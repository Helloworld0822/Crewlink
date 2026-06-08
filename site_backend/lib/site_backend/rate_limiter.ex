defmodule SiteBackend.RateLimiter do
  @moduledoc """
  In-memory rate limiter using ETS for high-performance token bucket.

  Used to prevent brute-force attacks on auth endpoints and API abuse.
  """
  use GenServer

  @table :rate_limiter_buckets

  def start_link(_opts) do
    GenServer.start_link(__MODULE__, [], name: __MODULE__)
  end

  def init(_) do
    :ets.new(@table, [:named_table, :set, :public, read_concurrency: true, write_concurrency: true])
    schedule_cleanup()
    {:ok, %{}}
  end

  @doc """
  Check if a request from `key` (e.g. IP address) is allowed.
  Returns {:ok, remaining} or {:error, :rate_limited, retry_after_seconds}.
  """
  def hit(key, max_requests, window_seconds) when is_binary(key) do
    now = System.system_time(:second)
    window_start = now - window_seconds

    case :ets.lookup(@table, key) do
      [] ->
        :ets.insert(@table, {key, [now]})
        {:ok, max_requests - 1}

      [{^key, timestamps}] ->
        # Prune timestamps outside the current window
        recent = Enum.filter(timestamps, fn ts -> ts > window_start end)

        if length(recent) >= max_requests do
          oldest = Enum.min(recent)
          retry_after = oldest + window_seconds - now
          {:error, :rate_limited, max(retry_after, 1)}
        else
          :ets.insert(@table, {key, [now | recent]})
          {:ok, max_requests - length(recent) - 1}
        end
    end
  end

  @doc """
  Reset rate limit for a key (e.g. after successful login).
  """
  def reset(key) when is_binary(key) do
    :ets.delete(@table, key)
    :ok
  end

  defp schedule_cleanup do
    Process.send_after(self(), :cleanup, 60_000)
  end

  def handle_info(:cleanup, state) do
    now = System.system_time(:second)
    # Remove entries that are all older than 1 hour
    :ets.tab2list(@table)
    |> Enum.each(fn {key, timestamps} ->
      recent = Enum.filter(timestamps, fn ts -> ts > now - 3600 end)

      if recent == [] do
        :ets.delete(@table, key)
      else
        :ets.insert(@table, {key, recent})
      end
    end)

    schedule_cleanup()
    {:noreply, state}
  end
end

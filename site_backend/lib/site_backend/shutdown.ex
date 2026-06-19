defmodule SiteBackend.Shutdown do
  @moduledoc """
  Coordinates graceful shutdown.

  Flips a draining flag and notifies subscribers. Components can poll
  `draining?/0` or call `await_active/1` to finish in-flight work before exit.

  Signal handling: BEAM forwards SIGINT/SIGTERM to the application controller
  by default, which then stops the supervision tree. This GenServer hooks
  into that lifecycle via the standard `:EXIT` signal so subscribers can be
  notified before the tree is torn down.
  """

  use GenServer

  require Logger

  @table :site_backend_shutdown_state

  def start_link(_opts) do
    GenServer.start_link(__MODULE__, [], name: __MODULE__)
  end

  @doc "Returns true once a shutdown signal has been received."
  @spec draining?() :: boolean()
  def draining? do
    case :ets.info(@table) do
      :undefined -> false
      _ -> :ets.lookup(@table, :draining) == [{:draining, true}]
    end
  end

  @doc """
  Synchronously begin the drain. Intended for use from `Application.prep_stop/1`
  so that any task still running can observe the drain before the supervision
  tree is torn down.
  """
  @spec __begin_drain__() :: :ok
  def __begin_drain__ do
    case :ets.info(@table) do
      :undefined -> :ok
      _ ->
        if :ets.lookup(@table, :draining) != [{:draining, true}] do
          :ets.insert(@table, {:draining, true})
          GenServer.cast(__MODULE__, :broadcast_drain)
        end

        :ok
    end
  end

  @doc """
  Block until the broadcast triggered by `__begin_drain__/0` has been
  delivered to all currently subscribed pids, or `timeout` (ms) elapses.
  """
  @spec await_drain_broadcast(timeout()) :: :ok
  def await_drain_broadcast(timeout) do
    deadline = System.monotonic_time(:millisecond) + timeout

    if Process.whereis(__MODULE__) == nil do
      :ok
    else
      ref = make_ref()
      GenServer.cast(__MODULE__, {:await_broadcast, self(), ref})
      await_broadcast(ref, deadline)
    end
  end

  defp await_broadcast(ref, deadline) do
    remaining = max(deadline - System.monotonic_time(:millisecond), 0)

    receive do
      {^ref, :done} -> :ok
    after
      min(remaining, 100) ->
        if remaining <= 0, do: :ok, else: await_broadcast(ref, deadline)
    end
  end

  @doc """
  Subscribe the caller to shutdown notifications. The caller will receive
  `{:site_backend, :draining}` once shutdown begins.
  """
  @spec subscribe() :: :ok
  def subscribe do
    GenServer.call(__MODULE__, {:subscribe, self()})
  end

  @doc """
  Block until shutdown begins or `timeout` (ms) elapses.
  Returns `:draining` if shutdown started, `{:timeout, remaining}` otherwise.
  """
  @spec await_active(timeout()) :: :draining | {:timeout, non_neg_integer()}
  def await_active(timeout) when is_integer(timeout) and timeout >= 0 do
    if draining?(), do: :draining, else: await_loop(timeout)
  end

  defp await_loop(0), do: {:timeout, 0}

  defp await_loop(timeout) do
    poll_interval = min(100, timeout)

    receive do
      {:site_backend, :draining} ->
        :draining
    after
      poll_interval ->
        if draining?() do
          :draining
        else
          remaining = timeout - poll_interval

          if remaining <= 0 do
            {:timeout, 0}
          else
            await_loop(remaining)
          end
        end
    end
  end

  @impl true
  def init(_) do
    :ets.new(@table, [:named_table, :set, :public, :protected, read_concurrency: true])
    :ets.insert(@table, {:draining, false})

    Process.flag(:trap_exit, true)
    {:ok, %{subscribers: MapSet.new()}}
  end

  @impl true
  def handle_call({:subscribe, pid}, _from, state) do
    ref = Process.monitor(pid)
    {:reply, :ok, %{state | subscribers: MapSet.put(state.subscribers, {pid, ref})}}
  end

  @impl true
  def handle_cast({:await_broadcast, pid, ref}, state) do
    if draining?() do
      send(pid, {ref, :done})
      {:noreply, state}
    else
      Process.send_after(pid, {ref, :done}, 0)
      {:noreply, state}
    end
  end

  @impl true
  def handle_info(:begin_shutdown, state) do
    begin_drain(state)
  end

  @impl true
  def handle_info(:broadcast_drain, state) do
    Logger.info("[SiteBackend.Shutdown] draining: notifying subscribers")
    Enum.each(state.subscribers, fn {pid, _ref} -> send(pid, {:site_backend, :draining}) end)
    {:noreply, state}
  end

  @impl true
  def handle_info({:EXIT, _pid, _reason}, state) do
    begin_drain(state)
  end

  @impl true
  def handle_info({:DOWN, ref, :process, pid, _reason}, state) do
    subs = MapSet.reject(state.subscribers, fn {p, r} -> p == pid or r == ref end)
    {:noreply, %{state | subscribers: subs}}
  end

  @impl true
  def handle_info(_other, state), do: {:noreply, state}

  defp begin_drain(state) do
    if draining?() do
      {:noreply, state}
    else
      :ets.insert(@table, {:draining, true})
      Logger.info("[SiteBackend.Shutdown] draining: notifying subscribers")
      Enum.each(state.subscribers, fn {pid, _ref} -> send(pid, {:site_backend, :draining}) end)
      {:noreply, state}
    end
  end
end

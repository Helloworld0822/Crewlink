defmodule SiteBackend.PubSub do
  use GenServer

  @table :pubsub_connections

  def start_link(_opts) do
    GenServer.start_link(__MODULE__, [], name: __MODULE__)
  end

  def init(_) do
    :ets.new(@table, [:named_table, :set, :public, read_concurrency: true])
    {:ok, %{}}
  end

  def subscribe(user_id, pid) when is_binary(user_id) do
    :ets.insert(@table, {user_id, pid})
    Process.monitor(pid)
    :ok
  end

  def unsubscribe(user_id) when is_binary(user_id) do
    :ets.delete(@table, user_id)
    :ok
  end

  def broadcast(user_id, message) when is_binary(user_id) and is_map(message) do
    case :ets.lookup(@table, user_id) do
      [{^user_id, pid}] ->
        send(pid, {:broadcast, Jason.encode!(message)})
        :ok

      [] ->
        :ok
    end
  end

  def broadcast_all(message) when is_map(message) do
    encoded = Jason.encode!(message)

    :ets.tab2list(@table)
    |> Enum.each(fn {_user_id, pid} ->
      send(pid, {:broadcast, encoded})
    end)

    :ok
  end

  def handle_info({:DOWN, _ref, :process, pid, _reason}, state) do
    :ets.match_delete(@table, {:_, pid})
    {:noreply, state}
  end
end

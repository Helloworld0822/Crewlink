defmodule SiteBackend.WSListener do
  @moduledoc """
  Supervised WebSocket listener built on top of raw `:cowboy` / `:ranch`.

  Lives in the application supervision tree so that it can be stopped gracefully
  during application shutdown. Stops the listener using a configured shutdown
  timeout so that active WebSocket connections have time to receive a close
  frame and shut down cleanly.
  """

  use GenServer

  require Logger

  alias SiteBackend.{Shutdown, WebSocketHandler}

  defstruct [:port, :shutdown_timeout, :ref]

  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl true
  def init(opts) do
    port = Keyword.fetch!(opts, :port)
    shutdown_timeout = Keyword.get(opts, :shutdown_timeout, 30_000)

    Process.flag(:trap_exit, true)

    dispatch =
      :cowboy_router.compile([
        {:_, [
          {"/ws", WebSocketHandler, %{}}
        ]}
      ])

    case :cowboy.start_clear(
           :ws_listener,
           [port: port],
           %{env: %{dispatch: dispatch}}
         ) do
      {:ok, _pid} ->
        Shutdown.subscribe()
        {:ok, %__MODULE__{port: port, shutdown_timeout: shutdown_timeout, ref: :ws_listener}}

      {:error, {:already_started, _pid}} ->
        Shutdown.subscribe()
        {:ok, %__MODULE__{port: port, shutdown_timeout: shutdown_timeout, ref: :ws_listener}}

      error ->
        Logger.error("[WSListener] failed to start: #{inspect(error)}")
        {:stop, error}
    end
  end

  @impl true
  def terminate(_reason, %__MODULE__{shutdown_timeout: timeout}) do
    Logger.info("[WSListener] stopping (timeout=#{timeout}ms)")
    :cowboy.stop_listener(:ws_listener)
    :ok
  end
end

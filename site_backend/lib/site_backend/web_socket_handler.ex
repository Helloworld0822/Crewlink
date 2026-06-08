defmodule SiteBackend.WebSocketHandler do
  @behaviour :cowboy_websocket

  alias SiteBackend.{Auth, PubSub, Repo, User}

  def init(req, state) do
    token = extract_token(req)

    case verify_token(token) do
      {:ok, user_id} ->
        {:cowboy_websocket, Map.put(state, :user_id, user_id), %{idle_timeout: 60_000}}

      {:error, _} ->
        {:ok, :stop, 401}
    end
  end

  def websocket_init(%{user_id: user_id} = state) do
    PubSub.subscribe(user_id, self())

    {:ok, state}
  end

  def websocket_handle({:text, "ping"}, state) do
    {:reply, {:text, "pong"}, state}
  end

  def websocket_handle({:text, _msg}, state) do
    {:ok, state}
  end

  def websocket_info({:broadcast, message}, state) do
    {:reply, {:text, message}, state}
  end

  def websocket_info(_info, state) do
    {:ok, state}
  end

  def terminate(_reason, %{user_id: user_id}) do
    PubSub.unsubscribe(user_id)
    :ok
  end

  def terminate(_reason, _state) do
    :ok
  end

  defp extract_token(req) do
    case :cowboy_req.parse_qs(req) do
      qs when is_list(qs) ->
        case Enum.find(qs, fn {k, _v} -> k == "token" end) do
          {_k, v} -> v
          nil -> nil
        end

      _ ->
        nil
    end
  end

  defp verify_token(nil), do: {:error, :no_token}

  defp verify_token(token) do
    case Auth.verify_jwt(token) do
      {:ok, claims} ->
        case Map.get(claims, "user_id") || Map.get(claims, :user_id) do
          user_id when is_binary(user_id) ->
            if Repo.get(User, user_id), do: {:ok, user_id}, else: {:error, :invalid_user}

          _ ->
            {:error, :no_user_id}
        end

      {:error, _} ->
        {:error, :invalid_token}
    end
  end
end

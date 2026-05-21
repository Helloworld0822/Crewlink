defmodule SiteBackend.Router do
  use Plug.Router
  use Plug.ErrorHandler

  alias SiteBackend.{Repo, User}

  plug :match
  plug Plug.Parsers, parsers: [:json], json_decoder: Jason
  plug :dispatch

  post "/api/register" do
    params = conn.body_params

    changeset = User.registration_changeset(%User{}, params)

    case Repo.insert(changeset) do
      {:ok, user} ->
        send_resp(conn, 201, Jason.encode!(%{id: user.id, email: user.email, name: user.name}))
      {:error, changeset} ->
        send_resp(conn, 400, Jason.encode!(%{errors: Ecto.Changeset.traverse_errors(changeset, fn {msg, _opts} -> msg end)}))
    end
  end

  post "/api/login" do
    %{"email" => email, "password" => password} = conn.body_params

    case Repo.get_by(User, email: email) do
      nil -> send_resp(conn, 401, Jason.encode!(%{error: "invalid credentials"}))
      user ->
        if Bcrypt.verify_pass(password, user.password_hash) do
          {:ok, token, _claims} = SiteBackend.Auth.generate_jwt(%{user_id: user.id})
          send_resp(conn, 200, Jason.encode!(%{token: token}))
        else
          send_resp(conn, 401, Jason.encode!(%{error: "invalid credentials"}))
        end
    end
  end

  match _ do
    send_resp(conn, 404, "not found")
  end
end

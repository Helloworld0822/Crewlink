defmodule SiteBackend.Router do
  use Plug.Router
  use Plug.ErrorHandler

  alias SiteBackend.{Login, Project, Repo, User}

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

          login_changeset =
            Login.changeset(%Login{}, %{
              user_id: user.id,
              ip_address: request_ip(conn)
            })

          case Repo.insert(login_changeset) do
            {:ok, _login} ->
              send_resp(conn, 200, Jason.encode!(%{token: token}))

            {:error, changeset} ->
              send_resp(conn, 500, Jason.encode!(%{
                errors: Ecto.Changeset.traverse_errors(changeset, fn {msg, _opts} -> msg end)
              }))
          end
        else
          send_resp(conn, 401, Jason.encode!(%{error: "invalid credentials"}))
        end
    end
  end

  get "/api/projects" do
    projects =
      Repo.all(Project)
      |> Enum.map(&project_to_map/1)

    send_resp(conn, 200, Jason.encode!(%{data: projects}))
  end

  post "/api/projects" do
    params = conn.body_params
    changeset = Project.changeset(%Project{}, params)

    case Repo.insert(changeset) do
      {:ok, project} ->
        send_resp(conn, 201, Jason.encode!(%{data: project_to_map(project)}))

      {:error, changeset} ->
        send_resp(conn, 400, Jason.encode!(%{
          errors: Ecto.Changeset.traverse_errors(changeset, fn {msg, _opts} -> msg end)
        }))
    end
  end

  get "/api/logins" do
    logins =
      Repo.all(Login)
      |> Repo.preload(:user)
      |> Enum.map(&login_to_map/1)

    send_resp(conn, 200, Jason.encode!(%{data: logins}))
  end

  match _ do
    send_resp(conn, 404, "not found")
  end

  defp project_to_map(project) do
    %{
      id: project.id,
      title: project.title,
      description: project.description,
      skills: project.skills,
      budget: project.budget,
      client_name: project.client_name,
      inserted_at: format_datetime(project.inserted_at),
      updated_at: format_datetime(project.updated_at)
    }
  end

  defp login_to_map(login) do
    %{
      id: login.id,
      user_id: login.user_id,
      user_email: login.user && login.user.email,
      ip_address: login.ip_address,
      inserted_at: format_datetime(login.inserted_at)
    }
  end

  defp format_datetime(nil), do: nil
  defp format_datetime(datetime), do: NaiveDateTime.to_iso8601(datetime)

  defp request_ip(conn) do
    case get_req_header(conn, "x-forwarded-for") do
      [value | _] ->
        value
        |> String.split(",", parts: 2)
        |> List.first()
        |> String.trim()

      _ ->
        conn.remote_ip
        |> :inet.ntoa()
        |> to_string()
    end
  end
end

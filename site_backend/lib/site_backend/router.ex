defmodule SiteBackend.Router do
  use Plug.Router
  use Plug.ErrorHandler

  import Ecto.Query

  alias SiteBackend.{Login, Project, ProjectApplication, Repo, User}

  plug :match
  plug Plug.Parsers, parsers: [:json], json_decoder: Jason
  plug :dispatch

  post "/api/signup" do
    handle_signup(conn)
  end

  post "/api/register" do
    handle_signup(conn)
  end

  post "/api/login" do
    %{"email" => email, "password" => password} = conn.body_params

    case Repo.get_by(User, email: email) do
      nil ->
        json_error(conn, 401, "invalid credentials")

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
              conn
              |> put_resp_content_type("application/json")
              |> send_resp(200, Jason.encode!(%{token: token, user: user_to_map(user)}))

            {:error, changeset} ->
              json_error(
                conn,
                500,
                Ecto.Changeset.traverse_errors(changeset, fn {msg, _opts} -> msg end)
              )
            end
        else
          json_error(conn, 401, "invalid credentials")
        end
    end
  end

  get "/api/projects" do
    projects =
      from(p in Project, order_by: [desc: p.inserted_at])
      |> Repo.all()
      |> Enum.map(&project_to_map/1)

    send_json(conn, %{data: projects})
  end

  post "/api/projects" do
    case authorize_roles(conn, [:client]) do
      {:ok, user} ->
        params =
          conn.body_params
          |> Map.put("client_id", user.id)
          |> Map.put("client_name", Map.get(conn.body_params, "client_name") || user.name)

        changeset = Project.changeset(%Project{}, params)

        case Repo.insert(changeset) do
          {:ok, project} ->
            send_json(conn, %{data: project_to_map(project)}, 201)

          {:error, changeset} ->
            json_error(conn, 400, Ecto.Changeset.traverse_errors(changeset, fn {msg, _opts} -> msg end))
        end

      {:error, status, message} ->
        json_error(conn, status, message)
    end
  end

  get "/api/client/projects" do
    case authorize_roles(conn, [:client]) do
      {:ok, user} ->
        projects =
          from(p in Project, where: p.client_id == ^user.id, order_by: [desc: p.inserted_at])
          |> Repo.all()
          |> Repo.preload(applications: :freelancer)

        send_json(conn, %{data: Enum.map(projects, &project_with_applications_to_map/1)})

      {:error, status, message} ->
        json_error(conn, status, message)
    end
  end

  post "/api/projects/:id/applications" do
    case authorize_roles(conn, [:freelancer]) do
      {:ok, user} ->
        case Repo.get(Project, conn.path_params["id"]) do
          nil ->
            json_error(conn, 404, "project not found")

          project ->
            params =
              conn.body_params
              |> Map.put("project_id", project.id)
              |> Map.put("freelancer_id", user.id)

            changeset = ProjectApplication.changeset(%ProjectApplication{}, params)

            case Repo.insert(changeset) do
              {:ok, application} ->
                application = Repo.preload(application, [:freelancer, :project])
                send_json(conn, %{data: application_to_map(application)}, 201)

              {:error, changeset} ->
                json_error(conn, 400, Ecto.Changeset.traverse_errors(changeset, fn {msg, _opts} -> msg end))
            end
        end

      {:error, status, message} ->
        json_error(conn, status, message)
    end
  end

  get "/api/freelancer/applications" do
    case authorize_roles(conn, [:freelancer]) do
      {:ok, user} ->
        applications =
          from(a in ProjectApplication, where: a.freelancer_id == ^user.id, order_by: [desc: a.inserted_at])
          |> Repo.all()
          |> Repo.preload([:project])

        send_json(conn, %{data: Enum.map(applications, &application_to_map/1)})

      {:error, status, message} ->
        json_error(conn, status, message)
    end
  end

  get "/api/logins" do
    logins =
      Repo.all(Login)
      |> Repo.preload(:user)
      |> Enum.map(&login_to_map/1)

    send_json(conn, %{data: logins})
  end

  match _ do
    send_resp(conn, 404, "not found")
  end

  defp handle_signup(conn) do
    params =
      conn.body_params
      |> Map.put("account_type", Map.get(conn.body_params, "account_type") || Map.get(conn.body_params, "role"))
      |> Map.drop(["role"])

    changeset = User.registration_changeset(%User{}, params)

    case Repo.insert(changeset) do
      {:ok, user} ->
        {:ok, token, _claims} = SiteBackend.Auth.generate_jwt(%{user_id: user.id})

        send_json(
          conn,
          %{
            token: token,
            user: user_to_map(user)
          },
          201
        )

      {:error, changeset} ->
        json_error(conn, 400, Ecto.Changeset.traverse_errors(changeset, fn {msg, _opts} -> msg end))
    end
  end

  defp authorize_roles(conn, roles) do
    with {:ok, user} <- current_user(conn) do
      if user.account_type in roles do
        {:ok, user}
      else
        {:error, 403, "forbidden"}
      end
    end
  end

  defp current_user(conn) do
    with token when is_binary(token) <- bearer_token(conn),
         {:ok, claims} <- SiteBackend.Auth.verify_jwt(token),
         user_id when is_binary(user_id) <- Map.get(claims, "user_id") || Map.get(claims, :user_id),
         user when not is_nil(user) <- Repo.get(User, user_id) do
      {:ok, user}
    else
      _ -> {:error, 401, "unauthorized"}
    end
  end

  defp bearer_token(conn) do
    case get_req_header(conn, "authorization") do
      ["Bearer " <> token] -> token
      ["bearer " <> token] -> token
      _ -> nil
    end
  end

  defp send_json(conn, body, status \\ 200) do
    conn
    |> put_resp_content_type("application/json")
    |> send_resp(status, Jason.encode!(body))
  end

  defp json_error(conn, status, error) do
    send_json(conn, %{error: error}, status)
  end

  defp project_to_map(project) do
    %{
      id: project.id,
      title: project.title,
      description: project.description,
      skills: project.skills,
      budget: project.budget,
      client_name: project.client_name,
      client_id: project.client_id,
      inserted_at: format_datetime(project.inserted_at),
      updated_at: format_datetime(project.updated_at)
    }
  end

  defp project_with_applications_to_map(project) do
    Map.put(project_to_map(project), :applications, Enum.map(project.applications, &application_to_map/1))
  end

  defp application_to_map(application) do
    %{
      id: application.id,
      project_id: application.project_id,
      freelancer_id: application.freelancer_id,
      message: application.message,
      status: Atom.to_string(application.status),
      freelancer: user_to_map(application.freelancer),
      inserted_at: format_datetime(application.inserted_at),
      updated_at: format_datetime(application.updated_at)
    }
  end

  defp user_to_map(user) do
    %{
      id: user.id,
      email: user.email,
      name: user.name,
      account_type: Atom.to_string(user.account_type)
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

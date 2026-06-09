defmodule SiteBackend.CORSMiddleware do
  @moduledoc """
  CORS middleware for Plug-based APIs.
  Adds appropriate Access-Control-* headers for cross-origin requests.
  """
  @behaviour Plug

  import Plug.Conn

  @allowed_origins ["http://localhost:5173", "http://localhost:80", "http://localhost:4000"]

  def init(opts), do: opts

  def call(conn, _opts) do
    origin = get_req_header(conn, "origin") |> List.first()

    conn =
      cond do
        origin in @allowed_origins ->
          put_resp_header(conn, "access-control-allow-origin", origin)
          |> put_resp_header("access-control-allow-credentials", "true")

        true ->
          conn
      end

    conn =
      conn
      |> put_resp_header("access-control-allow-methods", "GET, POST, PATCH, DELETE, OPTIONS")
      |> put_resp_header(
        "access-control-allow-headers",
        "Content-Type, Authorization, X-Requested-With"
      )
      |> put_resp_header("access-control-max-age", "86400")

    if conn.method == "OPTIONS" do
      conn
      |> put_resp_content_type("text/plain")
      |> send_resp(204, "")
    else
      conn
    end
  end
end

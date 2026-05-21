defmodule SiteBackend.Repo do
  use Ecto.Repo,
    otp_app: :site_backend,
    adapter: Ecto.Adapters.Postgres
end

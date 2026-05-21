import Config

config :site_backend, ecto_repos: [SiteBackend.Repo]

config :site_backend, SiteBackend.Repo,
  database: System.get_env("DB_NAME") || "outsourcing_dev",
  username: System.get_env("DB_USER") || "postgres",
  password: System.get_env("DB_PASSWORD") || "postgres",
  hostname: System.get_env("DB_HOST") || "localhost",
  port: String.to_integer(System.get_env("DB_PORT") || "5432"),
  pool_size: 10

config :site_backend, SiteBackendWeb.Endpoint,
  secret_key_base: System.get_env("SECRET_KEY_BASE") || "dev_secret"

config :logger, level: :info

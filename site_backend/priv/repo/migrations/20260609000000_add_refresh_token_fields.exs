defmodule SiteBackend.Repo.Migrations.AddRefreshTokenFields do
  use Ecto.Migration

  def up do
    execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS refresh_token_hash varchar(255)")
    execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS refresh_token_expires_at timestamp(0)")

    execute("""
    CREATE UNIQUE INDEX IF NOT EXISTS users_refresh_token_hash_index
      ON users (refresh_token_hash)
      WHERE refresh_token_hash IS NOT NULL
    """)
  end

  def down do
    execute("DROP INDEX IF EXISTS users_refresh_token_hash_index")

    execute("ALTER TABLE users DROP COLUMN IF EXISTS refresh_token_expires_at")
    execute("ALTER TABLE users DROP COLUMN IF EXISTS refresh_token_hash")
  end
end

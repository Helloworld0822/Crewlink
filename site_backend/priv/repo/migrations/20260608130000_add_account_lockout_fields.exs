defmodule SiteBackend.Repo.Migrations.AddAccountLockoutFields do
  use Ecto.Migration

  def up do
    execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS failed_login_count integer NOT NULL DEFAULT 0")
    execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS locked_until timestamp(0)")
  end

  def down do
    execute("ALTER TABLE users DROP COLUMN IF EXISTS locked_until")
    execute("ALTER TABLE users DROP COLUMN IF EXISTS failed_login_count")
  end
end

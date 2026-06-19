defmodule SiteBackend.Repo.Migrations.AddEmailVerificationFields do
  use Ecto.Migration

  def up do
    execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified boolean NOT NULL DEFAULT false")
    execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_token varchar(255)")
    execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_sent_at timestamp(0)")

    execute("""
    CREATE UNIQUE INDEX IF NOT EXISTS users_email_verification_token_index
      ON users (email_verification_token)
      WHERE email_verification_token IS NOT NULL
    """)
  end

  def down do
    execute("DROP INDEX IF EXISTS users_email_verification_token_index")

    execute("ALTER TABLE users DROP COLUMN IF EXISTS email_verification_sent_at")
    execute("ALTER TABLE users DROP COLUMN IF EXISTS email_verification_token")
    execute("ALTER TABLE users DROP COLUMN IF EXISTS email_verified")
  end
end

defmodule SiteBackend.Repo.Migrations.AddAccountLockoutFields do
  use Ecto.Migration

  def change do
    alter table(:users) do
      add :failed_login_count, :integer, default: 0, null: false
      add :locked_until, :naive_datetime
    end
  end
end

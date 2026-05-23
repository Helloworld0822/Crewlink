defmodule SiteBackend.Repo.Migrations.CreateLogins do
  use Ecto.Migration

  def change do
    create_if_not_exists table(:logins, primary_key: false) do
      add :id, :uuid, primary_key: true
      add :user_id, references(:users, type: :uuid, on_delete: :delete_all), null: false
      add :ip_address, :string

      timestamps()
    end

    create_if_not_exists index(:logins, [:user_id])
  end
end

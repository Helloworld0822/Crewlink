defmodule SiteBackend.Repo.Migrations.AddAccountTypeToUsers do
  use Ecto.Migration

  def change do
    alter table(:users) do
      add :account_type, :string, null: false, default: "client"
    end
  end
end

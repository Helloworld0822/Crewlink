defmodule SiteBackend.Repo.Migrations.AddProjectOwnershipAndApplications do
  use Ecto.Migration

  def change do
    alter table(:projects) do
      add :client_id, references(:users, type: :uuid, on_delete: :delete_all), null: true
    end

    create_if_not_exists index(:projects, [:client_id])

    create table(:project_applications, primary_key: false) do
      add :id, :uuid, primary_key: true
      add :project_id, references(:projects, type: :uuid, on_delete: :delete_all), null: false
      add :freelancer_id, references(:users, type: :uuid, on_delete: :delete_all), null: false
      add :message, :text, null: false
      add :status, :string, null: false, default: "pending"

      timestamps()
    end

    create unique_index(:project_applications, [:project_id, :freelancer_id])
    create index(:project_applications, [:project_id])
    create index(:project_applications, [:freelancer_id])
  end
end

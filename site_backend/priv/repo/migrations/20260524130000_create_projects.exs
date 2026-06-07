defmodule SiteBackend.Repo.Migrations.CreateProjects do
  use Ecto.Migration

  def change do
    create_if_not_exists table(:projects, primary_key: false) do
      add :id, :uuid, primary_key: true
      add :title, :string, null: false
      add :description, :text
      add :skills, {:array, :string}, default: [], null: false
      add :budget, :string
      add :client_name, :string

      timestamps()
    end
  end
end

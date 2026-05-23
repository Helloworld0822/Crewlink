defmodule SiteBackend.Project do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  schema "projects" do
    field :title, :string
    field :description, :string
    field :skills, {:array, :string}, default: []
    field :budget, :string
    field :client_name, :string

    timestamps()
  end

  def changeset(project, params) do
    project
    |> cast(params, [:title, :description, :skills, :budget, :client_name])
    |> validate_required([:title])
  end
end

defmodule SiteBackend.Project do
  use Ecto.Schema
  import Ecto.Changeset

  alias SiteBackend.{ProjectApplication, User}

  @primary_key {:id, :binary_id, autogenerate: true}
  schema "projects" do
    field :title, :string
    field :description, :string
    field :skills, {:array, :string}, default: []
    field :budget, :string
    field :client_name, :string
    belongs_to :client, User, type: :binary_id
    has_many :applications, ProjectApplication

    timestamps()
  end

  def changeset(project, params) do
    project
    |> cast(params, [:title, :description, :skills, :budget, :client_name, :client_id])
    |> validate_required([:title, :client_id])
  end
end

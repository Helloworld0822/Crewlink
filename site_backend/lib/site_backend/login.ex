defmodule SiteBackend.Login do
  use Ecto.Schema
  import Ecto.Changeset

  alias SiteBackend.User

  @primary_key {:id, :binary_id, autogenerate: true}
  schema "logins" do
    field :ip_address, :string
    belongs_to :user, User, type: :binary_id

    timestamps()
  end

  def changeset(login, params) do
    login
    |> cast(params, [:user_id, :ip_address])
    |> validate_required([:user_id])
    |> foreign_key_constraint(:user_id)
  end
end

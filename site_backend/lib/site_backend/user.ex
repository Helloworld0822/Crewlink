defmodule SiteBackend.User do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  schema "users" do
    field :email, :string
    field :password, :string, virtual: true
    field :password_hash, :string
    field :name, :string
    has_many :logins, SiteBackend.Login

    timestamps()
  end

  def registration_changeset(struct, params) do
    struct
    |> cast(params, [:email, :password, :name])
    |> validate_required([:email, :password])
    |> validate_format(:email, ~r/@/)
    |> unique_constraint(:email)
    |> put_pass_hash()
  end

  defp put_pass_hash(changeset) do
    case get_change(changeset, :password) do
      nil -> changeset
      pass ->
        put_change(changeset, :password_hash, Bcrypt.hash_pwd_salt(pass))
        |> delete_change(:password)
    end
  end
end

defmodule SiteBackend.ChatRoom do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  @timestamps_opts [type: :naive_datetime]

  schema "chat_rooms" do
    belongs_to :client, SiteBackend.User, type: :binary_id
    belongs_to :freelancer, SiteBackend.User, type: :binary_id
    belongs_to :service_order, SiteBackend.ServiceOrder, type: :binary_id

    has_many :messages, SiteBackend.ChatMessage, foreign_key: :chat_room_id

    timestamps()
  end

  def changeset(chat_room, attrs) do
    chat_room
    |> cast(attrs, [:client_id, :freelancer_id, :service_order_id])
    |> validate_required([:client_id, :freelancer_id])
  end
end

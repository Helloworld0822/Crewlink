defmodule SiteBackend.ChatMessage do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  @timestamps_opts [type: :naive_datetime]

  schema "chat_messages" do
    field :content, :string
    belongs_to :chat_room, SiteBackend.ChatRoom, type: :binary_id
    belongs_to :sender, SiteBackend.User, type: :binary_id

    timestamps()
  end

  def changeset(chat_message, attrs) do
    chat_message
    |> cast(attrs, [:content, :chat_room_id, :sender_id])
    |> validate_required([:content, :chat_room_id, :sender_id])
  end
end

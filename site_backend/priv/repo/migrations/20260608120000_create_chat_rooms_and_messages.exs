defmodule SiteBackend.Repo.Migrations.CreateChatRoomsAndMessages do
  use Ecto.Migration

  def change do
    execute "CREATE EXTENSION IF NOT EXISTS pgcrypto"

    execute """
    CREATE TABLE IF NOT EXISTS chat_rooms (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      client_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      freelancer_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      service_order_id uuid REFERENCES service_orders(id) ON DELETE SET NULL,
      inserted_at timestamp NOT NULL DEFAULT now(),
      updated_at timestamp NOT NULL DEFAULT now()
    )
    """

    execute "CREATE INDEX IF NOT EXISTS chat_rooms_client_id_index ON chat_rooms (client_id)"
    execute "CREATE INDEX IF NOT EXISTS chat_rooms_freelancer_id_index ON chat_rooms (freelancer_id)"

    execute """
    CREATE TABLE IF NOT EXISTS chat_messages (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      chat_room_id uuid NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
      sender_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      content text NOT NULL,
      inserted_at timestamp NOT NULL DEFAULT now(),
      updated_at timestamp NOT NULL DEFAULT now()
    )
    """

    execute "CREATE INDEX IF NOT EXISTS chat_messages_chat_room_id_index ON chat_messages (chat_room_id)"
    execute "CREATE INDEX IF NOT EXISTS chat_messages_sender_id_index ON chat_messages (sender_id)"
  end
end

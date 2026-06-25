defmodule SiteBackend.Repo.Migrations.AddPerformanceIndexes do
  use Ecto.Migration

  @disable_ddl_transaction true
  @disable_migration_lock true

  # Adds composite / covering indexes for the hot query patterns we
  # actually exercise:
  #
  #   * /api/projects              ORDER BY inserted_at DESC
  #   * /api/client/projects       WHERE client_id = ? ORDER BY inserted_at DESC
  #   * /api/freelancer/services  WHERE is_active = true
  #                                AND (category = ?)
  #                                AND (ilike(title) OR ilike(description))
  #                                ORDER BY inserted_at DESC
  #   * chat list                  WHERE chat_room_id = ? ORDER BY inserted_at ASC
  #   * notifications list         WHERE user_id = ? AND is_read = ?
  #                                ORDER BY inserted_at DESC
  #
  # All indexes are created with CREATE INDEX IF NOT EXISTS so the
  # migration is safe to re-run against an already-indexed database.
  def up do
    execute("CREATE INDEX IF NOT EXISTS projects_inserted_at_desc_idx ON projects (inserted_at DESC)")
    execute("CREATE INDEX IF NOT EXISTS projects_client_id_inserted_at_idx ON projects (client_id, inserted_at DESC)")

    execute("CREATE INDEX IF NOT EXISTS project_applications_freelancer_status_idx ON project_applications (freelancer_id, status)")
    execute("CREATE INDEX IF NOT EXISTS project_applications_project_status_idx ON project_applications (project_id, status)")
    execute("CREATE INDEX IF NOT EXISTS project_applications_freelancer_inserted_at_idx ON project_applications (freelancer_id, inserted_at DESC)")

    execute("CREATE INDEX IF NOT EXISTS freelancer_services_active_category_idx ON freelancer_services (is_active, category, inserted_at DESC)")
    execute("CREATE INDEX IF NOT EXISTS freelancer_services_active_inserted_at_idx ON freelancer_services (is_active, inserted_at DESC)")

    execute("CREATE INDEX IF NOT EXISTS service_orders_status_inserted_at_idx ON service_orders (status, inserted_at DESC)")
    execute("CREATE INDEX IF NOT EXISTS service_orders_client_status_idx ON service_orders (client_id, status)")

    execute("CREATE INDEX IF NOT EXISTS chat_messages_room_inserted_at_idx ON chat_messages (chat_room_id, inserted_at)")

    execute("CREATE INDEX IF NOT EXISTS notifications_user_is_read_idx ON notifications (user_id, is_read, inserted_at DESC)")
    execute("CREATE INDEX IF NOT EXISTS notifications_user_inserted_at_idx ON notifications (user_id, inserted_at DESC)")

    execute("CREATE INDEX IF NOT EXISTS users_account_type_idx ON users (account_type) WHERE account_type IS NOT NULL")
  end

  def down do
    execute("DROP INDEX IF EXISTS projects_inserted_at_desc_idx")
    execute("DROP INDEX IF EXISTS projects_client_id_inserted_at_idx")
    execute("DROP INDEX IF EXISTS project_applications_freelancer_status_idx")
    execute("DROP INDEX IF EXISTS project_applications_project_status_idx")
    execute("DROP INDEX IF EXISTS project_applications_freelancer_inserted_at_idx")
    execute("DROP INDEX IF EXISTS freelancer_services_active_category_idx")
    execute("DROP INDEX IF EXISTS freelancer_services_active_inserted_at_idx")
    execute("DROP INDEX IF EXISTS service_orders_status_inserted_at_idx")
    execute("DROP INDEX IF EXISTS service_orders_client_status_idx")
    execute("DROP INDEX IF EXISTS chat_messages_room_inserted_at_idx")
    execute("DROP INDEX IF EXISTS notifications_user_is_read_idx")
    execute("DROP INDEX IF EXISTS notifications_user_inserted_at_idx")
    execute("DROP INDEX IF EXISTS users_account_type_idx")
  end
end

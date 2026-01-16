from tortoise import BaseDBAsyncClient

RUN_IN_TRANSACTION = True


async def upgrade(db: BaseDBAsyncClient) -> str:
    return """
        CREATE TABLE IF NOT EXISTS "activities" (
    "id" UUID NOT NULL PRIMARY KEY,
    "entity_type" VARCHAR(12) NOT NULL,
    "entity_id" UUID NOT NULL,
    "action" VARCHAR(24) NOT NULL,
    "metadata" JSONB,
    "user_id" UUID NOT NULL,
    "org_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
COMMENT ON COLUMN "activities"."entity_type" IS 'TASK: task\nPROJECT: project\nORGANIZATION: organization';
COMMENT ON COLUMN "activities"."action" IS 'TASK_CREATED: task_created\nTASK_STATUS_CHANGED: task_status_changed\nTASK_DESCRIPTION_UPDATED: task_description_updated\nTASK_ASSIGNED: task_assigned\nTASK_UNASSIGNED: task_unassigned\nTASK_TITLE_UPDATED: task_title_updated\nPROJECT_CREATED: project_created\nPROJECT_UPDATED: project_updated\nPROJECT_ARCHIVED: project_archived\nPROJECT_RESTORED: project_restored\nORGANIZATION_CREATED: organization_created\nORGANIZATION_UPDATED: organization_updated\nORGANIZATION_DELETED: organization_deleted\nMEMBER_ADDED: member_added\nMEMBER_REMOVED: member_removed\nMEMBER_ROLE_CHANGED: member_role_changed';
        CREATE TABLE IF NOT EXISTS "tasks" (
    "id" UUID NOT NULL PRIMARY KEY,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "status" VARCHAR(11) NOT NULL DEFAULT 'todo',
    "version" INT NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignee_id" UUID REFERENCES "users" ("id") ON DELETE SET NULL,
    "created_by_id" UUID REFERENCES "users" ("id") ON DELETE SET NULL,
    "project_id" UUID NOT NULL REFERENCES "projects" ("id") ON DELETE CASCADE
);
COMMENT ON COLUMN "tasks"."status" IS 'TODO: todo\nIN_PROGRESS: in_progress\nREVIEW: review\nDONE: done';"""


async def downgrade(db: BaseDBAsyncClient) -> str:
    return """
        DROP TABLE IF EXISTS "tasks";
        DROP TABLE IF EXISTS "activities";"""


MODELS_STATE = (
    "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"
)

from tortoise import BaseDBAsyncClient

RUN_IN_TRANSACTION = True


async def upgrade(db: BaseDBAsyncClient) -> str:
    return """
        CREATE TABLE IF NOT EXISTS "chat_messages" (
    "id" UUID NOT NULL PRIMARY KEY,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "org_id" UUID NOT NULL REFERENCES "organizations" ("id") ON DELETE CASCADE,
    "project_id" UUID NOT NULL REFERENCES "projects" ("id") ON DELETE CASCADE,
    "user_id" UUID REFERENCES "users" ("id") ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS "idx_chat_messag_org_id_91323e" ON "chat_messages" ("org_id", "project_id", "createdAt");
        CREATE TABLE IF NOT EXISTS "meetings" (
    "id" UUID NOT NULL PRIMARY KEY,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "google_meet_link" VARCHAR(512) NOT NULL,
    "start_time" TIMESTAMPTZ NOT NULL,
    "end_time" TIMESTAMPTZ NOT NULL,
    "participant_ids" JSONB,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by_id" UUID REFERENCES "users" ("id") ON DELETE SET NULL,
    "org_id" UUID NOT NULL REFERENCES "organizations" ("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "idx_meetings_org_id_cef88d" ON "meetings" ("org_id", "start_time");
        COMMENT ON COLUMN "notifications"."type" IS 'ORG_INVITE: org_invite
MEETING: meeting';"""


async def downgrade(db: BaseDBAsyncClient) -> str:
    return """
        COMMENT ON COLUMN "notifications"."type" IS 'ORG_INVITE: org_invite';
        DROP TABLE IF EXISTS "chat_messages";
        DROP TABLE IF EXISTS "meetings";"""


MODELS_STATE = (
    "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"
    "udXl7+D+j7adg="
)

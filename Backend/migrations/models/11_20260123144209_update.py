from tortoise import BaseDBAsyncClient

RUN_IN_TRANSACTION = True


async def upgrade(db: BaseDBAsyncClient) -> str:
    return """
        CREATE TABLE IF NOT EXISTS "comments" (
    "id" UUID NOT NULL PRIMARY KEY,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "org_id" UUID NOT NULL REFERENCES "organizations" ("id") ON DELETE CASCADE,
    "project_id" UUID NOT NULL REFERENCES "projects" ("id") ON DELETE CASCADE,
    "user_id" UUID REFERENCES "users" ("id") ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS "idx_comments_org_id_b27c02" ON "comments" ("org_id", "project_id", "createdAt");
        COMMENT ON COLUMN "notifications"."type" IS 'ORG_INVITE: org_invite
MEETING: meeting
CHAT: chat';
        DROP TABLE IF EXISTS "chat_messages";"""


async def downgrade(db: BaseDBAsyncClient) -> str:
    return """
        COMMENT ON COLUMN "notifications"."type" IS 'ORG_INVITE: org_invite
MEETING: meeting';
        DROP TABLE IF EXISTS "comments";"""


MODELS_STATE = (
    "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"
    "4lA0ZlDR8yaJZ7tbYvGex0enn5P9JH9OQ="
)

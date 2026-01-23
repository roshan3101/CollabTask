from tortoise import BaseDBAsyncClient

RUN_IN_TRANSACTION = True


async def upgrade(db: BaseDBAsyncClient) -> str:
    return """
        CREATE TABLE IF NOT EXISTS "notifications" (
    "id" UUID NOT NULL PRIMARY KEY,
    "user_id" UUID NOT NULL,
    "type" VARCHAR(10) NOT NULL,
    "title" VARCHAR(512) NOT NULL,
    "message" TEXT NOT NULL,
    "metadata" JSONB,
    "read" BOOL NOT NULL DEFAULT False,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "idx_notificatio_user_id_daa173" ON "notifications" ("user_id");
COMMENT ON COLUMN "notifications"."type" IS 'ORG_INVITE: org_invite';"""


async def downgrade(db: BaseDBAsyncClient) -> str:
    return """
        DROP TABLE IF EXISTS "notifications";"""


MODELS_STATE = (
    "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"
    "yMyhqu5m6We7W2u7lfdHl5+h97etFn"
)

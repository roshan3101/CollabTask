from tortoise import BaseDBAsyncClient

RUN_IN_TRANSACTION = True


async def upgrade(db: BaseDBAsyncClient) -> str:
    return """
        CREATE TABLE IF NOT EXISTS "projects" (
    "id" UUID NOT NULL PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "is_archieved" BOOL NOT NULL DEFAULT False,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by_id" UUID REFERENCES "users" ("id") ON DELETE SET NULL,
    "org_id" UUID NOT NULL REFERENCES "organizations" ("id") ON DELETE CASCADE
);"""


async def downgrade(db: BaseDBAsyncClient) -> str:
    return """
        DROP TABLE IF EXISTS "projects";"""


MODELS_STATE = (
    "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"
)

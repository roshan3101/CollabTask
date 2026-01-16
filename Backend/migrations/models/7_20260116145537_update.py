from tortoise import BaseDBAsyncClient

RUN_IN_TRANSACTION = True


async def upgrade(db: BaseDBAsyncClient) -> str:
    return """
        CREATE UNIQUE INDEX IF NOT EXISTS "uid_memberships_userId_c7d15d" ON "memberships" ("userId", "organizationId");
        CREATE INDEX IF NOT EXISTS "idx_projects_org_id_07051a" ON "projects" ("org_id", "is_archieved");
        CREATE INDEX IF NOT EXISTS "idx_projects_org_id_aa2fdb" ON "projects" ("org_id");
        CREATE INDEX IF NOT EXISTS "idx_tasks_project_239528" ON "tasks" ("project_id", "assignee_id");
        CREATE INDEX IF NOT EXISTS "idx_tasks_project_6588fc" ON "tasks" ("project_id", "status");
        CREATE INDEX IF NOT EXISTS "idx_tasks_project_78d187" ON "tasks" ("project_id");"""


async def downgrade(db: BaseDBAsyncClient) -> str:
    return """
        DROP INDEX IF EXISTS "uid_memberships_userId_c7d15d";
        DROP INDEX IF EXISTS "idx_projects_org_id_aa2fdb";
        DROP INDEX IF EXISTS "idx_projects_org_id_07051a";
        DROP INDEX IF EXISTS "idx_tasks_project_78d187";
        DROP INDEX IF EXISTS "idx_tasks_project_6588fc";
        DROP INDEX IF EXISTS "idx_tasks_project_239528";"""


MODELS_STATE = (
    "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"
)

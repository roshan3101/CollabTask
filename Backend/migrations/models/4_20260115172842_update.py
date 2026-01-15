from tortoise import BaseDBAsyncClient

RUN_IN_TRANSACTION = True


async def upgrade(db: BaseDBAsyncClient) -> str:
    return """
        CREATE TABLE IF NOT EXISTS "memberships" (
    "id" UUID NOT NULL PRIMARY KEY,
    "userId" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "role" VARCHAR(6) NOT NULL DEFAULT 'member',
    "status" VARCHAR(9) NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
COMMENT ON COLUMN "memberships"."role" IS 'MEMBER: member\nADMIN: admin\nOWNER: owner';
COMMENT ON COLUMN "memberships"."status" IS 'PENDING: pending\nACTIVE: active\nSUSPENDED: suspended';
        CREATE TABLE IF NOT EXISTS "organizations" (
    "id" UUID NOT NULL PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL UNIQUE,
    "address" VARCHAR(512),
    "website" VARCHAR(255),
    "description" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);"""


async def downgrade(db: BaseDBAsyncClient) -> str:
    return """
        DROP TABLE IF EXISTS "memberships";
        DROP TABLE IF EXISTS "organizations";"""


MODELS_STATE = (
    "eJztm29v2jgcx99KlEed1KtW1nYrOp0EJbflVMJUQjdtnZBJDERN7Cx2Rruq7/1sk5D/Ge"
    "HKIFyetPD7Q+yPHf++juFJdrAJbXLS8elcbktPMgIOZC8S9mNJBq4bWbmBgoktAkEYMSHU"
    "AwZltimwCWQmExLDs1xqYcSsyLdtbsQGC7TQLDL5yPruwzHFM0jn0GOOr9+Y2UImfIAkfO"
    "vej6cWtM1EMy2TX1vYx/TRFbbRSO39LSL55SZjA9u+g6Jo95HOMVqF+75lnvAc7ptBBD1A"
    "oRnrBm9l0NvQtGwxM1DPh6ummpHBhFPg2xyG/OfURwZnIIkr8T9nf8kV8BgYcbQWopzF0/"
    "OyV1GfhVXml7r60Lk5enPxSvQSEzrzhFMQkZ9FIqBgmSq4RiAxdbMkr+bAyycZhKdQsmZu"
    "AjE0RBSjGRRiDPFsxkx2wMPYhmgmZvlFCcLbzo2guISI2YxeTnMtcLS4h6OM0PkEemqleR"
    "hlvORc3D7G/zL1Il6GB3mvOjSLrMcc1HJgPrZEYoqcGWSehC/2k6DMumAOkP0YLBUlRHW1"
    "rwz1Tv8j74lDyHdbEOroCve0hPUxZc1M29WHSJ9U/YPE30pfBpqSHqZVnP5F5m1iqzoeI7"
    "wYAzO2qoXWEEzyNnDNzYY1kdgM606HVTSeV9vpfaxMcMMEGPcL4JnjjAe3cFFs1uW0nLQF"
    "IDATo8LZ8lYG2qMPnQn0yNxy85RJzFuqT5xVHGlkSu1lSlNrq9Va7M0Asn4CfvVq3LKZ/0"
    "d+HrZhvi5WkO8Iciq7LEAGzBAMc3+fSA4Wu+xdK/eVfle5aUvLgDvU6fVVrS0B07HQHRp8"
    "0rgTL1CQvFtBzXhSn2yKPcr+jeBdiEzOK0v+o6L1VO19WwpCGPsrXb1VGHy23P6Ad2g4Gv"
    "IgpdeWiE94GDQ3GYXLNUbhsnAULtOj0Mj0A9BzjUw/yGHdJ5k+iAkFOUeoJ/ylUj0uORqx"
    "Xn+xLv7nVvF8lGH8y9TtX2N8yWeKrfPzNcoviyoswMKXLMHs9me0C5RQPsNYykYYA0g7ez"
    "Z7ftpagyOLKuQofEmOCzghFq00F2MpteS4lfkYb1mGpQ4faD7LVFpNeJaJA+WzntAFIbWj"
    "fufzq4Q2uB5o78PwGOWr60G30duHJ8wavX2Qw7pPentEhJzN6GxhL9XX/FFoo6vrr6unlk"
    "eoVlFcJ5LqeW6/FU1jg+os4zkNyhVK6ADLrsJxldDs+AKELiBkgb2clbKYYjynmY1RuSG3"
    "0LPYB+bA7GJsQ4AKKk8iMUV0wjK3hbRqLV6/2HQHg+uEsOqq6R3JiB8QHZ0KwiyI732ZWd"
    "X0ZptyeHq22aYc5LDu2zZlCAkRz/ILtisr//Gvti1jEg9tti913r403+FZh1/sOyhwypxz"
    "Hd/DnMeuxbownVdPbbiVA4FGxBxAtVuKmD0pdx22ZTDyf0Kz9JSWOBDF7E1tU1HBcU5uaW"
    "OzKz3dgxHb6Y59xq/yR+v07O3ZuzcXZ+9YiGjJyvK2ZPqHm5/iUvYDeiT3MKx4VY6l1HNB"
    "3s5Jt1vp50dBeD0Bnr5+vQZAFlUIUPhSFQ0jClFOPftnONAKalmUkgI5QqyDX03LoMeSbR"
    "H6bT+xllDkvS4/oU0fxqaqEf8AfkK70/Ly/C8T53U2"
)

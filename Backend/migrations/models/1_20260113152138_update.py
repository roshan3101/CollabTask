from tortoise import BaseDBAsyncClient

RUN_IN_TRANSACTION = True


async def upgrade(db: BaseDBAsyncClient) -> str:
    return """
        CREATE TABLE IF NOT EXISTS "auth" (
    "id" UUID NOT NULL PRIMARY KEY,
    "otp" VARCHAR(6) NOT NULL,
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);"""


async def downgrade(db: BaseDBAsyncClient) -> str:
    return """
        DROP TABLE IF EXISTS "auth";"""


MODELS_STATE = (
    "eJztmW1P2zAQx79KlVdMYghKYWiaJqXQiU7QTpCyCYQiN3Zbq44dbGdQIb77bOepSR9oGI"
    "gW5Q1q/3fX+H6+5M7h0fIZRETs2KEcWV9rjxYFPlIfcvp2zQJBkKlakKBPjCNIPPpCcuBJ"
    "pQ0AEUhJEAmP40BiRpVKQ0K0yDzliOkwk0KK70LkSjZEcoS4MtzcKhlTiB6QSL4GY3eAEY"
    "G5ZWKor210V04Co/V67ZMfxlNfru96jIQ+zbyDiRwxmrqHIYY7OkbbhogiDiSCU2noVcbZ"
    "JlK0YiVIHqJ0qTATIBqAkGgY1rdBSD3NoGaupP80vlsl8HiMarSYSs3i8SnKKsvZqJa+1P"
    "GpfbG1f/jJZMmEHHJjNESsJxMIJIhCDdcMJJPBLMnjEeDzScbuBZRqmS+BmAgZxayCEowJ"
    "npcxs3zw4BJEh6bKD5cgvLIvDMUIIlMVHZV5JzbUtUWjzNCFAvF2qTrMIl6zFt8e4/+UXs"
    "bL40hnZctZZCfKILGP5mPLBRbIwThyJ/mwngQtlQLsUjKJHxVLiDrt89alY5//0pn4QtwR"
    "Q8h2WtpSN+qkoM6Ubfojtd9t57Smv9auu51WcZtSP+fa0mtST3XmUnbvAjj1VEvUBEz+Ng"
    "jgy7Y1F1ht67tuq1m87raD8VSb0EIfeON7wKE7Y2F1tsh31uTX/aICKBiaXdFs9Srj2aMn"
    "zCwwM5MYfelMop+vohpKNn4oGWAuZAdEd/2qo0kuaDMHlPrBwQojivJaOKQYW77tElCe5X"
    "RMhTJFiXyASRmOacDrQHz+Bl97hAEQ4p7xOU/KxRSnY6pqzNqNuEIcqx+cA7PJGEGALug8"
    "ucAC0b6KfCukZXvx6s2m2e2e5QarZtspoOydN1sXW3uGsHLC0sjtjlMdUz7ePFsdUz7ktq"
    "7bMeUSCaH2IsI357iS2refO7a4Ytq1Or5s8vGlejFY7sUgRwNlHDlsjGiZubAYV82G2Unl"
    "IcCKTflulwvczG63Id0tSXvp1FINox9gaom2dU3GFlsd/bz5//ONLEtHFZD5rM2M0qayxI"
    "iiqqtY7vGOveubl6G+yuf6XuNL42j/sHGkXMxKUuXLkvJPDrGLR5K/iOvpskx3nQqpGmsK"
    "Ut8aJSDG7psJcG93dwWAymshQGMrvF5hVCI6p5/9vOx2FvSyLKQAskdVgjcQe3K7RrCQt+"
    "uJdQlFnXWuaSXwts7tP0Wux2fdZrEb6R9oKsbv2l6e/gGGwJ1r"
)

from tortoise import BaseDBAsyncClient

RUN_IN_TRANSACTION = True


async def upgrade(db: BaseDBAsyncClient) -> str:
    return """
        ALTER TABLE "user_sessions" ALTER COLUMN "refreshToken" TYPE VARCHAR(512) USING "refreshToken"::VARCHAR(512);"""


async def downgrade(db: BaseDBAsyncClient) -> str:
    return """
        ALTER TABLE "user_sessions" ALTER COLUMN "refreshToken" TYPE VARCHAR(255) USING "refreshToken"::VARCHAR(255);"""


MODELS_STATE = (
    "eJztmV1P2zAUhv9KlSsmMURDYWiaJqXQiU60nSBlEwhFbuK2Vh07xM6gQvz32c5XkzalYS"
    "AalBvUvuecxn7s5LwOj5pLHYjZnhHwqfa18agR4ELxIaPvNjTgeakqBQ5GWCWCOGPEuA9s"
    "LrQxwAwKyYHM9pHHESVCJQHGUqS2SERkkkoBQXcBtDidQD6Fvgjc3AoZEQc+QBZ/9WbWGE"
    "HsZIaJHHltpVt87iltOOye/lCZ8nIjy6Y4cEma7c35lJIkPQiQsydrZGwCCfQBh87CNOQo"
    "o9nGUjhiIXA/gMlQnVRw4BgEWMLQvo0DYksGDXUl+af1XSuBx6ZEokWESxaPT+Gs0jkrVZ"
    "OXOjkzLnYOjj6pWVLGJ74KKiLakyoEHISlimsKknJvmeTJFPirSUbpOZRimC+BGAspxXQH"
    "xRhjPC9jprngwcKQTNQuP1qD8Mq4UBRDiFTs6HCb96OALiMSZYouYNDvltqHacVr7sW3x/"
    "g/Wy/lZftQzsrgy8hORYAjF67GlinMkXOiyr34w3YS1MQUnAHB8+hRsYao2e11Lk2j90vO"
    "xGXsDitChtmREV2p85y6tG2TH2n87ppnDfm1cT3od/LLlOSZ15ock3iqU4vQews4C0+1WI"
    "3BZG8Dz3nZsmYK62V912VVg5fddjxbaBNSGAF7dg98x1qKUJ0W5S6HXN3NK4CAiVoVyVaO"
    "MvIeQ6a8wJInUfpaTyKfr6w2JZU3JWPkM94H4V2/qTXJFFXToOiHhxtYFJFVaFJULNt2MS"
    "jPcrGmRpmghC5AuAzHpOB1ID5/g289Qg8wdk/9FU/KYoqLNfVuTNsNu4I+Ej+4AmabUgwB"
    "Keg8mcIc0ZGofCukZXvx5s2mPRicZ4xVu2vmUA577c7FTlMRFkmIK7nbN+tjysfzs/Ux5U"
    "Mu67YdUy4hY2ItQnwrjitJfPe5Y4vFFlPr40uVjy/1i8FyLwZ9OBbBqUlnkJTxhfm6anrD"
    "w6a+gTcUWYXeUMVyJ5UHDwk25btdprCa3a4i3S2e9lrXUpvRD+BawmXdEttiiKOfvfp/vm"
    "FkrVUBac7WeJQu4SUsithd+e0erdi7vnmZyKt81putL63jg6PWsUhRI0mUL2u2f3yILbYk"
    "f6Ev3WWZ7rpQUs3G+iYvXeStUQJilF5NgM39/Q0AiqxCgCqWe71CCYdkRT/7eTnoF/SytC"
    "QHckjEBG8cZPPdBkaM324n1jUU5awzTSuGt9Mz/uS5npwP2vluJH+gLRi/a3t5+gcHQp1f"
)

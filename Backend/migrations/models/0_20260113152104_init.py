from tortoise import BaseDBAsyncClient

RUN_IN_TRANSACTION = True


async def upgrade(db: BaseDBAsyncClient) -> str:
    return """
        CREATE TABLE IF NOT EXISTS "users" (
    "id" UUID NOT NULL PRIMARY KEY,
    "firstName" VARCHAR(255) NOT NULL,
    "lastName" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL UNIQUE,
    "password" VARCHAR(255) NOT NULL,
    "isVerified" BOOL NOT NULL DEFAULT False,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS "user_sessions" (
    "id" UUID NOT NULL PRIMARY KEY,
    "userId" UUID NOT NULL,
    "refreshToken" VARCHAR(255) NOT NULL,
    "expiresAt" TIMESTAMPTZ NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS "aerich" (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "version" VARCHAR(255) NOT NULL,
    "app" VARCHAR(100) NOT NULL,
    "content" JSONB NOT NULL
);"""


async def downgrade(db: BaseDBAsyncClient) -> str:
    return """
        """


MODELS_STATE = (
    "eJztmG1v2jAQx78KyismdVVL6YOmaRK0TGUqMLWhm1pVkYkNWDh2GjujqOp3n21InJiHNl"
    "2rwsQbRP53l9z9bHJnHp2AQUT4bpejyPlSenQoCJD8ktN3Sg4IQ6MqQYAe0Y6x9NAK6HER"
    "AV9IsQ8IR1KCiPsRDgVmVKo0JkSJzJeOmA6MFFN8HyNPsAESQ53I7Z2UMYXoAfHkMhx5fY"
    "wIzOWJoXq21j0xCbXW7TbPvmtP9bie5zMSB9R4hxMxZDR1j2MMd1WMsg0QRREQCGbKUFnO"
    "yk2kacZSEFGM0lShESDqg5goGM7Xfkx9xaCkn6Q+qt+cAnh8RhVaTIVi8fg0rcrUrFVHPe"
    "r0vHZZPjj6pKtkXAwibdREnCcdCASYhmquBmQfR1y01cUcz9MhiBbzzAVZWGXKrwGaCIao"
    "2U0J0gTV6/g5AXjwCKIDMZSXlcPDFUCva5eaqfTSUJnc4dN9356ZKlObgmtgElCcZTZmiz"
    "JFiQKASRGOacDbQHz+B772CEPA+ZhFC96UyylmY7a70bQbfo0iLG+4AGadMYIAXdJ5coEW"
    "0Z6MfC+kRXvxy5tNvdO5UFkHnN8TLTRdC2W3VW9clvc1YemEhZabbdfC6kdIlV0T81TPpE"
    "HgAC3Gmgu0qMJZ5G7yZU13rSwBdiiZzN4tK4i7zVbjyq21fuawn9XchrJUtDqx1PKRtb/T"
    "m5R+Nd3zkros3XTaDXtmSP3cG0flBGLBPMrGHoCZ12CiJmByyxqH8HXLmgvcLuuHLqtOXs"
    "3f/VFmcFRCD/ijMYigN2dhFbbMd94UVAJbARQM9KootirLzHHkCnEu12KKb8FxJbXvPHds"
    "8XjWdXt82eTji1rPZiGYJuItgb7/i+Vf+BleEepL49BlI0SLzIV23HY2NCeVhxBLNsW7XS"
    "5wM7vdhnS3pOyVU8t2GP0Pppbpsq7J2FKTRz9/uGhgmVlWjirA+KzNjNKkosCIIneXvd1n"
    "K/ah/7wM1FM+V/arx9WTg6PqiXTRmaTK8Yrtnxxil48kf1Ckpssi3TUTsm2sKUj10ygAce"
    "a+mQD39/ZeAFB6LQWobdbfK4wKRBf0sx9XnfaSXmZCLJBdKgu8hdgXOyWCubhbT6wrKKqq"
    "c00rgVdu1X7bXE8vOnW7G6kb1CXjD20vT38BAx7ejg=="
)

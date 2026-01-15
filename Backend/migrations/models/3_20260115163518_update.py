from tortoise import BaseDBAsyncClient

RUN_IN_TRANSACTION = True


async def upgrade(db: BaseDBAsyncClient) -> str:
    return """
        ALTER TABLE "user_sessions" DROP COLUMN "expiresAt";"""


async def downgrade(db: BaseDBAsyncClient) -> str:
    return """
        ALTER TABLE "user_sessions" ADD "expiresAt" TIMESTAMPTZ NOT NULL;"""


MODELS_STATE = (
    "eJztmW1P2zAQx79KlVdMYoiWwtA0TUqhE51oO0HKJhCK3NhtrSZ2sJ1Bhfjus52nJm1Kw0"
    "C0KG9Q+7+72P754juXR8OjELl8zwzExPhaezQI8JD8kNF3awbw/VRVggBDVzuC2GPIBQOO"
    "kNoIuBxJCSLuMOwLTIlUSeC6SqSOdMRknEoBwXcBsgUdIzFBTBpubqWMCUQPiMdf/ak9ws"
    "iFmWliqMbWui1mvtYGg87pD+2phhvaDnUDj6Te/kxMKEncgwDDPRWjbGNEEAMCwbllqFlG"
    "q42lcMZSECxAyVRhKkA0AoGrYBjfRgFxFIOaHkn9aX43SuBxKFFoMRGKxeNTuKp0zVo11F"
    "AnZ+bFzsHRJ71KysWYaaMmYjzpQCBAGKq5piCp8BdJnkwAW04ycs+hlNN8CcRYSCmmGRRj"
    "jPG8jJnhgQfbRWSss/xoBcIr80JTDCFSmdFhmvciQ0NZFMoUXcAR65TKwzTiNXPx7TH+T+"
    "qlvByG1KpMsYjsVBoE9tBybJnAHDkYRe7FHzaToCGXAPvEnUVHxQqiVqfbvrTM7i+1Eo/z"
    "O1cTMq22sjS0OsupC2mbPKT2u2Od1dTX2nW/185vU+JnXRtqTvJUpzah9zaAc6darMZgsq"
    "+BD1+2rZnAalvfdVv15FW1HU3nyoQShsCZ3gMG7QULbdAi30WT1/DyCiBgrHdFsVWzjHqP"
    "Ade9wEJPovWVPYk6X3nVlGx9UzLCjIseCN/6dVuTTNB2NiiNw8M1WhTpVdikaFu27LqgPM"
    "v5mAplghJ5ALtlOCYBrwPx+Rd84xH6gPN7ypaclMUU52OqbEzLDb9CDMsHLoHZotRFgBRU"
    "nkxgjuhQRr4V0rK1eP1i0+r3zzONVatj5VAOuq32xU5dE5ZOWGi507Oqa8rH62era8qH3N"
    "ZNu6ZcIs7lXoT4llxXEvvuc9cWm8+7VteXbb6+VD8MlvthkKGRNE4sOkWkTF+Yj9vO3vCw"
    "3lijN5Rehb2htlVNzIerdmETsyHlzpRXBmf5/wpDy8oSB1KfjaltHSJKlDaZXfl0j3bsXW"
    "/sYzXK50a9+aV5fHDUPJYueiaJ8mVF+seXn+JS9hcx1ZWUOZXnQrbzQH6Ty7p6NUpAjNy3"
    "E2B9f38NgNKrEKC25SoaJQKRJfXs52W/V1DL0pAcyAGRC7yB2BG7NRdzcbuZWFdQVKvOFK"
    "0Y3k7X/JPnenLeb+WrkXpASzJ+1/Ly9A++4QwN"
)

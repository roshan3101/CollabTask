from tortoise import BaseDBAsyncClient

RUN_IN_TRANSACTION = True


async def upgrade(db: BaseDBAsyncClient) -> str:
    return """
        CREATE TABLE IF NOT EXISTS "task_assignees" (
    "id" UUID NOT NULL PRIMARY KEY,
    "assigned_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "task_id" UUID NOT NULL REFERENCES "tasks" ("id") ON DELETE CASCADE,
    "user_id" UUID NOT NULL REFERENCES "users" ("id") ON DELETE CASCADE,
    CONSTRAINT "uid_task_assign_task_id_de0cfd" UNIQUE ("task_id", "user_id")
);
CREATE INDEX IF NOT EXISTS "idx_task_assign_task_id_4737e6" ON "task_assignees" ("task_id");
CREATE INDEX IF NOT EXISTS "idx_task_assign_user_id_4027a8" ON "task_assignees" ("user_id");"""


async def downgrade(db: BaseDBAsyncClient) -> str:
    return """
        DROP TABLE IF EXISTS "task_assignees";"""


MODELS_STATE = (
    "eJztXVtzmzgU/isenrIz3U7tJtk2s7MzJKYpbQIZG6ed1h1GMYrDBoTLJWm2k/++krgJAY"
    "5xbMcXvbSxzjkgviOdmyT4LbmeBZ3gtTwK7Ts7fJCOWr8lBFyI/yjRXrUkMJnkFNIQgiuH"
    "MoOYy4a0GVwFoY+bMOUaOAHETRYMRr49CW0P4VYUOQ5p9EaY0UbjvClC9s8ImqE3huEN9D"
    "Hh+w/cbCML/sIXT35Obs1rGzpWocO2Re5N283wYULbBgO1+4FykttdmSPPiVyUc08ewhsP"
    "ZexRZFuviQyhjSGCPgihxTwG6WXyzGlT3GPcEPoRzLpq5Q0WvAaRQ8CQ/r6O0Ihg0KJ3Iv"
    "/s/yM1gGfkIQKtjUKCxe/H+KnyZ6atErnVyUe5t/f28A/6lF4Qjn1KpIhIj1QQhCAWpbjm"
    "QEIUYoXHoJQQPbkBvoIil6Kq4t4ANIIldLlLcDDjR5gH4LQhRzgfXSnEKXQFPCVD7n/G+g"
    "DB7RBd9PRPyolx1Jr43r9wFA6R3juVNfWbbKi6dtTy/DFA9n+Ays6kBckFv0wHonF4g3+2"
    "O1O0cin3qGLaHaoYD8+SeAJpCaVDSUQ/JX00G98FoUUO87m1sJJRnaMGRqkG5xnAufQ6jF"
    "3zpKfIhtKNx7A58iG59RBRWt+QjUHfxNBopxkLfqwwCszRDUDjjLOr9E966gUZ5+bgostc"
    "kbmnGU0s5upyv6+eahkjCAJ7jDLqQOPoEeI4DNU4U7i74ZHpwPw+yYzMHzKZmflzphzZZV"
    "KO0jXILFIvWRbgj27sO5anp/QNvcfy4FEUej7hYW1B3iHWJuS9KvBmXSvwZv0r8HaVM6XM"
    "i50qpLznyvmx0jPlbpfwuNC9gr4JLIuh9ZRz/ZKh+tD17li6jkHPRkTK5GHUkxExj2Xr7M"
    "9g2Tr7tZaNkIpz1IUhIG6oPEs/9XWt2rCxMtzcHCCM43fLHoWvWo4dhD9mmKmJk14P80ae"
    "mvTZDYKfDgve3rn8lcf15Ew/5u0gucAxB3IUYN03cx6MyC66DjwtGwKWS+wiXolFNEFYxq"
    "yLKaHtwmrcipIcdlYi+jr9Yz0xlPAzWDpyHhJrMgVTQz3Hvkc+vyhMcuI4CKVDWx+41r1D"
    "buJnF2l9UY2PLfKz9U3XFF5RGZ/xTSJ9AlHomci7J64kN3xpawrMI8mvrm+ZxIA0XIHR7T"
    "3wLbNE8TpeHW+Z5HZcvgUgMKZqIeCSbqZ5Z0R9TjkfJe3Tc9GUQ2Shm5yFeuGkOnivscAx"
    "+wtH67MbjUJkdThDYMWbgTyuOuTDKuK+1cYOX911/yXP675k4b3WxXsVpkGcfDVXa0FQqP"
    "VF1Uo7vyYxyTnNo4Mbe1IVmTDUqfGJm/EtoVj+nTHlbHUBt/wQIcyKQxjhhxvn3eyAbYBb"
    "WXIX8SMFvnkL3qns6gLoxBCWZ60UFzHTuuUQyd1zVTtqAcu10RDpXzRC9O5RIvyywXZcaZ"
    "8X9lx6hcBPILIIXmXkLxStq2qnR62EBWN/YqiXCgafrPDCIeoP+oSJlJWDKCBs8xWT38+g"
    "hfe1WnjPa0GE8FsQ64kQfivVuk4hvM6u7lcE8Tq3+l8fxrMhh9j1svnBOv2/0otXQ5nyL8"
    "ZvPw3jIuuNnYODWZZyDw7q13IJjdtwYVkY7ZpIqBpDRmQuGFe/eFvE8WCmzT4HU3b7HJS3"
    "+9zDq8AOG41FRmQjcVzKeGR7VsLSgL/Caiw5sQ3Bc1pwoHw1CnFBaVNBFhuc6dppys7vNB"
    "Dx9tYFZiLe3kq1No23c/Un++EqfPhxIvnhcw86oMY4JjH0RXyV9dTyYzpy01YWsGVlHSki"
    "FQkHA1Z9rsHqZalpxneS1ki4Mf6DEIN4ByW8g8kSgkhDtjcNEYGfCPymB34Fe1B2E57nQI"
    "BqZj0nyiF8hWWXNWabWsrZQT7W9bMCyMcqj+KArGbstSnimIkkarhZ1QwRU29f8CVi6q1U"
    "a9L58p7nq6YHs0qCzwiD1srdiA32C8WrlMAV4Ctj98HzoT1Gn+FDacW5Ok3jlzrWFrxSro"
    "abfXCfZSHM4MiOUVGA5f6J3FWkmnm7AAgHAVzrqPBJ5ErGqABgXzFa2uDsTHqcpXhAjvY9"
    "s3Jg4Ets1lBcatmAwlFRM0hhqi8YZLpYcrUgKUzEFYNJXspItrXwzcnZUCgKCcsvJNBDtk"
    "0qCZmAKCWIUsIqSgkbuHMu9CyvPNMlQ+/qWGOYOESqZl709NOe0u8ftWxkYvNHZm0wRD3l"
    "UlW+HLV8eGfD+yHq4sTkqGV5KH64pu+ZaM8w3Nvt+vdMtPnBfgf9oHKgq6hmnDMSnBKIh1"
    "ySEtrPsBhjcpM/O+39v/bfvT3cf4dZaEeylr+mgCoqNluZ2ouKzVaqtVSxSYPPhpUHTmwH"
    "qzWi1PUM8NJXzDRDriglSl555lgCcfeKNpxFqinZVAzCBYC3kXs7eACLs0vUDF+uZpgO5Q"
    "XUDWXGQmzO0Fx6/TCDpaaOyMI2vZ5oFpS16GPLYVLTJCdgS0eVEzItJ+YMon64zPph+h6/"
    "Od7qxImKRGjN8ls6m5tNFEZkV6JR8Q69BcbvqXl/ZvC0eQuEfPTETKSnA88oiRVXE3KuMW"
    "rMZKpG7WVOk1JgKwKrFPD6gIo8kDg1uvlR0rXtB6HWcM92QUistmZgOqA5lqyMgDJ/Z7wL"
    "bKcJjpmAOM+cFs1wGnPv+RWWsh5FVkaMRubQwCX0bXzB5kcGWEFxYEAsP+9Aei6Wn7dArf"
    "Mfwk3r66s+jLs+Kw5Vy/b46Ve2v3hNkUgHxs4DwaxGuBA9d4aIxaPa2kYfBgF9vVVNjSOj"
    "v3qq1mEGLKuoeWxyzUO81rbZ4oEPrzHxxvBuYc33yKpR4+U2M6FcyjuyROazBSFynPk0iJ"
    "GX6e5k6Nuj6i/OxJSpLg7kPGvj22p37Ve6tooN+4nGXrTMt5AN+/WurPbIQ71Vrj/zsCEG"
    "eTkvf5w0+lpPwr6ZALbfvJnl6M2bN/VnbwiN82geCiGq8Gf1X0JkRBbwIcT1Cq8W9iXEF3"
    "Uvj/8D+6vitA=="
)

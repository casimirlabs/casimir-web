# Casimir Data

> Database JSON schemas

## Schemas

Find the core JSON schemas in [src/schemas](src/schemas). These are the source of truth for data modeling in Casimir. When we deploy our [Postgres](https://www.postgresql.org/docs/) databases, we use the schemas to generate tables from each JSON object's properties. See the reference table below for the database, table, file, and description of each schema.

| Database | Table | Schema | Description |
| --- | --- | --- | --- |
| Users (Postgres) | `accounts` | [account.schema.json](src/schemas/account.schema.json) | User accounts |
| Users (Postgres) | `nonces` | [nonce.schema.json](src/schemas/nonce.schema.json) | User auth nonces |
| Users (Postgres) | `users` | [user.schema.json](src/schemas/user.schema.json) | User profiles |
| Users (Postgres) | `user_accounts` | [user_account.schema.json](src/schemas/user_account.schema.json) | User account relations |

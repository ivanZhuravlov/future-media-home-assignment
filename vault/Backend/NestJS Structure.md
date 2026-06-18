---
tags:
  - backend
  - nestjs
---

# NestJS Structure

## Module layout

```
backend/src/
├── main.ts                 Bootstrap, CORS, ValidationPipe, cookie-parser
├── app.module.ts           Root module: Config, TypeORM, feature modules
├── config/
│   └── configuration.ts    Joi env validation
├── database/
│   ├── data-source.ts      CLI migrations
│   └── migrations/
├── auth/                   Register, login, refresh, JWT strategies
├── users/                  User entity & service
├── messages/               CRUD, filtering, ownership guard
└── common/
    └── decorators/
        └── current-user.decorator.ts
```

## Pattern: Controller → Service → Repository

| Layer | Responsibility |
|-------|----------------|
| **Controller** | Routing, DTO binding, guard application |
| **Service** | Business logic, QueryBuilder, transactions |
| **Entity/Repository** | TypeORM data access |

Controllers must **not** contain business logic.

## Root module (`app.module.ts`)

- `ConfigModule` — global, Joi-validated env
- `TypeOrmModule` — `synchronize: false`, migrations only
- Imports: `UsersModule`, `AuthModule`, `MessagesModule`

## Bootstrap (`main.ts`)

- `cookieParser()` for refresh token cookies
- CORS with `credentials: true` for frontend origin
- Global `ValidationPipe` (whitelist, forbidNonWhitelisted, transform)

## Feature modules

| Module | Exports | See |
|--------|---------|-----|
| `UsersModule` | `UsersService` | User CRUD (internal) |
| `AuthModule` | `AuthService`, `JwtModule` | [[Backend/Authentication]] |
| `MessagesModule` | `MessagesService` | [[Backend/Messages Module]] |

## Dependency injection

All services use constructor injection. Guards and strategies are registered as providers in their respective modules.

## Related notes

- [[Backend/API Reference]]
- [[Database/Schema and Migrations]]

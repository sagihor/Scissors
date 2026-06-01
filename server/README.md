# Scissors API — Backend

A REST API supporting both Assignment 2 (CRUD over users and barbershops) and the additions required by Assignment 3 (authentication, current-user lookup, per-user settings).

## How to Run

1. Open a terminal in the `server` folder.
2. Run: `npm install`
3. Run: `node server.js`
4. The server runs on: **http://localhost:3000**

The base URL for all endpoints is `http://localhost:3000/api`.

## Project Structure

- `models/` — JSON data files and the model functions that read/write them. Includes `user.model.js`, `barbershop.model.js`, `settings.model.js` and their JSON stores.
- `controllers/` — Request handlers. Validates input, calls the relevant model, formats the response.
- `routes/` — Express route definitions. Composes middlewares onto each endpoint.
- `middleware/` — Reusable middlewares: `logger`, `requireRole`, `allowSelfOr`, `authMock`, `simulateDelay`.
- `docs/` — Postman collection and screenshots (from Assignment 2).

## Mock Data Persistence

Mutations are written back to the JSON files on every change (see the `persist()` helper in each model). This means changes made via the API survive server restarts. To reset to the seeded state, run `git checkout server/models/*.json`.

## Authentication

Authentication is **mocked** for this assignment. Login validates the email/password against the seeded user records (passwords are stored in plain text — acceptable for course mock data, would never be done in production). On successful login the server returns a token of the form `mock-token-<userId>`. Subsequent requests include this token via the `Authorization: Bearer <token>` header.

The `authMock` middleware parses the token, looks up the user, and attaches the user object to `req.user`. It also populates the legacy headers `x-user-role` and `x-user-id` so that the role-check middlewares from Assignment 2 (`requireRole`, `allowSelfOr`) continue to work unchanged.

### Demo credentials

Password is `123456` for all seeded users.

| Email | Role |
|---|---|
| `ido@scissors.test` | admin |
| `sagi@scissors.test` | manager |
| `rachel@scissors.test` | customer (maps to `user`) |
| `David@scissors.test` | barber (maps to `user`) |

The seeded users include domain roles `customer`, `barber`, `owner`, `admin`, `manager`. The `authMock` middleware maps `admin → admin`, `manager → manager`, and everything else to `user` for the purposes of role-based access control.

## API Rules

### 1. Response Format

All responses use this structure:

- **Success**: `{ "success": true, "data": ..., "error": null }`
- **Error**: `{ "success": false, "data": null, "error": { "code": "...", "message": "...", "details": {} } }`

### 2. Validation & Security

- **Fields**: POST and PUT requests must include all required fields, or the server returns **400 Bad Request**.
- **Authorization**:
  - **DELETE** (any resource) and **POST /api/barbershops**: `admin` only.
  - **PUT /api/barbershops/:id**: `admin` or `manager`.
  - **PUT /api/users/:id**: `admin` or `manager`, OR a regular `user` updating their own record (verified via `x-user-id`).
  - **GET** endpoints and **POST /api/users**: open access.
  - **GET /api/users/me**, **POST /api/auth/logout**, **GET/PUT /api/settings**: require a valid token via `Authorization: Bearer <token>`.
- **Headers used by the role check**:
  - For requests authenticated via token, `authMock` sets `x-user-role` and `x-user-id` automatically.
  - For testing without a token (Postman/curl), you can send `x-user-role` and `x-user-id` directly — this is the Assignment 2 mock-auth pattern, still supported.
- **IDs**: If an ID is not found, the server returns **404 Not Found**.

## API Reference

### Auth (`/api/auth`)

- **POST /api/auth/login** — Body: `{ email, password }`. Validates email format and password length (≥ 6 chars), then verifies credentials. Returns **200** with `{ token, user }`, or **401 INVALID_CREDENTIALS** on failure.
- **POST /api/auth/logout** — Requires auth. Returns **200** with `{ message: "Logged out." }`. Stateless — the frontend clears its own token.

### Users (`/api/users`)

- **GET /api/users/me** — Requires auth. Returns the current logged-in user.
- **GET /api/users** — Returns all users.
- **GET /api/users/:id** — Returns one user by ID.
- **POST /api/users** — Create a user. Body: `{ firstName, lastName, userRole }`. Returns **201** + `userId`.
- **PUT /api/users/:id** — Update a user. Body: `{ firstName, lastName, userRole }`. Returns **200** + `userId`.
- **DELETE /api/users/:id** — Delete a user. Returns **200** + `userId`.

### Barbershops (`/api/barbershops`)

- **GET /api/barbershops** — Returns all shops, including `rating` and `reviewCount` fields used by the frontend Dashboard.
- **GET /api/barbershops/:id** — Returns one shop by ID.
- **POST /api/barbershops** — Create a shop. Body: `{ name, address, phone }`. Returns **201** + `barbershopId`.
- **PUT /api/barbershops/:id** — Update a shop. Body: `{ name, address, phone }`. Returns **200** + `barbershopId`.
- **DELETE /api/barbershops/:id** — Delete a shop. Returns **200** + `barbershopId`.

### Settings (`/api/settings`)

Per-user editable settings. Both endpoints require auth.

- **GET /api/settings** — Returns `{ username, email, theme }` for the current user. `username` and `email` come from the user record; `theme` comes from the settings store.
- **PUT /api/settings** — Body may include any subset of `{ username, email, theme }`. Validates each provided field. Enforces uniqueness — returns **409 CONFLICT** if another user already has the supplied username or email. Returns **200** with the merged result.

## Response Format Examples

### Success — write operation (Status 200/201)

Write operations return the affected ID in the `data` field.

```json
{
  "success": true,
  "data": { "userId": 15 },
  "error": null
}
```

### Success — login (Status 200)

```json
{
  "success": true,
  "data": {
    "token": "mock-token-11",
    "user": {
      "userId": 11,
      "firstName": "Ido",
      "lastName": "Harel",
      "email": "ido@scissors.test",
      "userRole": "admin"
    }
  },
  "error": null
}
```

### Validation Error (Status 400)

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Missing required fields.",
    "details": { "required": ["firstName", "lastName", "userRole"] }
  }
}
```

### Unauthorized (Status 401)

Returned when a protected endpoint is called without a valid token.

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Missing or malformed Authorization header.",
    "details": {}
  }
}
```

### Forbidden (Status 403)

Returned when a protected endpoint is called with insufficient role.

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "FORBIDDEN",
    "message": "You do not have permission to perform this action.",
    "details": {}
  }
}
```

### Conflict (Status 409)

Returned when a PUT /api/settings would create a duplicate username or email.

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "CONFLICT",
    "message": "Email is already taken.",
    "details": { "field": "email" }
  }
}
```

## Middlewares

- **`logger`** — Logs `[timestamp] METHOD URL — Status: N (Xms)` for every request.
- **`simulateDelay`** — Adds a 400ms delay to every request so that frontend loading states are visible during local development with mock data.
- **`requireRole(...roles)`** — Reads `x-user-role` from the request and rejects with 403 if the role isn't in the allowed list.
- **`allowSelfOr(...roles)`** — Allows access if the user's role is in the allowed list, OR if the user is updating their own record (matched via `x-user-id` against the `:id` URL param).
- **`authMock`** — Parses `Authorization: Bearer mock-token-<id>`, looks up the user, attaches `req.user`, and sets the legacy `x-user-role` / `x-user-id` headers so role middlewares continue to work.
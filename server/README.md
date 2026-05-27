# Scissors API - Assignment 2

## How to Run
1. Open the terminal in the `server` folder.
2. Run: `npm install`
3. Run: `node server.js`
4. The server runs on: `http://localhost:3000`

## Project Structure
- `models/`: JSON data and logic.
- `controllers/`: Request handling and validation.
- `routes/`: API paths.
- `middleware/`: Logging and Role check.
- `docs/`: Postman collection and screenshots.

## API Rules
### 1. Response Format
All responses use this structure:
- **Success**: `{ "success": true, "data": ..., "error": null }`
- **Error**: `{ "success": false, "data": null, "error": { "code": "...", "message": "..." } }`

### 2. Validation & Security
- **Fields**: POST and PUT requests must include all required fields, or the server returns **400 Bad Request**.
- **Roles** (sent via the `x-user-role` header — values: `admin`, `manager`, `user`):
  - **DELETE** (any resource) and **POST /barbershops**: `admin` only.
  - **PUT /barbershops/:id**: `admin` or `manager`.
  - **PUT /users/:id**: `admin` or `manager` — OR a regular `user` updating their **own** record. For self-update, send `x-user-id: <your userId>` so the server can verify the requester matches `:id`.
  - **GET** endpoints and **POST /users**: open access.
- **Headers**: Use `x-user-role` for the role, and `x-user-id` when a regular user updates their own record.
- **IDs**: If an ID is not found, the server returns **404 Not Found**.
---

## API Reference

### Users (`/users`)
- **GET /users**: Returns all users.
- **GET /users/:id**: Returns one user by ID.
- **POST /users**: Create a user. Body: `{ firstName, lastName, userRole }`. Returns **201** + `userId`.
- **PUT /users/:id**: Update a user. Body: `{ firstName, lastName, userRole }`. Returns **200** + `userId`.
- **DELETE /users/:id**: Delete a user. Returns **200** + `userId`.

### Barbershops (`/barbershops`)
- **GET /barbershops**: Returns all shops.
- **GET /barbershops/:id**: Returns one shop by ID.
- **POST /barbershops**: Create a shop. Body: `{ name, address, phone }`. Returns **201** + `barbershopId`.
- **PUT /barbershops/:id**: Update a shop. Body: `{ name, address, phone }`. Returns **200** + `barbershopId`.
- **DELETE /barbershops/:id**: Delete a shop. Returns **200** + `barbershopId`.

---

## Response Format & Examples

All endpoints follow a unified response structure: `{ success, data, error }`.

Example Success Response (Status 201/200): Write operations (POST, PUT, DELETE) return only the affected ID in the data field.
```json
{
  "success": true,
  "data": {
    "userId": 15
  },
  "error": null
}
```

Example Validation Error (Status 400): Returned when required fields are missing in POST/PUT requests.
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Missing required fields.",
    "details": {
      "required": ["firstName", "lastName", "userRole"]
    }
  }
}
```


Example Forbidden Error (Status 403): Returned when a protected route is accessed with an insufficient `x-user-role` (e.g. `user` trying to delete, or `user` trying to update someone else's record).
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

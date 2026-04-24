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
- **Roles**: PUT and DELETE requests (and POST for barbershops) require an `admin` role.
- **Headers**: Use `x-user-role: admin` in Postman to access protected routes.
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


Example Forbidden Error (Status 403): Returned when a protected route is accessed without x-user-role: admin header

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

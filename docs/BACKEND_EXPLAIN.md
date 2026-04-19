# Backend Architecture & Data Flow

This project follows the **MVC (Model-View-Controller)** design pattern to ensure a clean separation of concerns, making the code maintainable, scalable, and easy to debug.

---

## 📂 Folder Structure & Responsibilities

### 1. `server.js` (Entry Point)
The heart of the application. It initializes the Express server, connects to the Database, and mounts global middlewares and routes.

### 2. `routes/` (The Gatekeeper)
Defines the available endpoints (URLs) and the HTTP methods (GET, POST, PUT, DELETE). It maps incoming requests to the specific logic in the Controllers.

### 3. `middleware/` (The Security Guard)
Functions that execute **before** the request reaches the Controller. Common uses include:
* **Authentication:** Checking JWT tokens.
* **Validation:** Ensuring the data sent by the user is in the correct format.

### 4. `controllers/` (The Brain)
Contains the business logic. It processes the request, interacts with the Models to fetch or modify data, and decides what response to send back to the client.

### 5. `models/` (The Librarian)
Defines the schema (structure) of the data and communicates directly with the Database (e.g., MongoDB/PostgreSQL).

### 6. `mock-data/` (Development Tool)
Contains static JSON files used for testing the API flow before the actual Database is fully integrated.

---

## 🔄 The Request-Response Lifecycle (The Flow)

To understand how these files interact, let’s trace a **"Update Profile Name"** request:

### **Phase A: The Request (Going In)**
1.  **Client:** Sends a `PUT` request to `/api/users/update` with the data `{"name": "John"}`.
2.  **`routes/`:** Matches the URL `/api/users/update` and directs the request to the `auth` middleware.
3.  **`middleware/`:** Verifies the user's session/token. If valid, it passes the request to the Controller.
4.  **`controllers/`:** Receives the new name ("John"). It calls a function from the Model: `User.update(id, "John")`.
5.  **`models/`:** Executes the command in the Database to update the specific record.

### **Phase B: The Response (Coming Back)**
6.  **Database:** Confirms the update was successful and returns the updated user object.
7.  **`models/`:** Passes the updated data back to the Controller.
8.  **`controllers/`:** Sends a JSON response to the client with Status **200 OK** and the updated profile data.
9.  **Client:** Receives the response and updates the UI to show the new name.

---

## 🛠 Tech Stack (Server-Side)
* **Runtime:** Node.js
* **Framework:** Express.js
* **Environment:** Cross-platform configuration using `.env` files.
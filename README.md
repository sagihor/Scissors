# Scissors — Assignment 3 Submission

A React frontend for a barbershop appointment management app, built on top of the Assignment 2 backend with additional endpoints for authentication and per-user settings.

## Quick start

Two terminals are needed — one for the backend, one for the frontend.

### Prerequisites

- **Node.js 18.x** (Node 22+ is not compatible with create-react-app)

### Terminal 1 — Backend

```bash
cd server
npm install
npm start
```

Backend runs at **http://localhost:3000**.

### Terminal 2 — Frontend

```bash
cd client
npm install
npm start
```

Frontend opens at **http://localhost:5173**.

First start takes a few minutes. create-react-app uses webpack,
which compiles the whole app on the first `npm start`. Expect roughly 2–4 minutes before
the browser opens — first "Starting the development server..." appears, then "Compiled
successfully!" The browser opens automatically at http://localhost:5173 when it is ready.
Please wait for it rather than stopping the process. 


## Login credentials

The backend ships with seeded mock users. Password is `123456` for all.

- **Admin:** `ido@scissors.test`
- **Manager:** `sagi@scissors.test`
- **Customer:** `rachel@scissors.test`

## What's in this submission

- `client/` — React frontend (Assignment 3 deliverable, built with create-react-app)
- `server/` — Express backend (Assignment 2 + new endpoints for Assignment 3)
- `screenshots/` — required screenshots showing the application running
- `client/README.md` and `server/README.md` — detailed per-project documentation

## Why both client/ and server/ are included

The Assignment 3 PDF lists "Frontend source code" as the submission. The `server/` directory is also included because:

- The frontend cannot run standalone — it makes HTTP requests to the backend
- The backend now includes endpoints that were added during Assignment 3 development (`/api/auth/login`, `/api/users/me`, `/api/settings`) which are not in the original Assignment 2 backend
- Including the server ensures the project can be tested end-to-end on the grader's machine

## Backend changes from Assignment 2

The backend retains every Assignment 2 endpoint and adds:

- `POST /api/auth/login` and `POST /api/auth/logout`
- `GET /api/users/me`
- `GET /api/settings` and `PUT /api/settings`
- `authMock` middleware for token-based authentication
- All previous routes re-mounted under `/api/` prefix (per Assignment 3 requirement)
- A `simulateDelay` middleware that adds 400ms to API responses so frontend loading states are visible during demo

See `server/README.md` for full API documentation.
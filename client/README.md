# Scissors — Frontend (Assignment 3)

A React frontend for the Scissors barbershop appointment management app. Built with create-react-app + React Router + Tailwind CSS v3. Connects to the backend REST API built in Assignment 2.

## Prerequisites

- **Node.js 18.x** (CRA is not compatible with Node 22+ at the time of this submission. If you have a newer Node, install Node 18 via nvm-windows or nvm: `nvm install 18.20.4 && nvm use 18.20.4`)
- The backend server (Assignment 2) must be running at `http://localhost:3000`

## How to install dependencies

```bash
npm install
```

## How to start the server

```bash
npm start
```

This opens the frontend at **http://localhost:5173**. The port is set explicitly via `.env` to avoid conflict with the backend (which uses port 3000).

## API Base URL

The frontend connects to the backend at **http://localhost:3000**.
All API calls go to `http://localhost:3000/api/...` via the shared `apiClient` in `src/services/apiClient.js`.

## Demo credentials

The backend seeds these test users (password `123456` for all):

| Email | Password | Role |
|---|---|---|
| `ido@scissors.test` | `123456` | admin |
| `sagi@scissors.test` | `123456` | manager |
| `rachel@scissors.test` | `123456` | customer |

## Project structure:
src/
├── App.js                       # Routing config + AuthProvider wrapper
├── index.js                     # React DOM mount
├── index.css                    # Tailwind + dark-mode styles
├── components/                  # Reusable UI elements
│   ├── Navbar.js
│   ├── Footer.js
│   ├── Layout.js
│   ├── ProtectedRoute.js
│   ├── BarbershopCard.js
│   └── BarbershopTable.js
├── pages/                       # Main route views
│   ├── Login.js
│   ├── Dashboard.js
│   └── Settings.js
└── services/                    # API communication
├── apiClient.js
└── AuthContext.js

## Assignment 3 requirements mapping

| Requirement | Implementation |
|---|---|
| Login Page (POST /api/auth/login) | `pages/Login.js` — email + password (≥ 6 chars) validation, loading state, error feedback, redirect on success |
| Navbar & Layout (GET /api/users/me, POST /api/auth/logout) | `components/Navbar.js` + `Layout.js` |
| Footer | `components/Footer.js` |
| Settings Page (GET /api/settings, PUT /api/settings) | `pages/Settings.js` — three independent fields (Username, Email, Theme) with per-field save and validation |
| Dashboard | `pages/Dashboard.js` — fetches `/api/barbershops`, displays top 3 by rating as cards, full list in a table |
| Reusable Card Component | `components/BarbershopCard.js` — receives a single `shop` prop, reused 3 times on Dashboard |
| Data Table Component | `components/BarbershopTable.js` — dynamically maps array to rows |
| Client-side routing | `App.js` (React Router v6) |
| Connects to backend API | `services/apiClient.js` |

## Loading state visibility

The backend includes a small artificial delay (~400ms per request) so that loading states are visible during local demo. This is intentional for grading visibility; it can be removed by deleting the `simulateDelay` middleware from `server/server.js`.
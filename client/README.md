# Scissors — Frontend (Assignment 3)

A React frontend for the Scissors barbershop appointment management web app. Built with Vite + React Router + Tailwind. Connects to the backend REST API built in Assignment 2.

## How to install dependencies

```bash
npm install
```

## How to start the server

```bash
npm start
```

This opens the frontend at **http://localhost:5173**.

## API Base URL

The frontend connects to the backend at **http://localhost:3000**.
All API calls are made to `http://localhost:3000/api/...` via the shared `apiClient` in `src/services/apiClient.js`.

## Prerequisites

The backend server (Assignment 2) must be running on `http://localhost:3000` before starting the frontend.

To start the backend, in a separate terminal:

```bash
cd ../server
npm install
npm start
```

## Demo credentials

The backend ships with seeded mock users. To log in, use any of:

| Email | Password | Role |
|---|---|---|
| `ido@scissors.test` | `123456` | admin |
| `sagi@scissors.test` | `123456` | manager |
| `rachel@scissors.test` | `123456` | customer (user) |

All seeded users have password `123456`. Login validates email + password against the user record in `server/models/users.json`.

## Project structure
src/
├── App.jsx                          # Routing config + AuthProvider wrapper
├── main.jsx                         # React DOM mount
├── index.css                        # Tailwind + dark-mode styles
├── components/                      # Reusable UI elements
│   ├── Navbar.jsx
│   ├── Footer.jsx
│   ├── Layout.jsx                   # Wraps protected pages (Navbar + Outlet + Footer)
│   ├── ProtectedRoute.jsx           # Route guard
│   ├── BarbershopCard.jsx           # Reusable Card component (PDF #6)
│   └── BarbershopTable.jsx          # Data Table component (PDF #7)
├── pages/                           # Main route views
│   ├── Login.jsx
│   ├── Dashboard.jsx
│   └── Settings.jsx
└── services/                        # API communication
├── apiClient.js                 # Fetch wrapper + auth header + 401 handling
└── AuthContext.jsx              # Auth state + theme state via React Context

## Mapping to Assignment 3 requirements

| Requirement | Implementation |
|-------------|----------------|

| 1. Login Page (POST /api/auth/login) | `pages/Login.jsx` — email + password (≥ 6 chars) validation, loading state, error feedback, redirect on success |

| 2. Navbar & Layout (GET /api/users/me, POST /api/auth/logout) | `components/Navbar.jsx` + `Layout.jsx` — shows logged-in user's name, logout button, nav links |

| 3. Footer | `components/Footer.jsx` — project name, slogan, year |

| 4. Settings Page (GET /api/settings, PUT /api/settings) | `pages/Settings.jsx` — three independent editable settings: Username, Email, Theme preference. Each has its own validation, save action, and loading/success/error states |

| 5. Dashboard (GET data from backend) | `pages/Dashboard.jsx` — fetches `/api/barbershops`. Top 3 by rating shown as cards; full list in a table. Loading and empty states implemented |

| 6. Reusable Card Component | `components/BarbershopCard.jsx` — receives a single `shop` object via props. Reused 3 times on Dashboard (top-rated section) |

| 7. Data Table Component | `components/BarbershopTable.jsx` — receives `shops` array via props, maps to rows dynamically with `.map()` |

## Loading state visibility

The backend includes a small artificial delay (~400ms per request) so that loading states are visible during local demo. This is intentional and only affects mock data; it can be removed by deleting the `simulateDelay` middleware from `server/server.js`.

## Tooling note

This project uses **Vite** instead of create-react-app. Meta deprecated CRA in early 2025 and the React team now recommends Vite. The PDF's `npm start` requirement is satisfied — `npm start` is aliased to `vite` in `package.json`.

## Routes

- `/login` — public; redirects to `/dashboard` after successful login
- `/dashboard` — protected; main page with featured cards + table
- `/settings` — protected; per-field edit form
- `/` and unknown routes — redirect to `/dashboard` (or `/login` if not authenticated)

## Authentication flow

1. User enters email + password on `/login`.
2. Frontend calls `POST /api/auth/login`. On success, receives a token + user object.
3. Token (`mock-token-<userId>`) stored in `localStorage`.
4. Every subsequent request includes `Authorization: Bearer <token>` header (auto-attached by `apiClient.js`).
5. On 401 response (invalid/missing token), the interceptor clears local state and redirects to `/login`.
6. Logout (Navbar button): calls `POST /api/auth/logout`, clears `localStorage`, redirects.

## Submission contents

- Source code in `client/` (excluding `node_modules/`)
- `server/` directory (the Assignment 2 backend, with Assignment 3 endpoints added: `/api/auth/*`, `/api/users/me`, `/api/settings`)
- This README
- `screenshots/` folder with Login, Dashboard, Table, Settings screenshots
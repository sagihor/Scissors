# Scissors — Frontend

React app (Create React App) with React Router and Tailwind CSS.

## Setup
```bash
npm install
npm start        # http://localhost:5173
```
The backend must be running on http://localhost:3000 first.

`.env`:
PORT=5173
GENERATE_SOURCEMAP=false
## Login
Use a seeded account, e.g. `ido@scissors.test` / `123456` (admin),
or `roni@scissors.test` / `123456` (customer).

## Structure
frontend/src/
├── components/    # Chat, AiRecommender, Navbar, BarbershopCard/Table, etc.
├── pages/         # Dashboard, Login, Settings
└── services/      # apiClient (fetch wrapper), socket (Socket.IO), AuthContext

## How it connects to the backend
- **REST:** `services/apiClient.js` calls `http://localhost:3000/api/...` and
  attaches the auth token from localStorage.
- **WebSocket:** `services/socket.js` opens a Socket.IO connection to the backend
  for live chat.
- **Auth:** `services/AuthContext.js` stores the logged-in user and token.

## Main UI (Dashboard)
- **AI Barbershop Finder** — type a request, get an AI recommendation
  (`components/AiRecommender.js` → `POST /api/ai/recommend`).
- **Top Rated / All Barbershops** — data from `GET /api/barbershops`.
- **Live Chat** — real-time chat across tabs (`components/Chat.js`).
  Open two tabs to see messages and typing sync live.
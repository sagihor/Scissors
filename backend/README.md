# Scissors — Backend

Node.js + Express API with Sequelize (MySQL), Socket.IO, and Google Gemini.

## Setup

1. Install:
```bash
   npm install
```

2. Create `.env` from `.env.example`:
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=scissors_db
DB_USER=root
DB_PASSWORD=your_mysql_password
AI_API_KEY=your_gemini_api_key

3. Create the DB, then run migrations + seed:
```bash
   npx sequelize-cli db:migrate
   npx sequelize-cli db:seed:all
```

4. Run:
```bash
   npm run dev      # http://localhost:3000
```

## Structure
backend/
├── config/        # Sequelize DB connection + CLI config
├── models/        # ORM models + associations (index.js)
├── migrations/    # Schema (sequelize-cli)
├── seeders/       # Sample data
└── src/
├── controllers/   # Route handlers
├── middleware/     # auth, logger, role checks
├── routes/         # Express routers
├── services/       # ai.service.js (Gemini)
├── socket/         # Socket.IO chat
└── server.js       # Entry point

## Models & Relationships
| Model | Table | Relationship |
|-------|-------|--------------|
| User | `users` | base entity |
| Admin | `admins` | one-to-one with User |
| Barbershop | `barbershops` | main resource |
| Service | `services` | one-to-many (Barbershop → Service) |
| BarbershopBarber | `barbershop_barbers` | junction, many-to-many (User ↔ Barbershop) |
| Setting | `settings` | one-to-one with User |
| Review | `reviews` | one-to-many (Barbershop/User → Review) |
| Message | `messages` | chat history |

Shop ratings are computed from reviews at read time (not stored).

## API
All responses: `{ success, data, error }`. Auth header: `Authorization: Bearer mock-token-<userId>`.

| Method | Endpoint | Auth |
|--------|----------|------|
| POST | `/api/auth/login` · `/api/auth/logout` | login: no / logout: yes |
| GET/POST/PUT/DELETE | `/api/users` , `/api/users/:id` , `/api/users/me` | mixed (see code) |
| GET | `/api/barbershops` , `/api/barbershops/:id` | no |
| GET | `/api/barbershops/:id/barbers` | no — **JOIN** (shop + barbers + services) |
| POST/PUT/DELETE | `/api/barbershops` , `/api/barbershops/:id` | admin/manager |
| GET/PUT | `/api/settings` | yes |
| GET | `/api/messages` | no — chat history |
| POST | `/api/ai/recommend` | no — AI recommendation |

## WebSocket (Socket.IO) — Live Chat
Custom events (plus connect/disconnect):
- `chat:message` — client → server → all (saved to MySQL + broadcast)
- `chat:typing` — client → server → others ("X is typing…")
- `chat:join` — client → server → others ("X joined")

Setup in `src/socket/index.js`. History via `GET /api/messages`.

## AI — Gemini Recommender
`POST /api/ai/recommend` with body `{ "request": "..." }`. The backend pulls
shops + services + reviews from MySQL, prompts Gemini, returns a recommendation.
The `AI_API_KEY` is server-side only — never exposed to the frontend.
Files: `src/services/ai.service.js`, `src/controllers/ai.controller.js`.

## Reset data
```bash
npx sequelize-cli db:seed:undo:all && npx sequelize-cli db:seed:all
```
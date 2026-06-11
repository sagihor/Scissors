# Scissors — Full Stack Barbershop Directory

A barbershop directory app with a MySQL database (Sequelize ORM), real-time chat
(Socket.IO), and an AI-powered recommender (Google Gemini).
React (frontend)  ->  Express (backend)  ->  Sequelize ORM  ->  MySQL
 + WebSockets (Socket.IO)
            + AI (Google Gemini)
## Purpose
Browse barbershops across cities, view their services and reviews, chat with
other users in real time, and get AI recommendations from a free-text request
(e.g. "a cheap fade in Tel Aviv with great reviews").

## Structure
Scissors/
├── frontend/   # React app — see frontend/README.md
└── backend/    # Express + Sequelize + Socket.IO + AI — see backend/README.md
## Quick Start

1. **Create the database** (MySQL):
```sql
   CREATE DATABASE IF NOT EXISTS scissors_db
     CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. **Backend** (from `backend/`):
```bash
   npm install
   # create .env from .env.example and fill in DB password + Gemini key
   npx sequelize-cli db:migrate
   npx sequelize-cli db:seed:all
   npm run dev          # http://localhost:3000
```

3. **Frontend** (from `frontend/`):
```bash
   npm install
   npm start            # http://localhost:5173
```

Open http://localhost:5173 and log in (e.g. `ido@scissors.test` / `123456`).

## Features
- **MySQL + ORM:** full CRUD, JOINs, one-to-many & many-to-many relationships.
- **WebSockets:** live chat with 3 custom events (`chat:message`, `chat:typing`,
  `chat:join`), persisted to MySQL.
- **AI:** barbershop recommender via Gemini — `POST /api/ai/recommend`.

Details are in `frontend/README.md` and `backend/README.md`.

## Known Limitations
- Simplified auth (`mock-token-<userId>`, not real JWT).
- Single global chat channel (no rooms).
- Seed passwords are plain text; AI free tier may rate-limit occasionally.
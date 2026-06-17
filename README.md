# Scissors — Full Stack Barbershop Directory

A full-stack barbershop directory application built with a React frontend, an
Express backend, a MySQL database accessed through the Sequelize ORM, real-time
chat using Socket.IO, and an AI-powered barbershop recommender using Google
Gemini.

```
React (frontend)  ->  Express (backend)  ->  Sequelize ORM  ->  MySQL
                          + WebSockets (Socket.IO)
                          + AI (Google Gemini)
```

---

## 1. Project Purpose

Scissors lets users discover and manage barbershops across multiple cities. Users
can browse barbershops, view each shop's services and customer reviews, chat with
other users in real time, and ask an AI assistant to recommend the best
barbershop for a free-text request (for example, "a cheap fade in Tel Aviv with
great reviews").

The project demonstrates a complete full-stack system: persistent relational data
(MySQL + ORM), real-time communication (WebSockets), and AI integration, all
connected through one Express API and one React frontend.

---

## 2. Installation Instructions

### Prerequisites
- Node.js 18 or higher
- MySQL 8 or higher (MySQL Workbench recommended)
- A free Google Gemini API key from https://aistudio.google.com

### Steps

1. Extract the submitted ZIP file. This gives you a `Scissors/` folder containing
   `frontend/` and `backend/`. Open a terminal in that folder.

2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

3. Install frontend dependencies:
   ```bash
   cd ../frontend
   npm install
   ```

4. Create the database, configure environment variables, and run migrations and
   seeders (see sections 3, 4, and 5 below).

5. Start the application (two terminals):
   ```bash
   # Terminal 1 - backend (from the backend/ folder)
   npm run dev          # runs on http://localhost:3000

   # Terminal 2 - frontend (from the frontend/ folder)
   npm start            # runs on http://localhost:5173
   ```

6. Open **http://localhost:5173** in your browser. You will land on the **Login**
   page. Log in using one of the seeded accounts below (you log in with **email +
   password**). Every seeded account uses the password `123456`.

   | Role     | Email (use to log in)   | Password |
   |----------|-------------------------|----------|
   | Admin    | `ido@scissors.test`     | `123456` |
   | Manager  | `sagi@scissors.test`    | `123456` |
   | Barber   | `david@scissors.test`   | `123456` |
   | Customer | `roni@scissors.test`    | `123456` |

   For grading, the **Admin** account (`ido@scissors.test`) is recommended. it has
   permission to create, update, and delete barbershops and users, so you can see
   every CRUD operation in the UI. After logging in you are taken to the Dashboard,
   where the barbershop list, live chat, and AI recommender are all available.


> Note: the project runs against a local MySQL database. The submission includes
> only the migrations (table structure) and seeders (sample data); running them
> creates and populates the database locally. No external or shared database is
> required.

### Quick start — full command sequence

Once MySQL is running and `backend/.env` is filled in (sections 3 and 4), this is
the complete sequence from an extracted ZIP:

```bash
# 1. Backend setup
cd backend
npm install
npx sequelize-cli db:migrate     # create all tables
npx sequelize-cli db:seed:all    # load sample data
npm run dev                      # start backend on http://localhost:3000

# 2. Frontend setup (in a SECOND terminal)
cd frontend
npm install                      # add --legacy-peer-deps if it errors
npm start                        # start frontend on http://localhost:5173
```

Then open http://localhost:5173 and log in with `ido@scissors.test` / `123456`.


### Where to see each requirement in the UI

- **CRUD (MySQL + ORM)** — the barbershop list on the Dashboard is loaded from
  MySQL; as admin you can create, edit, and delete shops and the changes persist.
- **ORM relationships (JOIN)** — click any barbershop card or table row to open a
  detail view that calls `GET /api/barbershops/:id/barbers` and shows the shop's
  services (one-to-many) and barbers (many-to-many, via the junction table).
- **WebSockets** — open two browser tabs and chat between them (typing indicator
  + instant messages).
- **AI** — use the recommender box at the top of the Dashboard.

---

## 3. Database Setup

1. Open MySQL Workbench (or any MySQL client) and create the database:
   ```sql
   CREATE DATABASE IF NOT EXISTS scissors_db
     CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

2. Configure your database credentials in `backend/.env` (see section 4).

3. From the `backend/` folder, create all tables by running the migrations:
   ```bash
   npx sequelize-cli db:migrate
   ```

4. Load the sample data (15 barbershops across 8 cities, services, users, and
   reviews):
   ```bash
   npx sequelize-cli db:seed:all
   ```

To reset the data at any time:
```bash
npx sequelize-cli db:seed:undo:all
npx sequelize-cli db:seed:all
```

All data is stored in MySQL and persists across server restarts.

---

## 4. Environment Variables

Create a file named `.env` inside the `backend/` folder, based on
`backend/.env.example`. Fill in your own values:

```
PORT=3000

DB_HOST=localhost
DB_PORT=3306
DB_NAME=scissors_db
DB_USER=root
DB_PASSWORD=your_mysql_password      # the local MySQL root password

AI_API_KEY=your_gemini_api_key       # a free key from Google AI Studio
```

What to fill in:
- `DB_PASSWORD` — your local MySQL root password 
- `DB_USER` / `DB_NAME` / `DB_HOST` / `DB_PORT` — keep the defaults above unless your MySQL setup differs.
- `AI_API_KEY` — a free Google Gemini key. Get one at https://aistudio.google.com → "Get API key" → "Create API key", then paste it here.
The app's database, CRUD, and live chat all work without a key; only the AI recommender needs it.


The frontend does **not** require a `.env` file — it works out of the box. The
port is already set to 5173 inside the frontend's `start` script. If you want to
override it, you may optionally create `frontend/.env`:
```
PORT=5173
GENERATE_SOURCEMAP=false
```

---

## 5. ORM Setup

The backend uses Sequelize as its ORM, with the `mysql2` driver.

- Connection: `backend/config/database.js` reads credentials from `.env`.
- Models: `backend/models/` — one Sequelize model per table.
- Associations: `backend/models/index.js` wires all relationships in one place.
- Migrations: `backend/migrations/` — the schema, created via `sequelize-cli`.
- Seeders: `backend/seeders/` — the sample data.
- CLI config: `backend/.sequelizerc` and `backend/config/config.js` tell the
  Sequelize CLI where these folders are and how to connect.

### Models

| Model            | Table                | Purpose                                  |
|------------------|----------------------|------------------------------------------|
| User             | `users`              | accounts: customer, barber, admin, manager |
| Admin            | `admins`             | admin profile linked to a user            |
| Barbershop       | `barbershops`        | the main project resource                 |
| Service          | `services`           | services offered by a barbershop          |
| BarbershopBarber | `barbershop_barbers` | junction linking barbers to barbershops   |
| Setting          | `settings`           | per-user preferences (theme)              |
| Review           | `reviews`            | customer reviews of barbershops           |
| Message          | `messages`           | chat messages (persisted)                 |

### Relationships
- One-to-many: Barbershop -> Service, Barbershop -> Review, User -> Review,
  User -> Message
- Many-to-many: User (barber) <-> Barbershop, through `barbershop_barbers`
- One-to-one: User <-> Admin, User <-> Setting

Barbershop ratings are computed dynamically from the reviews table at read time,
so a shop's rating always reflects its actual reviews.

---

## 6. API Endpoints

All responses use the standard format:
```json
{ "success": true, "data": {}, "error": null }
```
On error:
```json
{ "success": false, "data": null, "error": { "code": "...", "message": "...", "details": {} } }
```

Authentication uses a simple token in the header:
`Authorization: Bearer mock-token-<userId>` (for example, `mock-token-11` is the
admin Ido). Tokens are returned by the login endpoint.

### Auth
| Method | Endpoint            | Description           | Auth |
|--------|---------------------|-----------------------|------|
| POST   | `/api/auth/login`   | Log in, returns token | No   |
| POST   | `/api/auth/logout`  | Log out               | Yes  |

### Users
| Method | Endpoint          | Description     | Auth                    |
|--------|-------------------|-----------------|-------------------------|
| GET    | `/api/users`      | List all users  | No                      |
| GET    | `/api/users/me`   | Current user    | Yes                     |
| GET    | `/api/users/:id`  | One user        | No                      |
| POST   | `/api/users`      | Create a user   | No                      |
| PUT    | `/api/users/:id`  | Update a user   | Self, or admin/manager  |
| DELETE | `/api/users/:id`  | Delete a user   | Admin                   |

### Barbershops
| Method | Endpoint                       | Description                        | Auth          |
|--------|--------------------------------|------------------------------------|---------------|
| GET    | `/api/barbershops`             | List all (with computed rating)    | No            |
| GET    | `/api/barbershops/:id`         | One barbershop                     | No            |
| GET    | `/api/barbershops/:id/barbers` | Shop + barbers + services (JOIN)   | No            |
| POST   | `/api/barbershops`             | Create a barbershop                | Admin         |
| PUT    | `/api/barbershops/:id`         | Update a barbershop                | Admin/manager |
| DELETE | `/api/barbershops/:id`         | Delete a barbershop                | Admin         |

### Settings
| Method | Endpoint        | Description           | Auth |
|--------|-----------------|-----------------------|------|
| GET    | `/api/settings` | Get current settings  | Yes  |
| PUT    | `/api/settings` | Update settings/theme | Yes  |

### Messages
| Method | Endpoint        | Description          | Auth |
|--------|-----------------|----------------------|------|
| GET    | `/api/messages` | Recent chat history  | No   |

### AI
| Method | Endpoint            | Description                   | Auth |
|--------|---------------------|-------------------------------|------|
| POST   | `/api/ai/recommend` | AI barbershop recommendation  | No   |

A Postman collection (`Scissors - Assignment 4.postman_collection.json`) with all of these
requests is included in the assignment.

---

## 7. WebSocket Feature

A real-time **Live Chat** built with **Socket.IO**. Messages are saved to MySQL,
so chat history survives server restarts.

### Custom events (in addition to the built-in `connect` and `disconnect`)
| Event          | Direction                  | Purpose                          |
|----------------|----------------------------|----------------------------------|
| `chat:message` | client -> server -> all    | New message (saved + broadcast)  |
| `chat:typing`  | client -> server -> others | "X is typing..." indicator       |
| `chat:join`    | client -> server -> others | "X joined the chat" notice       |

- Backend: `backend/src/socket/index.js`
- Frontend: `frontend/src/components/Chat.js`; connection in
  `frontend/src/services/socket.js`
- Chat history loads via `GET /api/messages`; live updates arrive over the socket.

To see it work: open the app in two browser tabs, send a message in one, and it
appears instantly in both, with a typing indicator across tabs.

---

## 8. AI Feature

An **AI Barbershop Recommender** powered by **Google Gemini**.

- The user types a free-text request (e.g. "a relaxing shave in Jerusalem").
- The frontend calls the backend endpoint `POST /api/ai/recommend`.
- The backend gathers all barbershops, their services, and their reviews from
  MySQL, builds a prompt, and asks Gemini to recommend the best match.
- The recommendation is returned and displayed in the UI.

The Gemini API key is stored in `backend/.env` (`AI_API_KEY`) and is used only on
the server — it is never exposed to the frontend.

- Service: `backend/src/services/ai.service.js`
- Controller: `backend/src/controllers/ai.controller.js`
- Frontend: `frontend/src/components/AiRecommender.js`

---

## 9. Known Limitations

- Authentication is simplified: tokens are `mock-token-<userId>` rather than real
  signed JWTs. This is intentional for the assignment scope.
- There is a single global chat channel (no separate rooms).
- Seed-data passwords are stored in plain text for simplicity.
- The Gemini free tier may occasionally return a temporary "high demand" error;
  if that happens, the AI endpoint returns a clean `AI_ERROR` response and the
  request can simply be retried.
- Top-3 barbershop sorting is done on the client; this is fine for the current
  dataset size but a larger dataset would warrant server-side sorting.

---

## Project Structure

```
Scissors/
├── frontend/                 # React app (Create React App)
│   └── src/
│       ├── components/       # Chat, AiRecommender, Navbar, etc.
│       ├── pages/            # Dashboard, Login, Settings
│       └── services/         # apiClient, socket, AuthContext
└── backend/
    ├── config/               # Sequelize connection + CLI config
    ├── models/               # ORM models + associations (index.js)
    ├── migrations/           # Schema (sequelize-cli)
    ├── seeders/              # Sample data
    └── src/
        ├── controllers/      # Route handlers
        ├── middleware/       # auth, logger, role checks
        ├── routes/           # Express routers
        ├── services/         # ai.service.js (Gemini)
        ├── socket/           # Socket.IO chat
        └── server.js         # Entry point
```
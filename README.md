# BookNook Cafe – Board Game Booking Management System

> **Backend Development Fundamentals – College Group Assignment**  
> A modular REST API built with Node.js, Express.js, and SQLite for tracking cafe guests, board game shelf availability, active bookings, and transactional audit trails.

---

## 1. Project Overview

**BookNook Cafe** operates a popular board game library where guests can borrow games to play while dining. This system serves as the backend engine that manages the inventory of games, tracks guest information, enforces real-time game availability states (`available` vs. `in_use`), links guests to games via active bookings, and logs an immutable audit trail of all game catalog operations.

---

## 2. Problem Statement

Previously, cafe staff members struggled with:
1. Identifying which board games were missing from shelves or currently in use by guests.
2. Preventing double-booking of a single board game.
3. Tracking historic guest borrowing records and resolving disputes.
4. Auditing who added, updated, or deleted board games from the cafe catalog.

---

## 3. Objectives

- **Relational Integrity**: Enforce foreign keys between guests, games, and bookings (`PRAGMA foreign_keys = ON;`).
- **Atomic State Transitions**: Synchronize booking creation and game availability (`available` $\leftrightarrow$ `in_use`) using database transactions.
- **Relational Joins**: Provide a consolidated endpoint (`GET /bookings/details`) combining booking, guest, and game data using SQL `INNER JOIN`.
- **Search Capabilities**: Filter board games dynamically based on player count query parameters (`GET /games?players=4`).
- **Audit Logging**: Maintain a permanent chronological audit log of all game additions, modifications, and deletions.
- **Robust Error Handling**: Standardize all JSON error responses without exposing SQL errors or internal server traces.

---

## 4. Technologies Used

- **Runtime**: Node.js (`v22+` / LTS)
- **Framework**: Express.js (`v5.x`)
- **Database**: SQLite with `better-sqlite3` driver
- **Environment Management**: `dotenv`
- **Development Tooling**: `nodemon`
- **API Testing**: Postman (Collection v2.1.0) & Node.js Native Test Runner
- **Version Control**: Git & GitHub (6-member feature branch workflow)

---

## 5. System Architecture

The application adopts a clean, layered **MVC (Model-Controller-Route-Middleware)** design pattern:

```
                            HTTP Request (Postman / Client)
                                          │
                                          ▼
                                     server.js
                                          │
                                          ▼
                                       app.js
                                          │
               ┌──────────────────────────┴──────────────────────────┐
               ▼                          ▼                          ▼
          routes/guestRoutes         routes/gameRoutes         routes/bookingRoutes
               │                          │                          │
               ▼                          ▼                          ▼
          middleware/validate        middleware/validate        middleware/validate
               │                          │                          │
               ▼                          ▼                          ▼
        controllers/guest          controllers/game           controllers/booking
               │                          │                          │
               └──────────────────────────┼──────────────────────────┘
                                          ▼
                                   database/db.js  ◄── PRAGMA foreign_keys = ON;
                                          │
                                          ▼
                                  SQLite (booknook.db)
```

---

## 6. Database Schema & Entity Relationships

### Entity-Relationship Diagram

```
 ┌──────────────────────┐             1:N              ┌──────────────────────────┐
 │        guests        │ ───────────────────────────o{│         bookings         │
 ├──────────────────────┤                              ├──────────────────────────┤
 │ PK  guest_id (INT)   │                              │ PK  booking_id (INT)     │
 │     name (TEXT)      │                              │ FK  guest_id (INT)       │
 │     phone (TEXT, UQ) │                              │ FK  game_id (INT)        │
 └──────────────────────┘                              │     booking_time (TEXT)  │
                                                       │     status (TEXT)        │
                                                       └──────────────┬───────────┘
                                                                      │
 ┌──────────────────────┐             1:N                             │
 │        games         │ ────────────────────────────────────────────┘
 ├──────────────────────┤
 │ PK  game_id (INT)    │
 │     name (TEXT)      │
 │     players (INT)    │
 │     status (TEXT)    │
 └──────────────────────┘

 ┌──────────────────────┐
 │      audit_logs      │  ◄── Preserves historical record of game additions/deletions
 ├──────────────────────┤      (Independent; no cascade delete on game deletion)
 │ PK  audit_id (INT)   │
 │     action (TEXT)    │  ◄── 'CREATE' | 'UPDATE' | 'DELETE'
 │     game_id (INT)    │
 │     time (TEXT)      │  ◄── ISO 8601 Timestamp string
 └──────────────────────┘
```

### Table Specifications
1. **`guests`**:
   - `guest_id`: `INTEGER PRIMARY KEY AUTOINCREMENT`
   - `name`: `TEXT NOT NULL`
   - `phone`: `TEXT UNIQUE`
2. **`games`**:
   - `game_id`: `INTEGER PRIMARY KEY AUTOINCREMENT`
   - `name`: `TEXT NOT NULL`
   - `players`: `INTEGER NOT NULL CHECK (players > 0)`
   - `status`: `TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'in_use'))`
3. **`bookings`**:
   - `booking_id`: `INTEGER PRIMARY KEY AUTOINCREMENT`
   - `guest_id`: `INTEGER NOT NULL REFERENCES guests(guest_id) ON DELETE RESTRICT`
   - `game_id`: `INTEGER NOT NULL REFERENCES games(game_id) ON DELETE RESTRICT`
   - `booking_time`: `TEXT NOT NULL`
   - `status`: `TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed'))`
4. **`audit_logs`**:
   - `audit_id`: `INTEGER PRIMARY KEY AUTOINCREMENT`
   - `action`: `TEXT NOT NULL CHECK (action IN ('CREATE', 'UPDATE', 'DELETE'))`
   - `game_id`: `INTEGER NOT NULL` *(historical preservation without cascading delete)*
   - `time`: `TEXT NOT NULL`

---

## 7. Installation Instructions

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)

### Setup Steps (PowerShell / Terminal)
```powershell
# 1. Clone the repository
git clone https://github.com/<owner>/BookNook-Cafe.git
cd BookNook-Cafe

# 2. Install dependencies
npm install

# 3. Create local environment configuration
Copy-Item .env.example .env
```

---

## 8. How to Start the Server

```powershell
# Initialize / Reset the SQLite database tables
npm run init-db

# Run in production mode
npm start

# Run in development mode (with nodemon auto-reload)
npm run dev
```

The server will start at `http://localhost:5000`.

---

## 9. API Endpoint Documentation

### A. Guest Endpoints (`/guests`)

| Method | Endpoint | Description | Status Codes |
| :--- | :--- | :--- | :--- |
| `GET` | `/guests` | Retrieve all registered guests | `200` |
| `GET` | `/guests/:id` | Retrieve single guest by ID | `200`, `400`, `404` |
| `POST` | `/guests` | Register a new guest | `201`, `400`, `409` |
| `PUT` | `/guests/:id` | Update guest details | `200`, `400`, `404`, `409` |
| `DELETE` | `/guests/:id` | Remove guest (if no bookings reference them) | `200`, `400`, `404`, `409` |

### B. Game Endpoints (`/games`)

| Method | Endpoint | Description | Status Codes |
| :--- | :--- | :--- | :--- |
| `GET` | `/games` | Retrieve all games (or filter `?players=4`) | `200`, `400` |
| `GET` | `/games/:id` | Retrieve single game by ID | `200`, `400`, `404` |
| `POST` | `/games` | Add game + automatically log `CREATE` audit | `201`, `400` |
| `PUT` | `/games/:id` | Update game + automatically log `UPDATE` audit | `200`, `400`, `404`, `409` |
| `DELETE` | `/games/:id` | Delete game + automatically log `DELETE` audit | `200`, `400`, `404`, `409` |

### C. Booking Endpoints (`/bookings`)

| Method | Endpoint | Description | Status Codes |
| :--- | :--- | :--- | :--- |
| `GET` | `/bookings` | List all bookings | `200` |
| `GET` | `/bookings/details`| SQL `INNER JOIN` of bookings with guest & game names | `200` |
| `POST` | `/bookings` | Create active booking & set game to `in_use` | `201`, `400`, `404`, `409` |
| `PUT` | `/bookings/:id/complete`| Complete booking & restore game to `available` | `200`, `400`, `404`, `409` |

### D. Audit Endpoints (`/audit`)

| Method | Endpoint | Description | Status Codes |
| :--- | :--- | :--- | :--- |
| `GET` | `/audit` | Retrieve latest 10 game audit records (newest first) | `200` |

---

## 10. Sample Request and Response Bodies

### 1. Create a Game (`POST /games`)
**Request:**
```json
{
  "name": "Catan",
  "players": 4
}
```
**Response (`201 Created`):**
```json
{
  "success": true,
  "message": "Game created successfully.",
  "data": {
    "game_id": 1,
    "name": "Catan",
    "players": 4,
    "status": "available"
  }
}
```

### 2. Create a Booking (`POST /bookings`)
**Request:**
```json
{
  "guest_id": 1,
  "game_id": 1
}
```
**Response (`201 Created`):**
```json
{
  "success": true,
  "message": "Booking created successfully and game status set to in_use.",
  "data": {
    "booking_id": 1,
    "guest_id": 1,
    "game_id": 1,
    "booking_time": "2026-11-12T08:00:00.000Z",
    "status": "active"
  }
}
```

### 3. Booking Relational JOIN (`GET /bookings/details`)
**Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Booking details with guest and game information retrieved successfully.",
  "count": 1,
  "data": [
    {
      "booking_id": 1,
      "guest_name": "Alice Johnson",
      "game_name": "Catan",
      "booking_time": "2026-11-12T08:00:00.000Z",
      "booking_status": "active"
    }
  ]
}
```

### 4. Audit Trail (`GET /audit`)
**Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Recent audit records retrieved successfully.",
  "count": 2,
  "data": [
    {
      "audit_id": 2,
      "action": "UPDATE",
      "game_id": 1,
      "time": "2026-11-12T08:05:00.000Z"
    },
    {
      "audit_id": 1,
      "action": "CREATE",
      "game_id": 1,
      "time": "2026-11-12T08:00:00.000Z"
    }
  ]
}
```

---

## 11. Validation & Error Handling Rules

- **Standard Response Shape**:
  ```json
  {
    "success": false,
    "message": "Informative error description"
  }
  ```
- **Validation Rules**:
  - `name`: Must be non-empty string.
  - `players`: Must be a strictly positive integer (`players > 0`).
  - `guest_id`, `game_id`: Must be positive integers.
  - `:id` URL params: Must be positive integers.
- **Database Constraint Handling**:
  - Duplicate phone number $\rightarrow$ `409 Conflict`
  - Booking an unavailable game $\rightarrow$ `409 Conflict`
  - Deleting a game or guest with active bookings $\rightarrow$ `409 Conflict`
  - Attempting to complete an already completed booking $\rightarrow$ `409 Conflict`
  - Malformed JSON payload $\rightarrow$ `400 Bad Request`
  - Non-existent resource $\rightarrow$ `404 Not Found`

---

## 12. Audit Trail Explanation

The audit trail is a critical feature that monitors the full lifecycle of board games.
- **Creation**: When a game is added, an atomic transaction inserts the game and logs `CREATE`.
- **Modification**: When game details are updated, an atomic transaction applies changes and logs `UPDATE`.
- **Deletion**: When a game is removed, an atomic transaction deletes the game and logs `DELETE`.
- **Persistence**: The `audit_logs` table does not enforce a cascading foreign key on `game_id`, guaranteeing that audit entries are never deleted even after the game itself has been removed.
- **Query Logic**:
  ```sql
  SELECT audit_id, action, game_id, time
  FROM audit_logs
  ORDER BY audit_id DESC
  LIMIT 10;
  ```

---

## 13. Automated Tests & Postman Testing

### Running Automated Test Suite
Execute all end-to-end integration tests using:
```powershell
npm test
```

### Postman Testing Instructions
1. Open **Postman**.
2. Click **Import** $\rightarrow$ Select `postman/BookNook.postman_collection.json`.
3. Ensure the `baseUrl` variable is set to `http://localhost:5000`.
4. Ensure your server is running with `npm start`.
5. Run the collection using the **Postman Collection Runner** or execute individual requests in folder sequence:
   - `1. Guest APIs`
   - `2. Game APIs`
   - `3. Booking APIs`
   - `4. Booking JOIN`
   - `5. Search APIs`
   - `6. Audit APIs`
   - `7. Error Handling`

---

## 14. GitHub Collaboration & Team Distribution

The project was developed in a single GitHub repository using dedicated feature branches.

### Five-Member Task Allocation Table

| Member | Assigned Role & Responsibilities | Assigned Branch | Delivered Files |
| :--- | :--- | :--- | :--- |
| **Member 1** | **Role 1 – Server and Routes**<br>Express server setup, routing, middleware, error handling, environment config | `feature/server-setup` | `server.js`, `app.js`, `.env.example`, `package.json` |
| **Member 2 (You)** | **Role 2 – Database**<br>SQLite database design, schema, foreign keys, constraints, initialization scripts | `feature/database` | `database/schema.sql`, `database/db.js`, `database/init.js` |
| **Member 3** | **Role 3 – REST Endpoints**<br>Guest, Game, and Booking CRUD business logic, SQL INNER JOIN endpoint | `feature/crud-api` | `controllers/guestController.js`, `controllers/gameController.js`, `controllers/bookingController.js`, `routes/*.js` |
| **Member 4** | **Role 4 – Validation and Search**<br>Input sanitization & validation middleware, players count query search | `feature/validation-search` | `middleware/validateGuest.js`, `middleware/validateGame.js`, `middleware/validateBooking.js`, `middleware/notFound.js`, `middleware/errorHandler.js` |
| **Member 5** | **Roles 5 + 6 – Twist Rule, Postman and README**<br>Transactional Audit Trail system, Postman collection & assertions, automated test suite, README documentation | `feature/audit-postman` | `services/auditService.js`, `controllers/auditController.js`, `routes/auditRoutes.js`, `postman/*.json`, `tests/*.js`, `README.md` |

### Git Workflow Followed by Each Member
```powershell
# 1. Switch to personal feature branch
git checkout -b feature/<assigned-branch>

# 2. Stage changes
git add .

# 3. Commit with semantic description
git commit -m "Implement <specific feature>"

# 4. Push to remote repository
git push -u origin feature/<assigned-branch>

# 5. Open Pull Request on GitHub for peer review and merge into main
```

---

## 15. Known Limitations

1. **In-Store Focus**: Bookings are designed for instant in-cafe lending and do not feature future date reservation scheduling.
2. **Single Library Deployment**: SQLite is designed for lightweight, single-process, local file-based storage. For multi-tenant distributed cloud clustering, an external relational database (such as PostgreSQL) would be required.


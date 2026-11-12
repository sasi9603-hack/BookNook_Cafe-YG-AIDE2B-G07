PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS guests (
    guest_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT UNIQUE
);

CREATE TABLE IF NOT EXISTS games (
    game_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    players INTEGER NOT NULL CHECK (players > 0),
    status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'in_use'))
);

CREATE TABLE IF NOT EXISTS bookings (
    booking_id INTEGER PRIMARY KEY AUTOINCREMENT,
    guest_id INTEGER NOT NULL,
    game_id INTEGER NOT NULL,
    booking_time TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed')),
    FOREIGN KEY (guest_id) REFERENCES guests(guest_id) ON DELETE RESTRICT,
    FOREIGN KEY (game_id) REFERENCES games(game_id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS audit_logs (
    audit_id INTEGER PRIMARY KEY AUTOINCREMENT,
    action TEXT NOT NULL CHECK (action IN ('CREATE', 'UPDATE', 'DELETE')),
    game_id INTEGER NOT NULL,
    time TEXT NOT NULL
);

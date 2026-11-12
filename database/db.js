const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Determine database path relative to project root
const defaultDbPath = path.resolve(__dirname, 'booknook.db');
const dbFilePath = process.env.DB_PATH
    ? path.resolve(process.cwd(), process.env.DB_PATH)
    : defaultDbPath;

// Ensure database directory exists
const dbDir = path.dirname(dbFilePath);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

// Initialize SQLite connection
const db = new Database(dbFilePath, {
    // verbose: process.env.NODE_ENV === 'development' ? console.log : null
});

// CRITICAL: Always enforce Foreign Keys in SQLite
db.pragma('foreign_keys = ON');

// Verify foreign keys are enabled
const fkStatus = db.pragma('foreign_keys', { simple: true });
if (fkStatus !== 1) {
    console.warn('[DB Warning] SQLite foreign key enforcement is NOT enabled!');
}

module.exports = db;


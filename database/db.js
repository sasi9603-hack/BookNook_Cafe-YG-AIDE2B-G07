const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const defaultDbPath = path.resolve(__dirname, 'booknook.db');
const dbFilePath = process.env.DB_PATH
    ? path.resolve(process.cwd(), process.env.DB_PATH)
    : defaultDbPath;

const dbDir = path.dirname(dbFilePath);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbFilePath);

db.pragma('foreign_keys = ON');

const fkStatus = db.pragma('foreign_keys', { simple: true });
if (fkStatus !== 1) {
    console.warn('[DB Warning] SQLite foreign key enforcement is NOT enabled!');
}

module.exports = db;

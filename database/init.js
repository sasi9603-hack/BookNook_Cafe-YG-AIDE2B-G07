const fs = require('fs');
const path = require('path');
const db = require('./db');

function initDatabase() {
    try {
        const schemaPath = path.resolve(__dirname, 'schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        db.exec(schemaSql);

        const tables = db
            .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';")
            .all()
            .map(t => t.name);

        console.log(' SQLite Database initialized successfully!');
        console.log(' Verified active tables:', tables.join(', '));
        return true;
    } catch (error) {
        console.error(' Error initializing database:', error.message);
        throw error;
    }
}

if (require.main === module) {
    initDatabase();
}

module.exports = { initDatabase };

const app = require('./app');
const { initDatabase } = require('./database/init');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

try {
    initDatabase();
} catch (error) {
    console.error('Fatal: Failed to initialize SQLite database:', error.message);
    process.exit(1);
}

const server = app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(` BookNook Cafe REST API is running!`);
    console.log(` Server URL : http://localhost:${PORT}`);
    console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(` Database   : ${process.env.DB_PATH || 'database/booknook.db'}`);
    console.log(`====================================================`);
});

function handleShutdown(signal) {
    console.log(`\nReceived ${signal}. Shutting down gracefully...`);
    server.close(() => {
        console.log('HTTP server closed.');
        process.exit(0);
    });
}

process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));

module.exports = server;

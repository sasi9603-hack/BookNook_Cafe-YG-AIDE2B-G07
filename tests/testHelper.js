const app = require('../app');
const db = require('../database/db');

class TestServer {
    constructor() {
        this.server = null;
        this.baseUrl = '';
    }

    async start() {
        return new Promise((resolve) => {
            this.server = app.listen(0, () => {
                const port = this.server.address().port;
                this.baseUrl = `http://127.0.0.1:${port}`;
                resolve(this.baseUrl);
            });
        });
    }

    async stop() {
        return new Promise((resolve) => {
            if (this.server) {
                this.server.close(resolve);
            } else {
                resolve();
            }
        });
    }

    async request(method, path, body = null) {
        const url = `${this.baseUrl}${path}`;
        const options = {
            method,
            headers: {}
        };

        if (body) {
            options.headers['Content-Type'] = 'application/json';
            options.body = JSON.stringify(body);
        }

        const res = await fetch(url, options);
        let data = null;
        const text = await res.text();
        try {
            data = JSON.parse(text);
        } catch {
            data = text;
        }

        return {
            status: res.status,
            headers: res.headers,
            body: data
        };
    }

    resetDatabase() {
        db.pragma('foreign_keys = OFF');
        db.prepare('DELETE FROM audit_logs;').run();
        db.prepare('DELETE FROM bookings;').run();
        db.prepare('DELETE FROM games;').run();
        db.prepare('DELETE FROM guests;').run();
        db.prepare("DELETE FROM sqlite_sequence WHERE name IN ('guests', 'games', 'bookings', 'audit_logs');").run();
        db.pragma('foreign_keys = ON');
    }
}

module.exports = { TestServer };

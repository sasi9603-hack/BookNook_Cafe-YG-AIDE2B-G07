const db = require('../database/db');

function logAudit(action, gameId, customTime = null) {
    const validActions = ['CREATE', 'UPDATE', 'DELETE'];
    if (!validActions.includes(action)) {
        throw new Error(`Invalid audit action: ${action}. Allowed: ${validActions.join(', ')}`);
    }

    const timestamp = customTime || new Date().toISOString();

    const stmt = db.prepare(`
        INSERT INTO audit_logs (action, game_id, time)
        VALUES (?, ?, ?);
    `);

    const info = stmt.run(action, gameId, timestamp);

    return {
        audit_id: info.lastInsertRowid,
        action,
        game_id: gameId,
        time: timestamp
    };
}

function getRecentAuditLogs(limit = 10) {
    const stmt = db.prepare(`
        SELECT audit_id, action, game_id, time
        FROM audit_logs
        ORDER BY audit_id DESC
        LIMIT ?;
    `);

    return stmt.all(limit);
}

module.exports = {
    logAudit,
    getRecentAuditLogs
};

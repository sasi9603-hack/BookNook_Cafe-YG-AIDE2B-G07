const db = require('../database/db');
const auditService = require('../services/auditService');

function getAllGames(req, res, next) {
    try {
        const { players } = req.query;

        let games;
        if (players !== undefined) {
            const stmt = db.prepare(`
                SELECT game_id, name, players, status
                FROM games
                WHERE players = ?
                ORDER BY game_id ASC;
            `);
            games = stmt.all(players);
        } else {
            const stmt = db.prepare(`
                SELECT game_id, name, players, status
                FROM games
                ORDER BY game_id ASC;
            `);
            games = stmt.all();
        }

        return res.status(200).json({
            success: true,
            message: players !== undefined
                ? `Games with ${players} players retrieved successfully.`
                : 'All games retrieved successfully.',
            count: games.length,
            data: games
        });
    } catch (error) {
        next(error);
    }
}

function getGameById(req, res, next) {
    try {
        const { id } = req.params;
        const stmt = db.prepare('SELECT game_id, name, players, status FROM games WHERE game_id = ?;');
        const game = stmt.get(id);

        if (!game) {
            return res.status(404).json({
                success: false,
                message: `Game with ID ${id} not found.`
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Game retrieved successfully.',
            data: game
        });
    } catch (error) {
        next(error);
    }
}

function createGame(req, res, next) {
    try {
        const { name, players } = req.body;

        const createGameTransaction = db.transaction((gameName, gamePlayers) => {
            const insertStmt = db.prepare(`
                INSERT INTO games (name, players, status)
                VALUES (?, ?, 'available');
            `);
            const info = insertStmt.run(gameName, gamePlayers);
            const newGameId = info.lastInsertRowid;

            auditService.logAudit('CREATE', newGameId);

            return db.prepare('SELECT game_id, name, players, status FROM games WHERE game_id = ?;').get(newGameId);
        });

        const newGame = createGameTransaction(name, players);

        return res.status(201).json({
            success: true,
            message: 'Game created successfully.',
            data: newGame
        });
    } catch (error) {
        next(error);
    }
}

function updateGame(req, res, next) {
    try {
        const { id } = req.params;
        const { name, players, status } = req.body;

        const existingGame = db.prepare('SELECT game_id, name, players, status FROM games WHERE game_id = ?;').get(id);
        if (!existingGame) {
            return res.status(404).json({
                success: false,
                message: `Game with ID ${id} not found.`
            });
        }

        if (existingGame.status === 'in_use' && status === 'available') {
            const activeBooking = db.prepare('SELECT booking_id FROM bookings WHERE game_id = ? AND status = ?;').get(id, 'active');
            if (activeBooking) {
                return res.status(409).json({
                    success: false,
                    message: 'Cannot mark game as available while an active booking exists. Please complete the booking first.'
                });
            }
        }

        const updatedName = name !== undefined ? name : existingGame.name;
        const updatedPlayers = players !== undefined ? players : existingGame.players;
        const updatedStatus = status !== undefined ? status : existingGame.status;

        const updateGameTransaction = db.transaction((gameId, gName, gPlayers, gStatus) => {
            db.prepare(`
                UPDATE games
                SET name = ?, players = ?, status = ?
                WHERE game_id = ?;
            `).run(gName, gPlayers, gStatus, gameId);

            auditService.logAudit('UPDATE', gameId);

            return db.prepare('SELECT game_id, name, players, status FROM games WHERE game_id = ?;').get(gameId);
        });

        const updatedGame = updateGameTransaction(id, updatedName, updatedPlayers, updatedStatus);

        return res.status(200).json({
            success: true,
            message: 'Game updated successfully.',
            data: updatedGame
        });
    } catch (error) {
        next(error);
    }
}

function deleteGame(req, res, next) {
    try {
        const { id } = req.params;

        const existingGame = db.prepare('SELECT game_id, name, players, status FROM games WHERE game_id = ?;').get(id);
        if (!existingGame) {
            return res.status(404).json({
                success: false,
                message: `Game with ID ${id} not found.`
            });
        }

        const activeBooking = db.prepare('SELECT booking_id FROM bookings WHERE game_id = ? AND status = ?;').get(id, 'active');
        if (activeBooking) {
            return res.status(409).json({
                success: false,
                message: 'Cannot delete game: the game is currently booked and in use.'
            });
        }

        const pastBookings = db.prepare('SELECT COUNT(*) AS count FROM bookings WHERE game_id = ?;').get(id);
        if (pastBookings.count > 0) {
            return res.status(409).json({
                success: false,
                message: 'Cannot delete game: game is referenced by existing booking history.'
            });
        }

        const deleteGameTransaction = db.transaction((gameId) => {
            db.prepare('DELETE FROM games WHERE game_id = ?;').run(gameId);
            auditService.logAudit('DELETE', gameId);
        });

        deleteGameTransaction(id);

        return res.status(200).json({
            success: true,
            message: `Game with ID ${id} deleted successfully.`
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getAllGames,
    getGameById,
    createGame,
    updateGame,
    deleteGame
};

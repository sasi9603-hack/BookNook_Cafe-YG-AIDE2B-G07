function validateCreateGame(req, res, next) {
    const { name, players } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({
            success: false,
            message: 'Game name is required and cannot be empty.'
        });
    }

    if (players === undefined || players === null) {
        return res.status(400).json({
            success: false,
            message: 'Number of players is required.'
        });
    }

    const playersNum = Number(players);
    if (!Number.isInteger(playersNum) || playersNum <= 0) {
        return res.status(400).json({
            success: false,
            message: 'Players must be a positive integer.'
        });
    }

    req.body.name = name.trim();
    req.body.players = playersNum;

    next();
}

function validateUpdateGame(req, res, next) {
    const { name, players, status } = req.body;

    if (name === undefined && players === undefined && status === undefined) {
        return res.status(400).json({
            success: false,
            message: 'At least one field (name, players, or status) must be provided to update.'
        });
    }

    if (name !== undefined) {
        if (typeof name !== 'string' || name.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Game name cannot be empty.'
            });
        }
        req.body.name = name.trim();
    }

    if (players !== undefined) {
        const playersNum = Number(players);
        if (!Number.isInteger(playersNum) || playersNum <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Players must be a positive integer.'
            });
        }
        req.body.players = playersNum;
    }

    if (status !== undefined) {
        if (status !== 'available' && status !== 'in_use') {
            return res.status(400).json({
                success: false,
                message: "Game status must be either 'available' or 'in_use'."
            });
        }
    }

    next();
}

function validateGameId(req, res, next) {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            success: false,
            message: 'Game ID must be a positive integer.'
        });
    }
    req.params.id = id;
    next();
}

function validatePlayersQuery(req, res, next) {
    if (req.query.players !== undefined) {
        const playersNum = Number(req.query.players);
        if (!Number.isInteger(playersNum) || playersNum <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Query parameter players must be a positive integer.'
            });
        }
        req.query.players = playersNum;
    }
    next();
}

module.exports = {
    validateCreateGame,
    validateUpdateGame,
    validateGameId,
    validatePlayersQuery
};

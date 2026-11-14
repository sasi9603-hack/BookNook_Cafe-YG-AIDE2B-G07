function validateCreateBooking(req, res, next) {
    const { guest_id, game_id } = req.body;

    if (guest_id === undefined || guest_id === null) {
        return res.status(400).json({
            success: false,
            message: 'guest_id is required.'
        });
    }

    if (game_id === undefined || game_id === null) {
        return res.status(400).json({
            success: false,
            message: 'game_id is required.'
        });
    }

    const parsedGuestId = Number(guest_id);
    if (!Number.isInteger(parsedGuestId) || parsedGuestId <= 0) {
        return res.status(400).json({
            success: false,
            message: 'guest_id must be a positive integer.'
        });
    }

    const parsedGameId = Number(game_id);
    if (!Number.isInteger(parsedGameId) || parsedGameId <= 0) {
        return res.status(400).json({
            success: false,
            message: 'game_id must be a positive integer.'
        });
    }

    req.body.guest_id = parsedGuestId;
    req.body.game_id = parsedGameId;

    next();
}

function validateBookingId(req, res, next) {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            success: false,
            message: 'Booking ID must be a positive integer.'
        });
    }
    req.params.id = id;
    next();
}

module.exports = {
    validateCreateBooking,
    validateBookingId
};

function validateCreateGuest(req, res, next) {
    const { name, phone } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({
            success: false,
            message: 'Guest name is required and cannot be empty.'
        });
    }

    if (phone !== undefined && phone !== null) {
        if (typeof phone !== 'string' || phone.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Phone number must be a valid non-empty string if provided.'
            });
        }
    }

    req.body.name = name.trim();
    if (phone) req.body.phone = phone.trim();

    next();
}

function validateUpdateGuest(req, res, next) {
    const { name, phone } = req.body;

    if (name === undefined && phone === undefined) {
        return res.status(400).json({
            success: false,
            message: 'At least one field (name or phone) must be provided to update.'
        });
    }

    if (name !== undefined) {
        if (typeof name !== 'string' || name.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Guest name cannot be empty.'
            });
        }
        req.body.name = name.trim();
    }

    if (phone !== undefined && phone !== null) {
        if (typeof phone !== 'string' || phone.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Phone number must be a valid non-empty string if provided.'
            });
        }
        req.body.phone = phone.trim();
    }

    next();
}

function validateGuestId(req, res, next) {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            success: false,
            message: 'Guest ID must be a positive integer.'
        });
    }
    req.params.id = id;
    next();
}

module.exports = {
    validateCreateGuest,
    validateUpdateGuest,
    validateGuestId
};

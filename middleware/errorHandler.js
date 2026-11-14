function errorHandler(err, req, res, next) {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({
            success: false,
            message: 'Malformed JSON payload in request body.'
        });
    }

    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE' || (err.message && err.message.includes('UNIQUE constraint failed'))) {
        let field = 'record';
        if (err.message.includes('guests.phone')) field = 'Phone number';
        return res.status(409).json({
            success: false,
            message: `${field} already exists. Duplicate values are not allowed.`
        });
    }

    if (err.code === 'SQLITE_CONSTRAINT_FOREIGNKEY' || (err.message && err.message.includes('FOREIGN KEY constraint failed'))) {
        return res.status(409).json({
            success: false,
            message: 'Operation violates a database relationship constraint (foreign key violation).'
        });
    }

    if (err.code === 'SQLITE_CONSTRAINT_CHECK' || (err.message && err.message.includes('CHECK constraint failed'))) {
        return res.status(400).json({
            success: false,
            message: 'Data constraint failed. Please verify field values meet required rules.'
        });
    }

    const statusCode = err.statusCode || err.status || 500;
    const message = statusCode === 500
        ? 'Internal Server Error. Please contact support.'
        : (err.message || 'An unexpected error occurred.');

    if (process.env.NODE_ENV !== 'production') {
        console.error('[Error Handler]', err);
    }

    return res.status(statusCode).json({
        success: false,
        message: message
    });
}

module.exports = errorHandler;

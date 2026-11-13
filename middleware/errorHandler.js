function errorHandler(err, req, res, next) {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ success: false, message: 'Invalid JSON in request body.' });
  }

  if (err.code === 'SQLITE_CONSTRAINT') {
    const message = err.message || '';

    if (message.includes('UNIQUE')) {
      return res.status(409).json({ success: false, message: 'A record with this value already exists (unique constraint violated).' });
    }

    if (message.includes('FOREIGN KEY')) {
      return res.status(409).json({ success: false, message: 'Referenced record does not exist (foreign key constraint violated).' });
    }

    if (message.includes('CHECK')) {
      return res.status(400).json({ success: false, message: 'Value did not satisfy a database check constraint.' });
    }

    return res.status(409).json({ success: false, message: 'Database constraint violated.' });
  }

  const status = err.status || err.statusCode || 500;
  const message = status < 500 ? err.message : 'An unexpected error occurred.';

  res.status(status).json({ success: false, message });
}

module.exports = errorHandler;

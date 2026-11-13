const VALID_STATUSES = ['available', 'in_use'];

function validateCreateGame(req, res, next) {
  let { name, players } = req.body;

  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ success: false, message: 'name is required and must be a non-empty string.' });
  }

  if (players === undefined || players === null) {
    return res.status(400).json({ success: false, message: 'players is required.' });
  }

  if (!Number.isInteger(players) || players <= 0) {
    return res.status(400).json({ success: false, message: 'players must be a strictly positive integer.' });
  }

  req.body.name = name.trim();
  next();
}

function validateUpdateGame(req, res, next) {
  const { name, players, status } = req.body;

  if (name === undefined && players === undefined && status === undefined) {
    return res.status(400).json({ success: false, message: 'At least one field (name, players, or status) must be provided.' });
  }

  if (name !== undefined && (typeof name !== 'string' || name.trim() === '')) {
    return res.status(400).json({ success: false, message: 'name must be a non-empty string.' });
  }

  if (players !== undefined && (!Number.isInteger(players) || players <= 0)) {
    return res.status(400).json({ success: false, message: 'players must be a strictly positive integer.' });
  }

  if (status !== undefined && !VALID_STATUSES.includes(status)) {
    return res.status(400).json({ success: false, message: "status must be 'available' or 'in_use'." });
  }

  if (name !== undefined) req.body.name = name.trim();
  next();
}

function validateGameId(req, res, next) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ success: false, message: 'Game id must be a strictly positive integer.' });
  }

  next();
}

function validatePlayersQuery(req, res, next) {
  const { players } = req.query;

  if (players !== undefined) {
    const parsed = Number(players);

    if (!Number.isInteger(parsed) || parsed <= 0) {
      return res.status(400).json({ success: false, message: 'Query parameter players must be a strictly positive integer.' });
    }
  }

  next();
}

module.exports = { validateCreateGame, validateUpdateGame, validateGameId, validatePlayersQuery };

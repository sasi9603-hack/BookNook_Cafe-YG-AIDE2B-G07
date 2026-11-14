function validateCreateGuest(req, res, next) {
  let { name, phone } = req.body;

  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ success: false, message: 'name is required and must be a non-empty string.' });
  }

  if (phone !== undefined && (typeof phone !== 'string' || phone.trim() === '')) {
    return res.status(400).json({ success: false, message: 'phone must be a non-empty string if provided.' });
  }

  req.body.name = name.trim();
  if (phone !== undefined) req.body.phone = phone.trim();

  next();
}

function validateUpdateGuest(req, res, next) {
  const { name, phone } = req.body;

  if (name === undefined && phone === undefined) {
    return res.status(400).json({ success: false, message: 'At least one field (name or phone) must be provided.' });
  }

  if (name !== undefined && (typeof name !== 'string' || name.trim() === '')) {
    return res.status(400).json({ success: false, message: 'name must be a non-empty string.' });
  }

  if (phone !== undefined && (typeof phone !== 'string' || phone.trim() === '')) {
    return res.status(400).json({ success: false, message: 'phone must be a non-empty string if provided.' });
  }

  if (name !== undefined) req.body.name = name.trim();
  if (phone !== undefined) req.body.phone = phone.trim();

  next();
}

function validateGuestId(req, res, next) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ success: false, message: 'Guest id must be a strictly positive integer.' });
  }

  next();
}

module.exports = { validateCreateGuest, validateUpdateGuest, validateGuestId };

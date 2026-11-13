function validateCreateBooking(req, res, next) {
  const { guest_id, game_id } = req.body;

  if (guest_id === undefined || !Number.isInteger(guest_id) || guest_id <= 0) {
    return res.status(400).json({ success: false, message: 'guest_id is required and must be a strictly positive integer.' });
  }

  if (game_id === undefined || !Number.isInteger(game_id) || game_id <= 0) {
    return res.status(400).json({ success: false, message: 'game_id is required and must be a strictly positive integer.' });
  }

  next();
}

function validateBookingId(req, res, next) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ success: false, message: 'Booking id must be a strictly positive integer.' });
  }

  next();
}

module.exports = { validateCreateBooking, validateBookingId };

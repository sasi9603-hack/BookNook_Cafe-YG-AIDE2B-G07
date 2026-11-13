const express = require('express');
const router = express.Router();

const bookingController = require('../controllers/bookingController');
const {
    validateCreateBooking,
    validateBookingId
} = require('../middleware/validateBooking');

router.get('/', bookingController.getAllBookings);
router.get('/details', bookingController.getBookingDetails);
router.post('/', validateCreateBooking, bookingController.createBooking);
router.put('/:id/complete', validateBookingId, bookingController.completeBooking);

module.exports = router;

const express = require('express');
const router = express.Router();

const guestController = require('../controllers/guestController');
const {
    validateCreateGuest,
    validateUpdateGuest,
    validateGuestId
} = require('../middleware/validateGuest');

router.get('/', guestController.getAllGuests);
router.get('/:id', validateGuestId, guestController.getGuestById);
router.post('/', validateCreateGuest, guestController.createGuest);
router.put('/:id', validateGuestId, validateUpdateGuest, guestController.updateGuest);
router.delete('/:id', validateGuestId, guestController.deleteGuest);

module.exports = router;

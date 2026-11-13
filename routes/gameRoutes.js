const express = require('express');
const router = express.Router();

const gameController = require('../controllers/gameController');
const {
    validateCreateGame,
    validateUpdateGame,
    validateGameId,
    validatePlayersQuery
} = require('../middleware/validateGame');

router.get('/', validatePlayersQuery, gameController.getAllGames);
router.get('/:id', validateGameId, gameController.getGameById);
router.post('/', validateCreateGame, gameController.createGame);
router.put('/:id', validateGameId, validateUpdateGame, gameController.updateGame);
router.delete('/:id', validateGameId, gameController.deleteGame);

module.exports = router;

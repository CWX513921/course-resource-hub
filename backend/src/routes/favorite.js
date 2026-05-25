const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const { addFavorite, removeFavorite, listFavorites, checkFavorite } = require('../controllers/favoriteController');

router.get('/', authMiddleware, listFavorites);
router.get('/:resourceId/check', authMiddleware, checkFavorite);
router.post('/:resourceId', authMiddleware, addFavorite);
router.delete('/:resourceId', authMiddleware, removeFavorite);

module.exports = router;

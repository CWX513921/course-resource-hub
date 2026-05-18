const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const { addFavorite, removeFavorite, listFavorites } = require('../controllers/favoriteController');

router.get('/', authMiddleware, listFavorites);
router.post('/:resourceId', authMiddleware, addFavorite);
router.delete('/:resourceId', authMiddleware, removeFavorite);

module.exports = router;

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const checkRole = require('../middlewares/checkRole');
const { list, create, update, remove } = require('../controllers/tagController');

router.get('/', list);
router.post('/', authMiddleware, checkRole(['admin']), create);
router.put('/:id', authMiddleware, checkRole(['admin']), update);
router.delete('/:id', authMiddleware, checkRole(['admin']), remove);

module.exports = router;

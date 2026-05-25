const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const checkRole = require('../middlewares/checkRole');
const { getTree, create, remove } = require('../controllers/categoryController');

router.get('/tree', getTree);
router.post('/', authMiddleware, checkRole(['admin']), create);
router.delete('/:id', authMiddleware, checkRole(['admin']), remove);

module.exports = router;

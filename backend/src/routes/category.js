const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const checkRole = require('../middlewares/checkRole');
const { getTree, create } = require('../controllers/categoryController');

router.get('/tree', getTree);
router.post('/', authMiddleware, checkRole(['admin']), create);

module.exports = router;

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const checkRole = require('../middlewares/checkRole');
const { getList, updateStatus } = require('../controllers/userController');

router.get('/', authMiddleware, checkRole(['admin']), getList);
router.put('/:id/status', authMiddleware, checkRole(['admin']), updateStatus);

module.exports = router;

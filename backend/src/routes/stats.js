const express = require('express');
const router = express.Router();
const { overview, topDownloaded, categoryStats } = require('../controllers/statsController');

router.get('/overview', overview);
router.get('/resources/top-downloaded', topDownloaded);
router.get('/categories', categoryStats);

module.exports = router;

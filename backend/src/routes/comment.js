const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const { listComments, addComment, deleteComment } = require('../controllers/commentController');

router.get('/:resourceId', listComments);
router.post('/:resourceId', authMiddleware, addComment);
router.delete('/:resourceId/:commentId', authMiddleware, deleteComment);

module.exports = router;

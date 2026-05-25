const commentService = require('../services/commentService');

async function listComments(req, res, next) {
  try {
    const resourceId = req.params.resourceId;
    const { page, pageSize } = req.query;
    const result = await commentService.getByResourceId(resourceId, { page, pageSize });
    res.json({ code: 0, message: 'success', data: result });
  } catch (err) {
    next(err);
  }
}

async function addComment(req, res, next) {
  try {
    const resourceId = req.params.resourceId;
    const userId = req.user.userId;
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ code: 400, message: '评论内容不能为空' });
    }
    if (content.length > 500) {
      return res.status(400).json({ code: 400, message: '评论内容不能超过500字' });
    }
    const result = await commentService.create({ resourceId, userId, content: content.trim() });
    res.status(201).json({ code: 0, message: '评论成功', data: result });
  } catch (err) {
    next(err);
  }
}

async function deleteComment(req, res, next) {
  try {
    const commentId = req.params.commentId;
    const userId = req.user.userId;
    await commentService.remove(commentId, userId);
    res.json({ code: 0, message: '删除成功', data: {} });
  } catch (err) {
    if (err.code) return res.status(err.code === 403 ? 403 : 404).json(err);
    next(err);
  }
}

module.exports = { listComments, addComment, deleteComment };

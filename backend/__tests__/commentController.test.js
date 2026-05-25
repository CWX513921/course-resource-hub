const commentService = require('../src/services/commentService');

jest.mock('../src/services/commentService');

const { listComments, addComment, deleteComment } = require('../src/controllers/commentController');

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('commentController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('listComments', () => {
    it('应返回评论列表', async () => {
      const req = { params: { resourceId: '1' }, query: {} };
      const res = mockRes();
      const next = jest.fn();
      commentService.getByResourceId.mockResolvedValue({ list: [], total: 0, page: 1, pageSize: 20 });
      await listComments(req, res, next);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ code: 0 }));
    });
  });

  describe('addComment', () => {
    it('评论内容为空应返回400', async () => {
      const req = { params: { resourceId: '1' }, user: { userId: 1 }, body: { content: '' } };
      const res = mockRes();
      const next = jest.fn();
      await addComment(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('评论超过500字应返回400', async () => {
      const req = { params: { resourceId: '1' }, user: { userId: 1 }, body: { content: 'a'.repeat(501) } };
      const res = mockRes();
      const next = jest.fn();
      await addComment(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('应成功添加评论', async () => {
      const req = { params: { resourceId: '1' }, user: { userId: 1 }, body: { content: '好资源' } };
      const res = mockRes();
      const next = jest.fn();
      commentService.create.mockResolvedValue({ id: 1 });
      await addComment(req, res, next);
      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe('deleteComment', () => {
    it('评论不存在应返回404', async () => {
      const req = { params: { commentId: '999' }, user: { userId: 1 } };
      const res = mockRes();
      const next = jest.fn();
      commentService.remove.mockRejectedValue({ code: 2001, message: '评论不存在' });
      await deleteComment(req, res, next);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('无权删除应返回403', async () => {
      const req = { params: { commentId: '1' }, user: { userId: 1 } };
      const res = mockRes();
      const next = jest.fn();
      commentService.remove.mockRejectedValue({ code: 403, message: '无权删除此评论' });
      await deleteComment(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('应成功删除评论', async () => {
      const req = { params: { commentId: '1' }, user: { userId: 1 } };
      const res = mockRes();
      const next = jest.fn();
      commentService.remove.mockResolvedValue();
      await deleteComment(req, res, next);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ code: 0 }));
    });

    it('其他code错误应返回404', async () => {
      const req = { params: { commentId: '1' }, user: { userId: 1 } };
      const res = mockRes();
      const next = jest.fn();
      commentService.remove.mockRejectedValue({ code: 2001, message: '评论不存在' });
      await deleteComment(req, res, next);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('无code错误应调用next', async () => {
      const req = { params: { commentId: '1' }, user: { userId: 1 } };
      const res = mockRes();
      const next = jest.fn();
      commentService.remove.mockRejectedValue(new Error('unknown'));
      await deleteComment(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('listComments - error handling', () => {
    it('出错应调用next', async () => {
      const req = { params: { resourceId: '1' }, query: {} };
      const res = mockRes();
      const next = jest.fn();
      commentService.getByResourceId.mockRejectedValue(new Error('DB error'));
      await listComments(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('addComment - error handling', () => {
    it('service出错应调用next', async () => {
      const req = { params: { resourceId: '1' }, user: { userId: 1 }, body: { content: '好' } };
      const res = mockRes();
      const next = jest.fn();
      commentService.create.mockRejectedValue(new Error('DB error'));
      await addComment(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });
});

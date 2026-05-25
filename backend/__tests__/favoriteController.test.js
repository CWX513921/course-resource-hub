const favoriteService = require('../src/services/favoriteService');

jest.mock('../src/services/favoriteService');

const { addFavorite, removeFavorite, listFavorites, checkFavorite } = require('../src/controllers/favoriteController');

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('favoriteController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('addFavorite', () => {
    it('应成功收藏', async () => {
      const req = { user: { userId: 1 }, params: { resourceId: '1' } };
      const res = mockRes();
      const next = jest.fn();
      favoriteService.addFavorite.mockResolvedValue({ id: 1 });
      await addFavorite(req, res, next);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ code: 0 }));
    });

    it('资源不存在应返回400', async () => {
      const req = { user: { userId: 1 }, params: { resourceId: '999' } };
      const res = mockRes();
      const next = jest.fn();
      favoriteService.addFavorite.mockRejectedValue({ code: 2001, message: '资源不存在' });
      await addFavorite(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('重复收藏应返回400', async () => {
      const req = { user: { userId: 1 }, params: { resourceId: '1' } };
      const res = mockRes();
      const next = jest.fn();
      favoriteService.addFavorite.mockRejectedValue({ code: 400, message: '已收藏过该资源' });
      await addFavorite(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('removeFavorite', () => {
    it('应成功取消收藏', async () => {
      const req = { user: { userId: 1 }, params: { resourceId: '1' } };
      const res = mockRes();
      const next = jest.fn();
      favoriteService.removeFavorite.mockResolvedValue();
      await removeFavorite(req, res, next);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ code: 0 }));
    });
  });

  describe('listFavorites', () => {
    it('应返回收藏列表', async () => {
      const req = { user: { userId: 1 }, query: {} };
      const res = mockRes();
      const next = jest.fn();
      favoriteService.getUserFavorites.mockResolvedValue({ list: [], total: 0, page: 1, pageSize: 20 });
      await listFavorites(req, res, next);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ code: 0 }));
    });
  });

  describe('checkFavorite', () => {
    it('已收藏应返回true', async () => {
      const req = { user: { userId: 1 }, params: { resourceId: '1' } };
      const res = mockRes();
      const next = jest.fn();
      favoriteService.isFavorited.mockResolvedValue(true);
      await checkFavorite(req, res, next);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ data: { favorited: true } }));
    });

    it('未收藏应返回false', async () => {
      const req = { user: { userId: 1 }, params: { resourceId: '1' } };
      const res = mockRes();
      const next = jest.fn();
      favoriteService.isFavorited.mockResolvedValue(false);
      await checkFavorite(req, res, next);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ data: { favorited: false } }));
    });
  });

  describe('removeFavorite - error handling', () => {
    it('出错应调用next', async () => {
      const req = { user: { userId: 1 }, params: { resourceId: '1' } };
      const res = mockRes();
      const next = jest.fn();
      favoriteService.removeFavorite.mockRejectedValue(new Error('DB error'));
      await removeFavorite(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('listFavorites - error handling', () => {
    it('出错应调用next', async () => {
      const req = { user: { userId: 1 }, query: {} };
      const res = mockRes();
      const next = jest.fn();
      favoriteService.getUserFavorites.mockRejectedValue(new Error('DB error'));
      await listFavorites(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('addFavorite - non-code error', () => {
    it('无code错误应调用next', async () => {
      const req = { user: { userId: 1 }, params: { resourceId: '1' } };
      const res = mockRes();
      const next = jest.fn();
      favoriteService.addFavorite.mockRejectedValue(new Error('unknown'));
      await addFavorite(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('checkFavorite - error handling', () => {
    it('出错应调用next', async () => {
      const req = { user: { userId: 1 }, params: { resourceId: '1' } };
      const res = mockRes();
      const next = jest.fn();
      favoriteService.isFavorited.mockRejectedValue(new Error('DB error'));
      await checkFavorite(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });
});

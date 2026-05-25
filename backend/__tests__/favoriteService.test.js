const pool = require('../src/models/db');

jest.mock('../src/models/db', () => ({
  execute: jest.fn()
}));

const { addFavorite, removeFavorite, getUserFavorites, isFavorited } = require('../src/services/favoriteService');

describe('favoriteService', () => {
  beforeEach(() => {
    pool.execute.mockReset();
  });

  describe('addFavorite', () => {
    it('应成功添加收藏', async () => {
      pool.execute
        .mockResolvedValueOnce([[{ id: 1 }]])
        .mockResolvedValueOnce([{ insertId: 1 }]);
      const result = await addFavorite(1, 1);
      expect(result).toEqual({ id: 1 });
    });

    it('资源不存在应抛出错误', async () => {
      pool.execute.mockResolvedValueOnce([[]]);
      await expect(addFavorite(1, 999)).rejects.toEqual({ code: 2001, message: '资源不存在' });
    });

    it('重复收藏应抛出400错误', async () => {
      const dupError = new Error('Duplicate');
      dupError.code = 'ER_DUP_ENTRY';
      pool.execute
        .mockResolvedValueOnce([[{ id: 1 }]])
        .mockRejectedValueOnce(dupError);
      await expect(addFavorite(1, 1)).rejects.toEqual({ code: 400, message: '已收藏过该资源' });
    });

    it('其他数据库错误应向上抛出', async () => {
      const otherError = new Error('DB error');
      otherError.code = 'ER_OTHER';
      pool.execute
        .mockResolvedValueOnce([[{ id: 1 }]])
        .mockRejectedValueOnce(otherError);
      await expect(addFavorite(1, 1)).rejects.toThrow('DB error');
    });
  });

  describe('removeFavorite', () => {
    it('应删除收藏记录', async () => {
      pool.execute.mockResolvedValue([{ affectedRows: 1 }]);
      await removeFavorite(1, 1);
      expect(pool.execute).toHaveBeenCalledTimes(1);
    });
  });

  describe('getUserFavorites', () => {
    it('应返回分页收藏列表', async () => {
      pool.execute
        .mockResolvedValueOnce([[{ total: 5 }]])
        .mockResolvedValueOnce([[{ favorite_id: 1, resource_id: 10, title: 'A' }]]);
      const result = await getUserFavorites(1, { page: 1, pageSize: 10 });
      expect(result.total).toBe(5);
      expect(result.list).toHaveLength(1);
    });

    it('应使用默认分页参数', async () => {
      pool.execute
        .mockResolvedValueOnce([[{ total: 0 }]])
        .mockResolvedValueOnce([[]]);
      const result = await getUserFavorites(1);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(20);
    });
  });

  describe('isFavorited', () => {
    it('已收藏应返回true', async () => {
      pool.execute.mockResolvedValue([[{ id: 1 }]]);
      const result = await isFavorited(1, 1);
      expect(result).toBe(true);
    });

    it('未收藏应返回false', async () => {
      pool.execute.mockResolvedValue([[]]);
      const result = await isFavorited(1, 1);
      expect(result).toBe(false);
    });
  });
});

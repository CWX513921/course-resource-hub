const pool = require('../src/models/db');

jest.mock('../src/models/db', () => ({
  execute: jest.fn()
}));

const { getByResourceId, create, remove } = require('../src/services/commentService');

describe('commentService', () => {
  beforeEach(() => {
    pool.execute.mockReset();
  });

  describe('getByResourceId', () => {
    it('应返回分页评论列表', async () => {
      pool.execute
        .mockResolvedValueOnce([[{ total: 3 }]])
        .mockResolvedValueOnce([[{ id: 1, content: '好', username: 'u1' }]]);
      const result = await getByResourceId(1, { page: 1, pageSize: 10 });
      expect(result.total).toBe(3);
      expect(result.list).toHaveLength(1);
    });

    it('应使用默认分页参数', async () => {
      pool.execute
        .mockResolvedValueOnce([[{ total: 0 }]])
        .mockResolvedValueOnce([[]]);
      const result = await getByResourceId(1);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(20);
    });
  });

  describe('create', () => {
    it('应创建评论并返回id', async () => {
      pool.execute.mockResolvedValue([{ insertId: 1 }]);
      const result = await create({ resourceId: 1, userId: 1, content: '不错' });
      expect(result).toEqual({ id: 1 });
    });
  });

  describe('remove', () => {
    it('评论不存在应抛出错误', async () => {
      pool.execute.mockResolvedValue([[]]);
      await expect(remove(999, 1)).rejects.toEqual({ code: 2001, message: '评论不存在' });
    });

    it('非本人评论应抛出403错误', async () => {
      pool.execute.mockResolvedValue([[{ user_id: 2 }]]);
      await expect(remove(1, 1)).rejects.toEqual({ code: 403, message: '无权删除此评论' });
    });

    it('本人评论应正常删除', async () => {
      pool.execute
        .mockResolvedValueOnce([[{ user_id: 1 }]])
        .mockResolvedValueOnce([{ affectedRows: 1 }]);
      await remove(1, 1);
      expect(pool.execute).toHaveBeenCalledTimes(2);
    });
  });
});

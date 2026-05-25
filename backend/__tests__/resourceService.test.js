const pool = require('../src/models/db');

jest.mock('../src/models/db', () => ({
  execute: jest.fn()
}));

const { create, findById, findList, update, remove, incrementDownload, incrementView, attachTags } = require('../src/services/resourceService');

describe('resourceService', () => {
  beforeEach(() => {
    pool.execute.mockReset();
  });

  describe('create', () => {
    it('应创建资源并返回id和title', async () => {
      pool.execute.mockResolvedValue([{ insertId: 1 }]);
      const result = await create({
        title: '测试课件', description: 'desc', filePath: '/a.pdf',
        fileType: 'pdf', fileSize: 1024, uploaderId: 1, categoryId: 1
      });
      expect(pool.execute).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ id: 1, title: '测试课件' });
    });

    it('status未传时应默认published', async () => {
      pool.execute.mockResolvedValue([{ insertId: 2 }]);
      await create({
        title: 'T', description: '', filePath: '/b.pdf',
        fileType: 'pdf', fileSize: 100, uploaderId: 1, categoryId: 1
      });
      const args = pool.execute.mock.calls[0];
      expect(args[1][7]).toBe('published');
    });
  });

  describe('findById', () => {
    it('应返回资源详情含uploader和tags', async () => {
      pool.execute
        .mockResolvedValueOnce([[{ id: 1, title: 'A', uploader_name: 'u1', uploader_id: 1, category_name: 'c1', file_path: '/a.pdf' }]])
        .mockResolvedValueOnce([[{ id: 10, name: 'tag1' }]]);
      const result = await findById(1);
      expect(result.uploader).toEqual({ id: 1, name: 'u1' });
      expect(result.tags).toEqual([{ id: 10, name: 'tag1' }]);
      expect(result.uploader_name).toBeUndefined();
    });

    it('资源不存在应返回null', async () => {
      pool.execute.mockResolvedValue([[]]);
      const result = await findById(999);
      expect(result).toBeNull();
    });
  });

  describe('findList', () => {
    it('默认应按published状态查询', async () => {
      pool.execute
        .mockResolvedValueOnce([[{ total: 0 }]])
        .mockResolvedValueOnce([[]]);
      await findList();
      const sql = pool.execute.mock.calls[0][0];
      expect(sql).toContain('r.status = ?');
      expect(pool.execute.mock.calls[0][1][0]).toBe('published');
    });

    it('传入keyword应添加LIKE条件', async () => {
      pool.execute
        .mockResolvedValueOnce([[{ total: 1 }]])
        .mockResolvedValueOnce([[{ id: 1, title: '匹配' }]]);
      const result = await findList({ keyword: '测试' });
      expect(result.list).toHaveLength(1);
    });

    it('status为all时不应添加状态条件', async () => {
      pool.execute
        .mockResolvedValueOnce([[{ total: 0 }]])
        .mockResolvedValueOnce([[]]);
      await findList({ status: 'all' });
      const sql = pool.execute.mock.calls[0][0];
      expect(sql).toContain('1=1');
    });

    it('应支持分页', async () => {
      pool.execute
        .mockResolvedValueOnce([[{ total: 50 }]])
        .mockResolvedValueOnce([[]]);
      const result = await findList({ page: 2, pageSize: 10 });
      expect(result.page).toBe(2);
      expect(result.pageSize).toBe(10);
    });

    it('传入category应添加分类条件', async () => {
      pool.execute
        .mockResolvedValueOnce([[{ total: 1 }]])
        .mockResolvedValueOnce([[{ id: 1, title: 'A' }]]);
      await findList({ category: 2 });
      const sql = pool.execute.mock.calls[0][0];
      expect(sql).toContain('r.category_id = ?');
    });

    it('传入tag应添加EXISTS子查询', async () => {
      pool.execute
        .mockResolvedValueOnce([[{ total: 0 }]])
        .mockResolvedValueOnce([[]]);
      await findList({ tag: '数学' });
      const sql = pool.execute.mock.calls[0][0];
      expect(sql).toContain('EXISTS');
    });

    it('传入uploaderId应添加上传者条件', async () => {
      pool.execute
        .mockResolvedValueOnce([[{ total: 0 }]])
        .mockResolvedValueOnce([[]]);
      await findList({ uploaderId: 5 });
      const sql = pool.execute.mock.calls[0][0];
      expect(sql).toContain('r.uploader_id = ?');
    });

    it('传入status非all应添加状态条件', async () => {
      pool.execute
        .mockResolvedValueOnce([[{ total: 0 }]])
        .mockResolvedValueOnce([[]]);
      await findList({ status: 'draft' });
      const params = pool.execute.mock.calls[0][1];
      expect(params[0]).toBe('draft');
    });
  });

  describe('update', () => {
    it('应更新指定字段', async () => {
      pool.execute.mockResolvedValue([{ affectedRows: 1 }]);
      const result = await update(1, { title: '新标题', status: 'draft' });
      expect(result).toBe(true);
    });

    it('无字段更新应返回false', async () => {
      const result = await update(1, {});
      expect(result).toBe(false);
    });
  });

  describe('remove', () => {
    it('应删除资源记录', async () => {
      pool.execute
        .mockResolvedValueOnce([[{ file_path: '/tmp/test.pdf' }]])
        .mockResolvedValueOnce([{ affectedRows: 1 }]);
      await remove(1);
      expect(pool.execute).toHaveBeenCalledTimes(2);
    });

    it('无file_path时也应正常删除', async () => {
      pool.execute
        .mockResolvedValueOnce([[{ file_path: null }]])
        .mockResolvedValueOnce([{ affectedRows: 1 }]);
      await remove(2);
      expect(pool.execute).toHaveBeenCalledTimes(2);
    });
  });

  describe('incrementDownload', () => {
    it('应调用UPDATE递增download_count', async () => {
      pool.execute.mockResolvedValue([{ affectedRows: 1 }]);
      await incrementDownload(1);
      expect(pool.execute.mock.calls[0][0]).toContain('download_count = download_count + 1');
    });
  });

  describe('incrementView', () => {
    it('应调用UPDATE递增view_count', async () => {
      pool.execute.mockResolvedValue([{ affectedRows: 1 }]);
      await incrementView(1);
      expect(pool.execute.mock.calls[0][0]).toContain('view_count = view_count + 1');
    });
  });

  describe('attachTags', () => {
    it('已存在的tag应复用', async () => {
      pool.execute
        .mockResolvedValueOnce([[{ id: 5 }]])
        .mockResolvedValueOnce([{ affectedRows: 1 }]);
      await attachTags(1, ['已存在标签']);
      expect(pool.execute).toHaveBeenCalledTimes(2);
    });

    it('新tag应创建后再关联', async () => {
      pool.execute
        .mockResolvedValueOnce([[]])
        .mockResolvedValueOnce([{ insertId: 10 }])
        .mockResolvedValueOnce([{ affectedRows: 1 }]);
      await attachTags(1, ['新标签']);
      expect(pool.execute).toHaveBeenCalledTimes(3);
    });

    it('空白tag应跳过', async () => {
      await attachTags(1, ['   ', '']);
      expect(pool.execute).not.toHaveBeenCalled();
    });
  });
});

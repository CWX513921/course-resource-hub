const pool = require('../src/models/db');

jest.mock('../src/models/db', () => ({
  execute: jest.fn()
}));

const { getOverview, getTopDownloaded, getCategoryStats } = require('../src/services/statsService');

describe('statsService', () => {
  beforeEach(() => {
    pool.execute.mockReset();
  });

  describe('getOverview', () => {
    it('应返回总览统计数据', async () => {
      pool.execute
        .mockResolvedValueOnce([[{ totalUsers: 10 }]])
        .mockResolvedValueOnce([[{ totalResources: 20 }]])
        .mockResolvedValueOnce([[{ totalDownloads: 100 }]])
        .mockResolvedValueOnce([[{ totalFavorites: 30 }]]);
      const result = await getOverview();
      expect(result).toEqual({ totalUsers: 10, totalResources: 20, totalDownloads: 100, totalFavorites: 30 });
    });
  });

  describe('getTopDownloaded', () => {
    it('应返回热门下载资源列表', async () => {
      pool.execute.mockResolvedValue([[{ id: 1, title: 'A', download_count: 50 }]]);
      const result = await getTopDownloaded(5);
      expect(result).toHaveLength(1);
    });

    it('未传limit应默认10', async () => {
      pool.execute.mockResolvedValue([[]]);
      await getTopDownloaded();
      const args = pool.execute.mock.calls[0][1];
      expect(args[1]).toBe('10');
    });
  });

  describe('getCategoryStats', () => {
    it('应返回分类统计列表', async () => {
      pool.execute.mockResolvedValue([[{ category_name: '数学', resource_count: 5 }]]);
      const result = await getCategoryStats();
      expect(result).toHaveLength(1);
      expect(result[0].category_name).toBe('数学');
    });
  });
});

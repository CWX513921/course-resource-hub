const categoryService = require('../src/services/categoryService');
const statsService = require('../src/services/statsService');
const userService = require('../src/services/userService');

jest.mock('../src/services/categoryService');
jest.mock('../src/services/statsService');
jest.mock('../src/services/userService');

const { getTree, create } = require('../src/controllers/categoryController');
const { overview, topDownloaded, categoryStats } = require('../src/controllers/statsController');
const { getList, updateStatus } = require('../src/controllers/userController');

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('categoryController', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  describe('getTree', () => {
    it('应返回分类树', async () => {
      const req = {};
      const res = mockRes();
      const next = jest.fn();
      categoryService.getTree.mockResolvedValue([{ id: 1, name: 'A', children: [] }]);
      await getTree(req, res, next);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ code: 0 }));
    });

    it('出错应调用next', async () => {
      const req = {};
      const res = mockRes();
      const next = jest.fn();
      categoryService.getTree.mockRejectedValue(new Error('DB error'));
      await getTree(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('name为空应返回400', async () => {
      const req = { body: { name: '' } };
      const res = mockRes();
      const next = jest.fn();
      await create(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('name未传应返回400', async () => {
      const req = { body: {} };
      const res = mockRes();
      const next = jest.fn();
      await create(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('应成功创建分类', async () => {
      const req = { body: { name: '新分类' } };
      const res = mockRes();
      const next = jest.fn();
      categoryService.create.mockResolvedValue({ id: 1, name: '新分类' });
      await create(req, res, next);
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('出错应调用next', async () => {
      const req = { body: { name: '新分类' } };
      const res = mockRes();
      const next = jest.fn();
      categoryService.create.mockRejectedValue(new Error('DB error'));
      await create(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });
});

describe('statsController', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  describe('overview', () => {
    it('应返回统计概览', async () => {
      const req = {};
      const res = mockRes();
      const next = jest.fn();
      statsService.getOverview.mockResolvedValue({ totalUsers: 10, totalResources: 20, totalDownloads: 100, totalFavorites: 30 });
      await overview(req, res, next);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ code: 0 }));
    });

    it('出错应调用next', async () => {
      const req = {};
      const res = mockRes();
      const next = jest.fn();
      statsService.getOverview.mockRejectedValue(new Error('DB error'));
      await overview(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('topDownloaded', () => {
    it('应返回热门资源', async () => {
      const req = { query: { limit: '5' } };
      const res = mockRes();
      const next = jest.fn();
      statsService.getTopDownloaded.mockResolvedValue([{ id: 1, title: 'A', download_count: 50 }]);
      await topDownloaded(req, res, next);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ code: 0 }));
    });

    it('无limit参数应默认10', async () => {
      const req = { query: {} };
      const res = mockRes();
      const next = jest.fn();
      statsService.getTopDownloaded.mockResolvedValue([]);
      await topDownloaded(req, res, next);
      expect(statsService.getTopDownloaded).toHaveBeenCalledWith(10);
    });

    it('出错应调用next', async () => {
      const req = { query: {} };
      const res = mockRes();
      const next = jest.fn();
      statsService.getTopDownloaded.mockRejectedValue(new Error('DB error'));
      await topDownloaded(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('categoryStats', () => {
    it('应返回分类统计', async () => {
      const req = {};
      const res = mockRes();
      const next = jest.fn();
      statsService.getCategoryStats.mockResolvedValue([]);
      await categoryStats(req, res, next);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ code: 0 }));
    });

    it('出错应调用next', async () => {
      const req = {};
      const res = mockRes();
      const next = jest.fn();
      statsService.getCategoryStats.mockRejectedValue(new Error('DB error'));
      await categoryStats(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });
});

describe('userController', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  describe('getList', () => {
    it('应返回用户列表', async () => {
      const req = { query: {} };
      const res = mockRes();
      const next = jest.fn();
      userService.getList.mockResolvedValue({ list: [], total: 0, page: 1, pageSize: 20 });
      await getList(req, res, next);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ code: 0 }));
    });

    it('出错应调用next', async () => {
      const req = { query: {} };
      const res = mockRes();
      const next = jest.fn();
      userService.getList.mockRejectedValue(new Error('DB error'));
      await getList(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('updateStatus', () => {
    it('无效状态应返回400', async () => {
      const req = { params: { id: '1' }, body: { status: 'invalid' } };
      const res = mockRes();
      const next = jest.fn();
      await updateStatus(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('应成功更新状态', async () => {
      const req = { params: { id: '1' }, body: { status: 'disabled' } };
      const res = mockRes();
      const next = jest.fn();
      userService.updateStatus.mockResolvedValue();
      await updateStatus(req, res, next);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ code: 0 }));
    });

    it('active状态应通过', async () => {
      const req = { params: { id: '1' }, body: { status: 'active' } };
      const res = mockRes();
      const next = jest.fn();
      userService.updateStatus.mockResolvedValue();
      await updateStatus(req, res, next);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ code: 0 }));
    });

    it('出错应调用next', async () => {
      const req = { params: { id: '1' }, body: { status: 'disabled' } };
      const res = mockRes();
      const next = jest.fn();
      userService.updateStatus.mockRejectedValue(new Error('DB error'));
      await updateStatus(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });
});

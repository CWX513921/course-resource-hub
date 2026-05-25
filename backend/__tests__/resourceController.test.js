const resourceService = require('../src/services/resourceService');
const accessLogService = require('../src/services/accessLogService');

jest.mock('../src/services/resourceService');
jest.mock('../src/services/accessLogService', () => ({
  log: jest.fn()
}));

const { list, detail, create, update, remove, download } = require('../src/controllers/resourceController');

function mockRes() {
  const res = { statusCode: 200 };
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('resourceController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('应返回资源列表', async () => {
      const req = { query: {} };
      const res = mockRes();
      const next = jest.fn();
      resourceService.findList.mockResolvedValue({ list: [], total: 0, page: 1, pageSize: 20 });
      await list(req, res, next);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ code: 0 }));
    });

    it('出错时应调用next', async () => {
      const req = { query: {} };
      const res = mockRes();
      const next = jest.fn();
      resourceService.findList.mockRejectedValue(new Error('DB error'));
      await list(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('detail', () => {
    it('应返回资源详情', async () => {
      const req = { params: { id: '1' }, user: { userId: 1 }, ip: '127.0.0.1' };
      const res = mockRes();
      const next = jest.fn();
      resourceService.findById.mockResolvedValue({ id: 1, title: 'A', view_count: 5, uploader: { id: 1 } });
      resourceService.incrementView.mockResolvedValue();
      accessLogService.log.mockResolvedValue();
      await detail(req, res, next);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ code: 0 }));
    });

    it('资源不存在应返回404', async () => {
      const req = { params: { id: '999' }, user: null, ip: '127.0.0.1' };
      const res = mockRes();
      const next = jest.fn();
      resourceService.findById.mockResolvedValue(null);
      await detail(req, res, next);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('create', () => {
    it('非教师/管理员应返回403', async () => {
      const req = { user: { userId: 1, role: 'student' }, body: {}, file: {} };
      const res = mockRes();
      const next = jest.fn();
      await create(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('缺少标题或文件应返回400', async () => {
      const req = { user: { userId: 1, role: 'teacher' }, body: { title: '' }, file: null };
      const res = mockRes();
      const next = jest.fn();
      await create(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('教师应成功上传资源', async () => {
      const req = {
        user: { userId: 1, role: 'teacher' },
        body: { title: '课件', categoryId: 1 },
        file: { originalname: 'test.pdf', path: '/uploads/1.pdf', size: 1024 }
      };
      const res = mockRes();
      const next = jest.fn();
      resourceService.create.mockResolvedValue({ id: 1, title: '课件' });
      await create(req, res, next);
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('上传带tags字符串应正确拆分', async () => {
      const req = {
        user: { userId: 1, role: 'teacher' },
        body: { title: '课件', categoryId: 1, tags: 'tag1,tag2' },
        file: { originalname: 'test.pdf', path: '/uploads/1.pdf', size: 1024 }
      };
      const res = mockRes();
      const next = jest.fn();
      resourceService.create.mockResolvedValue({ id: 1, title: '课件' });
      resourceService.attachTags.mockResolvedValue();
      await create(req, res, next);
      expect(resourceService.attachTags).toHaveBeenCalledWith(1, ['tag1', 'tag2']);
    });

    it('上传带tags数组应直接传', async () => {
      const req = {
        user: { userId: 1, role: 'teacher' },
        body: { title: '课件', categoryId: 1, tags: ['a', 'b'] },
        file: { originalname: 'test.pdf', path: '/uploads/1.pdf', size: 1024 }
      };
      const res = mockRes();
      const next = jest.fn();
      resourceService.create.mockResolvedValue({ id: 1, title: '课件' });
      resourceService.attachTags.mockResolvedValue();
      await create(req, res, next);
      expect(resourceService.attachTags).toHaveBeenCalledWith(1, ['a', 'b']);
    });

    it('无user应返回403', async () => {
      const req = { user: null, body: {}, file: {} };
      const res = mockRes();
      const next = jest.fn();
      await create(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
    });
  });

  describe('update', () => {
    it('资源不存在应返回404', async () => {
      const req = { params: { id: '1' }, user: { userId: 1, role: 'teacher' }, body: {} };
      const res = mockRes();
      const next = jest.fn();
      resourceService.findById.mockResolvedValue(null);
      await update(req, res, next);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('非本人且非管理员应返回403', async () => {
      const req = { params: { id: '1' }, user: { userId: 2, role: 'teacher' }, body: { title: 'X' } };
      const res = mockRes();
      const next = jest.fn();
      resourceService.findById.mockResolvedValue({ id: 1, uploader: { id: 1 } });
      await update(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('管理员应可更新他人资源', async () => {
      const req = { params: { id: '1' }, user: { userId: 2, role: 'admin' }, body: { title: 'X' } };
      const res = mockRes();
      const next = jest.fn();
      resourceService.findById.mockResolvedValue({ id: 1, uploader: { id: 1 } });
      resourceService.update.mockResolvedValue(true);
      await update(req, res, next);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ code: 0 }));
    });
  });

  describe('remove', () => {
    it('资源不存在应返回404', async () => {
      const req = { params: { id: '1' }, user: { userId: 1, role: 'teacher' } };
      const res = mockRes();
      const next = jest.fn();
      resourceService.findById.mockResolvedValue(null);
      await remove(req, res, next);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('本人应可删除', async () => {
      const req = { params: { id: '1' }, user: { userId: 1, role: 'teacher' } };
      const res = mockRes();
      const next = jest.fn();
      resourceService.findById.mockResolvedValue({ id: 1, uploader: { id: 1 } });
      resourceService.remove.mockResolvedValue();
      await remove(req, res, next);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ code: 0 }));
    });

    it('非本人且非管理员应返回403', async () => {
      const req = { params: { id: '1' }, user: { userId: 2, role: 'teacher' } };
      const res = mockRes();
      const next = jest.fn();
      resourceService.findById.mockResolvedValue({ id: 1, uploader: { id: 1 } });
      await remove(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
    });
  });

  describe('download', () => {
    it('应返回下载URL', async () => {
      const req = { params: { id: '1' }, user: { userId: 1 }, ip: '127.0.0.1' };
      const res = mockRes();
      const next = jest.fn();
      resourceService.findById.mockResolvedValue({ id: 1, title: 'A', file_path: '/a.pdf' });
      resourceService.incrementDownload.mockResolvedValue();
      accessLogService.log.mockResolvedValue();
      await download(req, res, next);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ code: 0 }));
    });

    it('资源不存在应返回404', async () => {
      const req = { params: { id: '999' }, user: null, ip: '127.0.0.1' };
      const res = mockRes();
      const next = jest.fn();
      resourceService.findById.mockResolvedValue(null);
      await download(req, res, next);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('detail - error handling', () => {
    it('service出错应调用next', async () => {
      const req = { params: { id: '1' }, user: { userId: 1 }, ip: '127.0.0.1' };
      const res = mockRes();
      const next = jest.fn();
      resourceService.findById.mockRejectedValue(new Error('DB error'));
      await detail(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('download - error handling', () => {
    it('service出错应调用next', async () => {
      const req = { params: { id: '1' }, user: { userId: 1 }, ip: '127.0.0.1' };
      const res = mockRes();
      const next = jest.fn();
      resourceService.findById.mockRejectedValue(new Error('DB error'));
      await download(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('update - error handling', () => {
    it('service出错应调用next', async () => {
      const req = { params: { id: '1' }, user: { userId: 1, role: 'teacher' }, body: { title: 'X' } };
      const res = mockRes();
      const next = jest.fn();
      resourceService.findById.mockResolvedValue({ id: 1, uploader: { id: 1 } });
      resourceService.update.mockRejectedValue(new Error('DB error'));
      await update(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('remove - error handling', () => {
    it('service出错应调用next', async () => {
      const req = { params: { id: '1' }, user: { userId: 1, role: 'teacher' } };
      const res = mockRes();
      const next = jest.fn();
      resourceService.findById.mockResolvedValue({ id: 1, uploader: { id: 1 } });
      resourceService.remove.mockRejectedValue(new Error('DB error'));
      await remove(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('create - error handling', () => {
    it('service出错应调用next', async () => {
      const req = {
        user: { userId: 1, role: 'teacher' },
        body: { title: '课件' },
        file: { originalname: 'test.pdf', path: '/uploads/1.pdf', size: 1024 }
      };
      const res = mockRes();
      const next = jest.fn();
      resourceService.create.mockRejectedValue(new Error('DB error'));
      await create(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });
});

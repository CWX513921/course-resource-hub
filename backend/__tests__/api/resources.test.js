const request = require('supertest');
const express = require('express');
const resourceController = require('../../src/controllers/resourceController');
const authMiddleware = require('../../src/middlewares/auth');

jest.mock('../../src/services/resourceService');
jest.mock('../../src/services/accessLogService', () => ({ log: jest.fn() }));
jest.mock('../../src/middlewares/auth', () => {
  return (req, res, next) => {
    req.user = { userId: 1, role: 'teacher' };
    next();
  };
});

const resourceService = require('../../src/services/resourceService');

const app = express();
app.use(express.json());
app.get('/api/v1/resources', resourceController.list);
app.get('/api/v1/resources/:id', resourceController.detail);
app.post('/api/v1/resources', authMiddleware, resourceController.create);

describe('API /resources', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /resources', () => {
    it('应返回资源列表', async () => {
      resourceService.findList.mockResolvedValue({ list: [], total: 0, page: 1, pageSize: 20 });
      const res = await request(app).get('/api/v1/resources');
      expect(res.status).toBe(200);
      expect(res.body.code).toBe(0);
    });

    it('应支持查询参数', async () => {
      resourceService.findList.mockResolvedValue({ list: [], total: 0, page: 1, pageSize: 20 });
      const res = await request(app).get('/api/v1/resources?keyword=test&page=1');
      expect(res.status).toBe(200);
    });
  });

  describe('GET /resources/:id', () => {
    it('应返回资源详情', async () => {
      resourceService.findById.mockResolvedValue({ id: 1, title: 'A', view_count: 5, uploader: { id: 1 } });
      resourceService.incrementView.mockResolvedValue();
      const res = await request(app).get('/api/v1/resources/1');
      expect(res.status).toBe(200);
      expect(res.body.code).toBe(0);
    });

    it('资源不存在应返回404', async () => {
      resourceService.findById.mockResolvedValue(null);
      const res = await request(app).get('/api/v1/resources/999');
      expect(res.status).toBe(404);
    });
  });

  describe('POST /resources', () => {
    it('缺少标题应返回400', async () => {
      const res = await request(app)
        .post('/api/v1/resources')
        .field('categoryId', '1');
      expect(res.status).toBe(400);
    });
  });
});

const request = require('supertest');
const express = require('express');
const authController = require('../../src/controllers/authController');

jest.mock('../../src/services/userService');

const userService = require('../../src/services/userService');

const app = express();
app.use(express.json());
app.post('/api/v1/auth/register', authController.register);
app.post('/api/v1/auth/login', authController.login);

describe('API /auth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /auth/register', () => {
    it('缺少必填项应返回400', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ username: 'test' });
      expect(res.status).toBe(400);
    });

    it('密码过短应返回400', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ username: 'test', password: '12', email: 't@t.com' });
      expect(res.status).toBe(400);
    });

    it('应成功注册', async () => {
      userService.register.mockResolvedValue({ id: 1, username: 'test' });
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ username: 'test', password: '123456', email: 't@t.com' });
      expect(res.status).toBe(201);
      expect(res.body.code).toBe(0);
    });

    it('用户名已存在应返回400', async () => {
      userService.register.mockRejectedValue({ code: 1001, message: '用户名或邮箱已存在' });
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ username: 'test', password: '123456', email: 't@t.com' });
      expect(res.status).toBe(400);
    });
  });

  describe('POST /auth/login', () => {
    it('缺少必填项应返回400', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({});
      expect(res.status).toBe(400);
    });

    it('应成功登录', async () => {
      userService.login.mockResolvedValue({ token: 'tok', userInfo: { id: 1, username: 'test', role: 'student' } });
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ username: 'test', password: '123456' });
      expect(res.status).toBe(200);
      expect(res.body.code).toBe(0);
    });

    it('密码错误应返回401', async () => {
      userService.login.mockRejectedValue({ code: 401, message: '用户名或密码错误' });
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ username: 'test', password: 'wrong' });
      expect(res.status).toBe(401);
    });

    it('账号禁用应返回403', async () => {
      userService.login.mockRejectedValue({ code: 403, message: '账号已被禁用' });
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ username: 'test', password: '123456' });
      expect(res.status).toBe(403);
    });
  });
});

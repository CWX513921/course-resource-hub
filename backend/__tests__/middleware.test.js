const authMiddleware = require('../src/middlewares/auth');
const checkRole = require('../src/middlewares/checkRole');

process.env.JWT_SECRET = 'test_secret_key';
const { generateToken } = require('../src/utils/jwt');

describe('认证中间件', () => {
  test('无Authorization头应返回401', () => {
    const req = { headers: {} };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();
    authMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('有效Token应调用next', () => {
    const token = generateToken({ userId: 1, role: 'student' });
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();
    authMiddleware(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.user.userId).toBe(1);
  });
});

describe('权限校验中间件', () => {
  test('有权限角色应调用next', () => {
    const req = { user: { userId: 1, role: 'admin' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();
    checkRole(['admin', 'teacher'])(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  test('无权限角色应返回403', () => {
    const req = { user: { userId: 1, role: 'student' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();
    checkRole(['admin'])(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
});

const pool = require('../src/models/db');
const { hashPassword, comparePassword } = require('../src/utils/password');
const { generateToken } = require('../src/utils/jwt');

jest.mock('../src/models/db', () => ({
  execute: jest.fn()
}));
jest.mock('../src/utils/password', () => ({
  hashPassword: jest.fn(),
  comparePassword: jest.fn()
}));
jest.mock('../src/utils/jwt', () => ({
  generateToken: jest.fn(),
  verifyToken: jest.fn()
}));

const { register, login, findById, getList, updateStatus } = require('../src/services/userService');

describe('userService', () => {
  beforeEach(() => {
    pool.execute.mockReset();
    hashPassword.mockReset();
    comparePassword.mockReset();
    generateToken.mockReset();
  });

  describe('register', () => {
    it('应成功注册并返回id和username', async () => {
      pool.execute
        .mockResolvedValueOnce([[]])
        .mockResolvedValueOnce([{ insertId: 1 }]);
      hashPassword.mockResolvedValue('hashed');
      const result = await register({ username: 'test', password: '123456', email: 't@t.com' });
      expect(result).toEqual({ id: 1, username: 'test' });
    });

    it('用户名或邮箱已存在应抛出错误', async () => {
      pool.execute.mockResolvedValue([[{ id: 1 }]]);
      await expect(register({ username: 'test', password: '123456', email: 't@t.com' }))
        .rejects.toEqual({ code: 1001, message: '用户名或邮箱已存在' });
    });

    it('role未传时应默认student', async () => {
      pool.execute
        .mockResolvedValueOnce([[]])
        .mockResolvedValueOnce([{ insertId: 2 }]);
      hashPassword.mockResolvedValue('hashed');
      await register({ username: 'stu', password: '123456', email: 's@s.com' });
      const args = pool.execute.mock.calls[1][1];
      expect(args[3]).toBe('student');
    });
  });

  describe('login', () => {
    it('应成功登录返回token和userInfo', async () => {
      pool.execute.mockResolvedValue([[{ id: 1, username: 'test', password_hash: 'h', role: 'student', status: 'active' }]]);
      comparePassword.mockResolvedValue(true);
      generateToken.mockReturnValue('token123');
      const result = await login({ username: 'test', password: '123456' });
      expect(result.token).toBe('token123');
      expect(result.userInfo.username).toBe('test');
    });

    it('用户不存在应抛出401错误', async () => {
      pool.execute.mockResolvedValue([[]]);
      await expect(login({ username: 'nobody', password: 'x' }))
        .rejects.toEqual({ code: 401, message: '用户名或密码错误' });
    });

    it('账号被禁用应抛出403错误', async () => {
      pool.execute.mockResolvedValue([[{ id: 1, username: 'test', password_hash: 'h', role: 'student', status: 'disabled' }]]);
      await expect(login({ username: 'test', password: '123456' }))
        .rejects.toEqual({ code: 403, message: '账号已被禁用' });
    });

    it('密码错误应抛出401错误', async () => {
      pool.execute.mockResolvedValue([[{ id: 1, username: 'test', password_hash: 'h', role: 'student', status: 'active' }]]);
      comparePassword.mockResolvedValue(false);
      await expect(login({ username: 'test', password: 'wrong' }))
        .rejects.toEqual({ code: 401, message: '用户名或密码错误' });
    });
  });

  describe('findById', () => {
    it('应返回用户信息', async () => {
      pool.execute.mockResolvedValue([[{ id: 1, username: 'test' }]]);
      const result = await findById(1);
      expect(result).toEqual({ id: 1, username: 'test' });
    });

    it('用户不存在应返回null', async () => {
      pool.execute.mockResolvedValue([[]]);
      const result = await findById(999);
      expect(result).toBeNull();
    });
  });

  describe('getList', () => {
    it('应返回分页用户列表', async () => {
      pool.execute
        .mockResolvedValueOnce([[{ total: 1 }]])
        .mockResolvedValueOnce([[{ id: 1, username: 'test' }]]);
      const result = await getList({ page: 1, pageSize: 10 });
      expect(result.total).toBe(1);
      expect(result.list).toHaveLength(1);
    });

    it('传入role应添加过滤条件', async () => {
      pool.execute
        .mockResolvedValueOnce([[{ total: 0 }]])
        .mockResolvedValueOnce([[]]);
      await getList({ role: 'teacher' });
      const sql = pool.execute.mock.calls[0][0];
      expect(sql).toContain('role = ?');
    });
  });

  describe('updateStatus', () => {
    it('应更新用户状态', async () => {
      pool.execute.mockResolvedValue([{ affectedRows: 1 }]);
      await updateStatus(1, 'disabled');
      expect(pool.execute).toHaveBeenCalledTimes(1);
    });
  });
});

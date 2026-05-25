const { generateToken, verifyToken } = require('../src/utils/jwt');

process.env.JWT_SECRET = 'test_secret_key';

describe('JWT工具函数', () => {
  test('generateToken 应返回有效token', () => {
    const token = generateToken({ userId: 1, role: 'student' });
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
  });

  test('verifyToken 应正确解码token', () => {
    const payload = { userId: 1, role: 'teacher' };
    const token = generateToken(payload);
    const decoded = verifyToken(token);
    expect(decoded.userId).toBe(1);
    expect(decoded.role).toBe('teacher');
  });

  test('verifyToken 无效token应抛出异常', () => {
    expect(() => verifyToken('invalid_token')).toThrow();
  });
});

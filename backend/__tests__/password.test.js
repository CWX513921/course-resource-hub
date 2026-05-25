const { hashPassword, comparePassword } = require('../src/utils/password');

describe('密码工具函数', () => {
  test('hashPassword 应返回哈希字符串', async () => {
    const hash = await hashPassword('test123');
    expect(hash).toBeDefined();
    expect(typeof hash).toBe('string');
    expect(hash).not.toBe('test123');
  });

  test('comparePassword 正确密码应返回true', async () => {
    const hash = await hashPassword('test123');
    const result = await comparePassword('test123', hash);
    expect(result).toBe(true);
  });

  test('comparePassword 错误密码应返回false', async () => {
    const hash = await hashPassword('test123');
    const result = await comparePassword('wrong', hash);
    expect(result).toBe(false);
  });
});

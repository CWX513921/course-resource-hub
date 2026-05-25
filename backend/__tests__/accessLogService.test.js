const pool = require('../src/models/db');

jest.mock('../src/models/db', () => ({
  execute: jest.fn()
}));

const { log } = require('../src/services/accessLogService');

describe('accessLogService', () => {
  beforeEach(() => {
    pool.execute.mockReset();
  });

  describe('log', () => {
    it('应插入访问日志', async () => {
      pool.execute.mockResolvedValue([{ insertId: 1 }]);
      await log({ userId: 1, resourceId: 1, action: 'view', ipAddress: '127.0.0.1' });
      expect(pool.execute).toHaveBeenCalledTimes(1);
    });

    it('userId为null时应传null', async () => {
      pool.execute.mockResolvedValue([{ insertId: 1 }]);
      await log({ userId: null, resourceId: 1, action: 'download', ipAddress: '127.0.0.1' });
      const args = pool.execute.mock.calls[0][1];
      expect(args[0]).toBeNull();
    });
  });
});

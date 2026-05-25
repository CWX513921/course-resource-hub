const pool = require('../src/models/db');

jest.mock('../src/models/db', () => ({
  execute: jest.fn()
}));

const { getTree, create } = require('../src/services/categoryService');

describe('categoryService', () => {
  beforeEach(() => {
    pool.execute.mockReset();
  });

  describe('getTree', () => {
    it('应返回树形结构', async () => {
      pool.execute.mockResolvedValue([[
        { id: 1, name: '父分类', parent_id: null, sort_order: 0 },
        { id: 2, name: '子分类', parent_id: 1, sort_order: 1 }
      ]]);
      const tree = await getTree();
      expect(tree).toHaveLength(1);
      expect(tree[0].name).toBe('父分类');
      expect(tree[0].children).toHaveLength(1);
      expect(tree[0].children[0].name).toBe('子分类');
    });

    it('无数据应返回空数组', async () => {
      pool.execute.mockResolvedValue([[]]);
      const tree = await getTree();
      expect(tree).toEqual([]);
    });

    it('多顶级分类应都出现在tree中', async () => {
      pool.execute.mockResolvedValue([[
        { id: 1, name: 'A', parent_id: null, sort_order: 0 },
        { id: 2, name: 'B', parent_id: null, sort_order: 1 }
      ]]);
      const tree = await getTree();
      expect(tree).toHaveLength(2);
    });
  });

  describe('create', () => {
    it('应创建分类并返回id和name', async () => {
      pool.execute.mockResolvedValue([{ insertId: 3 }]);
      const result = await create({ name: '新分类', parentId: 1, sortOrder: 2 });
      expect(result).toEqual({ id: 3, name: '新分类' });
    });

    it('parentId未传时应为null', async () => {
      pool.execute.mockResolvedValue([{ insertId: 4 }]);
      await create({ name: '顶级分类' });
      const args = pool.execute.mock.calls[0][1];
      expect(args[1]).toBeNull();
    });

    it('sortOrder未传时应默认0', async () => {
      pool.execute.mockResolvedValue([{ insertId: 5 }]);
      await create({ name: 'X' });
      const args = pool.execute.mock.calls[0][1];
      expect(args[2]).toBe(0);
    });
  });
});

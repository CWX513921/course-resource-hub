const pool = require('../models/db');

async function getTree() {
  const [rows] = await pool.execute(
    'SELECT id, name, parent_id, sort_order FROM categories ORDER BY sort_order ASC'
  );
  const map = {};
  const tree = [];
  rows.forEach(item => {
    map[item.id] = { ...item, children: [] };
  });
  rows.forEach(item => {
    if (item.parent_id && map[item.parent_id]) {
      map[item.parent_id].children.push(map[item.id]);
    } else if (!item.parent_id) {
      tree.push(map[item.id]);
    }
  });
  return tree;
}

async function create({ name, parentId, sortOrder }) {
  const [result] = await pool.execute(
    'INSERT INTO categories (name, parent_id, sort_order) VALUES (?, ?, ?)',
    [name, parentId || null, sortOrder || 0]
  );
  return { id: result.insertId, name };
}

async function remove(id) {
  const [children] = await pool.execute('SELECT id FROM categories WHERE parent_id = ?', [id]);
  if (children.length > 0) {
    throw { code: 400, message: '该分类下有子分类，无法删除' };
  }
  const [resources] = await pool.execute('SELECT id FROM resources WHERE category_id = ?', [id]);
  if (resources.length > 0) {
    throw { code: 400, message: '该分类下有资源，无法删除' };
  }
  await pool.execute('DELETE FROM categories WHERE id = ?', [id]);
}

module.exports = { getTree, create, remove };

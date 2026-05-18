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

module.exports = { getTree, create };

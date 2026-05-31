const pool = require('../models/db');

async function findAll() {
  const [rows] = await pool.execute(
    'SELECT t.*, (SELECT COUNT(*) FROM resource_tags rt WHERE rt.tag_id = t.id) AS resource_count FROM tags t ORDER BY t.created_at DESC'
  );
  return rows;
}

async function findById(id) {
  const [rows] = await pool.execute('SELECT * FROM tags WHERE id = ?', [id]);
  return rows.length > 0 ? rows[0] : null;
}

async function create({ name }) {
  const [result] = await pool.execute('INSERT INTO tags (name) VALUES (?)', [name]);
  return { id: result.insertId, name };
}

async function update(id, { name }) {
  await pool.execute('UPDATE tags SET name = ? WHERE id = ?', [name, id]);
  return true;
}

async function remove(id) {
  await pool.execute('DELETE FROM resource_tags WHERE tag_id = ?', [id]);
  await pool.execute('DELETE FROM tags WHERE id = ?', [id]);
  return true;
}

module.exports = { findAll, findById, create, update, remove };

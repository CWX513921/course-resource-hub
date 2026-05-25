const pool = require('../models/db');

async function getByResourceId(resourceId, { page = 1, pageSize = 20 } = {}) {
  const offset = (page - 1) * pageSize;
  const [countResult] = await pool.execute(
    'SELECT COUNT(*) as total FROM comments WHERE resource_id = ?',
    [resourceId]
  );
  const total = countResult[0].total;
  const [rows] = await pool.execute(
    `SELECT c.id, c.content, c.created_at, u.username, u.id as user_id
     FROM comments c
     LEFT JOIN users u ON c.user_id = u.id
     WHERE c.resource_id = ?
     ORDER BY c.created_at DESC
     LIMIT ? OFFSET ?`,
    [resourceId, String(pageSize), String(offset)]
  );
  return { list: rows, total, page: Number(page), pageSize: Number(pageSize) };
}

async function create({ resourceId, userId, content }) {
  const [result] = await pool.execute(
    'INSERT INTO comments (resource_id, user_id, content) VALUES (?, ?, ?)',
    [resourceId, userId, content]
  );
  return { id: result.insertId };
}

async function remove(id, userId) {
  const [rows] = await pool.execute('SELECT user_id FROM comments WHERE id = ?', [id]);
  if (rows.length === 0) throw { code: 2001, message: '评论不存在' };
  if (rows[0].user_id !== userId) throw { code: 403, message: '无权删除此评论' };
  await pool.execute('DELETE FROM comments WHERE id = ?', [id]);
}

module.exports = { getByResourceId, create, remove };

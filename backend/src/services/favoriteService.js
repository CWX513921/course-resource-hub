const pool = require('../models/db');

async function addFavorite(userId, resourceId) {
  const [resource] = await pool.execute('SELECT id FROM resources WHERE id = ?', [resourceId]);
  if (resource.length === 0) {
    throw { code: 2001, message: '资源不存在' };
  }
  try {
    const [result] = await pool.execute(
      'INSERT INTO favorites (user_id, resource_id) VALUES (?, ?)',
      [userId, resourceId]
    );
    return { id: result.insertId };
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      throw { code: 400, message: '已收藏过该资源' };
    }
    throw err;
  }
}

async function removeFavorite(userId, resourceId) {
  await pool.execute(
    'DELETE FROM favorites WHERE user_id = ? AND resource_id = ?',
    [userId, resourceId]
  );
}

async function getUserFavorites(userId, { page = 1, pageSize = 20 } = {}) {
  const offset = (page - 1) * pageSize;
  const [countResult] = await pool.execute(
    'SELECT COUNT(*) as total FROM favorites WHERE user_id = ?',
    [userId]
  );
  const total = countResult[0].total;
  const [rows] = await pool.execute(
    `SELECT f.id as favorite_id, f.created_at as favorited_at, r.id as resource_id, r.title, r.file_type, r.download_count, r.view_count
     FROM favorites f
     INNER JOIN resources r ON f.resource_id = r.id
     WHERE f.user_id = ?
     ORDER BY f.created_at DESC
     LIMIT ? OFFSET ?`,
    [userId, String(pageSize), String(offset)]
  );
  return { list: rows, total, page: Number(page), pageSize: Number(pageSize) };
}

async function isFavorited(userId, resourceId) {
  const [rows] = await pool.execute(
    'SELECT id FROM favorites WHERE user_id = ? AND resource_id = ?',
    [userId, resourceId]
  );
  return rows.length > 0;
}

module.exports = { addFavorite, removeFavorite, getUserFavorites, isFavorited };

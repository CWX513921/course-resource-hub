const pool = require('../models/db');

async function getOverview() {
  const [[{ totalUsers }]] = await pool.execute('SELECT COUNT(*) as totalUsers FROM users');
  const [[{ totalResources }]] = await pool.execute('SELECT COUNT(*) as totalResources FROM resources WHERE status = ?', ['published']);
  const [[{ totalDownloads }]] = await pool.execute('SELECT COALESCE(SUM(download_count), 0) as totalDownloads FROM resources');
  const [[{ totalFavorites }]] = await pool.execute('SELECT COUNT(*) as totalFavorites FROM favorites');
  return { totalUsers, totalResources, totalDownloads, totalFavorites };
}

async function getTopDownloaded(limit = 10) {
  const [rows] = await pool.execute(
    `SELECT id, title, download_count FROM resources WHERE status = ? ORDER BY download_count DESC LIMIT ?`,
    ['published', String(limit)]
  );
  return rows;
}

async function getCategoryStats() {
  const [rows] = await pool.execute(
    `SELECT c.name as category_name, COUNT(r.id) as resource_count
     FROM categories c
     LEFT JOIN resources r ON c.id = r.category_id AND r.status = 'published'
     WHERE c.parent_id IS NULL
     GROUP BY c.id, c.name
     ORDER BY resource_count DESC`
  );
  return rows;
}

module.exports = { getOverview, getTopDownloaded, getCategoryStats };

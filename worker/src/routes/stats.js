import { Hono } from 'hono'

const stats = new Hono()

stats.get('/overview', async (c) => {
  const db = c.env.DB
  const [u, r, d, f] = await Promise.all([
    db.prepare('SELECT COUNT(*) as totalUsers FROM users').first(),
    db.prepare('SELECT COUNT(*) as totalResources FROM resources WHERE status = ?').bind('published').first(),
    db.prepare('SELECT COALESCE(SUM(download_count), 0) as totalDownloads FROM resources').first(),
    db.prepare('SELECT COUNT(*) as totalFavorites FROM favorites').first()
  ])
  return c.json({ code: 0, message: 'success', data: { totalUsers: u.totalUsers, totalResources: r.totalResources, totalDownloads: d.totalDownloads, totalFavorites: f.totalFavorites } })
})

stats.get('/resources/top-downloaded', async (c) => {
  const db = c.env.DB
  const limit = Number(c.req.query('limit')) || 10
  const rows = await db.prepare('SELECT id, title, download_count FROM resources WHERE status = ? ORDER BY download_count DESC LIMIT ?').bind('published', limit).all()
  return c.json({ code: 0, message: 'success', data: rows.results })
})

stats.get('/categories', async (c) => {
  const db = c.env.DB
  const rows = await db.prepare(
    `SELECT c.name as category_name, COUNT(r.id) as resource_count FROM categories c LEFT JOIN resources r ON c.id = r.category_id AND r.status = 'published' WHERE c.parent_id IS NULL GROUP BY c.id, c.name ORDER BY resource_count DESC`
  ).all()
  return c.json({ code: 0, message: 'success', data: rows.results })
})

export default stats

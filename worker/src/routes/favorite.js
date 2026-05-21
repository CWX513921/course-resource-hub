import { Hono } from 'hono'
import { verifyToken } from '../utils/jwt.js'

const favorite = new Hono()

favorite.get('/', async (c) => {
  const user = await getAuthUser(c)
  if (!user) return c.json({ code: 401, message: '未登录' }, 401)
  const db = c.env.DB
  const { page = '1', pageSize = '20' } = c.req.query()
  const p = Number(page); const ps = Number(pageSize); const offset = (p - 1) * ps
  const countResult = await db.prepare('SELECT COUNT(*) as total FROM favorites WHERE user_id = ?').bind(user.userId).first()
  const rows = await db.prepare(
    `SELECT f.id as favorite_id, f.created_at as favorited_at, r.id as resource_id, r.title, r.file_type, r.download_count, r.view_count
     FROM favorites f INNER JOIN resources r ON f.resource_id = r.id WHERE f.user_id = ? ORDER BY f.created_at DESC LIMIT ? OFFSET ?`
  ).bind(user.userId, ps, offset).all()
  return c.json({ code: 0, message: 'success', data: { list: (rows.results || []).map(f => ({ ...f, resource_id: Number(f.resource_id) || 0, download_count: Number(f.download_count) || 0, view_count: Number(f.view_count) || 0 })), total: Number(countResult.total) || 0, page: p, pageSize: ps } })
})

favorite.post('/:resourceId', async (c) => {
  const user = await getAuthUser(c)
  if (!user) return c.json({ code: 401, message: '未登录' }, 401)
  const db = c.env.DB
  const resourceId = c.req.param('resourceId')
  const resource = await db.prepare('SELECT id FROM resources WHERE id = ?').bind(resourceId).first()
  if (!resource) return c.json({ code: 2001, message: '资源不存在' }, 400)
  try {
    await db.prepare('INSERT INTO favorites (user_id, resource_id) VALUES (?, ?)').bind(user.userId, resourceId).run()
    return c.json({ code: 0, message: '收藏成功', data: {} })
  } catch { return c.json({ code: 400, message: '已收藏过该资源' }, 400) }
})

favorite.delete('/:resourceId', async (c) => {
  const user = await getAuthUser(c)
  if (!user) return c.json({ code: 401, message: '未登录' }, 401)
  const db = c.env.DB
  await db.prepare('DELETE FROM favorites WHERE user_id = ? AND resource_id = ?').bind(user.userId, c.req.param('resourceId')).run()
  return c.json({ code: 0, message: '取消成功', data: {} })
})

async function getAuthUser(c) {
  const authHeader = c.req.header('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null
  try {
    return await verifyToken(authHeader.split(' ')[1], c.env.JWT_SECRET)
  } catch { return null }
}

export default favorite

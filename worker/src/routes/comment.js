import { Hono } from 'hono'
import { verifyToken } from '../utils/jwt.js'

const comment = new Hono()

comment.get('/:resourceId', async (c) => {
  const db = c.env.DB
  const resourceId = c.req.param('resourceId')
  const { page = '1', pageSize = '20' } = c.req.query()
  const p = Number(page); const ps = Number(pageSize); const offset = (p - 1) * ps
  const countResult = await db.prepare('SELECT COUNT(*) as total FROM comments WHERE resource_id = ?').bind(resourceId).first()
  const rows = await db.prepare(
    `SELECT c.id, c.content, c.created_at, u.username, u.id as user_id
     FROM comments c LEFT JOIN users u ON c.user_id = u.id
     WHERE c.resource_id = ? ORDER BY c.created_at DESC LIMIT ? OFFSET ?`
  ).bind(resourceId, ps, offset).all()
  return c.json({ code: 0, message: 'success', data: { list: (rows.results || []).map(cmt => ({ ...cmt, id: Number(cmt.id) || 0, user_id: Number(cmt.user_id) || 0 })), total: Number(countResult.total) || 0, page: p, pageSize: ps } })
})

comment.post('/:resourceId', async (c) => {
  const user = await getAuthUser(c)
  if (!user) return c.json({ code: 401, message: '未登录' }, 401)
  const db = c.env.DB
  const resourceId = c.req.param('resourceId')
  const { content } = await c.req.json()
  if (!content || !content.trim()) return c.json({ code: 400, message: '评论内容不能为空' }, 400)
  if (content.length > 500) return c.json({ code: 400, message: '评论内容不能超过500字' }, 400)
  const result = await db.prepare('INSERT INTO comments (resource_id, user_id, content) VALUES (?, ?, ?)').bind(resourceId, user.userId, content.trim()).run()
  return c.json({ code: 0, message: '评论成功', data: { id: result.meta.last_row_id } }, 201)
})

comment.delete('/:resourceId/:commentId', async (c) => {
  const user = await getAuthUser(c)
  if (!user) return c.json({ code: 401, message: '未登录' }, 401)
  const db = c.env.DB
  const commentId = c.req.param('commentId')
  const row = await db.prepare('SELECT user_id FROM comments WHERE id = ?').bind(commentId).first()
  if (!row) return c.json({ code: 2001, message: '评论不存在' }, 404)
  if (row.user_id !== user.userId) return c.json({ code: 403, message: '无权删除此评论' }, 403)
  await db.prepare('DELETE FROM comments WHERE id = ?').bind(commentId).run()
  return c.json({ code: 0, message: '删除成功', data: {} })
})

async function getAuthUser(c) {
  const authHeader = c.req.header('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null
  try {
    return await verifyToken(authHeader.split(' ')[1], c.env.JWT_SECRET)
  } catch { return null }
}

export default comment

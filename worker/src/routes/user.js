import { Hono } from 'hono'
import { verifyToken } from '../utils/jwt.js'

const user = new Hono()

user.get('/', async (c) => {
  const authUser = await getAuthAdmin(c)
  if (!authUser) return c.json({ code: 403, message: '无权限' }, 403)
  const db = c.env.DB
  const { role, page = '1', pageSize = '20' } = c.req.query()
  const p = Number(page); const ps = Number(pageSize); const offset = (p - 1) * ps
  let where = '1=1'; const params = []
  if (role) { where += ' AND role = ?'; params.push(role) }
  const countResult = await db.prepare(`SELECT COUNT(*) as total FROM users WHERE ${where}`).bind(...params).first()
  const rows = await db.prepare(`SELECT id, username, email, role, status, created_at FROM users WHERE ${where} ORDER BY id ASC LIMIT ? OFFSET ?`).bind(...params, ps, offset).all()
  return c.json({ code: 0, message: 'success', data: { list: rows.results, total: countResult.total, page: p, pageSize: ps } })
})

user.put('/:id/status', async (c) => {
  const authUser = await getAuthAdmin(c)
  if (!authUser) return c.json({ code: 403, message: '无权限' }, 403)
  const db = c.env.DB
  const id = c.req.param('id')
  const { status } = await c.req.json()
  if (!['active', 'disabled'].includes(status)) return c.json({ code: 400, message: '无效的状态值' }, 400)
  await db.prepare('UPDATE users SET status = ? WHERE id = ?').bind(status, id).run()
  return c.json({ code: 0, message: '状态更新成功', data: {} })
})

async function getAuthAdmin(c) {
  const authHeader = c.req.header('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null
  try {
    const decoded = await verifyToken(authHeader.split(' ')[1], c.env.JWT_SECRET)
    return decoded.role === 'admin' ? decoded : null
  } catch { return null }
}

export default user

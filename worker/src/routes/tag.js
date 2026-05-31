import { Hono } from 'hono'
import { verifyToken } from '../utils/jwt.js'

const tag = new Hono()

tag.get('/', async (c) => {
  const db = c.env.DB
  const rows = await db.prepare(
    'SELECT t.*, (SELECT COUNT(*) FROM resource_tags rt WHERE rt.tag_id = t.id) AS resource_count FROM tags t ORDER BY t.created_at DESC'
  ).all()
  return c.json({ code: 0, message: 'success', data: rows.results })
})

tag.post('/', async (c) => {
  const authResult = await checkAdmin(c)
  if (authResult.error) return authResult.error
  const { name } = await c.req.json()
  if (!name || !name.trim()) return c.json({ code: 400, message: '标签名称为必填项' }, 400)
  const db = c.env.DB
  try {
    const result = await db.prepare('INSERT INTO tags (name) VALUES (?)').bind(name.trim()).run()
    return c.json({ code: 0, message: '创建成功', data: { id: result.meta.last_row_id, name: name.trim() } }, 201)
  } catch (e) {
    if (e.message && e.message.includes('UNIQUE')) {
      return c.json({ code: 400, message: '标签已存在' }, 400)
    }
    throw e
  }
})

tag.put('/:id', async (c) => {
  const authResult = await checkAdmin(c)
  if (authResult.error) return authResult.error
  const id = c.req.param('id')
  const { name } = await c.req.json()
  if (!name || !name.trim()) return c.json({ code: 400, message: '标签名称为必填项' }, 400)
  const db = c.env.DB
  const existing = await db.prepare('SELECT id FROM tags WHERE id = ?').bind(id).first()
  if (!existing) return c.json({ code: 404, message: '标签不存在' }, 404)
  try {
    await db.prepare('UPDATE tags SET name = ? WHERE id = ?').bind(name.trim(), id).run()
    return c.json({ code: 0, message: '更新成功', data: {} })
  } catch (e) {
    if (e.message && e.message.includes('UNIQUE')) {
      return c.json({ code: 400, message: '标签名称已存在' }, 400)
    }
    throw e
  }
})

tag.delete('/:id', async (c) => {
  const authResult = await checkAdmin(c)
  if (authResult.error) return authResult.error
  const db = c.env.DB
  const id = c.req.param('id')
  const existing = await db.prepare('SELECT id FROM tags WHERE id = ?').bind(id).first()
  if (!existing) return c.json({ code: 404, message: '标签不存在' }, 404)
  await db.prepare('DELETE FROM resource_tags WHERE tag_id = ?').bind(id).run()
  await db.prepare('DELETE FROM tags WHERE id = ?').bind(id).run()
  return c.json({ code: 0, message: '删除成功', data: {} })
})

async function checkAdmin(c) {
  const authHeader = c.req.header('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: c.json({ code: 401, message: '未登录' }, 401) }
  }
  try {
    const decoded = await verifyToken(authHeader.split(' ')[1], c.env.JWT_SECRET)
    if (decoded.role !== 'admin') return { error: c.json({ code: 403, message: '需要管理员权限' }, 403) }
    return { user: decoded }
  } catch {
    return { error: c.json({ code: 401, message: 'Token无效或已过期' }, 401) }
  }
}

export default tag

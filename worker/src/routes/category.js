import { Hono } from 'hono'
import { verifyToken } from '../utils/jwt.js'

const category = new Hono()

category.get('/tree', async (c) => {
  const db = c.env.DB
  const rows = await db.prepare('SELECT id, name, parent_id, sort_order FROM categories ORDER BY sort_order ASC').all()
  const map = {}
  const tree = []
  rows.results.forEach(item => { map[item.id] = { ...item, children: [] } })
  rows.results.forEach(item => {
    if (item.parent_id && map[item.parent_id]) { map[item.parent_id].children.push(map[item.id]) }
    else if (!item.parent_id) { tree.push(map[item.id]) }
  })
  return c.json({ code: 0, message: 'success', data: tree })
})

category.post('/', async (c) => {
  const authResult = await checkAdmin(c)
  if (authResult.error) return authResult.error
  const { name, parentId, sortOrder } = await c.req.json()
  if (!name) return c.json({ code: 400, message: '分类名称为必填项' }, 400)
  const db = c.env.DB
  const result = await db.prepare('INSERT INTO categories (name, parent_id, sort_order) VALUES (?, ?, ?)').bind(name, parentId || null, sortOrder || 0).run()
  return c.json({ code: 0, message: '创建成功', data: { id: result.meta.last_row_id, name } }, 201)
})

category.delete('/:id', async (c) => {
  const authResult = await checkAdmin(c)
  if (authResult.error) return authResult.error
  const db = c.env.DB
  const id = c.req.param('id')
  const children = await db.prepare('SELECT id FROM categories WHERE parent_id = ?').bind(id).first()
  if (children) return c.json({ code: 400, message: '该分类下有子分类，无法删除' }, 400)
  const resources = await db.prepare('SELECT id FROM resources WHERE category_id = ?').bind(id).first()
  if (resources) return c.json({ code: 400, message: '该分类下有资源，无法删除' }, 400)
  await db.prepare('DELETE FROM categories WHERE id = ?').bind(id).run()
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

export default category

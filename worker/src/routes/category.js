import { Hono } from 'hono'

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
  const authHeader = c.req.header('Authorization')
  if (!authHeader) return c.json({ code: 401, message: '未登录' }, 401)
  const { name, parentId, sortOrder } = await c.req.json()
  if (!name) return c.json({ code: 400, message: '分类名称为必填项' }, 400)
  const db = c.env.DB
  const result = await db.prepare('INSERT INTO categories (name, parent_id, sort_order) VALUES (?, ?, ?)').bind(name, parentId || null, sortOrder || 0).run()
  return c.json({ code: 0, message: '创建成功', data: { id: result.meta.last_row_id, name } }, 201)
})

export default category

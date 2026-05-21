import { Hono } from 'hono'
import { verifyToken } from '../utils/jwt.js'

const resource = new Hono()

resource.get('/', async (c) => {
  const db = c.env.DB
  const { category, tag, keyword, page = '1', pageSize = '20' } = c.req.query()
  const p = Number(page)
  const ps = Number(pageSize)
  const offset = (p - 1) * ps

  let where = 'r.status = ?'
  const params = ['published']
  if (category) { where += ' AND r.category_id = ?'; params.push(category) }
  if (keyword) { where += ' AND (r.title LIKE ? OR r.description LIKE ?)'; params.push(`%${keyword}%`, `%${keyword}%`) }

  const countResult = await db.prepare(`SELECT COUNT(*) as total FROM resources r WHERE ${where}`).bind(...params).first()
  const total = countResult.total
  const rows = await db.prepare(
    `SELECT r.id, r.title, r.description, r.file_type, r.file_size, r.view_count, r.download_count, r.status, r.created_at, u.username as uploader_name, c.name as category_name
     FROM resources r LEFT JOIN users u ON r.uploader_id = u.id LEFT JOIN categories c ON r.category_id = c.id
     WHERE ${where} ORDER BY r.created_at DESC LIMIT ? OFFSET ?`
  ).bind(...params, ps, offset).all()
  return c.json({ code: 0, message: 'success', data: { list: rows.results, total, page: p, pageSize: ps } })
})

resource.get('/:id/file', async (c) => {
  const db = c.env.DB
  const id = c.req.param('id')
  const row = await db.prepare('SELECT file_path, file_type FROM resources WHERE id = ?').bind(id).first()
  if (!row) return c.json({ code: 2001, message: '资源不存在' }, 404)

  const fileName = row.file_path.split('-').slice(1).join('-')
  const mimeTypes = {
    pdf: 'application/pdf', ppt: 'application/vnd.ms-powerpoint', pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    doc: 'application/msword', docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel', xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    zip: 'application/zip', rar: 'application/x-rar-compressed'
  }
  const contentType = mimeTypes[row.file_type] || 'application/octet-stream'

  if (c.env.BUCKET) {
    const obj = await c.env.BUCKET.get(row.file_path)
    if (!obj) return c.json({ code: 2001, message: '文件不存在' }, 404)
    return new Response(obj.body, { headers: { 'Content-Type': contentType, 'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}"` } })
  }

  const fileRow = await db.prepare('SELECT file_data FROM resource_files WHERE resource_id = ?').bind(id).first()
  if (!fileRow) return c.json({ code: 2001, message: '文件数据不存在' }, 404)

  const binaryStr = atob(fileRow.file_data)
  const bytes = new Uint8Array(binaryStr.length)
  for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i)
  return new Response(bytes, { headers: { 'Content-Type': contentType, 'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}"` } })
})

resource.get('/:id', async (c) => {
  const db = c.env.DB
  const id = c.req.param('id')
  const row = await db.prepare(
    `SELECT r.*, u.username as uploader_name, u.id as uploader_id, c.name as category_name
     FROM resources r LEFT JOIN users u ON r.uploader_id = u.id LEFT JOIN categories c ON r.category_id = c.id WHERE r.id = ?`
  ).bind(id).first()
  if (!row) return c.json({ code: 2001, message: '资源不存在' }, 404)
  await db.prepare('UPDATE resources SET view_count = view_count + 1 WHERE id = ?').bind(id).run()
  row.view_count += 1
  row.uploader = { id: row.uploader_id, name: row.uploader_name }
  delete row.uploader_name; delete row.uploader_id
  const tags = await db.prepare('SELECT t.id, t.name FROM tags t INNER JOIN resource_tags rt ON t.id = rt.tag_id WHERE rt.resource_id = ?').bind(id).all()
  row.tags = tags.results
  return c.json({ code: 0, message: 'success', data: row })
})

resource.post('/', async (c) => {
  const authResult = await checkAuth(c)
  if (authResult.error) return authResult.error
  if (!['teacher', 'admin'].includes(authResult.user.role)) {
    return c.json({ code: 403, message: '仅教师或管理员可上传资源' }, 403)
  }
  const db = c.env.DB
  const formData = await c.req.formData()
  const file = formData.get('file')
  const title = formData.get('title')
  const description = formData.get('description') || ''
  const categoryId = formData.get('categoryId') || '1'
  const tags = formData.get('tags')
  if (!title || !file) return c.json({ code: 400, message: '标题和文件为必填项' }, 400)

  const ext = file.name.split('.').pop().toLowerCase()
  const fileKey = `${Date.now()}-${file.name}`

  const result = await db.prepare(
    'INSERT INTO resources (title, description, file_path, file_type, file_size, uploader_id, category_id, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).bind(title, description, fileKey, ext, file.size, authResult.user.userId, categoryId, 'published').run()

  const resourceId = result.meta.last_row_id

  if (c.env.BUCKET) {
    await c.env.BUCKET.put(fileKey, file.stream())
  } else {
    const arrayBuffer = await file.arrayBuffer()
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))
    await db.prepare('INSERT INTO resource_files (resource_id, file_data) VALUES (?, ?)').bind(resourceId, base64).run()
  }

  if (tags) {
    const tagNames = typeof tags === 'string' ? tags.split(',') : [tags]
    for (const tagName of tagNames) {
      let tagRow = await db.prepare('SELECT id FROM tags WHERE name = ?').bind(tagName.trim()).first()
      let tagId
      if (tagRow) { tagId = tagRow.id } else {
        const r = await db.prepare('INSERT INTO tags (name) VALUES (?)').bind(tagName.trim()).run()
        tagId = r.meta.last_row_id
      }
      await db.prepare('INSERT OR IGNORE INTO resource_tags (resource_id, tag_id) VALUES (?, ?)').bind(resourceId, tagId).run()
    }
  }
  return c.json({ code: 0, message: '上传成功', data: { id: resourceId, title } }, 201)
})

resource.put('/:id', async (c) => {
  const authResult = await checkAuth(c)
  if (authResult.error) return authResult.error
  const db = c.env.DB
  const id = c.req.param('id')
  const existing = await db.prepare('SELECT uploader_id FROM resources WHERE id = ?').bind(id).first()
  if (!existing) return c.json({ code: 2001, message: '资源不存在' }, 404)
  if (existing.uploader_id !== authResult.user.userId && authResult.user.role !== 'admin') {
    return c.json({ code: 403, message: '无权限修改' }, 403)
  }
  const body = await c.req.json()
  const fields = []; const params = []
  if (body.title !== undefined) { fields.push('title = ?'); params.push(body.title) }
  if (body.description !== undefined) { fields.push('description = ?'); params.push(body.description) }
  if (body.categoryId !== undefined) { fields.push('category_id = ?'); params.push(body.categoryId) }
  if (body.status !== undefined) { fields.push('status = ?'); params.push(body.status) }
  if (fields.length === 0) return c.json({ code: 0, message: '无更新', data: {} })
  params.push(id)
  await db.prepare(`UPDATE resources SET ${fields.join(', ')} WHERE id = ?`).bind(...params).run()
  return c.json({ code: 0, message: '更新成功', data: {} })
})

resource.delete('/:id', async (c) => {
  const authResult = await checkAuth(c)
  if (authResult.error) return authResult.error
  const db = c.env.DB
  const id = c.req.param('id')
  const existing = await db.prepare('SELECT uploader_id, file_path FROM resources WHERE id = ?').bind(id).first()
  if (!existing) return c.json({ code: 2001, message: '资源不存在' }, 404)
  if (existing.uploader_id !== authResult.user.userId && authResult.user.role !== 'admin') {
    return c.json({ code: 403, message: '无权限删除' }, 403)
  }
  if (c.env.BUCKET && existing.file_path) {
    await c.env.BUCKET.delete(existing.file_path)
  }
  await db.prepare('DELETE FROM resources WHERE id = ?').bind(id).run()
  return c.json({ code: 0, message: '删除成功', data: {} })
})

resource.post('/:id/download', async (c) => {
  const authResult = await checkAuth(c)
  if (authResult.error) return authResult.error
  const db = c.env.DB
  const id = c.req.param('id')
  const row = await db.prepare('SELECT file_path FROM resources WHERE id = ?').bind(id).first()
  if (!row) return c.json({ code: 2001, message: '资源不存在' }, 404)
  await db.prepare('UPDATE resources SET download_count = download_count + 1 WHERE id = ?').bind(id).run()
  return c.json({ code: 0, message: 'success', data: { downloadUrl: `/api/v1/resources/${id}/file` } })
})

async function checkAuth(c) {
  const authHeader = c.req.header('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: c.json({ code: 401, message: '未登录' }, 401) }
  }
  try {
    const token = authHeader.split(' ')[1]
    const decoded = await verifyToken(token, c.env.JWT_SECRET)
    return { user: decoded }
  } catch {
    return { error: c.json({ code: 401, message: 'Token无效或已过期' }, 401) }
  }
}

export default resource

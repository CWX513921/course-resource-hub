import { Hono } from 'hono'
import { hashPassword, comparePassword } from '../utils/password.js'
import { generateToken } from '../utils/jwt.js'

const auth = new Hono()

auth.post('/register', async (c) => {
  const db = c.env.DB
  const { username, password, email, role } = await c.req.json()
  if (!username || !password || !email) {
    return c.json({ code: 400, message: '用户名、密码和邮箱为必填项' }, 400)
  }
  if (password.length < 6) {
    return c.json({ code: 400, message: '密码长度至少6位' }, 400)
  }
  const existing = await db.prepare('SELECT id FROM users WHERE username = ? OR email = ?').bind(username, email).first()
  if (existing) {
    return c.json({ code: 1001, message: '用户名或邮箱已存在' }, 400)
  }
  const passwordHash = await hashPassword(password)
  const result = await db.prepare('INSERT INTO users (username, password_hash, email, role) VALUES (?, ?, ?, ?)').bind(username, passwordHash, email, role || 'student').run()
  return c.json({ code: 0, message: '注册成功', data: { id: result.meta.last_row_id, username } }, 201)
})

auth.post('/login', async (c) => {
  const db = c.env.DB
  const { username, password } = await c.req.json()
  if (!username || !password) {
    return c.json({ code: 400, message: '用户名和密码为必填项' }, 400)
  }
  const user = await db.prepare('SELECT id, username, password_hash, role, status FROM users WHERE username = ?').bind(username).first()
  if (!user) {
    return c.json({ code: 401, message: '用户名或密码错误' }, 401)
  }
  if (user.status === 'disabled') {
    return c.json({ code: 403, message: '账号已被禁用' }, 403)
  }
  const isMatch = await comparePassword(password, user.password_hash)
  if (!isMatch) {
    return c.json({ code: 401, message: '用户名或密码错误' }, 401)
  }
  const token = await generateToken({ userId: user.id, role: user.role }, c.env.JWT_SECRET)
  return c.json({ code: 0, message: '登录成功', data: { token, userInfo: { id: user.id, username: user.username, role: user.role } } })
})

export default auth

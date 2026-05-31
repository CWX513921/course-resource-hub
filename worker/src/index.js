import { Hono } from 'hono'
import { cors } from 'hono/cors'
import authRoutes from './routes/auth.js'
import resourceRoutes from './routes/resource.js'
import categoryRoutes from './routes/category.js'
import favoriteRoutes from './routes/favorite.js'
import statsRoutes from './routes/stats.js'
import userRoutes from './routes/user.js'
import commentRoutes from './routes/comment.js'
import tagRoutes from './routes/tag.js'

const app = new Hono()

app.use('*', cors({
  origin: ['https://dd7878.cc.cd', 'https://course-sharing-api.cwx513921.workers.dev', 'http://localhost:5173'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['Content-Disposition'],
  maxAge: 86400
}))

const authAttempts = new Map()

app.use('/api/v1/auth/*', async (c, next) => {
  const ip = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || 'unknown'
  const now = Date.now()
  const record = authAttempts.get(ip)
  if (record && record.count >= 5 && now - record.firstAttempt < 15 * 60 * 1000) {
    return c.json({ code: 429, message: '请求过于频繁，请15分钟后再试' }, 429)
  }
  if (!record || now - record.firstAttempt >= 15 * 60 * 1000) {
    authAttempts.set(ip, { count: 1, firstAttempt: now })
  } else {
    record.count++
  }
  await next()
})

app.get('/api/health', async (c) => {
  try {
    await c.env.DB.prepare('SELECT 1').first()
    return c.json({ code: 0, message: 'success', data: { status: 'ok', db: 'connected', timestamp: new Date().toISOString() } })
  } catch (e) {
    return c.json({ code: 500, message: 'db error', data: { error: e.message } }, 500)
  }
})

app.route('/api/v1/auth', authRoutes)
app.route('/api/v1/resources', resourceRoutes)
app.route('/api/v1/categories', categoryRoutes)
app.route('/api/v1/favorites', favoriteRoutes)
app.route('/api/v1/stats', statsRoutes)
app.route('/api/v1/users', userRoutes)
app.route('/api/v1/comments', commentRoutes)
app.route('/api/v1/tags', tagRoutes)

app.onError((err, c) => {
  console.error(`[ERROR] ${err.stack || err.message}`)
  return c.json({ code: 500, message: '服务器内部错误' }, 500)
})

export default app

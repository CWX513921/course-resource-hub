import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { rateLimiter } from 'hono-rate-limiter'
import { MemoryStore } from 'hono-rate-limiter'
import authRoutes from './routes/auth.js'
import resourceRoutes from './routes/resource.js'
import categoryRoutes from './routes/category.js'
import favoriteRoutes from './routes/favorite.js'
import statsRoutes from './routes/stats.js'
import userRoutes from './routes/user.js'
import commentRoutes from './routes/comment.js'

const app = new Hono()

app.use('*', cors({
  origin: ['https://dd7878.cc.cd', 'https://api.dd7878.cc.cd', 'http://localhost:5173'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['Content-Disposition'],
  maxAge: 86400
}))

const authLimiter = rateLimiter({
  store: new MemoryStore(),
  windowMs: 15 * 60 * 1000,
  limit: 5,
  keyGenerator: (c) => c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || 'unknown'
})

app.get('/api/health', async (c) => {
  try {
    await c.env.DB.prepare('SELECT 1').first()
    return c.json({ code: 0, message: 'success', data: { status: 'ok', db: 'connected', timestamp: new Date().toISOString() } })
  } catch (e) {
    return c.json({ code: 500, message: 'db error', data: { error: e.message } }, 500)
  }
})

app.route('/api/v1/auth', authLimiter, authRoutes)
app.route('/api/v1/resources', resourceRoutes)
app.route('/api/v1/categories', categoryRoutes)
app.route('/api/v1/favorites', favoriteRoutes)
app.route('/api/v1/stats', statsRoutes)
app.route('/api/v1/users', userRoutes)
app.route('/api/v1/comments', commentRoutes)

app.onError((err, c) => {
  console.error(`[ERROR] ${err.stack || err.message}`)
  return c.json({ code: 500, message: '服务器内部错误' }, 500)
})

export default app

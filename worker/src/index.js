import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import authRoutes from './routes/auth.js'
import resourceRoutes from './routes/resource.js'
import categoryRoutes from './routes/category.js'
import favoriteRoutes from './routes/favorite.js'
import statsRoutes from './routes/stats.js'
import userRoutes from './routes/user.js'

const app = new Hono()

app.use('*', cors())

app.get('/api/health', (c) => {
  return c.json({ code: 0, message: 'success', data: { status: 'ok', timestamp: new Date().toISOString() } })
})

app.route('/api/v1/auth', authRoutes)
app.route('/api/v1/resources', resourceRoutes)
app.route('/api/v1/categories', categoryRoutes)
app.route('/api/v1/favorites', favoriteRoutes)
app.route('/api/v1/stats', statsRoutes)
app.route('/api/v1/users', userRoutes)

app.onError((err, c) => {
  console.error(`[ERROR] ${err.stack || err.message}`)
  return c.json({ code: 500, message: '服务器内部错误' }, 500)
})

export default app

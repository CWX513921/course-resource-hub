const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

const authRoutes = require('./routes/auth');
const resourceRoutes = require('./routes/resource');
const categoryRoutes = require('./routes/category');
const favoriteRoutes = require('./routes/favorite');
const statsRoutes = require('./routes/stats');
const userRoutes = require('./routes/user');

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/resources', resourceRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/favorites', favoriteRoutes);
app.use('/api/v1/stats', statsRoutes);
app.use('/api/v1/users', userRoutes);

app.get('/api/health', (req, res) => {
  res.json({ code: 0, message: 'success', data: { status: 'ok', timestamp: new Date().toISOString() } });
});

app.use((err, req, res, next) => {
  console.error(`[ERROR] ${new Date().toISOString()} - ${err.stack}`);
  res.status(500).json({ code: 500, message: '服务器内部错误' });
});

module.exports = app;

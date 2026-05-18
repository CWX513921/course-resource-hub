const pool = require('../models/db');
const { hashPassword, comparePassword } = require('../utils/password');
const { generateToken } = require('../utils/jwt');

async function register({ username, password, email, role }) {
  const [existing] = await pool.execute(
    'SELECT id FROM users WHERE username = ? OR email = ?',
    [username, email]
  );
  if (existing.length > 0) {
    throw { code: 1001, message: '用户名或邮箱已存在' };
  }
  const passwordHash = await hashPassword(password);
  const [result] = await pool.execute(
    'INSERT INTO users (username, password_hash, email, role) VALUES (?, ?, ?, ?)',
    [username, passwordHash, email, role || 'student']
  );
  return { id: result.insertId, username };
}

async function login({ username, password }) {
  const [rows] = await pool.execute(
    'SELECT id, username, password_hash, role, status FROM users WHERE username = ?',
    [username]
  );
  if (rows.length === 0) {
    throw { code: 401, message: '用户名或密码错误' };
  }
  const user = rows[0];
  if (user.status === 'disabled') {
    throw { code: 403, message: '账号已被禁用' };
  }
  const isMatch = await comparePassword(password, user.password_hash);
  if (!isMatch) {
    throw { code: 401, message: '用户名或密码错误' };
  }
  const token = generateToken({ userId: user.id, role: user.role });
  return {
    token,
    userInfo: { id: user.id, username: user.username, role: user.role }
  };
}

async function findById(id) {
  const [rows] = await pool.execute(
    'SELECT id, username, email, role, status, created_at FROM users WHERE id = ?',
    [id]
  );
  return rows[0] || null;
}

async function getList({ role, page = 1, pageSize = 20 } = {}) {
  let where = '1=1';
  const params = [];
  if (role) {
    where += ' AND role = ?';
    params.push(role);
  }
  const [countResult] = await pool.execute(`SELECT COUNT(*) as total FROM users WHERE ${where}`, params);
  const total = countResult[0].total;
  const offset = (page - 1) * pageSize;
  const [rows] = await pool.execute(
    `SELECT id, username, email, role, status, created_at FROM users WHERE ${where} ORDER BY id ASC LIMIT ? OFFSET ?`,
    [...params, String(pageSize), String(offset)]
  );
  return { list: rows, total, page: Number(page), pageSize: Number(pageSize) };
}

async function updateStatus(id, status) {
  await pool.execute('UPDATE users SET status = ? WHERE id = ?', [status, id]);
}

module.exports = { register, login, findById, getList, updateStatus };

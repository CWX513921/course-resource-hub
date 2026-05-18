const userService = require('../services/userService');

async function register(req, res, next) {
  try {
    const { username, password, email, role } = req.body;
    if (!username || !password || !email) {
      return res.status(400).json({ code: 400, message: '用户名、密码和邮箱为必填项' });
    }
    if (password.length < 6) {
      return res.status(400).json({ code: 400, message: '密码长度至少6位' });
    }
    const result = await userService.register({ username, password, email, role });
    res.status(201).json({ code: 0, message: '注册成功', data: result });
  } catch (err) {
    if (err.code) {
      return res.status(400).json(err);
    }
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ code: 400, message: '用户名和密码为必填项' });
    }
    const result = await userService.login({ username, password });
    res.json({ code: 0, message: '登录成功', data: result });
  } catch (err) {
    if (err.code) {
      return res.status(err.code === 401 ? 401 : 403).json(err);
    }
    next(err);
  }
}

module.exports = { register, login };

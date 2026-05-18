function checkRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ code: 401, message: '未登录' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ code: 403, message: '无权限访问' });
    }
    next();
  };
}

module.exports = checkRole;

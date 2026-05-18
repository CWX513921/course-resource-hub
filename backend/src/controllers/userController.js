const userService = require('../services/userService');

async function getList(req, res, next) {
  try {
    const { role, page, pageSize } = req.query;
    const result = await userService.getList({ role, page, pageSize });
    res.json({ code: 0, message: 'success', data: result });
  } catch (err) {
    next(err);
  }
}

async function updateStatus(req, res, next) {
  try {
    const id = req.params.id;
    const { status } = req.body;
    if (!['active', 'disabled'].includes(status)) {
      return res.status(400).json({ code: 400, message: '无效的状态值' });
    }
    await userService.updateStatus(id, status);
    res.json({ code: 0, message: '状态更新成功', data: {} });
  } catch (err) {
    next(err);
  }
}

module.exports = { getList, updateStatus };

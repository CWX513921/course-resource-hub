const categoryService = require('../services/categoryService');

async function getTree(req, res, next) {
  try {
    const tree = await categoryService.getTree();
    res.json({ code: 0, message: 'success', data: tree });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { name, parentId, sortOrder } = req.body;
    if (!name) {
      return res.status(400).json({ code: 400, message: '分类名称为必填项' });
    }
    const result = await categoryService.create({ name, parentId, sortOrder });
    res.status(201).json({ code: 0, message: '创建成功', data: result });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const id = req.params.id;
    await categoryService.remove(id);
    res.json({ code: 0, message: '删除成功', data: {} });
  } catch (err) {
    if (err.code) return res.status(err.code === 400 ? 400 : 500).json(err);
    next(err);
  }
}

module.exports = { getTree, create, remove };

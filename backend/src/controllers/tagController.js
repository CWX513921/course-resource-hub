const tagService = require('../services/tagService');

async function list(req, res, next) {
  try {
    const tags = await tagService.findAll();
    res.json({ code: 0, message: 'success', data: tags });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ code: 400, message: '标签名称为必填项' });
    }
    const result = await tagService.create({ name: name.trim() });
    res.status(201).json({ code: 0, message: '创建成功', data: result });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ code: 400, message: '标签已存在' });
    }
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const id = req.params.id;
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ code: 400, message: '标签名称为必填项' });
    }
    const tag = await tagService.findById(id);
    if (!tag) {
      return res.status(404).json({ code: 404, message: '标签不存在' });
    }
    await tagService.update(id, { name: name.trim() });
    res.json({ code: 0, message: '更新成功', data: {} });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ code: 400, message: '标签名称已存在' });
    }
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const id = req.params.id;
    const tag = await tagService.findById(id);
    if (!tag) {
      return res.status(404).json({ code: 404, message: '标签不存在' });
    }
    await tagService.remove(id);
    res.json({ code: 0, message: '删除成功', data: {} });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, create, update, remove };

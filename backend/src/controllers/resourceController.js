const resourceService = require('../services/resourceService');
const accessLogService = require('../services/accessLogService');
const path = require('path');
const fs = require('fs');

async function list(req, res, next) {
  try {
    const { category, tag, keyword, page, pageSize } = req.query;
    const result = await resourceService.findList({ category, tag, keyword, page, pageSize });
    res.json({ code: 0, message: 'success', data: result });
  } catch (err) {
    next(err);
  }
}

async function detail(req, res, next) {
  try {
    const id = req.params.id;
    const resource = await resourceService.findById(id);
    if (!resource) {
      return res.status(404).json({ code: 2001, message: '资源不存在' });
    }
    await resourceService.incrementView(id);
    resource.view_count += 1;
    const userId = req.user ? req.user.userId : null;
    await accessLogService.log({ userId, resourceId: id, action: 'view', ipAddress: req.ip });
    res.json({ code: 0, message: 'success', data: resource });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    if (!req.user || !['teacher', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ code: 403, message: '仅教师或管理员可上传资源' });
    }
    const { title, description, categoryId, tags } = req.body;
    const file = req.file;
    if (!title || !file) {
      return res.status(400).json({ code: 400, message: '标题和文件为必填项' });
    }
    const ext = path.extname(file.originalname).substring(1).toLowerCase();
    const result = await resourceService.create({
      title, description: description || '',
      filePath: file.path,
      fileType: ext,
      fileSize: file.size,
      uploaderId: req.user.userId,
      categoryId: categoryId || 1
    });
    if (tags) {
      const tagNames = typeof tags === 'string' ? tags.split(',') : tags;
      const pool = require('../models/db');
      for (const tagName of tagNames) {
        const [existing] = await pool.execute('SELECT id FROM tags WHERE name = ?', [tagName.trim()]);
        let tagId;
        if (existing.length > 0) {
          tagId = existing[0].id;
        } else {
          const [r] = await pool.execute('INSERT INTO tags (name) VALUES (?)', [tagName.trim()]);
          tagId = r.insertId;
        }
        await pool.execute('INSERT IGNORE INTO resource_tags (resource_id, tag_id) VALUES (?, ?)', [result.id, tagId]);
      }
    }
    res.status(201).json({ code: 0, message: '上传成功', data: result });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const id = req.params.id;
    const resource = await resourceService.findById(id);
    if (!resource) {
      return res.status(404).json({ code: 2001, message: '资源不存在' });
    }
    if (resource.uploader.id !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ code: 403, message: '无权限修改此资源' });
    }
    await resourceService.update(id, req.body);
    res.json({ code: 0, message: '更新成功', data: {} });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const id = req.params.id;
    const resource = await resourceService.findById(id);
    if (!resource) {
      return res.status(404).json({ code: 2001, message: '资源不存在' });
    }
    if (resource.uploader.id !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ code: 403, message: '无权限删除此资源' });
    }
    await resourceService.remove(id);
    res.json({ code: 0, message: '删除成功', data: {} });
  } catch (err) {
    next(err);
  }
}

async function download(req, res, next) {
  try {
    const id = req.params.id;
    const resource = await resourceService.findById(id);
    if (!resource) {
      return res.status(404).json({ code: 2001, message: '资源不存在' });
    }
    await resourceService.incrementDownload(id);
    const userId = req.user ? req.user.userId : null;
    await accessLogService.log({ userId, resourceId: id, action: 'download', ipAddress: req.ip });
    res.json({ code: 0, message: 'success', data: { downloadUrl: `/api/v1/resources/${id}/file` } });
  } catch (err) {
    next(err);
  }
}

async function downloadFile(req, res, next) {
  try {
    const id = req.params.id;
    const resource = await resourceService.findById(id);
    if (!resource) {
      return res.status(404).json({ code: 2001, message: '资源不存在' });
    }
    const filePath = resource.file_path;
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ code: 2002, message: '文件不存在' });
    }
    const fileName = path.basename(filePath).replace(/^\d+-/, '');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
      '.pdf': 'application/pdf', '.ppt': 'application/vnd.ms-powerpoint', '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      '.doc': 'application/msword', '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel', '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.zip': 'application/zip', '.rar': 'application/x-rar-compressed'
    };
    res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (err) {
    next(err);
  }
}

module.exports = { list, detail, create, update, remove, download, downloadFile };

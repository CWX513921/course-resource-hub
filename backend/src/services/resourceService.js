const pool = require('../models/db');

async function create({ title, description, filePath, fileType, fileSize, uploaderId, categoryId, status }) {
  const [result] = await pool.execute(
    'INSERT INTO resources (title, description, file_path, file_type, file_size, uploader_id, category_id, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [title, description, filePath, fileType, fileSize, uploaderId, categoryId, status || 'published']
  );
  return { id: result.insertId, title };
}

async function findById(id) {
  const [rows] = await pool.execute(
    `SELECT r.*, u.username as uploader_name, u.id as uploader_id, c.name as category_name
     FROM resources r
     LEFT JOIN users u ON r.uploader_id = u.id
     LEFT JOIN categories c ON r.category_id = c.id
     WHERE r.id = ?`,
    [id]
  );
  if (rows.length === 0) return null;
  const resource = rows[0];
  resource.uploader = { id: resource.uploader_id, name: resource.uploader_name };
  delete resource.uploader_name;
  delete resource.uploader_id;
  const [tags] = await pool.execute(
    `SELECT t.id, t.name FROM tags t
     INNER JOIN resource_tags rt ON t.id = rt.tag_id
     WHERE rt.resource_id = ?`,
    [id]
  );
  resource.tags = tags;
  return resource;
}

async function findList({ category, tag, keyword, page = 1, pageSize = 20, status } = {}) {
  let where = ['r.status = ?'];
  let params = [status || 'published'];
  if (category) {
    where.push('r.category_id = ?');
    params.push(category);
  }
  if (keyword) {
    where.push('(r.title LIKE ? OR r.description LIKE ?)');
    params.push(`%${keyword}%`, `%${keyword}%`);
  }
  if (tag) {
    where.push('EXISTS (SELECT 1 FROM resource_tags rt JOIN tags t ON rt.tag_id = t.id WHERE rt.resource_id = r.id AND t.name = ?)');
    params.push(tag);
  }
  const whereClause = where.join(' AND ');
  const countParams = [...params];
  const [countResult] = await pool.execute(
    `SELECT COUNT(*) as total FROM resources r WHERE ${whereClause}`,
    countParams
  );
  const total = countResult[0].total;
  const offset = (page - 1) * pageSize;
  const [rows] = await pool.execute(
    `SELECT r.id, r.title, r.description, r.file_type, r.file_size, r.view_count, r.download_count, r.status, r.created_at,
            u.username as uploader_name, c.name as category_name
     FROM resources r
     LEFT JOIN users u ON r.uploader_id = u.id
     LEFT JOIN categories c ON r.category_id = c.id
     WHERE ${whereClause}
     ORDER BY r.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, String(pageSize), String(offset)]
  );
  return { list: rows, total, page: Number(page), pageSize: Number(pageSize) };
}

async function update(id, { title, description, categoryId, status }) {
  const fields = [];
  const params = [];
  if (title !== undefined) { fields.push('title = ?'); params.push(title); }
  if (description !== undefined) { fields.push('description = ?'); params.push(description); }
  if (categoryId !== undefined) { fields.push('category_id = ?'); params.push(categoryId); }
  if (status !== undefined) { fields.push('status = ?'); params.push(status); }
  if (fields.length === 0) return false;
  params.push(id);
  await pool.execute(`UPDATE resources SET ${fields.join(', ')} WHERE id = ?`, params);
  return true;
}

async function remove(id) {
  await pool.execute('DELETE FROM resources WHERE id = ?', [id]);
}

async function incrementDownload(id) {
  await pool.execute('UPDATE resources SET download_count = download_count + 1 WHERE id = ?', [id]);
}

async function incrementView(id) {
  await pool.execute('UPDATE resources SET view_count = view_count + 1 WHERE id = ?', [id]);
}

module.exports = { create, findById, findList, update, remove, incrementDownload, incrementView };

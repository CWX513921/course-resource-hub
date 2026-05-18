const pool = require('../models/db');

async function log({ userId, resourceId, action, ipAddress }) {
  await pool.execute(
    'INSERT INTO access_logs (user_id, resource_id, action, ip_address) VALUES (?, ?, ?, ?)',
    [userId || null, resourceId, action, ipAddress]
  );
}

module.exports = { log };

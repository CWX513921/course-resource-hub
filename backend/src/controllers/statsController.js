const statsService = require('../services/statsService');

async function overview(req, res, next) {
  try {
    const data = await statsService.getOverview();
    res.json({ code: 0, message: 'success', data });
  } catch (err) {
    next(err);
  }
}

async function topDownloaded(req, res, next) {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const data = await statsService.getTopDownloaded(limit);
    res.json({ code: 0, message: 'success', data });
  } catch (err) {
    next(err);
  }
}

async function categoryStats(req, res, next) {
  try {
    const data = await statsService.getCategoryStats();
    res.json({ code: 0, message: 'success', data });
  } catch (err) {
    next(err);
  }
}

module.exports = { overview, topDownloaded, categoryStats };

const favoriteService = require('../services/favoriteService');

async function addFavorite(req, res, next) {
  try {
    const userId = req.user.userId;
    const resourceId = req.params.resourceId;
    await favoriteService.addFavorite(userId, resourceId);
    res.json({ code: 0, message: '收藏成功', data: {} });
  } catch (err) {
    if (err.code) return res.status(400).json(err);
    next(err);
  }
}

async function removeFavorite(req, res, next) {
  try {
    const userId = req.user.userId;
    const resourceId = req.params.resourceId;
    await favoriteService.removeFavorite(userId, resourceId);
    res.json({ code: 0, message: '取消成功', data: {} });
  } catch (err) {
    next(err);
  }
}

async function listFavorites(req, res, next) {
  try {
    const userId = req.user.userId;
    const { page, pageSize } = req.query;
    const result = await favoriteService.getUserFavorites(userId, { page, pageSize });
    res.json({ code: 0, message: 'success', data: result });
  } catch (err) {
    next(err);
  }
}

async function checkFavorite(req, res, next) {
  try {
    const userId = req.user.userId;
    const resourceId = req.params.resourceId;
    const favorited = await favoriteService.isFavorited(userId, resourceId);
    res.json({ code: 0, message: 'success', data: { favorited } });
  } catch (err) {
    next(err);
  }
}

module.exports = { addFavorite, removeFavorite, listFavorites, checkFavorite };

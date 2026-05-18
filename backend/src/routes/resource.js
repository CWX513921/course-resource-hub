const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const authMiddleware = require('../middlewares/auth');
const { list, detail, create, update, remove, download } = require('../controllers/resourceController');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '..', '..', 'uploads')),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.ppt', '.pptx', '.doc', '.docx', '.xls', '.xlsx', '.zip', '.rar'];
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, allowedTypes.includes(ext));
  }
});

router.get('/', list);
router.get('/:id', detail);
router.post('/', authMiddleware, upload.single('file'), create);
router.put('/:id', authMiddleware, update);
router.delete('/:id', authMiddleware, remove);
router.post('/:id/download', authMiddleware, download);

module.exports = router;

const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const {
  getAllLaporan, getStats, getLaporanById,
  createLaporan, updateStatus, deleteLaporan
} = require('../controllers/laporanController');

router.get('/stats',        getStats);
router.get('/',             getAllLaporan);
router.get('/:id',          getLaporanById);
router.post('/', upload.single('foto'), createLaporan);
router.patch('/:id/status', updateStatus);
router.delete('/:id',       deleteLaporan);

module.exports = router;
const { pool } = require('../config/database');
const { uploadToS3, deleteFromS3 } = require('../config/s3');

// GET /api/laporan
const getAllLaporan = async (req, res, next) => {
  try {
    const { status, jenis, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    let conditions = [], values = [];

    if (status) { conditions.push('status = ?'); values.push(status); }
    if (jenis)  { conditions.push('jenis = ?');  values.push(jenis);  }

    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';

    const [rows]  = await pool.query(
      `SELECT * FROM laporan ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...values, parseInt(limit), parseInt(offset)]
    );
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM laporan ${where}`,
      values
    );

    res.json({
      success: true,
      data: rows,
      pagination: { total, page: parseInt(page), limit: parseInt(limit) }
    });
  } catch (err) { next(err); }
};

// GET /api/laporan/stats
const getStats = async (req, res, next) => {
  try {
    const [[stats]] = await pool.query(`
      SELECT
        SUM(status = 'menunggu')  AS menunggu,
        SUM(status = 'diproses')  AS diproses,
        SUM(status = 'selesai')   AS selesai,
        SUM(jenis  = 'kemacetan') AS kemacetan,
        SUM(jenis  = 'kecelakaan') AS kecelakaan,
        COUNT(*) AS total
      FROM laporan
    `);
    res.json({ success: true, data: stats });
  } catch (err) { next(err); }
};

// GET /api/laporan/:id
const getLaporanById = async (req, res, next) => {
  try {
    const [[row]] = await pool.query('SELECT * FROM laporan WHERE id = ?', [req.params.id]);
    if (!row) return res.status(404).json({ success: false, message: 'Laporan tidak ditemukan' });
    res.json({ success: true, data: row });
  } catch (err) { next(err); }
};

// POST /api/laporan
const createLaporan = async (req, res, next) => {
  try {
    const { judul, jenis, deskripsi, lokasi, pelapor } = req.body;
    if (!judul || !jenis || !deskripsi || !lokasi)
      return res.status(400).json({ success: false, message: 'Judul, jenis, deskripsi, dan lokasi wajib diisi' });

    let foto_url = null, foto_key = null;
    if (req.file) {
      const uploaded = await uploadToS3(req.file);
      foto_url = uploaded.url;
      foto_key = uploaded.key;
    }

    const [result] = await pool.query(
      `INSERT INTO laporan (judul, jenis, deskripsi, lokasi, foto_url, foto_key, pelapor)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [judul, jenis, deskripsi, lokasi, foto_url, foto_key, pelapor || 'Anonim']
    );
    const [[newRow]] = await pool.query('SELECT * FROM laporan WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, message: 'Laporan berhasil dibuat', data: newRow });
  } catch (err) { next(err); }
};

// PATCH /api/laporan/:id/status
const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowed = ['menunggu', 'diproses', 'selesai'];
    if (!allowed.includes(status))
      return res.status(400).json({ success: false, message: 'Status tidak valid' });

    const [result] = await pool.query(
      'UPDATE laporan SET status = ? WHERE id = ?',
      [status, req.params.id]
    );
    if (!result.affectedRows)
      return res.status(404).json({ success: false, message: 'Laporan tidak ditemukan' });

    const [[updated]] = await pool.query('SELECT * FROM laporan WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Status berhasil diupdate', data: updated });
  } catch (err) { next(err); }
};

// DELETE /api/laporan/:id
const deleteLaporan = async (req, res, next) => {
  try {
    const [[row]] = await pool.query('SELECT foto_key FROM laporan WHERE id = ?', [req.params.id]);
    if (!row) return res.status(404).json({ success: false, message: 'Laporan tidak ditemukan' });

    if (row.foto_key) await deleteFromS3(row.foto_key);
    await pool.query('DELETE FROM laporan WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Laporan berhasil dihapus' });
  } catch (err) { next(err); }
};

module.exports = { getAllLaporan, getStats, getLaporanById, createLaporan, updateStatus, deleteLaporan };
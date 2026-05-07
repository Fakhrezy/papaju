const { pool } = require('./database');

const migrate = async () => {
  const conn = await pool.getConnection();
  try {
    await conn.query(`
      CREATE TABLE IF NOT EXISTS laporan (
        id          INT AUTO_INCREMENT PRIMARY KEY,
        judul       VARCHAR(255) NOT NULL,
        jenis       ENUM('kemacetan','kecelakaan','lainnya') NOT NULL,
        deskripsi   TEXT NOT NULL,
        lokasi      VARCHAR(255) NOT NULL,
        foto_url    TEXT,
        foto_key    TEXT,
        status      ENUM('menunggu','diproses','selesai') NOT NULL DEFAULT 'menunggu',
        pelapor     VARCHAR(100),
        created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS admin (
        id         INT AUTO_INCREMENT PRIMARY KEY,
        username   VARCHAR(100) NOT NULL UNIQUE,
        password   VARCHAR(255) NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await conn.query(`
      INSERT IGNORE INTO admin (username, password)
      VALUES ('admin', 'admin123');
    `);

    console.log(' Database migration complete');
  } catch (err) {
    console.error(' Migration error:', err.message);
  } finally {
    conn.release();
  }
};

module.exports = { migrate };
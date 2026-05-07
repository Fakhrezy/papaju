const { pool } = require('../config/database');

const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const [[admin]] = await pool.query(
      'SELECT * FROM admin WHERE username = ? AND password = ?',
      [username, password]
    );
    if (!admin)
      return res.status(401).json({ success: false, message: 'Username atau password salah' });

    res.json({ success: true, message: 'Login berhasil', data: { username: admin.username } });
  } catch (err) { next(err); }
};

module.exports = { login };
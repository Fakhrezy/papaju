const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host:     process.env.DB_HOST,
  port:     process.env.DB_PORT || 3306,
  database: process.env.DB_NAME,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false }, // wajib untuk AWS RDS
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
});

const connectDB = async () => {
  try {
    const conn = await pool.getConnection();
    console.log(' Connected to RDS MySQL');
    conn.release();
  } catch (err) {
    console.error(' Failed to connect to RDS:', err.message);
    process.exit(1);
  }
};

module.exports = { pool, connectDB };
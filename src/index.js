require('dotenv').config();
const express = require('express');
const path = require('path');
const { connectDB } = require('./config/database');
const { migrate } = require('./config/migrate');
const errorHandler = require('./middleware/errorHandler');
const laporanRoutes = require('./routes/laporan');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// Health check untuk ECS
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/laporan', laporanRoutes);
app.use('/api/admin', adminRoutes);

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.use(errorHandler);

const start = async () => {
  await connectDB();
  await migrate();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(` PAPAJU running on port ${PORT}`);
  });
};

start().catch(console.error);
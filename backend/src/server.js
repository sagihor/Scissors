/**
 * Server entry point.
 * Boots Express + Socket.IO, verifies the MySQL connection, then listens.
 */

const http = require('http');
const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');

const { sequelize } = require('../models');
const { initSocket } = require('./socket');

const logger = require('./middleware/logger');
const userRoutes = require('./routes/user.routes');
const barbershopRoutes = require('./routes/barbershop.routes');
const authRoutes = require('./routes/auth.routes');
const settingsRoutes = require('./routes/settings.routes');
const messageRoutes = require('./routes/message.routes'); // chat history
const aiRoutes = require('./routes/ai.routes');
const appointmentRoutes = require('./routes/appointment.routes');


const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());
app.use(logger);

app.use('/api/users', userRoutes);
app.use('/api/barbershops', barbershopRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/appointments', appointmentRoutes);

// ── Serve the built React (Parcel) frontend in production ──
// Parcel outputs the compiled app to frontend/dist. Express serves those
// static files, and any non-API route falls back to index.html so that
// client-side routing (react-router) works on refresh / deep links.
const clientDist = path.join(__dirname, '..', '..', 'frontend', 'dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.use((err, req, res, next) => {
  console.error('Unhandled Exception:', err);
  res.status(500).json({
    success: false,
    data: null,
    error: { code: 'INTERNAL_SERVER_ERROR', message: err.message || 'An unexpected error occurred', details: {} },
  });
});

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);
initSocket(server);

async function start() {
  try {
    await sequelize.authenticate();
    console.log('✅ MySQL connection established successfully.');

    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📡 WebSocket (Socket.IO) ready — live chat enabled.`);
    });
  } catch (err) {
    console.error('❌ Unable to connect to the database:', err.message);
    process.exit(1);
  }
}

start();
const express = require('express');
const cors = require('cors');
// REMOVED: require('./models/db');

const logger = require('./middleware/logger');
const userRoutes = require('./routes/user.routes');
const barbershopRoutes = require('./routes/barbershop.routes');
const authRoutes = require('./routes/auth.routes');         // NEW - Phase 2
const settingsRoutes = require('./routes/settings.routes'); // NEW - Phase 2

const app = express();

app.use(cors());
app.use(express.json());
app.use(logger);

// Mount everything under /api per Assignment 3 requirement
app.use('/api/users', userRoutes);
app.use('/api/barbershops', barbershopRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/settings', settingsRoutes);

app.use((err, req, res, next) => {
  console.error("Unhandled Exception:", err);
  res.status(500).json({
    success: false,
    data: null,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: err.message || "An unexpected error occurred",
      details: {}
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
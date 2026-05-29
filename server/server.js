const express = require('express');
const cors = require('cors');

const logger = require('./middleware/logger');
const simulateDelay = require('./middleware/simulateDelay');
const userRoutes = require('./routes/user.routes');
const barbershopRoutes = require('./routes/barbershop.routes');
const authRoutes = require('./routes/auth.routes');
const settingsRoutes = require('./routes/settings.routes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(logger);
app.use(simulateDelay); // Adds ~400ms delay so loading states are visible

// Mount everything under /api
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
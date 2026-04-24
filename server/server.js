const express = require('express');
const cors = require('cors');

const logger = require('./middleware/logger');
const userRoutes = require('./routes/user.routes');
const barbershopRoutes = require('./routes/barbershop.routes');

const app = express();

app.use(cors());

// Parse incoming request bodies as JSON 
app.use(express.json()); 

// Attach the custom logger middleware to all incoming requests
app.use(logger);

// Route all '/users' requests to the user router
app.use('/users', userRoutes);

// Route all '/barbershops' requests to the barbershop router
app.use('/barbershops', barbershopRoutes);


// Catch unexpected server errors and format them to match the API standard
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

// 4. Start Server 
const PORT = process.env.PORT || 3000; 

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`⚠️ Running with Mock Data Only (No DB connection)`);
});
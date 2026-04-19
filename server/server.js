const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// הגדרות בסיסיות
app.use(cors());
app.use(express.json({ limit: '10mb' })); 

// נתיב בדיקה לראות שהשרת חי (Health Check)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    mode: process.env.USE_MOCKS === 'true' ? 'mock' : 'real' 
  });
});

// טיפול בשגיאות (Error Handler)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

// פונקציית ההפעלה
async function start() {
  if (process.env.USE_MOCKS !== 'true') {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ DB connected');
  } else {
    console.log('⚠️ Running in MOCK mode — no DB connection');
  }

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
  });
}

start().catch(err => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});
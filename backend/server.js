require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');

const authRoutes = require('./routes/auth');
const { protect } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? 'https://backco.us' : 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── Public Static Files ───────────────────────────────────────────────────────
// Login and signup are public — serve them directly
app.use('/home', express.static(path.join(__dirname, 'frontend/home')));
app.use('/signup', express.static(path.join(__dirname, 'frontend')));

// Serve signup.html explicitly
app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'signup.html'));
});

// Root redirect to login
app.get('/', (req, res) => {
  res.redirect('/home');
});

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);

// ── Protected API Routes ──────────────────────────────────────────────────────
// All /api/* routes below this line require auth
app.use('/api/*', protect);

// ── Protected Frontend Routes ─────────────────────────────────────────────────
// Serve admin and any future protected pages — token verified on the frontend
// (frontend pages check token on load and redirect to /home if invalid)
app.use('/admin', express.static(path.join(__dirname, 'frontend/admin')));
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'admin', 'index.html'));
});

// Catch-all for any other frontend routes — serve from frontend folder
app.use(express.static(path.join(__dirname, 'frontend')));

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ success: false, message: 'Route not found.' });
  }
  res.redirect('/home');
});

// ── Error Handler ─────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error.'
  });
});

// ── MongoDB + Start ───────────────────────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/backco')
  .then(() => {
    console.log('✅ MongoDB connected → backco');
    app.listen(PORT, () => {
      console.log(`🌲 Backco server running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });

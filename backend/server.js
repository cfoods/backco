require('dotenv').config();
const express      = require('express');
const mongoose     = require('mongoose');
const cors         = require('cors');
const cookieParser = require('cookie-parser');
const path         = require('path');

const { protect } = require('./middleware/auth');

const authRoutes     = require('./routes/auth');
const customerRoutes = require('./routes/customers');
const invoiceRoutes  = require('./routes/invoices');
const estimateRoutes = require('./routes/estimates');
const expenseRoutes  = require('./routes/expenses');
const settingsRoutes = require('./routes/settings');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? 'https://backco.us' : 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── Public ────────────────────────────────────────────────────────────────────
app.use('/home', express.static(path.join(__dirname, '../frontend/home')));
app.get('/signup', (req, res) => res.sendFile(path.join(__dirname, '../frontend/signup.html')));
app.get('/', (req, res) => res.redirect('/home'));

// ── Public API ────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);

// ── Protected API ─────────────────────────────────────────────────────────────
app.use('/api/customers', protect, customerRoutes);
app.use('/api/invoices',  protect, invoiceRoutes);
app.use('/api/estimates', protect, estimateRoutes);
app.use('/api/expenses',  protect, expenseRoutes);
app.use('/api/settings',  protect, settingsRoutes);

// ── Frontend ──────────────────────────────────────────────────────────────────
app.use('/admin', express.static(path.join(__dirname, '../frontend/admin')));
app.get('/admin*', (req, res) => res.sendFile(path.join(__dirname, '../frontend/admin/index.html')));
app.use(express.static(path.join(__dirname, '../frontend')));

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  if (req.path.startsWith('/api')) return res.status(404).json({ success: false, message: 'Route not found.' });
  res.redirect('/home');
});

// ── Error handler ─────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Server error.' });
});

// ── Start ─────────────────────────────────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/backco')
  .then(() => {
    console.log('✅ MongoDB connected → backco');
    app.listen(PORT, () => console.log(`🌲 Backco running on http://localhost:${PORT}`));
  })
  .catch(err => { console.error('❌ MongoDB failed:', err.message); process.exit(1); });

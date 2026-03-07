// ============================================================
// GABBAR SINGH TRUCK - Express Backend API
// Stripe Payment Processing & Order Management
// ============================================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const stripeRoutes = require('./routes/stripe');
const orderRoutes = require('./routes/orders');
const menuRoutes = require('./routes/menu');
const promoRoutes = require('./routes/promo');

const app = express();
const PORT = process.env.PORT || 3001;

// ============================================================
// SECURITY MIDDLEWARE
// ============================================================
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:4200',
    'https://gabbarsinghtruck.netlify.app',
    /\.netlify\.app$/
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Raw body for Stripe webhooks (MUST be before express.json())
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));

// JSON body parsing
app.use(express.json({ limit: '10mb' }));

// ============================================================
// ROUTES
// ============================================================
app.use('/api/stripe', stripeRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/promo', promoRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Gabbar Singh Truck API',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

// ============================================================
// START SERVER
// ============================================================
app.listen(PORT, () => {
  console.log(`\n🌶️  Gabbar Singh Truck API running on port ${PORT}`);
  console.log(`📍 Health: http://localhost:${PORT}/health`);
  console.log(`💳 Stripe: http://localhost:${PORT}/api/stripe`);
  console.log(`\nGabbar doesn't wait. Neither does our server! 🔥\n`);
});

module.exports = app;

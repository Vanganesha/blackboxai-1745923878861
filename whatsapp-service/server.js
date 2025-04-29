const express = require('express');
const cors = require('cors');
const config = require('./src/config/config');
const logger = require('./src/utils/logger');
const apiRoutes = require('./src/routes/api');

// Initialize express app
const app = express();

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// CORS configuration
app.use(cors({
  origin: '*', // Allow all origins in development
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'x-api-key']
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api', apiRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  logger.error('Server Error', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  logger.info(`WhatsApp Service started on port ${PORT}`);
  logger.info(`Environment: ${config.nodeEnv}`);
  logger.info(`Allowed origins: ${config.allowedOrigins.join(', ')}`);
});

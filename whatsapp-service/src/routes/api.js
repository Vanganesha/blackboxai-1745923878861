const express = require('express');
const rateLimit = require('express-rate-limit');
const whatsappController = require('../controllers/whatsappController');
const config = require('../config/config');
const logger = require('../utils/logger');

const router = express.Router();

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// API Key authentication middleware
const authenticateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey || apiKey !== config.apiKey) {
    logger.warn('Invalid API key attempt', { 
      ip: req.ip, 
      path: req.path 
    });
    return res.status(401).json({
      success: false,
      error: 'Invalid API key'
    });
  }

  next();
};

// Request logging middleware
const logRequest = (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.apiRequest(req.method, req.path, res.statusCode, duration);
  });
  next();
};

// Apply middlewares to all routes
router.use(limiter);
router.use(authenticateApiKey);
router.use(logRequest);

// WhatsApp Authentication Routes
router.get('/auth/qr', whatsappController.getQR);
router.get('/auth/status', whatsappController.getStatus);

// Messaging Routes
router.post('/message/send', whatsappController.sendMessage);
router.post('/message/welcome', whatsappController.sendWelcomeMessage);

// Notification Routes
router.post('/notification/payment', whatsappController.sendPaymentNotification);
router.post('/notification/withdrawal', whatsappController.sendWithdrawalNotification);
router.post('/notification/system', whatsappController.sendSystemNotification);

// Error handling middleware
router.use((err, req, res, next) => {
  logger.error('API Error', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

module.exports = router;

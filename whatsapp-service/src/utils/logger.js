const winston = require('winston');
const path = require('path');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'whatsapp-service' },
  transports: [
    // Write all logs with importance level of 'error' or less to 'error.log'
    new winston.transports.File({ 
      filename: path.join(__dirname, '../../logs/error.log'), 
      level: 'error' 
    }),
    // Write all logs with importance level of 'info' or less to 'combined.log'
    new winston.transports.File({ 
      filename: path.join(__dirname, '../../logs/combined.log') 
    })
  ]
});

// If we're not in production then log to the console
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Create custom logging methods
const customLogger = {
  info: (message, meta = {}) => {
    logger.info(message, meta);
  },
  error: (message, error = null, meta = {}) => {
    if (error) {
      meta.error = {
        message: error.message,
        stack: error.stack
      };
    }
    logger.error(message, meta);
  },
  warn: (message, meta = {}) => {
    logger.warn(message, meta);
  },
  debug: (message, meta = {}) => {
    logger.debug(message, meta);
  },
  whatsappEvent: (event, data = {}) => {
    logger.info(`WhatsApp Event: ${event}`, { event, data });
  },
  apiRequest: (method, path, status, duration) => {
    logger.info('API Request', {
      method,
      path,
      status,
      duration: `${duration}ms`
    });
  }
};

module.exports = customLogger;

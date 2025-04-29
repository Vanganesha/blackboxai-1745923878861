const whatsappService = require('../services/whatsappService');
const logger = require('../utils/logger');

class WhatsAppController {
  async getQR(req, res) {
    try {
      const qrCode = await whatsappService.getQR();
      if (!qrCode) {
        return res.status(404).json({
          success: false,
          error: 'QR Code not yet generated'
        });
      }
      res.json({ success: true, qrCode });
    } catch (error) {
      logger.error('Error getting QR code', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Error generating QR code'
      });
    }
  }

  async getStatus(req, res) {
    try {
      const status = whatsappService.getStatus();
      res.json({ success: true, status });
    } catch (error) {
      logger.error('Error getting status', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Error getting status'
      });
    }
  }

  async sendMessage(req, res) {
    try {
      const { phone, templateId, data } = req.body;

      if (!phone || !templateId) {
        return res.status(400).json({
          success: false,
          error: 'Phone number and template ID are required'
        });
      }

      const result = await whatsappService.sendMessage(phone, templateId, data);
      res.json({
        success: true,
        messageId: result.id._serialized
      });
    } catch (error) {
      logger.error('Error sending message', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Error sending message'
      });
    }
  }

  async sendWelcomeMessage(req, res) {
    try {
      const { phone, userData } = req.body;

      if (!phone) {
        return res.status(400).json({
          success: false,
          error: 'Phone number is required'
        });
      }

      const result = await whatsappService.sendMessage(phone, 'registration', userData);
      res.json({
        success: true,
        messageId: result.id._serialized
      });
    } catch (error) {
      logger.error('Error sending welcome message', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Error sending welcome message'
      });
    }
  }

  async sendPaymentNotification(req, res) {
    try {
      const { phone, status, paymentData } = req.body;

      if (!phone || !status || !paymentData) {
        return res.status(400).json({
          success: false,
          error: 'Phone number, status, and payment data are required'
        });
      }

      const templateId = status === 'success' ? 'paymentSuccess' : 'paymentFailed';
      const result = await whatsappService.sendMessage(phone, templateId, paymentData);
      
      res.json({
        success: true,
        messageId: result.id._serialized
      });
    } catch (error) {
      logger.error('Error sending payment notification', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Error sending payment notification'
      });
    }
  }

  async sendWithdrawalNotification(req, res) {
    try {
      const { phone, status, withdrawalData } = req.body;

      if (!phone || !status || !withdrawalData) {
        return res.status(400).json({
          success: false,
          error: 'Phone number, status, and withdrawal data are required'
        });
      }

      const templateId = status === 'success' ? 'withdrawalSuccess' : 'withdrawalFailed';
      const result = await whatsappService.sendMessage(phone, templateId, withdrawalData);
      
      res.json({
        success: true,
        messageId: result.id._serialized
      });
    } catch (error) {
      logger.error('Error sending withdrawal notification', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Error sending withdrawal notification'
      });
    }
  }

  async sendSystemNotification(req, res) {
    try {
      const { phone, message } = req.body;

      if (!phone || !message) {
        return res.status(400).json({
          success: false,
          error: 'Phone number and message are required'
        });
      }

      const data = {
        message,
        timestamp: new Date().toLocaleString('id-ID')
      };

      const result = await whatsappService.sendMessage(phone, 'notification', data);
      
      res.json({
        success: true,
        messageId: result.id._serialized
      });
    } catch (error) {
      logger.error('Error sending system notification', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Error sending system notification'
      });
    }
  }
}

module.exports = new WhatsAppController();

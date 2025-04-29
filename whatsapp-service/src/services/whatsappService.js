const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const logger = require('../utils/logger');
const config = require('../config/config');

class WhatsAppService {
  constructor() {
    this.client = null;
    this.isReady = false;
    this.qr = null;
    this.initializeClient();
  }

  initializeClient() {
    try {
      this.client = new Client({
        authStrategy: new LocalAuth(),
        puppeteer: {
          headless: true,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
          ]
        }
      });

      this.setupEventListeners();
      this.client.initialize().catch(error => {
        logger.error('Error initializing WhatsApp client', error);
        this.isReady = false;
        this.qr = null;
      });
    } catch (error) {
      logger.error('Error creating WhatsApp client', error);
      this.isReady = false;
      this.qr = null;
    }
  }

  setupEventListeners() {
    this.client.on('qr', (qr) => {
      logger.whatsappEvent('qr', { status: 'QR Code received' });
      this.qr = qr;
    });

    this.client.on('ready', () => {
      logger.whatsappEvent('ready', { status: 'WhatsApp client is ready' });
      this.isReady = true;
      this.qr = null;
    });

    this.client.on('authenticated', () => {
      logger.whatsappEvent('authenticated', { status: 'WhatsApp client is authenticated' });
    });

    this.client.on('auth_failure', (msg) => {
      logger.error('WhatsApp authentication failed', new Error(msg));
      this.isReady = false;
      this.qr = null;
      // Try to reinitialize after auth failure
      setTimeout(() => this.initializeClient(), 5000);
    });

    this.client.on('disconnected', (reason) => {
      logger.whatsappEvent('disconnected', { reason });
      this.isReady = false;
      this.qr = null;
      // Try to reconnect after disconnection
      setTimeout(() => this.initializeClient(), 5000);
    });

    this.client.on('message', async (message) => {
      try {
        await this.handleIncomingMessage(message);
      } catch (error) {
        logger.error('Error handling incoming message', error);
      }
    });
  }

  async getQR() {
    try {
      if (!this.qr) {
        return null;
      }

      const qrImage = await qrcode.toDataURL(this.qr);
      return qrImage;
    } catch (error) {
      logger.error('Error generating QR code', error);
      throw new Error('Failed to generate QR code');
    }
  }

  async sendMessage(to, templateId, data = {}) {
    if (!this.isReady) {
      throw new Error('WhatsApp client is not ready');
    }

    try {
      const template = config.messageTemplates[templateId];
      if (!template) {
        throw new Error(`Template ${templateId} not found`);
      }

      let messageText = template.template;
      Object.entries(data).forEach(([key, value]) => {
        messageText = messageText.replace(new RegExp(`{${key}}`, 'g'), value);
      });

      const formattedNumber = this.formatPhoneNumber(to);
      const response = await this.client.sendMessage(formattedNumber, messageText);
      
      logger.info('Message sent successfully', {
        to: formattedNumber,
        templateId,
        messageId: response.id._serialized
      });

      return response;
    } catch (error) {
      logger.error('Error sending message', error, { to, templateId, data });
      throw error;
    }
  }

  formatPhoneNumber(number) {
    let cleaned = number.replace(/\D/g, '');
    if (!cleaned.startsWith('62')) {
      cleaned = '62' + (cleaned.startsWith('0') ? cleaned.slice(1) : cleaned);
    }
    return cleaned + '@c.us';
  }

  async handleIncomingMessage(message) {
    const text = message.body.toLowerCase();
    const sender = message.from;

    logger.info('Received message', {
      from: sender,
      text: text
    });

    if (text.startsWith('!')) {
      await this.handleCommand(text, sender);
    }
  }

  async handleCommand(text, sender) {
    const command = text.split(' ')[0].substring(1);
    const args = text.split(' ').slice(1);

    switch (command) {
      case 'help':
        await this.sendMessage(sender, 'commandHelp');
        break;
      
      case 'status':
        // Implement status check logic
        break;
      
      case 'saldo':
        // Implement balance check logic
        break;
      
      case 'withdraw':
        if (!args[0] || isNaN(args[0])) {
          await this.client.sendMessage(sender, 'Format salah. Contoh: !withdraw 100000');
          return;
        }
        // Process withdrawal...
        break;
      
      default:
        await this.client.sendMessage(sender, 'Perintah tidak dikenal. Ketik !help untuk bantuan.');
    }
  }

  getStatus() {
    return {
      ready: this.isReady,
      hasQR: !!this.qr
    };
  }
}

// Create singleton instance
const whatsappService = new WhatsAppService();
module.exports = whatsappService;

require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  apiKey: process.env.API_KEY,
  nodeEnv: process.env.NODE_ENV || 'development',
  allowedOrigins: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:8000'],
  messageTemplates: {
    // Template untuk registrasi berhasil
    registration: {
      id: 'registration',
      template: `Selamat datang di layanan kami! 👋

Terima kasih telah mendaftar. Akun Anda telah berhasil dibuat.
      
Jika ada pertanyaan, silakan balas pesan ini.

Salam,
Tim Support`
    },
    
    // Template untuk notifikasi sistem
    notification: {
      id: 'notification',
      template: `📢 *NOTIFIKASI SISTEM*

{message}

Waktu: {timestamp}

Mohon perhatikan notifikasi ini.`
    },
    
    // Template untuk pembayaran berhasil
    paymentSuccess: {
      id: 'payment_success',
      template: `✅ *PEMBAYARAN BERHASIL*

Detail Pembayaran:
📅 Tanggal: {date}
💰 Jumlah: Rp {amount}
📝 Deskripsi: {description}

Terima kasih atas pembayaran Anda!`
    },
    
    // Template untuk pembayaran gagal
    paymentFailed: {
      id: 'payment_failed',
      template: `❌ *PEMBAYARAN GAGAL*

Detail Pembayaran:
📅 Tanggal: {date}
💰 Jumlah: Rp {amount}
❌ Alasan: {reason}

Mohon coba lagi atau hubungi tim support kami.`
    },
    
    // Template untuk withdrawal berhasil
    withdrawalSuccess: {
      id: 'withdrawal_success',
      template: `💰 *WITHDRAWAL BERHASIL*

Detail Withdrawal:
📅 Tanggal: {date}
💰 Jumlah: Rp {amount}
🏦 Bank: {bank}
📝 Status: Berhasil

Dana telah dikirim ke rekening Anda.`
    },
    
    // Template untuk withdrawal gagal
    withdrawalFailed: {
      id: 'withdrawal_failed',
      template: `❌ *WITHDRAWAL GAGAL*

Detail Withdrawal:
📅 Tanggal: {date}
💰 Jumlah: Rp {amount}
❌ Alasan: {reason}

Mohon hubungi tim support untuk informasi lebih lanjut.`
    },
    
    // Template untuk pesan format command
    commandHelp: {
      id: 'command_help',
      template: `🔍 *PANDUAN PERINTAH*

Berikut format perintah yang tersedia:

1. !status - Cek status langganan
2. !saldo - Cek saldo
3. !withdraw <jumlah> - Tarik dana
4. !help - Tampilkan panduan ini

Contoh: !withdraw 100000`
    }
  }
};

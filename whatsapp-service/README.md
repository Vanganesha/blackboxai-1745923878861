# WhatsApp Integration Service

Service untuk integrasi WhatsApp dengan aplikasi Laravel menggunakan whatsapp-web.js.

## Fitur

- Autentikasi WhatsApp menggunakan QR Code
- Pengiriman pesan dengan template:
  - Pesan selamat datang untuk user baru
  - Notifikasi sistem
  - Notifikasi pembayaran (sukses/gagal)
  - Notifikasi withdrawal (sukses/gagal)
- Command handler untuk pesan masuk
- Rate limiting dan API key authentication
- Logging system

## Instalasi

1. Install dependencies:
```bash
npm install
```

2. Copy file .env.example ke .env dan sesuaikan konfigurasi:
```bash
cp .env.example .env
```

3. Sesuaikan konfigurasi di .env:
```
PORT=3000
API_KEY=your-secret-api-key
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:8000,http://your-laravel-domain.com
```

4. Jalankan service:
```bash
npm start
```

Untuk development:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `GET /api/auth/qr` - Mendapatkan QR code untuk autentikasi WhatsApp
- `GET /api/auth/status` - Cek status koneksi WhatsApp

### Messaging
- `POST /api/message/send` - Kirim pesan custom
- `POST /api/message/welcome` - Kirim pesan selamat datang

### Notifications
- `POST /api/notification/payment` - Kirim notifikasi pembayaran
- `POST /api/notification/withdrawal` - Kirim notifikasi withdrawal
- `POST /api/notification/system` - Kirim notifikasi sistem

## Contoh Penggunaan API

### Kirim Pesan Selamat Datang
```javascript
// Request
POST /api/message/welcome
Headers: {
  'Content-Type': 'application/json',
  'x-api-key': 'your-api-key'
}
Body: {
  "phone": "6281234567890",
  "userData": {
    "name": "John Doe"
  }
}

// Response
{
  "success": true,
  "messageId": "XXXXX"
}
```

### Kirim Notifikasi Pembayaran
```javascript
// Request
POST /api/notification/payment
Headers: {
  'Content-Type': 'application/json',
  'x-api-key': 'your-api-key'
}
Body: {
  "phone": "6281234567890",
  "status": "success",
  "paymentData": {
    "date": "2024-01-20",
    "amount": "100000",
    "description": "Pembayaran Langganan"
  }
}

// Response
{
  "success": true,
  "messageId": "XXXXX"
}
```

## Integrasi dengan Laravel

1. Tambahkan konfigurasi di .env Laravel:
```
WHATSAPP_SERVICE_URL=http://localhost:3000
WHATSAPP_API_KEY=your-api-key
```

2. Buat service provider untuk WhatsApp:
```php
php artisan make:provider WhatsAppServiceProvider
```

3. Implementasi service provider:
```php
namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Services\WhatsAppService;

class WhatsAppServiceProvider extends ServiceProvider
{
    public function register()
    {
        $this->app->singleton(WhatsAppService::class, function ($app) {
            return new WhatsAppService(
                config('services.whatsapp.url'),
                config('services.whatsapp.key')
            );
        });
    }
}
```

4. Buat service class:
```php
namespace App\Services;

use Illuminate\Support\Facades\Http;

class WhatsAppService
{
    protected $baseUrl;
    protected $apiKey;

    public function __construct($baseUrl, $apiKey)
    {
        $this->baseUrl = $baseUrl;
        $this->apiKey = $apiKey;
    }

    public function sendWelcomeMessage($phone, $userData)
    {
        return Http::withHeaders([
            'x-api-key' => $this->apiKey
        ])->post("{$this->baseUrl}/api/message/welcome", [
            'phone' => $phone,
            'userData' => $userData
        ]);
    }

    public function sendPaymentNotification($phone, $status, $paymentData)
    {
        return Http::withHeaders([
            'x-api-key' => $this->apiKey
        ])->post("{$this->baseUrl}/api/notification/payment", [
            'phone' => $phone,
            'status' => $status,
            'paymentData' => $paymentData
        ]);
    }
}
```

5. Penggunaan dalam controller:
```php
namespace App\Http\Controllers;

use App\Services\WhatsAppService;

class UserController extends Controller
{
    protected $whatsapp;

    public function __construct(WhatsAppService $whatsapp)
    {
        $this->whatsapp = $whatsapp;
    }

    public function register(Request $request)
    {
        // Proses registrasi user
        $user = User::create($request->all());

        // Kirim pesan WhatsApp
        $this->whatsapp->sendWelcomeMessage(
            $user->phone,
            ['name' => $user->name]
        );

        return response()->json(['message' => 'User registered successfully']);
    }
}
```

## Command WhatsApp

User dapat mengirim perintah berikut melalui chat WhatsApp:

- `!help` - Menampilkan bantuan
- `!status` - Cek status langganan
- `!saldo` - Cek saldo
- `!withdraw <jumlah>` - Melakukan penarikan dana

## Troubleshooting

1. Jika QR code tidak muncul:
   - Pastikan service berjalan dengan benar
   - Cek log untuk error
   - Restart service

2. Jika pesan tidak terkirim:
   - Pastikan nomor tujuan valid
   - Cek status koneksi WhatsApp
   - Periksa format nomor telepon (awali dengan 62)

3. Jika terjadi error "Too many requests":
   - Tunggu beberapa menit
   - Periksa rate limiting di konfigurasi

## Logging

Log tersimpan di folder `logs/`:
- `error.log` - Error logs
- `combined.log` - Semua logs

## Security

- Gunakan HTTPS di production
- Simpan API key dengan aman
- Batasi akses IP jika memungkinkan
- Monitor log secara berkala

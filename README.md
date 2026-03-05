# ☕ Kahve Falı - AI Kahve Falı Uygulaması

Geleneksel Türk kahve falı geleneğini modern AI teknolojisiyle buluşturan mobil uygulama!

## 🎯 Özellikler

- 📸 Kahve falı fotoğrafı çekme veya galeriden seçme
- 🤖 OpenAI GPT-4 Vision ile görüntü analizi
- 🔮 Yapay zeka destekli otantik falcılık yorumları
- 🎨 Güzel ve kullanıcı dostu arayüz
- ⚡ Hızlı ve güvenilir API

## 📋 Gereksinimler

- Node.js 16+ 
- Python 3.8+ (opsiyonel, sadece geliştirilme için)
- OpenAI API Key
- Expo CLI (mobil uygulaması çalıştırmak için)

## 🚀 Kurulum

### 1. Backend Kurulumu

```bash
cd backend
npm install
```

### 2. Environment Variables Ayarla

`.env` dosyası oluştur:

```bash
cp .env.example .env
```

`.env` dosyasını düzenle ve OpenAI API Key'ini ekle:

```
OPENAI_API_KEY=your_openai_api_key_here
PORT=3000
```

**OpenAI API Key nasıl alınır:**
1. [OpenAI Platform](https://platform.openai.com/) adresine git
2. Hesap oluştur veya giriş yap
3. API Keys bölümüne git
4. Yeni bir API key oluştur
5. Key'i `.env` dosyasına kopyala

### 3. Backend Başlat

```bash
npm run dev
```

Server şu adreste çalışacak: `http://localhost:3000`

### 4. Frontend Kurulumu

```bash
cd ../kahvefali
npm install
```

### 5. Frontend Başlat

```bash
npm start
```

Expo Uygulaması açılacak. QR kodu tarayarak iOS/Android uygulamasını çalıştır.

## 💻 API Endpoint'leri

### POST `/api/fortune`

Kahve falı fotoğrafını göndererek falcılık yap.

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: 
  - `image` (File): Kahve falı fotoğrafı

**Response:**
```json
{
  "success": true,
  "imageAnalysis": "Fotoğrafta gözüken desenlerin analizi...",
  "fortune": "Senin falında gözüken semboller şunlar anlamına geliyor..."
}
```

## 📁 Proje Yapısı

```
kahvefali/
├── backend/
│   ├── server.js          # Express sunucusu
│   ├── package.json       # Backend bağımlılıkları
│   └── .env.example       # Environment variables template'i
│
└── kahvefali/             # React Native (Expo) uygulaması
    ├── App.js             # Ana uygulama
    ├── package.json       # Frontend bağımlılıkları
    └── app.json           # Expo konfigürasyonu
```

## 🎨 Teknoloji Stack

### Backend
- **Express.js** - Web framework
- **OpenAI API** - GPT-4 ve Vision modelleri
- **Multer** - Dosya yükleme
- **CORS** - Cross-origin istekleri yönetme
- **dotenv** - Environment variables

### Frontend
- **React Native** - Mobil uygulama framework'ü
- **Expo** - React Native development platform
- **expo-camera** - Kamera erişimi
- **expo-image-picker** - Galeriden resim seçimi

## 🔐 Güvenlik

- API Key'i asla public yapmayın
- `.env` dosyasını `.gitignore`'a ekle
- Üretim ortamı için güvenli bir key yönetim sistemi kullan

## 🐛 Sorun Giderme

### "Connection refused" hatası
- Backend'in çalışıyor olduğundan emin ol (`npm run dev`)
- Mobil uygulamada API_URL'i doğru ayarla

### Kamera izni hatası
- iOS: `Info.plist`'e kamera izni ekle
- Android: `AndroidManifest.xml`'de izin iste

### OpenAI hatası
- API Key'in doğru olduğundan emin ol
- Account'ta yeterli kredi olup olmadığını kontrol et

## 📚 Faydalı Linkler

- [OpenAI Documentation](https://platform.openai.com/docs)
- [Expo Documentation](https://docs.expo.dev)
- [React Native](https://reactnative.dev)

## 📝 Lisans

MIT

## 👨‍💻 Geliştirici

Kahve Falı Uygulaması - Yapay Zeka ve Geleneğin Birleşimi ☕✨

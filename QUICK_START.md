# 🚀 Kahve Falı - Hızlı Başlangıç Rehberi

## ⚡ Kurulum Adımları

### Adım 1: Backend Dependencies'i Kur

```bash
cd backend
npm install
```

### Adım 2: OpenAI API Key Al

1. https://platform.openai.com/account/api-keys adresine git
2. Yeni bir API key oluştur
3. Backend klasöründe `.env` dosyası oluştur:

```bash
cd backend
cat > .env << EOF
OPENAI_API_KEY=your_api_key_here
PORT=3000
EOF
```

`your_api_key_here` yerine gerçek API key'ini koy!

### Adım 3: Backend'i Başlat

```bash
npm run dev
```

Konsol'da şunu göreceksin:
```
🎉 Kahve Falı Backend is running on http://localhost:3000
```

### Adım 4: Yeni bir Terminal Aç (Adım 3'ü Çalıştırırken)

### Adım 5: Frontend Dependencies'i Kur

```bash
cd kahvefali
npm install
```

### Adım 6: Frontend'i Başlat

```bash
npm start
```

Expo Metro Bundler çalışacak. QR kodu tarayarak uygulamayı çalıştır!

## 📱 Uygulamayı Test Et

1. **Frontend** açıldıktan sonra:
   - "📸 Fotoğraf Çek" veya "🖼️ Galeriden Seç" butonuna tıkla
   - Bir kahve falı fotoğrafı seç
   - "🔮 Falımı Oku" butonuna tıkla
   - AI'nin falcılık yapmasını bekleet!

## 🔧 Dikkat Edilecek Noktalar

| Problem | Çözüm |
|---------|-------|
| Backend bağlantı hatası | Backend'in açık olduğundan emin ol |
| API Key hatası | `.env` dosyasını kontrol et |
| Kamera izni | iOS/Android izinlerini denetle |
| Paket bağımlılığı hatası | `npm install`'ı tekrar çalıştır |

## 📂 Proje Yapısı

```
kahvefali/
├── backend/
│   ├── server.js              ← API sunucusu
│   ├── package.json           ← Dependencies
│   └── .env                   ← API Key (gizli - GitHub'a yükleme!)
│
└── kahvefali/
    ├── App.js                 ← Ana uygulaması
    ├── package.json           ← Dependencies
    └── app.json               ← Expo config
```

## 💡 Sonraki Adımlar

- [ ] Falcılık geçmişini kaydet
- [ ] Sosyal medya paylaşımı
- [ ] Kullanıcı profili
- [ ] Push notifications
- [ ] Offline mod

---

**Sorun mu yaşıyorsun?** README.md'e bakabilirsin! 📖

Eğlenceli Falcılık! ☕✨

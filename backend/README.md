# 🔮 Kahve Falı Backend API

Modern, modüler Express.js backend with OpenAI GPT-4o integration.

## 📁 Proje Yapısı

```
backend/
├── server.js                 # Ana server dosyası
├── routes/
│   ├── health.js            # Health check endpoints
│   └── fortune.js           # Fortune telling endpoints
├── services/
│   └── openai.js            # OpenAI GPT-4o integration
├── .env                     # Environment variables
└── package.json
```

## 🚀 Kurulum

```bash
# Dependencies yükle
npm install

# .env dosyasını oluştur
cp .env.example .env

# OpenAI API key ekle
# .env dosyasına: OPENAI_API_KEY=your_key_here
```

## 🎯 API Endpoints

### Health Check
```
GET /health
GET /health/detailed
```

Response:
```json
{
  "status": "OK",
  "service": "Kahve Falı API",
  "version": "1.0.0",
  "timestamp": "2026-01-11T18:00:00.000Z",
  "uptime": 123.45
}
```

### Fortune Telling
```
POST /api/fortune
Content-Type: multipart/form-data
```

Request:
- `images` (file[]): 1-5 kahve fincanı fotoğrafları

Response:
```json
{
  "success": true,
  "fortune": "Fincanınızda çok güzel semboller var...",
  "metadata": {
    "imagesAnalyzed": 2,
    "processingTimeMs": 3450,
    "timestamp": "2026-01-11T18:00:00.000Z"
  }
}
```

### Statistics (Coming Soon)
```
GET /api/fortune/stats
```

## 🧪 Test

### Health Check
```bash
curl http://localhost:3000/health
```

### Fortune Telling (with curl)
```bash
curl -X POST http://localhost:3000/api/fortune \
  -F "images=@photo1.jpg" \
  -F "images=@photo2.jpg"
```

### Fortune Telling (with httpie)
```bash
http -f POST http://localhost:3000/api/fortune \
  images@photo1.jpg \
  images@photo2.jpg
```

## 🔧 Environment Variables

```env
PORT=3000                          # Server port
OPENAI_API_KEY=sk-...             # OpenAI API key (required)
NODE_ENV=development              # development | production
```

## 📝 Notlar

- **Model**: GPT-4o (latest vision model)
- **Max Images**: 5 per request
- **Max File Size**: 10MB per image
- **Supported Formats**: JPEG, PNG, WebP
- **Response Time**: ~3-5 seconds

## 🛠️ Development

```bash
# Start server
npm start

# Start with nodemon (auto-restart)
npm run dev
```

## 🏗️ Architecture

### Modular Design
- **Routes**: Endpoint definitions
- **Services**: Business logic (OpenAI, DB, etc.)
- **Middleware**: Authentication, validation, logging
- **Controllers**: Request handling (if needed)

### Error Handling
- OpenAI API errors
- File upload errors
- Validation errors
- Generic server errors

### Future Features
- [ ] User authentication
- [ ] Rate limiting
- [ ] Database integration (fortune history)
- [ ] Analytics & statistics
- [ ] Caching (Redis)
- [ ] Image optimization
- [ ] Multiple language support

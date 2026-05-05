# Kahve Falı (Expo)

Türk kahve falı ve fal türleri için **mobil uygulama** (Expo / React Native).

API ve sunucu kodu **bu repoda yok** — backend ayrı Git deposunda.

## Kurulum

```bash
npm install
cp .env.example .env
# .env içinde EXPO_PUBLIC_* değişkenlerini doldur
npm start
```

Gerekli ortam değişkenleri için kök dizindeki `.env.example` dosyasına bak.

## Geliştirme

| Komut        | Açıklama        |
| ------------ | --------------- |
| `npm start`  | Expo dev server |
| `npm run android` / `ios` / `web` | Platform |

## Notlar

- Gizli anahtarları repoya commit etmeyin; `.env` gitignore’da.
- Yerel monorepo kullanıyorsanız: bu repo dalında `backend/` klasörü takip edilmez (diskte durabilir).

## Lisans

MIT

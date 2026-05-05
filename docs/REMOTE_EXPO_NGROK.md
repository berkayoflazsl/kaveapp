# Uzaktan test (farklı ağ)

## 0. URL değişince `.env` elle yazma (otomatik)

Ngrok her açılışta adres değişir. Projede:

```bash
npm run sync:ngrok
```

Bu komut `http://127.0.0.1:4040` üzerinden **api** ve **metro** URL’lerini okur, **`.env`** içine yazar:

- `EXPO_PUBLIC_API_URL` — backend
- `EXPO_PACKAGER_PROXY_URL` — Metro’nun **HTTPS (443)** adresi. **Zorunlu:** Aksi halde Expo manifest `http://....ngrok...:8081` üretir; ngrok dışarıda `:8081` sunmaz → Expo Go “Packager is not running at http://…:8081” der.

Sonra Expo’yu yeniden başlat: `CI=false npx expo start`.

Arkadaşın yapıştıracağı **`exp://...`** satırı da terminale yazdırılır.

**Kalıcı sabit adres** istersen ngrok’ta **ücretli reserved domain** kullanılır; ücretsiz planda URL her oturumda değişir — o zaman sadece `npm run sync:ngrok` yeterli.

## 1. Sıra

1. Backend: `cd backend && node server.js`
2. Ngrok: `ngrok start --all`
3. `npm run sync:ngrok` → `.env` + arkadaşa verilecek `exp://` ekranda
4. Expo: `CI=false npx expo start` (Metro 8081)

## 2. URL’ler

`ngrok start --all` çıktısında **iki** `Forwarding` satırı olur:

- **api** → `.env` içinde `EXPO_PUBLIC_API_URL=https://....ngrok-free.app` (https ile, sonda `/` yok)
- **metro** → Expo Go’da manuel: `exp://HOST:443` (HOST = metro satırındaki alan adı)

Metro URL’si değişince Expo’yu yeniden başlat.

## 3. Ngrok yapılandırması

Dosya: `~/Library/Application Support/ngrok/ngrok.yml`  
Tüneller: `api` (3000), `metro` (8081).

## 4. Eski tek tünel

Sadece API için: `ngrok http 3000` hâlâ kullanılabilir; uzaktan Expo için **iki tünel** gerekir → `ngrok start --all`.

## 5. `Packager is not running at http://….ngrok-free.app:8081`

**Neden:** Metro yerelde 8081; manifest’e de `:8081` yazılıyor. Ngrok’un public adresi ise **HTTPS:443** — `:8081` dışarıdan yok.

**Çözüm:** `npm run sync:ngrok` → `.env` içine `EXPO_PACKAGER_PROXY_URL=https://(metro-tüneli).ngrok-free.app` yazılır. Expo CLI bu değişkeni okuyup packager URL’sini **https + 443** yapar. Sonra `CI=false npx expo start`.

## 5b. `packager is not running at http://127.0.0.1:8081` (eski)

**Neden:** `ngrok` metro tünelinde `host_header: rewrite` kullanılırsa Metro’ya `localhost` gider; Expo manifest hâlâ **127.0.0.1** yazar, telefon kendi localhost’una bağlanır.

**Çözüm:** `ngrok.yml` metro tünelinde **host_header yok** (sadece `proto` + `addr`). Ngrok’u yeniden başlat: `ngrok start --all` → `npm run sync:ngrok`.

## 6. `exp://` açılmıyorsa (diğer)

- Ngrok’u **yeniden başlat**: `ngrok start --all` → yeni URL’leri **4040**’dan al.
- Ücretsiz ngrok bazen **uyarı sayfası** döndürür; Expo Go bunu aşamayabilir — o zaman **Tailscale** (aynı sanal ağ) veya **ücretli ngrok** düşün.
- Arkadaşın telefonunda tarayıcıdan `https://API-NGROK/health` açılıp JSON geliyorsa backend tamam; Metro için sorun genelde `exp://` veya Host/ngrok tarafıdır.

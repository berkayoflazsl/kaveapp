# Astroloji: API cevabı ve çark (UI)

## Özet

- **Backend** [`backend/services/astrology.js`](../backend/services/astrology.js) `calculateNatalChart` Swiss Ephemeris (`@swisseph/node`) ile **geniş** bir natal seti üretir: klasik gezegenler, Chiron, Ceres, Pallas, Juno, Vesta, Lilith (mean apogee), true north/south node, part of fortune, vertex, açılar, Placidus evleri.
- **İstemci** [`components/NatalChartWheel.js`](../components/NatalChartWheel.js) yalnızca [`@astrodraw/astrochart`](https://github.com/AstroDraw/AstroChart) ile çizilebilen bir **altküme** gezegen/ noktayı (ör. ana gezegenler, NNode, SNode, Chiron, Lilith, Fortuna, Vertex) `radix` verisine aktarır. Kütüphane tüm cisim adlarını desteklemeyebileceğinden, dört küçük asteroid ve benzeri satırlar haritada bilinçli biçimde dışlanmış olabilir.
- **LLM yorumu** sunucu tarafında, bu geniş setten üretilen metinle beslenir ([`formatChartForPrompt` in `backend/routes/astrology.js`](../backend/routes/astrology.js)).

## İstemci → sunucu doğum anı

Uygulama, seçilen tarih/saati [Luxon `setZone(iana, { keepLocalTime: true })`](../lib/birthWallTimeToIso.js) ile doğum yeri IANA bölgesine yaslar; DSO ve sabit `+03:00` / `-05:00` stringi kullanılmaz. İstek gövdesi `datetime` (ISO), `latitude`, `longitude`, `timezone` (IANA) alır.

## Test

`npm run test:astro` (çalışma dizini `backend/`) – `calculateNatalChart` için duman testleri.

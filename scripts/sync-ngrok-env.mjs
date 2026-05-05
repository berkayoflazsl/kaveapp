#!/usr/bin/env node
/**
 * ngrok çalışırken (ngrok start --all) localhost:4040'dan tünel URL'lerini okur,
 * kök .env içinde yazar:
 * - EXPO_PUBLIC_API_URL (API)
 * - EXPO_PACKAGER_PROXY_URL (Metro HTTPS — Expo'nun packager URL'sini :8081 değil 443 ile üretmesi için; @expo/cli UrlCreator)
 *
 * Kullanım: node scripts/sync-ngrok-env.mjs
 * Sonra Expo'yu yeniden başlat: CI=false npx expo start
 */

import fs from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const envPath = join(root, '.env');

async function main() {
  let data;
  try {
    const res = await fetch('http://127.0.0.1:4040/api/tunnels');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    data = await res.json();
  } catch (e) {
    console.error(
      '❌ ngrok API okunamadı (http://127.0.0.1:4040). Önce `ngrok start --all` çalıştır.\n',
      e.message
    );
    process.exit(1);
  }

  const tunnels = {};
  for (const t of data.tunnels || []) {
    tunnels[t.name] = t.public_url;
  }

  const api = tunnels.api;
  const metro = tunnels.metro;

  if (!api) {
    console.error(
      '❌ "api" tüneli yok. ngrok.yml içinde api (3000) tanımlı mı? `ngrok start --all`'
    );
    process.exit(1);
  }

  let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';

  const setEnvLine = (key, value) => {
    const line = `${key}=${value}`;
    if (new RegExp(`^${key}=`, 'm').test(envContent)) {
      envContent = envContent.replace(new RegExp(`^${key}=.*$`, 'm'), line);
    } else {
      envContent = envContent.trim() + (envContent.trim() ? '\n' : '') + line + '\n';
    }
  };

  setEnvLine('EXPO_PUBLIC_API_URL', api);
  if (metro) {
    // Metro’nun public adresi (https, 443). Olmazsa manifest http://host:8081 üretir → telefonda hata.
    setEnvLine('EXPO_PACKAGER_PROXY_URL', metro);
  }

  fs.writeFileSync(envPath, envContent.trim() + '\n');

  console.log('✅ .env güncellendi');
  console.log(`   EXPO_PUBLIC_API_URL=${api}`);
  if (metro) {
    console.log(`   EXPO_PACKAGER_PROXY_URL=${metro}`);
  }
  console.log('');

  if (metro) {
    const host = metro.replace(/^https:\/\//i, '').replace(/\/$/, '');
    console.log('📱 Arkadaş — Expo Go → "Enter URL manually":');
    console.log(`   exp://${host}:443`);
    console.log('   (açılmazsa aynı host ile :80 dene)\n');
  } else {
    console.warn('⚠️  "metro" tüneli yok; sadece API yazıldı.\n');
  }

  console.log(
    '→ Expo’yu mutlaka yeniden başlat: Ctrl+C sonra `CI=false npx expo start` (EXPO_PACKAGER_PROXY_URL yüklensin).'
  );
}

main();

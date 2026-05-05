// API — kök dizinde .env: EXPO_PUBLIC_API_URL
export const API_URL = __DEV__
  ? process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.106:3000'
  : 'https://your-production-api.com';

/** Kahve falı görselleri — backend [fortune.js] FORTUNE_MAX_IMAGES ile aynı sayıda tutulmalı. */
export const MAX_IMAGES = 5;
export const MIN_IMAGES = 1;

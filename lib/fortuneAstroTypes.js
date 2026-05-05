/** Fal anahtarları (URL / state ile uyumlu stringler). */
export const FORTUNE_TYPE = Object.freeze({
  KAHVE: 'kahve',
  TAROT: 'tarot',
  RUYA: 'ruya',
  ASTRO: 'astroloji',
});

/**
 * `astroMode`: null = hub; diğerleri ilgili alt akış.
 * İleride React Navigation stack ile eşleştirilebilir.
 */
export const ASTRO_MODE = Object.freeze({
  HUB: null,
  NATAL: 'natal',
  TRANSIT: 'transit',
  SYNASTRY: 'synastry',
});

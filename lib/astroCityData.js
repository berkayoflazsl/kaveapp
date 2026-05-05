/** @typedef {{ key: string, countryKey: string, lat: number, lon: number, ianaTz: string }} BirthCity */

export const BIRTH_COUNTRY_KEYS = ['turkey', 'unitedKingdom', 'unitedStates'];

/** @type {Record<string, BirthCity[]>} */
export const CITIES_BY_COUNTRY = {
  turkey: [
    { key: 'istanbul', countryKey: 'turkey', lat: 41.0082, lon: 28.9784, ianaTz: 'Europe/Istanbul' },
    { key: 'ankara', countryKey: 'turkey', lat: 39.9334, lon: 32.8597, ianaTz: 'Europe/Istanbul' },
    { key: 'izmir', countryKey: 'turkey', lat: 38.4237, lon: 27.1428, ianaTz: 'Europe/Istanbul' },
    { key: 'bursa', countryKey: 'turkey', lat: 40.1885, lon: 29.061, ianaTz: 'Europe/Istanbul' },
    { key: 'antalya', countryKey: 'turkey', lat: 36.8969, lon: 30.7133, ianaTz: 'Europe/Istanbul' },
    { key: 'adana', countryKey: 'turkey', lat: 37.0, lon: 35.3213, ianaTz: 'Europe/Istanbul' },
    { key: 'konya', countryKey: 'turkey', lat: 37.8746, lon: 32.4932, ianaTz: 'Europe/Istanbul' },
    { key: 'gaziantep', countryKey: 'turkey', lat: 37.0662, lon: 37.3833, ianaTz: 'Europe/Istanbul' },
    { key: 'mersin', countryKey: 'turkey', lat: 36.8121, lon: 34.6415, ianaTz: 'Europe/Istanbul' },
    { key: 'diyarbakir', countryKey: 'turkey', lat: 37.9144, lon: 40.2306, ianaTz: 'Europe/Istanbul' },
  ],
  unitedKingdom: [
    { key: 'london', countryKey: 'unitedKingdom', lat: 51.5074, lon: -0.1278, ianaTz: 'Europe/London' },
  ],
  unitedStates: [
    { key: 'newYork', countryKey: 'unitedStates', lat: 40.7128, lon: -74.006, ianaTz: 'America/New_York' },
  ],
};

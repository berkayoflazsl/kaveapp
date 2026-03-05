import {
  dateToJulianDay,
  calculatePosition,
  calculateHouses,
  Planet,
  LunarPoint,
  HouseSystem,
} from '@swisseph/node';

const ZODIAC_SIGNS = [
  { name: 'Koç', nameEn: 'Aries', symbol: '♈', element: 'Ateş' },
  { name: 'Boğa', nameEn: 'Taurus', symbol: '♉', element: 'Toprak' },
  { name: 'İkizler', nameEn: 'Gemini', symbol: '♊', element: 'Hava' },
  { name: 'Yengeç', nameEn: 'Cancer', symbol: '♋', element: 'Su' },
  { name: 'Aslan', nameEn: 'Leo', symbol: '♌', element: 'Ateş' },
  { name: 'Başak', nameEn: 'Virgo', symbol: '♍', element: 'Toprak' },
  { name: 'Terazi', nameEn: 'Libra', symbol: '♎', element: 'Hava' },
  { name: 'Akrep', nameEn: 'Scorpio', symbol: '♏', element: 'Su' },
  { name: 'Yay', nameEn: 'Sagittarius', symbol: '♐', element: 'Ateş' },
  { name: 'Oğlak', nameEn: 'Capricorn', symbol: '♑', element: 'Toprak' },
  { name: 'Kova', nameEn: 'Aquarius', symbol: '♒', element: 'Hava' },
  { name: 'Balık', nameEn: 'Pisces', symbol: '♓', element: 'Su' },
];

const PLANET_NAMES = {
  [Planet.Sun]: { tr: 'Güneş', en: 'Sun' },
  [Planet.Moon]: { tr: 'Ay', en: 'Moon' },
  [Planet.Mercury]: { tr: 'Merkür', en: 'Mercury' },
  [Planet.Venus]: { tr: 'Venüs', en: 'Venus' },
  [Planet.Mars]: { tr: 'Mars', en: 'Mars' },
  [Planet.Jupiter]: { tr: 'Jüpiter', en: 'Jupiter' },
  [Planet.Saturn]: { tr: 'Satürn', en: 'Saturn' },
  [Planet.Uranus]: { tr: 'Uranüs', en: 'Uranus' },
  [Planet.Neptune]: { tr: 'Neptün', en: 'Neptune' },
  [Planet.Pluto]: { tr: 'Plüton', en: 'Pluto' },
  [LunarPoint.TrueNode]: { tr: 'Kuzey Düğüm', en: 'northNode' },
};

function longitudeToSign(longitude) {
  const normalized = ((longitude % 360) + 360) % 360;
  const signIndex = Math.floor(normalized / 30);
  const degreeInSign = normalized % 30;
  return { ...ZODIAC_SIGNS[signIndex], degree: degreeInSign, longitude };
}

function getHouseNumber(cusps, longitude) {
  const normLon = ((longitude % 360) + 360) % 360;
  for (let h = 1; h <= 12; h++) {
    const start = ((cusps[h] ?? 0) % 360 + 360) % 360;
    const end = h === 12
      ? (((cusps[1] ?? 0) % 360 + 360) % 360 + 360) % 360
      : ((cusps[h + 1] ?? start + 30) % 360 + 360) % 360;
    if (start < end) {
      if (normLon >= start && normLon < end) return h;
    } else {
      if (normLon >= start || normLon < (end === 0 ? 360 : end)) return h;
    }
  }
  return 1;
}

/**
 * Calculate natal chart from birth data
 * @param {Object} birthData - { datetime (ISO string), latitude, longitude, timezone }
 */
export function calculateNatalChart(birthData) {
  const { datetime, latitude, longitude } = birthData;

  const birthDate = new Date(datetime);
  const jd = dateToJulianDay(birthDate);

  const planetsToCalculate = [
    Planet.Sun, Planet.Moon, Planet.Mercury, Planet.Venus, Planet.Mars,
    Planet.Jupiter, Planet.Saturn, Planet.Uranus, Planet.Neptune, Planet.Pluto,
    LunarPoint.TrueNode,
  ];

  const positions = {};
  for (const body of planetsToCalculate) {
    const pos = calculatePosition(jd, body);
    const signData = longitudeToSign(pos.longitude);
    const key = (PLANET_NAMES[body]?.en || 'node').replace(/\s+/g, '');
    positions[key.charAt(0).toLowerCase() + key.slice(1)] = {
      longitude: pos.longitude,
      latitude: pos.latitude,
      speed: pos.longitudeSpeed,
      sign: signData.name,
      signSymbol: signData.symbol,
      degree: Math.floor(signData.degree),
      minute: Math.floor((signData.degree % 1) * 60),
      element: signData.element,
    };
  }

  const houses = calculateHouses(jd, latitude, longitude, HouseSystem.Placidus);

  for (const [key, pos] of Object.entries(positions)) {
    pos.house = getHouseNumber(houses.cusps, pos.longitude);
  }

  const ascendant = longitudeToSign(houses.ascendant);
  const mc = longitudeToSign(houses.mc);

  return {
    planets: positions,
    houses: {
      ascendant: { ...ascendant, longitude: houses.ascendant },
      mc: { ...mc, longitude: houses.mc },
      cusps: houses.cusps.slice(1, 13).map((c, i) => ({
        house: i + 1,
        ...longitudeToSign(c),
        longitude: c,
      })),
    },
    birthDate: birthDate.toISOString(),
  };
}

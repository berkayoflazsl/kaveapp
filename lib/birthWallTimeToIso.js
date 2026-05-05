import { DateTime } from 'luxon';

/**
 * Seçiciden gelen anı, doğum yeri IANA bölgesinde aynı "duvar saati" rakamlarını
 * koruyarak ISO-8601 anına çevirir. DST, Londra / New York gibi bölgelerde
 * ofset `CITIES_BY_COUNTRY` içindeki sabit +00/-05’ten doğru türetilir.
 *
 * @param {Date} date — DateTimePicker’ın verdiği değer
 * @param {string} [ianaTimeZone] örn. Europe/Istanbul
 * @returns {string}
 */
export function birthWallTimeToIso(date, ianaTimeZone) {
  const d = date instanceof Date ? date : new Date(date);
  const z = ianaTimeZone && ianaTimeZone.length > 0 ? ianaTimeZone : 'UTC';
  const inDeviceWall = DateTime.fromJSDate(d);
  const inBirthPlace = inDeviceWall.setZone(z, { keepLocalTime: true });
  if (!inBirthPlace.isValid) {
    throw new Error(inBirthPlace.invalidReason || 'Invalid date/time in zone');
  }
  return inBirthPlace.toISO();
}

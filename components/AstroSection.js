import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import NatalChartWheel from './NatalChartWheel';
import { BIRTH_COUNTRY_KEYS, CITIES_BY_COUNTRY } from '../lib/astroCityData';

/**
 * Astroloji: mod hub, yakında, doğum formu, sonuç.
 * Stiller [App.js](App.js) içindeki StyleSheet’te tutulur; tekrar yok.
 */
export default function AstroSection({
  styles,
  t,
  themeColors,
  fortune,
  astroMode,
  setAstroMode,
  birthDateTime,
  setBirthDateTime,
  showDatePicker,
  setShowDatePicker,
  showTimePicker,
  setShowTimePicker,
  birthCountryKey,
  setBirthCountryKey,
  birthCity,
  setBirthCity,
  datePickerLocale,
  getAstrologyReading,
  loading,
  astrologyChart,
  setFortune,
  setAstrologyChart,
}) {
  if (!fortune && !astroMode) {
    return (
      <View style={styles.astroHubOuter}>
        <View style={[styles.astroHubHero, { borderColor: themeColors.textSecondary }]}>
          <Text style={[styles.astroHubKicker, { color: themeColors.textSecondary }]}>{t('app.astroHubKicker')}</Text>
          <Text style={[styles.astroHubTitle, { color: themeColors.text }]}>{t('app.astroHubTitle')}</Text>
          <Text style={[styles.astroHubSubtitle, { color: themeColors.textSecondary }]}>{t('app.astroHubSubtitle')}</Text>
        </View>
        <TouchableOpacity
          style={[styles.astroModeCard, { backgroundColor: themeColors.card, borderLeftColor: '#a78bfa' }]}
          onPress={() => setAstroMode('natal')}
          activeOpacity={0.85}
        >
          <Text style={styles.astroModeEmoji}>✨</Text>
          <View style={styles.astroModeTextCol}>
            <Text style={[styles.astroModeTitle, { color: themeColors.text }]}>{t('app.astroModeNatal')}</Text>
            <Text style={[styles.astroModeDesc, { color: themeColors.textSecondary }]}>{t('app.astroModeNatalDesc')}</Text>
          </View>
          <Text style={[styles.astroModeChevron, { color: themeColors.textSecondary }]}>→</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.astroModeCard, { backgroundColor: themeColors.card, borderLeftColor: '#38bdf8' }]}
          onPress={() => setAstroMode('transit')}
          activeOpacity={0.85}
        >
          <Text style={styles.astroModeEmoji}>🌌</Text>
          <View style={styles.astroModeTextCol}>
            <Text style={[styles.astroModeTitle, { color: themeColors.text }]}>{t('app.astroModeTransit')}</Text>
            <Text style={[styles.astroModeDesc, { color: themeColors.textSecondary }]}>{t('app.astroModeTransitDesc')}</Text>
          </View>
          <Text style={[styles.astroModeChevron, { color: themeColors.textSecondary }]}>→</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.astroModeCard, { backgroundColor: themeColors.card, borderLeftColor: '#f472b6' }]}
          onPress={() => setAstroMode('synastry')}
          activeOpacity={0.85}
        >
          <Text style={styles.astroModeEmoji}>💞</Text>
          <View style={styles.astroModeTextCol}>
            <Text style={[styles.astroModeTitle, { color: themeColors.text }]}>{t('app.astroModeSynastry')}</Text>
            <Text style={[styles.astroModeDesc, { color: themeColors.textSecondary }]}>{t('app.astroModeSynastryDesc')}</Text>
          </View>
          <Text style={[styles.astroModeChevron, { color: themeColors.textSecondary }]}>→</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!fortune && (astroMode === 'transit' || astroMode === 'synastry')) {
    return (
      <View style={[styles.dreamInputContainer, { backgroundColor: themeColors.card }]}>
        <Text style={styles.astroComingEmoji}>🛰️</Text>
        <Text style={[styles.inputLabel, { color: themeColors.text, textAlign: 'center' }]}>{t('app.astroComingTitle')}</Text>
        <Text style={[styles.inputHint, { color: themeColors.textSecondary, textAlign: 'center', marginBottom: 20 }]}>{t('app.astroComingBody')}</Text>
        <TouchableOpacity
          style={[styles.dreamButton, { backgroundColor: themeColors.text }]}
          onPress={() => setAstroMode('natal')}
          activeOpacity={0.85}
        >
          <Text style={[styles.dreamButtonText, { color: themeColors.background }]}>{t('app.astroModeNatal')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ marginTop: 12, padding: 12 }} onPress={() => setAstroMode(null)} activeOpacity={0.7}>
          <Text style={{ color: themeColors.textSecondary, textAlign: 'center', fontSize: 15 }}>{t('app.astroBackToMenu')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!fortune && astroMode === 'natal') {
    return (
      <>
        <View style={[styles.dreamInputContainer, { backgroundColor: themeColors.card }]}>
          <Text style={[styles.inputLabel, { color: themeColors.text }]}>{t('app.birthInfoTitle')}</Text>
          <Text style={[styles.inputHint, { color: themeColors.textSecondary }]}>{t('app.birthInfoHint')}</Text>

          <Text style={[styles.astrologyLabel, { color: themeColors.textSecondary }]}>{t('app.birthDate')}</Text>
          <TouchableOpacity
            style={[styles.astrologyInput, styles.astrologyPickerButton, { backgroundColor: themeColors.background, borderColor: themeColors.textSecondary }]}
            onPress={() => setShowDatePicker(true)}
            activeOpacity={0.7}
          >
            <Text style={[styles.astrologyPickerText, { color: birthDateTime ? themeColors.text : themeColors.textSecondary }]}>
              {birthDateTime
                ? `${String(birthDateTime.getDate()).padStart(2, '0')}.${String(birthDateTime.getMonth() + 1).padStart(2, '0')}.${birthDateTime.getFullYear()}`
                : t('app.selectDate')}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={birthDateTime || new Date(1990, 4, 15)}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              maximumDate={new Date()}
              minimumDate={new Date(1900, 0, 1)}
              onChange={(_, selectedDate) => {
                setShowDatePicker(Platform.OS === 'ios');
                if (selectedDate) {
                  const prev = birthDateTime || new Date(1990, 4, 15, 12, 0);
                  setBirthDateTime(
                    new Date(
                      selectedDate.getFullYear(),
                      selectedDate.getMonth(),
                      selectedDate.getDate(),
                      prev.getHours(),
                      prev.getMinutes()
                    )
                  );
                }
              }}
              locale={datePickerLocale}
            />
          )}

          <Text style={[styles.astrologyLabel, { color: themeColors.textSecondary }]}>{t('app.birthTime')}</Text>
          <Text style={[styles.inputHint, { color: themeColors.textSecondary, marginTop: 0, marginBottom: 8 }]}>{t('app.birthTimeZoneHint')}</Text>
          <TouchableOpacity
            style={[styles.astrologyInput, styles.astrologyPickerButton, { backgroundColor: themeColors.background, borderColor: themeColors.textSecondary }]}
            onPress={() => setShowTimePicker(true)}
            activeOpacity={0.7}
          >
            <Text style={[styles.astrologyPickerText, { color: birthDateTime ? themeColors.text : themeColors.textSecondary }]}>
              {birthDateTime
                ? `${String(birthDateTime.getHours()).padStart(2, '0')}:${String(birthDateTime.getMinutes()).padStart(2, '0')}`
                : t('app.selectTime')}
            </Text>
          </TouchableOpacity>
          {showTimePicker && (
            <DateTimePicker
              value={birthDateTime || new Date(1990, 4, 15, 12, 0)}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              is24Hour
              onChange={(_, selectedTime) => {
                setShowTimePicker(Platform.OS === 'ios');
                if (selectedTime) {
                  const prev = birthDateTime || new Date(1990, 4, 15, 12, 0);
                  setBirthDateTime(
                    new Date(
                      prev.getFullYear(),
                      prev.getMonth(),
                      prev.getDate(),
                      selectedTime.getHours(),
                      selectedTime.getMinutes()
                    )
                  );
                }
              }}
              locale={datePickerLocale}
            />
          )}

          <Text style={[styles.astrologyLabel, { color: themeColors.textSecondary }]}>{t('app.birthCountry')}</Text>
          {!birthCountryKey && <Text style={[styles.inputHint, { color: themeColors.textSecondary, marginBottom: 6 }]}>{t('app.birthCountryHelper')}</Text>}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cityScroll}>
            {BIRTH_COUNTRY_KEYS.map((cKey) => (
              <TouchableOpacity
                key={cKey}
                style={[
                  styles.cityChip,
                  { backgroundColor: birthCountryKey === cKey ? themeColors.text : themeColors.buttonBg, borderColor: themeColors.text },
                ]}
                onPress={() => {
                  setBirthCountryKey(cKey);
                  setBirthCity((prev) => (prev && prev.countryKey === cKey ? prev : null));
                }}
              >
                <Text style={[styles.cityChipText, { color: birthCountryKey === cKey ? themeColors.background : themeColors.text }]}>
                  {t(`countries.${cKey}`)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Text style={[styles.astrologyLabel, { color: themeColors.textSecondary, marginTop: 8 }]}>{t('app.birthCity')}</Text>
          {!birthCountryKey ? (
            <Text style={[styles.inputHint, { color: themeColors.textSecondary }]}>{t('app.birthCitySelectCountryFirst')}</Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cityScroll}>
              {(CITIES_BY_COUNTRY[birthCountryKey] || []).map((city) => (
                <TouchableOpacity
                  key={city.key}
                  style={[
                    styles.cityChip,
                    {
                      backgroundColor:
                        birthCity?.key === city.key && birthCity?.countryKey === city.countryKey
                          ? themeColors.text
                          : themeColors.buttonBg,
                      borderColor: themeColors.text,
                    },
                  ]}
                  onPress={() => setBirthCity(city)}
                >
                  <Text
                    style={[
                      styles.cityChipText,
                      {
                        color: birthCity?.key === city.key && birthCity?.countryKey === city.countryKey ? themeColors.background : themeColors.text,
                      },
                    ]}
                  >
                    {t(`cities.${city.key}`)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          <TouchableOpacity
            style={[styles.dreamButton, { backgroundColor: themeColors.text, opacity: !birthDateTime || !birthCity ? 0.5 : 1 }]}
            onPress={getAstrologyReading}
            disabled={loading || !birthDateTime || !birthCity}
          >
            {loading ? (
              <ActivityIndicator color={themeColors.background} />
            ) : (
              <>
                <Text style={[styles.dreamButtonText, { color: themeColors.background }]}>{t('app.getChart')}</Text>
                <Text style={[styles.dreamButtonCost, { color: themeColors.background }]}>{t('app.oneDiamond')}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </>
    );
  }

  if (fortune) {
    return (
      <View style={[styles.dreamInputContainer, { backgroundColor: themeColors.card }]}>
        <Text style={[styles.astroResultKicker, { color: themeColors.textSecondary }]}>{t('app.astroResultKicker')}</Text>
        {astrologyChart ? (
          <>
            <Text style={[styles.inputHint, { color: themeColors.textSecondary, marginBottom: 8 }]}>{t('app.chartVisualHint')}</Text>
            <NatalChartWheel chart={astrologyChart} themeColors={themeColors} />
          </>
        ) : null}
        <Text style={[styles.fortuneText, { color: themeColors.text, marginTop: astrologyChart ? 8 : 0 }]}>{fortune}</Text>
        <TouchableOpacity
          style={[styles.newFortuneButton, { backgroundColor: themeColors.text, marginTop: 20 }]}
          onPress={() => {
            setFortune(null);
            setAstrologyChart(null);
            setAstroMode('natal');
          }}
          activeOpacity={0.85}
        >
          <Text style={[styles.newFortuneButtonText, { color: themeColors.background }]}>{t('app.newFortune')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return null;
}

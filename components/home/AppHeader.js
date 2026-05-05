import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';

/**
 * Ana ekran üst bar: geri (veya geçmiş/ayarlar), logo, elmas.
 * Geri tıklamasındaki astro hiyerarşisi üst bileşende çözülür (`onBack`).
 */
export default function AppHeader({
  styles,
  themeColors,
  t,
  tokens,
  selectedFortune,
  onBack,
  onHistory,
  onSettings,
  onTokens,
}) {
  return (
    <View style={[styles.header, { backgroundColor: themeColors.background }]}>
      {selectedFortune ? (
        <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7}>
          <Text style={[styles.backIcon, { color: themeColors.text }]}>←</Text>
        </TouchableOpacity>
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity style={styles.backButton} onPress={onHistory}>
            <Text style={{ fontSize: 22 }}>📜</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.backButton}
            onPress={onSettings}
            accessibilityLabel={t('app.accessibilitySettings')}
          >
            <Text style={{ fontSize: 20 }}>⚙️</Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={[styles.logoText, { color: themeColors.text }]}>{t('common.appName')}</Text>

      <TouchableOpacity
        style={[styles.coinBadge, { backgroundColor: themeColors.buttonBg }]}
        onPress={onTokens}
      >
        <Text style={styles.coinIcon}>💎</Text>
        <Text style={[styles.coinText, { color: themeColors.text }]}>{tokens}</Text>
      </TouchableOpacity>
    </View>
  );
}

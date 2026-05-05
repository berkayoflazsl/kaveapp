import React from 'react';
import { View, TouchableOpacity, Text, ImageBackground } from 'react-native';

/** Ana sayfa: dört fal türü kartı. */
export default function FortuneTypeGrid({ styles, themeColors, t, onSelectKahve, onSelectTarot, onSelectRuya, onSelectAstro }) {
  return (
    <View style={styles.fortuneTypesContainer}>
      <TouchableOpacity
        style={[styles.fortuneTypeCard, { backgroundColor: themeColors.card }]}
        onPress={onSelectKahve}
        activeOpacity={0.8}
      >
        <ImageBackground
          source={{ uri: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=600' }}
          style={styles.fortuneTypeImage}
          imageStyle={styles.fortuneTypeImageStyle}
        >
          <View style={styles.fortuneTypeOverlay}>
            <Text style={styles.fortuneTypeEmoji}>☕</Text>
            <Text style={styles.fortuneTypeTitle}>{t('app.fortuneCoffeeTitle')}</Text>
            <Text style={styles.fortuneTypeDesc}>{t('app.fortuneCoffeeDesc')}</Text>
          </View>
        </ImageBackground>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.fortuneTypeCard, { backgroundColor: themeColors.card }]}
        onPress={onSelectTarot}
        activeOpacity={0.8}
      >
        <ImageBackground
          source={{ uri: 'https://images.unsplash.com/photo-1551269901-5c5e14c25df7?w=600' }}
          style={styles.fortuneTypeImage}
          imageStyle={styles.fortuneTypeImageStyle}
        >
          <View style={styles.fortuneTypeOverlay}>
            <Text style={styles.fortuneTypeEmoji}>🔮</Text>
            <Text style={styles.fortuneTypeTitle}>{t('app.fortuneTarotTitle')}</Text>
            <Text style={styles.fortuneTypeDesc}>{t('app.fortuneTarotDesc')}</Text>
          </View>
        </ImageBackground>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.fortuneTypeCard, { backgroundColor: themeColors.card }]}
        onPress={onSelectRuya}
        activeOpacity={0.8}
      >
        <ImageBackground
          source={{ uri: 'https://images.unsplash.com/photo-1475274047050-1d0c0975c63e?w=600' }}
          style={styles.fortuneTypeImage}
          imageStyle={styles.fortuneTypeImageStyle}
        >
          <View style={styles.fortuneTypeOverlay}>
            <Text style={styles.fortuneTypeEmoji}>💭</Text>
            <Text style={styles.fortuneTypeTitle}>{t('app.fortuneDreamTitle')}</Text>
            <Text style={styles.fortuneTypeDesc}>{t('app.fortuneDreamDesc')}</Text>
          </View>
        </ImageBackground>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.fortuneTypeCard, { backgroundColor: themeColors.card }]}
        onPress={onSelectAstro}
        activeOpacity={0.8}
      >
        <ImageBackground
          source={{ uri: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=600' }}
          style={styles.fortuneTypeImage}
          imageStyle={styles.fortuneTypeImageStyle}
        >
          <View style={styles.fortuneTypeOverlay}>
            <Text style={styles.fortuneTypeEmoji}>✨</Text>
            <Text style={styles.fortuneTypeTitle}>{t('app.fortuneStarTitle')}</Text>
            <Text style={styles.fortuneTypeDesc}>{t('app.fortuneStarDesc')}</Text>
          </View>
        </ImageBackground>
      </TouchableOpacity>
    </View>
  );
}

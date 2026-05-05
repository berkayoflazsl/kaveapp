import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, SafeAreaView, Modal, ActivityIndicator, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useTokens } from '../contexts/TokenContext';
import { useTheme } from '../contexts/ThemeContext';
import { useState } from 'react';

const AD_MOCK_SEC = 2.5;

export default function TokensScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { tokens, addTokens, watchAd, canWatchAd } = useTokens();
  const { themeColors } = useTheme();
  const [showAdModal, setShowAdModal] = useState(false);
  const [adWatching, setAdWatching] = useState(false);

  const watchAdForTokens = async () => {
    if (!canWatchAd) {
      Alert.alert(t('tokens.adLimitTitle'), t('tokens.adLimit'));
      return;
    }
    setShowAdModal(true);
    setAdWatching(true);
    await new Promise((r) => setTimeout(r, AD_MOCK_SEC * 1000));
    try {
      await watchAd();
      setAdWatching(false);
      setTimeout(() => {
        setShowAdModal(false);
        Alert.alert(t('tokens.adCongrats'), t('tokens.adSuccess'));
      }, 300);
    } catch (error) {
      setAdWatching(false);
      setShowAdModal(false);
      Alert.alert(t('common.error'), t('tokens.adError'));
    }
  };

  const buyTokens = (amount: number) => {
    Alert.alert(t('tokens.mockBuyTitle'), t('tokens.mockBuyBody', { amount: String(amount) }), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('tokens.try'),
        onPress: async () => {
          const ok = await addTokens(amount);
          if (ok) {
            Alert.alert(t('tokens.successTitle'), t('tokens.added', { amount: String(amount) }), [
              { text: t('common.ok'), onPress: () => router.back() },
            ]);
          } else {
            Alert.alert(t('tokens.closedTitle'), t('tokens.closedBody'));
          }
        },
      },
    ]);
  };

  return (
    <View style={[styles.wrapper, { backgroundColor: themeColors.background }]}>
      <SafeAreaView style={[styles.safeArea, { backgroundColor: themeColors.background }]}>
        <View
          style={[
            styles.header,
            {
              backgroundColor: themeColors.background,
              borderBottomColor: themeColors.text,
              paddingTop: Platform.OS === 'android' ? Math.max(insets.top, 12) : insets.top,
            },
          ]}
        >
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={[styles.backButtonText, { color: themeColors.text }]}>← {t('common.back')}</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: themeColors.text }]}>{t('tokens.title')}</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={[styles.container, { backgroundColor: themeColors.background }]}
          contentContainerStyle={{ backgroundColor: themeColors.background, flexGrow: 1, padding: 20 }}
        >
          <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>{t('tokens.balance', { count: tokens })}</Text>

          <TouchableOpacity
            style={[
              styles.tokenOption,
              {
                backgroundColor: canWatchAd ? themeColors.buttonBg : themeColors.background,
                borderColor: canWatchAd ? themeColors.text : themeColors.textSecondary,
                opacity: canWatchAd ? 1 : 0.5,
              },
            ]}
            onPress={watchAdForTokens}
            disabled={!canWatchAd}
          >
            <Text style={styles.tokenOptionIcon}>📺</Text>
            <View style={styles.tokenOptionText}>
              <Text style={[styles.tokenOptionTitle, { color: themeColors.text }]}>
                {canWatchAd ? t('tokens.adTitleOn') : t('tokens.adTitleOff')}
              </Text>
              <Text style={[styles.tokenOptionDesc, { color: themeColors.textSecondary }]}>
                {canWatchAd ? t('tokens.adDescOn') : t('tokens.adDescOff')}
              </Text>
            </View>
          </TouchableOpacity>

          <View style={styles.tokenPackages}>
            <TouchableOpacity
              style={[styles.tokenPackage, { backgroundColor: themeColors.buttonBg, borderColor: themeColors.text }]}
              onPress={() => buyTokens(10)}
            >
              <Text style={styles.tokenPackageIcon}>💎</Text>
              <Text style={[styles.tokenPackageAmount, { color: themeColors.text }]}>10</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tokenPackage, styles.tokenPackagePopular, { backgroundColor: themeColors.text }]}
              onPress={() => buyTokens(25)}
            >
              <View style={styles.popularBadge}>
                <Text style={styles.popularBadgeText}>POP</Text>
              </View>
              <Text style={styles.tokenPackageIcon}>💎</Text>
              <Text style={[styles.tokenPackageAmount, { color: themeColors.background }]}>25</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tokenPackage, { backgroundColor: themeColors.buttonBg, borderColor: themeColors.text }]}
              onPress={() => buyTokens(50)}
            >
              <Text style={styles.tokenPackageIcon}>💎</Text>
              <Text style={[styles.tokenPackageAmount, { color: themeColors.text }]}>50</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>

      <Modal visible={showAdModal} transparent animationType="fade">
        <View style={styles.adModalOverlay}>
          <View style={[styles.adModalContent, { backgroundColor: themeColors.card }]}>
            {adWatching ? (
              <>
                <Text style={styles.adModalTitle}>{t('tokens.adModalWait')}</Text>
                <Text style={[styles.adModalSubtitle, { color: themeColors.textSecondary }]}>{t('tokens.adModalSim')}</Text>
                <ActivityIndicator size="large" color={themeColors.text} style={{ marginTop: 20 }} />
              </>
            ) : null}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  safeArea: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  backButton: { padding: 8 },
  backButtonText: { fontSize: 16, fontWeight: '600' },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  headerSpacer: { width: 60 },
  container: { flex: 1 },
  subtitle: { fontSize: 16, textAlign: 'center', marginBottom: 32, fontWeight: '500' },
  tokenOption: { flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 16, borderWidth: 2, marginBottom: 24, gap: 16 },
  tokenOptionIcon: { fontSize: 22, fontWeight: '800' },
  tokenOptionText: { flex: 1 },
  tokenOptionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  tokenOptionDesc: { fontSize: 14, fontWeight: '500' },
  tokenPackages: { flexDirection: 'row', gap: 12, justifyContent: 'space-between', marginTop: 12 },
  tokenPackage: { flex: 1, padding: 20, borderRadius: 16, borderWidth: 2, alignItems: 'center', position: 'relative' },
  tokenPackagePopular: { transform: [{ scale: 1.05 }], elevation: 8 },
  popularBadge: { position: 'absolute', top: -12, backgroundColor: '#e74c3c', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  popularBadgeText: { color: '#fff', fontSize: 9, fontWeight: '700' },
  tokenPackageIcon: { fontSize: 28, fontWeight: '800', marginBottom: 8 },
  tokenPackageAmount: { fontSize: 16, fontWeight: '700' },
  adModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  adModalContent: { width: '80%', borderRadius: 20, padding: 30, alignItems: 'center' },
  adModalTitle: { fontSize: 20, fontWeight: '800' },
  adModalSubtitle: { fontSize: 15, marginTop: 8 },
});

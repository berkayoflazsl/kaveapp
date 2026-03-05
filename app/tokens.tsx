import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, SafeAreaView, Modal, ActivityIndicator, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTokens } from '../contexts/TokenContext';
import { useTheme } from '../contexts/ThemeContext';
import { useState } from 'react';

export default function TokensScreen() {
  const insets = useSafeAreaInsets();
  const { tokens, addTokens, watchAd, canWatchAd } = useTokens();
  const { themeColors } = useTheme();
  const [showAdModal, setShowAdModal] = useState(false);
  const [adWatching, setAdWatching] = useState(false);

  // 📺 Reklam İzleme
  const watchAdForTokens = async () => {
    if (!canWatchAd) {
      Alert.alert(
        '⏰ Günlük Limit',
        'Günlük reklam izleme hakkınızı doldurdunuz. Yarın tekrar deneyin!'
      );
      return;
    }

    setShowAdModal(true);
    setAdWatching(true);
    
    try {
      await watchAd();
      setAdWatching(false);
      // Modal kapanınca başarı mesajı
      setTimeout(() => {
        setShowAdModal(false);
        Alert.alert('🎉 Tebrikler!', '1 elmas kazandın!');
      }, 500);
    } catch (error) {
      setAdWatching(false);
      setShowAdModal(false);
    }
  };

  // 💰 Mock Satın Alma (v1.0 - Demo Mode)
  const buyTokens = (amount: number, price: string) => {
    Alert.alert(
      '� Geliştirme Modu',
      `Jeton satın alma sistemi çok yakında aktif olacak!\n\nŞimdilik test amaçlı ${amount} jeton hediye! 🎁`,
      [
        { text: 'Tamam', style: 'cancel' },
        {
          text: 'Test Et',
          onPress: () => {
            addTokens(amount);
            Alert.alert('✅ Test Başarılı!', `${amount} jeton eklendi!\n\nGerçek ödeme sistemi yakında aktif olacak.`);
            router.back();
          }
        }
      ]
    );
  };

  return (
    <View style={[styles.wrapper, { backgroundColor: themeColors.background }]}>
      <SafeAreaView style={[styles.safeArea, { backgroundColor: themeColors.background }]}>
        {/* Custom Header - status bar ile ayrılsın */}
        <View style={[
          styles.header,
          {
            backgroundColor: themeColors.background,
            borderBottomColor: themeColors.text,
            paddingTop: Platform.OS === 'android' ? Math.max(insets.top, 12) : insets.top,
          }
        ]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={[styles.backButtonText, { color: themeColors.text }]}>← Geri</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: themeColors.text }]}>💎 Elmas Al</Text>
          <View style={styles.headerSpacer} />
        </View>
        
        <ScrollView 
          style={[styles.container, { backgroundColor: themeColors.background }]}
          contentContainerStyle={{ backgroundColor: themeColors.background, flexGrow: 1 }}
        >
          <View style={[styles.content, { backgroundColor: themeColors.background }]}>
            <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
              Mevcut Elmasın: {tokens} 💎
          </Text>

        {/* Reklam İzle */}
        <TouchableOpacity
          style={[
            styles.tokenOption, 
            { 
              backgroundColor: canWatchAd ? themeColors.buttonBg : themeColors.background, 
              borderColor: canWatchAd ? themeColors.text : themeColors.textSecondary,
              opacity: canWatchAd ? 1 : 0.5
            }
          ]}
          onPress={watchAdForTokens}
          disabled={!canWatchAd}
        >
          <Text style={styles.tokenOptionIcon}>📺</Text>
          <View style={styles.tokenOptionText}>
            <Text style={[styles.tokenOptionTitle, { color: themeColors.text }]}>
              {canWatchAd ? 'Reklam İzle' : 'Günlük Limit Doldu'}
            </Text>
            <Text style={[styles.tokenOptionDesc, { color: themeColors.textSecondary }]}>
              {canWatchAd ? 'Ücretsiz 1 elmas kazan' : 'Yarın tekrar deneyin'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Satın Alma Paketleri */}
        <View style={styles.tokenPackages}>
          <TouchableOpacity
            style={[styles.tokenPackage, { backgroundColor: themeColors.buttonBg, borderColor: themeColors.text }]}
            onPress={() => buyTokens(10, '₺29.99')}
          >
            <Text style={styles.tokenPackageIcon}>💎</Text>
            <Text style={[styles.tokenPackageAmount, { color: themeColors.text }]}>10 Jeton</Text>
            <Text style={[styles.tokenPackagePrice, { color: themeColors.textSecondary }]}>₺29.99</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tokenPackage, styles.tokenPackagePopular, { backgroundColor: themeColors.text }]}
            onPress={() => buyTokens(25, '₺59.99')}
          >
            <View style={styles.popularBadge}>
              <Text style={styles.popularBadgeText}>POPÜLER</Text>
            </View>
            <Text style={styles.tokenPackageIcon}>💎</Text>
            <Text style={[styles.tokenPackageAmount, { color: themeColors.background }]}>25 Jeton</Text>
            <Text style={[styles.tokenPackagePrice, { color: themeColors.background }]}>₺59.99</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tokenPackage, { backgroundColor: themeColors.buttonBg, borderColor: themeColors.text }]}
            onPress={() => buyTokens(50, '₺99.99')}
          >
            <Text style={styles.tokenPackageIcon}>💎</Text>
            <Text style={[styles.tokenPackageAmount, { color: themeColors.text }]}>50 Jeton</Text>
            <Text style={[styles.tokenPackagePrice, { color: themeColors.textSecondary }]}>₺99.99</Text>
          </TouchableOpacity>
        </View>
        </View>
      </ScrollView>
      </SafeAreaView>

      {/* Reklam Modal */}
      <Modal
        visible={showAdModal}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.adModalOverlay}>
          <View style={[styles.adModalContent, { backgroundColor: themeColors.card }]}>
            {adWatching ? (
              <>
                <Text style={styles.adModalEmoji}>📺</Text>
                <Text style={[styles.adModalTitle, { color: themeColors.text }]}>
                  Reklam Gösteriliyor...
                </Text>
                <Text style={[styles.adModalSubtitle, { color: themeColors.textSecondary }]}>
                  Lütfen bekleyin
                </Text>
                <ActivityIndicator size="large" color={themeColors.text} style={{ marginTop: 20 }} />
                
                {/* Fake Reklam İçeriği */}
                <View style={styles.fakeAd}>
                  <Text style={styles.fakeAdEmoji}>☕</Text>
                  <Text style={[styles.fakeAdTitle, { color: themeColors.text }]}>
                    Kahve Falı
                  </Text>
                  <Text style={[styles.fakeAdText, { color: themeColors.textSecondary }]}>
                    Fincanından geleceğini öğren! 🔮
                  </Text>
                  <Text style={[styles.fakeAdText, { color: themeColors.textSecondary }]}>
                    Tarot • Rüya Tabiri • Ve daha fazlası...
                  </Text>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.adModalEmoji}>🎉</Text>
                <Text style={[styles.adModalTitle, { color: themeColors.text }]}>
                  Tebrikler!
                </Text>
                <Text style={[styles.adModalSubtitle, { color: themeColors.textSecondary }]}>
                  1 elmas kazandın!
                </Text>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerSpacer: {
    width: 60, // backButton ile aynı genişlikte, title'ı ortala
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    fontWeight: '500',
  },
  tokenOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    marginBottom: 24,
    gap: 16,
  },
  tokenOptionIcon: {
    fontSize: 48,
  },
  tokenOptionText: {
    flex: 1,
  },
  tokenOptionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  tokenOptionDesc: {
    fontSize: 14,
    fontWeight: '500',
  },
  tokenPackages: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    marginTop: 12,
  },
  tokenPackage: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    position: 'relative',
  },
  tokenPackagePopular: {
    transform: [{ scale: 1.05 }],
    elevation: 8,
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    backgroundColor: '#e74c3c',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  popularBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  tokenPackageIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  tokenPackageAmount: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  tokenPackagePrice: {
    fontSize: 16,
    fontWeight: '600',
  },
  // Ad Modal Styles
  adModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  adModalContent: {
    width: '85%',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
  },
  adModalEmoji: {
    fontSize: 60,
    marginBottom: 16,
  },
  adModalTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
  },
  adModalSubtitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  fakeAd: {
    marginTop: 30,
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 16,
    alignItems: 'center',
    width: '100%',
  },
  fakeAdEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  fakeAdTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
  },
  fakeAdText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 4,
  },
});

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

export default function ForgotPasswordScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { resetPassword } = useAuth();
  const { themeColors } = useTheme();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const onSend = async () => {
    const e = email.trim();
    if (!e) {
      Alert.alert(t('auth.missingFields'), t('auth.forgotMissingEmail'));
      return;
    }
    setLoading(true);
    const { error } = await resetPassword(e);
    setLoading(false);
    if (error) {
      Alert.alert(t('auth.forgotErrorTitle'), error.message);
      return;
    }
    Alert.alert(t('auth.forgotEmailSent'), t('auth.forgotEmailSentBody'), [
      { text: t('common.ok'), onPress: () => router.back() },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: themeColors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.inner}>
        <Text style={[styles.title, { color: themeColors.text }]}>{t('auth.forgotTitle')}</Text>
        <Text style={[styles.sub, { color: themeColors.textSecondary }]}>{t('auth.forgotSub')}</Text>

        <TextInput
          style={[styles.input, { color: themeColors.text, borderColor: themeColors.textSecondary, backgroundColor: themeColors.card }]}
          placeholder={t('auth.emailPlaceholder')}
          placeholderTextColor={themeColors.textSecondary}
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <TouchableOpacity
          style={[styles.btn, { backgroundColor: themeColors.text }]}
          onPress={onSend}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color={themeColors.background} /> : <Text style={[styles.btnText, { color: themeColors.background }]}>{t('auth.send')}</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 24 }}>
          <Text style={{ color: themeColors.textSecondary, textAlign: 'center' }}>{t('auth.backToSignIn')}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'center' },
  inner: { paddingHorizontal: 24 },
  title: { fontSize: 26, fontWeight: '800', textAlign: 'center' },
  sub: { textAlign: 'center', marginTop: 8, marginBottom: 32 },
  input: { borderWidth: 1, borderRadius: 12, padding: 16, fontSize: 16, marginBottom: 12 },
  btn: { paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  btnText: { fontSize: 17, fontWeight: '800' },
});

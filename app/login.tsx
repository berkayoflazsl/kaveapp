import React, { useState, useEffect } from 'react';
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
import { Link, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

export default function LoginScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { signIn, session } = useAuth();
  const { themeColors } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session) {
      router.replace('/');
    }
  }, [session, router]);

  const onLogin = async () => {
    const e = email.trim();
    if (!e || !password) {
      Alert.alert(t('auth.missingFields'), t('auth.emailPasswordRequired'));
      return;
    }
    setLoading(true);
    const { error } = await signIn(e, password);
    setLoading(false);
    if (error) {
      Alert.alert(t('auth.signInFailed'), error.message || t('auth.signInError'));
      return;
    }
    router.replace('/');
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: themeColors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.inner}>
        <Text style={[styles.title, { color: themeColors.text }]}>{t('common.appName')}</Text>
        <Text style={[styles.sub, { color: themeColors.textSecondary }]}>{t('auth.signInTitle')}</Text>

        <TextInput
          style={[styles.input, { color: themeColors.text, borderColor: themeColors.textSecondary, backgroundColor: themeColors.card }]}
          placeholder={t('auth.emailPlaceholder')}
          placeholderTextColor={themeColors.textSecondary}
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={[styles.input, { color: themeColors.text, borderColor: themeColors.textSecondary, backgroundColor: themeColors.card }]}
          placeholder={t('common.password')}
          placeholderTextColor={themeColors.textSecondary}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          style={[styles.btn, { backgroundColor: themeColors.text }]}
          onPress={onLogin}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color={themeColors.background} /> : <Text style={[styles.btnText, { color: themeColors.background }]}>{t('auth.signIn')}</Text>}
        </TouchableOpacity>

        <Link href="/register" asChild>
          <TouchableOpacity style={styles.linkWrap}>
            <Text style={{ color: themeColors.textSecondary }}>{t('auth.noAccount')}</Text>
            <Text style={{ color: themeColors.text, fontWeight: '700' }}>{t('auth.signUp')}</Text>
          </TouchableOpacity>
        </Link>
        <Link href="/forgot-password" asChild>
          <TouchableOpacity style={styles.linkWrap}>
            <Text style={{ color: themeColors.textSecondary, textDecorationLine: 'underline' }}>{t('auth.forgotLink')}</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'center' },
  inner: { paddingHorizontal: 24 },
  title: { fontSize: 32, fontWeight: '800', textAlign: 'center', fontStyle: 'italic' },
  sub: { textAlign: 'center', marginTop: 8, marginBottom: 32 },
  input: { borderWidth: 1, borderRadius: 12, padding: 16, fontSize: 16, marginBottom: 12 },
  btn: { paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  btnText: { fontSize: 17, fontWeight: '800' },
  linkWrap: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
});

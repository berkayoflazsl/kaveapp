import { Stack } from 'expo-router';
import { I18nextProvider } from 'react-i18next';
import { ActivityIndicator, View } from 'react-native';
import { TokenProvider } from '../contexts/TokenContext';
import { AuthProvider } from '../contexts/AuthContext';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';
import { LocaleProvider, useLocale } from '../contexts/LocaleContext';
import i18n from '../lib/i18n';

function RootStack() {
  const { themeColors } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: themeColors.background }}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'none',
          contentStyle: {
            backgroundColor: themeColors.background,
          },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="forgot-password" />
        <Stack.Screen name="tokens" />
        <Stack.Screen name="history" />
        <Stack.Screen name="settings" />
      </Stack>
    </View>
  );
}

function LocaleAndTokens() {
  const { ready } = useLocale();
  const { themeColors } = useTheme();

  if (!ready) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: themeColors.background,
        }}
      >
        <ActivityIndicator size="large" color={themeColors.text} />
      </View>
    );
  }

  return (
    <TokenProvider>
      <RootStack />
    </TokenProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <I18nextProvider i18n={i18n}>
          <LocaleProvider>
            <LocaleAndTokens />
          </LocaleProvider>
        </I18nextProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

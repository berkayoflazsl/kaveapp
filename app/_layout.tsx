import { Stack } from 'expo-router';
import { TokenProvider } from '../contexts/TokenContext';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';
import { useEffect } from 'react';
import { View } from 'react-native';

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
        <Stack.Screen name="tokens" />
      </Stack>
    </View>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <TokenProvider>
        <RootStack />
      </TokenProvider>
    </ThemeProvider>
  );
}

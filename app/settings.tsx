import { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import { SUPPORTED_LOCALES, type SupportedLocale } from '../constants/supportedLocales';
import { useLocale, type LocalePreference } from '../contexts/LocaleContext';

function languageLabel(resolvedI18nLang: string, code: string) {
  try {
    return new Intl.DisplayNames([resolvedI18nLang || 'en'], { type: 'language' }).of(code) ?? code;
  } catch {
    return code;
  }
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { themeColors } = useTheme();
  const { t, i18n } = useTranslation();
  const { preference, setPreference } = useLocale();

  const displayLang = i18n.resolvedLanguage || i18n.language || 'en';

  const onPick = useCallback(
    (p: LocalePreference) => {
      void setPreference(p);
    },
    [setPreference]
  );

  const rows = useMemo(
    () => SUPPORTED_LOCALES.map((code) => ({ code, label: languageLabel(displayLang, code) })),
    [displayLang]
  );

  const isDeviceSelected = preference === 'device';
  const selectedCode: SupportedLocale | null = preference === 'device' ? null : preference;

  return (
    <View style={[styles.wrap, { backgroundColor: themeColors.background }]}>
      <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.background }}>
        <View
          style={[
            styles.header,
            {
              borderBottomColor: themeColors.text,
              paddingTop: Platform.OS === 'android' ? Math.max(insets.top, 12) : insets.top,
            },
          ]}
        >
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={{ color: themeColors.text, fontSize: 16, fontWeight: '600' }}>
              {t('common.back')}
            </Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: themeColors.text }]}>{t('settings.title')}</Text>
          <View style={{ width: 60 }} />
        </View>

        <Text style={[styles.section, { color: themeColors.textSecondary }]}>{t('settings.languageSection')}</Text>

        <ScrollView contentContainerStyle={styles.list} keyboardShouldPersistTaps="handled">
          <TouchableOpacity
            style={[
              styles.row,
              { backgroundColor: themeColors.card, borderColor: isDeviceSelected ? themeColors.text : themeColors.textSecondary },
            ]}
            onPress={() => onPick('device')}
            activeOpacity={0.75}
          >
            <Text style={[styles.rowTitle, { color: themeColors.text }]}>{t('settings.systemLanguage')}</Text>
            {isDeviceSelected ? <Text style={{ color: themeColors.text }}>✓</Text> : null}
          </TouchableOpacity>

          {rows.map(({ code, label }) => {
            const selected = !isDeviceSelected && selectedCode === code;
            return (
              <TouchableOpacity
                key={code}
                style={[
                  styles.row,
                  { backgroundColor: themeColors.card, borderColor: selected ? themeColors.text : themeColors.textSecondary },
                ]}
                onPress={() => onPick(code as SupportedLocale)}
                activeOpacity={0.75}
              >
                <View style={styles.rowText}>
                  <Text style={[styles.rowTitle, { color: themeColors.text }]}>{label}</Text>
                  <Text style={{ color: themeColors.textSecondary, fontSize: 12 }}>{code.toUpperCase()}</Text>
                </View>
                {selected ? <Text style={{ color: themeColors.text }}>✓</Text> : null}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  section: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', paddingHorizontal: 20, marginTop: 16, marginBottom: 8 },
  list: { paddingHorizontal: 16, paddingBottom: 32 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  rowText: { flex: 1, marginRight: 8 },
  rowTitle: { fontSize: 16, fontWeight: '600' },
});

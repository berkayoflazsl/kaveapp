import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Platform,
  SafeAreaView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { API_URL } from '../constants/config';
import { authHeaders } from '../lib/api';

type Reading = {
  id: number;
  type: string;
  content: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

export default function HistoryScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { session, signOut } = useAuth();
  const { themeColors } = useTheme();
  const [readings, setReadings] = useState<Reading[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch(`${API_URL}/api/readings?limit=50`, {
        headers: { ...authHeaders(session) },
      });
      if (res.status === 401) {
        await signOut();
        router.replace('/login');
        return;
      }
      if (!res.ok) {
        setErr(t('history.loadError'));
        return;
      }
      const j = await res.json();
      setReadings(j.readings || []);
    } catch {
      setErr(t('history.connectionError'));
    } finally {
      setLoading(false);
    }
  }, [session, signOut, t]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return (
    <View style={{ flex: 1, backgroundColor: themeColors.background }}>
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
            <Text style={{ color: themeColors.text, fontSize: 16, fontWeight: '600' }}>← {t('common.back')}</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: themeColors.text }]}>{t('history.title')}</Text>
          <View style={{ width: 60 }} />
        </View>
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={themeColors.text} />
          </View>
        ) : err ? (
          <Text style={{ color: themeColors.textSecondary, textAlign: 'center', marginTop: 24 }}>{err}</Text>
        ) : readings.length === 0 ? (
          <Text style={{ color: themeColors.textSecondary, textAlign: 'center', marginTop: 24 }}>{t('history.empty')}</Text>
        ) : (
          <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
            {readings.map((r) => (
              <View
                key={r.id}
                style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.textSecondary }]}
              >
                <Text style={[styles.type, { color: themeColors.textSecondary }]}>{r.type}</Text>
                <Text style={[styles.date, { color: themeColors.textSecondary }]}>
                  {new Date(r.created_at).toLocaleString('tr-TR')}
                </Text>
                <Text style={[styles.content, { color: themeColors.text }]} numberOfLines={6}>
                  {r.content || '—'}
                </Text>
              </View>
            ))}
          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  center: { flex: 1, justifyContent: 'center' },
  card: { borderWidth: 1, borderRadius: 14, padding: 14, marginBottom: 12 },
  type: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  date: { fontSize: 11, marginTop: 4, marginBottom: 8 },
  content: { fontSize: 15, lineHeight: 22 },
});

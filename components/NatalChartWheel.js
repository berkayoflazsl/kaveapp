import React, { useMemo } from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { WebView } from 'react-native-webview';

/** @astrodraw/astrochart 3 — radix gezegen anahtarları; eklenen her anahtar kütüphanede yoksa yok sayılabilir */
const KAVE_TO_ASTROCHART = {
  sun: 'Sun',
  moon: 'Moon',
  mercury: 'Mercury',
  venus: 'Venus',
  mars: 'Mars',
  jupiter: 'Jupiter',
  saturn: 'Saturn',
  uranus: 'Uranus',
  neptune: 'Neptune',
  pluto: 'Pluto',
  northNode: 'NNode',
  southNode: 'SNode',
  chiron: 'Chiron',
  lilith: 'Lilith',
  partOfFortune: 'Fortune',
  vertex: 'Vertex',
};

function toAstroChartData(chart) {
  if (!chart?.planets || !chart?.houses?.cusps) return null;
  const planets = {};
  for (const [key, data] of Object.entries(chart.planets)) {
    if (data?.longitude == null) continue;
    const ac = KAVE_TO_ASTROCHART[key];
    if (ac) planets[ac] = [data.longitude, data.speed ?? 0];
  }
  const cusps = (chart.houses.cusps || [])
    .slice(0, 12)
    .map((c) => (typeof c === 'object' ? c.longitude : c));
  if (cusps.length !== 12) return null;
  return { planets, cusps };
}

function buildChartHtml(data, isDark) {
  const bg = isDark ? '#1a1a1a' : '#ffffff';
  const textColor = isDark ? '#e0e0e0' : '#333333';
  return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: ${bg}; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
  </style>
</head>
<body>
  <div id="chart-root"></div>
  <script src="https://unpkg.com/@astrodraw/astrochart@3.0.2/dist/astrochart.js"><\/script>
  <script>
    try {
      var astro = typeof astrochart !== 'undefined' ? astrochart : (window.astrochart || self.astrochart);
      if (!astro || !astro.Chart) { document.body.innerHTML = '<p style="color:#888">Chart yüklenemedi</p>'; } else {
        var data = ${JSON.stringify(data)};
        var size = Math.min(window.innerWidth - 48, 320);
        var chart = new astro.Chart('chart-root', size, size, {
          COLOR_BACKGROUND: '${bg}',
          CIRCLE_COLOR: '${textColor}',
          LINE_COLOR: '${textColor}',
          POINTS_COLOR: '${textColor}',
          SIGNS_COLOR: '${textColor}',
          CUSPS_FONT_COLOR: '${textColor}',
          SYMBOL_AXIS_FONT_COLOR: '${textColor}',
          MARGIN: 20,
          SHOW_DIGNITIES_TEXT: false
        });
        var radix = chart.radix(data);
        radix.aspects();
      }
    } catch (e) { document.body.innerHTML = '<p style="color:#c00">' + (e.message || 'Hata') + '</p>'; }
  <\/script>
</body>
</html>`;
}

export default function NatalChartWheel({ chart, themeColors }) {
  const { width } = useWindowDimensions();
  const size = Math.min(width - 48, 320);
  const astroData = useMemo(() => toAstroChartData(chart), [chart]);
  const html = useMemo(
    () => (astroData ? buildChartHtml(astroData, themeColors?.background === '#0a0a0a' || themeColors?.background?.startsWith('#1')) : ''),
    [astroData, themeColors?.background]
  );

  if (!chart?.planets) return null;
  if (!astroData) {
    return (
      <View style={[styles.container, { backgroundColor: themeColors?.card || '#1E1E1E' }]}>
        <Text style={[styles.title, { color: themeColors?.text }]}>⭐ Yıldız Haritan</Text>
        <Text style={[styles.fallback, { color: themeColors?.textSecondary }]}>Harita hesaplanıyor…</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: themeColors?.card || '#1E1E1E' }]}>
      <Text style={[styles.title, { color: themeColors?.text }]}>⭐ Yıldız Haritan</Text>
      <WebView
        source={{ html }}
        style={[styles.webview, { width: size, height: size }]}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        originWhitelist={['*']}
        javaScriptEnabled
        domStorageEnabled
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  webview: {
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  fallback: {
    fontSize: 14,
    marginVertical: 24,
  },
});

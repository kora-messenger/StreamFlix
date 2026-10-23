import React from 'react';
import {
  Image, StyleSheet, Text, View, useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { GradientButton, Wordmark } from '../components/ui';
import { FeatureBolt, FeatureClapper, FeatureDevices, FeatureHeart } from '../components/icons';

/**
 * Welcome onboarding — rebuilt on a pure flex column.
 * The cinematic TV scene is the full-screen background; the content flows
 * top-to-bottom and the two flexible spacers (45:34 ratio, from the mock)
 * absorb any screen size, so nothing is positioned by percentages anymore.
 * Fixed layout, no scrolling.
 */
export default function WelcomeScreen() {
  const nav = useNavigation<any>();
  const { width: W } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const logoSize = Math.max(72, Math.round(W * 0.19));
  const wordmarkSize = Math.max(38, Math.round(W * 0.115));
  const features = [
    { icon: <FeatureClapper size={Math.max(24, Math.round(W * 0.062))} />, label: 'Thousands of\nMovies & Shows' },
    { icon: <FeatureDevices size={Math.max(24, Math.round(W * 0.062))} />, label: 'Watch on\nAny Device' },
    { icon: <FeatureBolt size={Math.max(24, Math.round(W * 0.062))} />, label: 'High Quality\nStreaming' },
    { icon: <FeatureHeart size={Math.max(24, Math.round(W * 0.062))} />, label: 'Personalized\nJust for You' },
  ];

  return (
    <View style={styles.root}>
      <Image
        source={require('../assets/img/welcome_hero_full.png')}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />

      <View style={styles.body}>
        {/* spacer above the logo — collapses first on short screens */}
        <View style={{ flexGrow: 45 }} />

        <Image
          source={require('../assets/img/logo_splash.png')}
          style={{ width: logoSize, height: logoSize }}
          resizeMode="contain"
        />
        <View style={{ marginTop: 16, alignItems: 'center' }}>
          <Wordmark size={wordmarkSize} />
        </View>
        <Text style={[styles.tag, { marginTop: 14 }]}>Your Movies. Your Way.</Text>
        <Text style={styles.desc}>
          Discover, stream and enjoy the best movies, TV shows and more — all in one place.
        </Text>

        {/* four equal-width feature cells; separators are real borders */}
        <View style={styles.grid}>
          {features.map((f, i) => (
            <View key={i} style={[styles.cell, i > 0 ? styles.cellSep : null]}>
              {f.icon}
              <Text style={styles.cellText}>{f.label}</Text>
            </View>
          ))}
        </View>

        {/* spacer between features and the CTA */}
        <View style={{ flexGrow: 34 }} />

        <GradientButton
          label="Get Started"
          onPress={() => nav.navigate('CreateAccount')}
          height={52}
          fontSize={16}
          style={styles.cta}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#050505' },
  body: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingTop: 10,
    paddingBottom: 18,
  },
  tag: { color: '#ffffff', fontSize: 17, marginTop: 16, fontWeight: '400', textAlign: 'center' },
  desc: {
    color: '#B1B4C5', fontSize: 15, lineHeight: 22, fontWeight: '300',
    textAlign: 'center', marginTop: 18, maxWidth: '82%',
  },
  grid: { flexDirection: 'row', alignSelf: 'stretch', marginTop: 32 },
  cell: { flex: 1, alignItems: 'center', paddingHorizontal: 2 },
  cellSep: { borderLeftWidth: 1, borderLeftColor: 'rgba(255,255,255,0.10)' },
  cellText: {
    color: 'rgba(255,255,255,0.82)', fontSize: 13, lineHeight: 18,
    textAlign: 'center', fontWeight: '500', marginTop: 12,
  },
  cta: { alignSelf: 'stretch', marginBottom: 8 + 10, marginHorizontal: 20 },
});

import React from 'react';
import { Image, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { GradientButton, Wordmark } from '../components/ui';
import { FeatureBolt, FeatureClapper, FeatureDevices, FeatureHeart } from '../components/icons';

/**
 * Welcome onboarding — 100% mock fidelity (2026-10-24 rebuild).
 *
 * The cinematic TV scene is a TOP hero (~45% of the screen, fading into the
 * dark #010214 background), NOT a full-screen backdrop. Every element sits
 * at its measured mock percentage of screen height:
 *   logo 44.2% | wordmark 54.2% | tagline 61.2% | description 66.4%
 *   feature row 73.7% | CTA 84.8% | page dots 93.8%
 * Fixed layout, no scrolling, sizes scale with screen width (mock is
 * 512x1024: sizes here are W x 0.0xx of that reference).
 */
const MOCK_BG = '#010214';

export default function WelcomeScreen() {
  const nav = useNavigation<any>();
  const { width: W, height: H } = useWindowDimensions();

  const logoSize = Math.round(W * 0.186);
  const wordmarkSize = Math.round(W * 0.105);
  const iconSize = Math.round(W * 0.058);
  const iconLabel = Math.max(9.5, Math.round(W * 0.0235 * 2) / 2);
  const ctaHeight = Math.round(W * 0.117);
  const dot = Math.max(6.5, Math.round(W * 0.019));
  const dotGap = Math.round(W * 0.035);

  const features = [
    { icon: <FeatureClapper size={iconSize} />, label: 'Thousands of\nMovies & Shows' },
    { icon: <FeatureDevices size={iconSize} />, label: 'Watch on\nAny Device' },
    { icon: <FeatureBolt size={iconSize} />, label: 'High Quality\nStreaming' },
    { icon: <FeatureHeart size={iconSize} />, label: 'Personalized\nJust for You' },
  ];

  return (
    <View style={[styles.root, { height: H, width: W }]}>
      {/* top hero — fades into the background */}
      <Image
        source={require('../assets/img/welcome_hero_top.png')}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: Math.round(H * 0.45) }}
        resizeMode="cover"
      />

      {/* brand mark */}
      <Image
        source={require('../assets/img/logo_splash.png')}
        style={{ position: 'absolute', top: H * 0.442, alignSelf: 'center', width: logoSize, height: logoSize }}
        resizeMode="contain"
      />
      <View style={{ position: 'absolute', top: H * 0.542, alignSelf: 'center', alignItems: 'center' }}>
        <Wordmark size={wordmarkSize} />
      </View>

      {/* tagline + description */}
      <Text style={[styles.tag, { top: H * 0.612, fontSize: Math.round(W * 0.046) }]}>
        Your Movies. Your Way.
      </Text>
      <Text style={[styles.desc, { top: H * 0.664, maxWidth: W * 0.66, fontSize: Math.max(12, Math.round(W * 0.03)) }]}>
        Discover, stream and enjoy the best movies, TV shows and more — all in one place.
      </Text>

      {/* four feature cells with thin separators */}
      <View style={[styles.grid, { top: H * 0.737, paddingHorizontal: Math.round(W * 0.03) }]}>
        {features.map((f, i) => (
          <View key={i} style={[styles.cell, i > 0 ? styles.cellSep : null]}>
            {f.icon}
            <Text style={[styles.cellText, { fontSize: iconLabel, marginTop: Math.round(W * 0.012) }]}>{f.label}</Text>
          </View>
        ))}
      </View>

      {/* CTA */}
      <GradientButton
        label="Get Started"
        onPress={() => nav.navigate('CreateAccount')}
        height={ctaHeight}
        fontSize={Math.max(14, Math.round(W * 0.035))}
        style={{ position: 'absolute', top: H * 0.848, left: Math.round(W * 0.088), right: Math.round(W * 0.088) }}
      />

      {/* page dots — first active */}
      <View style={[styles.dots, { top: H * 0.938, gap: dotGap }]}>
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            style={[styles.dot, { width: dot, height: dot, borderRadius: dot / 2, backgroundColor: i === 0 ? '#7C26CD' : '#2A2C5C' }]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: MOCK_BG },
  tag: {
    position: 'absolute', alignSelf: 'center', color: '#ffffff',
    fontWeight: '500', letterSpacing: 0.2, textAlign: 'center',
  },
  desc: {
    position: 'absolute', alignSelf: 'center', color: '#B0B3C6', fontWeight: '300',
    lineHeight: 22, textAlign: 'center',
  },
  grid: { position: 'absolute', left: 0, right: 0, flexDirection: 'row' },
  cell: { flex: 1, alignItems: 'center', paddingHorizontal: 2 },
  cellSep: { borderLeftWidth: 1, borderLeftColor: 'rgba(255,255,255,0.10)' },
  cellText: { color: 'rgba(255,255,255,0.82)', lineHeight: 14, textAlign: 'center', fontWeight: '500' },
  dots: { position: 'absolute', alignSelf: 'center', flexDirection: 'row', alignItems: 'center' },
  dot: {},
});

import React from 'react';
import {
  Image, ScrollView, StyleSheet, Text, View, useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { GradientButton, Wordmark } from '../components/ui';
import { FeatureBolt, FeatureClapper, FeatureDevices, FeatureHeart } from '../components/icons';

export default function WelcomeScreen() {
  const nav = useNavigation<any>();
  const { width: W, height: H } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  // Calibrated to the design mockup (512x1024): positions as fractions of
  // screen height, sizes scale from screen width so it matches on every device.
  const k = W / 512;
  const logoSize = Math.round(k * 99);
  const wordmarkSize = Math.round(k * 40);
  const tagSize = Math.max(10.5, k * 14);
  const tagSpacing = k * 3.3;
  const descSize = Math.max(11, k * 15);
  const iconSize = Math.round(k * 31);
  const labelSize = Math.max(10, k * 11);
  const btnHeight = Math.max(50, Math.round(k * 60));
  const btnText = Math.max(15, Math.round(k * 18));

  const features = [
    { icon: <FeatureClapper size={iconSize} />, label: 'Thousands of\nMovies & Shows' },
    { icon: <FeatureDevices size={iconSize} />, label: 'Watch on\nAny Device' },
    { icon: <FeatureBolt size={iconSize} />, label: 'High Quality\nStreaming' },
    { icon: <FeatureHeart size={iconSize} />, label: 'Personalized\nJust for You' },
  ];

  return (
    <View style={styles.root}>
      {/* Cinematic TV scene is the full-screen background; the UI sits on top of it */}
      <Image
        source={require('../assets/img/welcome_hero_full.png')}
        style={{ position: 'absolute', top: 0, left: 0, width: W, height: H }}
        resizeMode="cover"
      />

      <ScrollView
        style={styles.body}
        contentContainerStyle={{
          alignItems: 'center',
          paddingTop: H * 0.328,
          paddingBottom: insets.bottom + 14,
        }}
        showsVerticalScrollIndicator={false}
        bounces={false}
        keyboardShouldPersistTaps="handled"
      >
        <Image
          source={require('../assets/img/logo_splash.png')}
          style={{ width: logoSize, height: logoSize }}
          resizeMode="contain"
        />

        <View style={{ marginTop: H * 0.127 }}>
          <Wordmark size={wordmarkSize} />
        </View>

        <Text style={[styles.tag, { marginTop: H * 0.023, fontSize: tagSize, letterSpacing: tagSpacing }]}>
          Your Movies. Your Way.
        </Text>

        <Text style={[styles.desc, { marginTop: H * 0.03, fontSize: descSize, lineHeight: descSize * 1.5, maxWidth: W * 0.66 }]}>
          Discover, stream and enjoy the best movies, TV shows and more — all in one place.
        </Text>

        <View style={[styles.grid, { marginTop: H * 0.044, marginHorizontal: W * 0.123 }]}>
          {features.map((f, i) => (
            <View key={i} style={[styles.cell, { width: W * 0.185 }]}>
              {f.icon}
              <Text style={[styles.cellText, { fontSize: labelSize, lineHeight: labelSize * 1.3, marginTop: Math.round(k * 13) }]}>
                {f.label}
              </Text>
            </View>
          ))}
        </View>

        <GradientButton
          label="Get Started"
          onPress={() => nav.navigate('CreateAccount')}
          height={btnHeight}
          fontSize={btnText}
          style={{ marginTop: H * 0.045, alignSelf: 'stretch', marginHorizontal: W * 0.086 }}
        />

        <View style={[styles.dots, { marginTop: H * 0.033 }]}>
          <View style={[styles.dotActive, { width: W * 0.014, height: W * 0.015 }]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#050505' },
  body: { flex: 1 },
  tag: { color: '#e6e8ff', fontWeight: '500' },
  desc: { color: '#a0a6bb', textAlign: 'center' },
  grid: { flexDirection: 'row', alignSelf: 'stretch', justifyContent: 'space-between' },
  cell: { alignItems: 'center' },
  cellText: { color: '#e0e3f5', textAlign: 'center' },
  dots: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#2e3346', marginHorizontal: 5 },
  dotActive: { borderRadius: 4, backgroundColor: '#5E24ED', marginHorizontal: 5 },
});

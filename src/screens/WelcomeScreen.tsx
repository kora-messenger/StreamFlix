import React from 'react';
import {
  Image, StyleSheet, Text, View, useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { GradientButton, Wordmark } from '../components/ui';
import { FeatureBolt, FeatureClapper, FeatureDevices, FeatureHeart } from '../components/icons';

const features = [
  { icon: <FeatureClapper />, label: 'Thousands of\nMovies & Shows' },
  { icon: <FeatureDevices />, label: 'Watch on\nAny Device' },
  { icon: <FeatureBolt />, label: 'High Quality\nStreaming' },
  { icon: <FeatureHeart />, label: 'Personalized\nJust for You' },
];

export default function WelcomeScreen() {
  const nav = useNavigation<any>();
  const { width: W, height: H } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const brandSize = Math.round(W * 0.148);

  return (
    <View style={styles.root}>
      {/* Hero — top ~53% of the screen, fading into the background */}
      <View style={{ height: H * 0.535 }}>
        <Image
          source={require('../assets/img/welcome_hero_faded.png')}
          style={{ flex: 1, width: W }}
          resizeMode="cover"
        />
      </View>

      <View style={[styles.body, { marginTop: -H * 0.05, paddingHorizontal: W * 0.085, paddingBottom: insets.bottom + H * 0.022 }]}>
        <Image
          source={require('../assets/img/logo_splash.png')}
          style={{ width: brandSize, height: brandSize }}
          resizeMode="contain"
        />
        <View style={{ marginTop: H * 0.008 }}>
          <Wordmark size={Math.round(H * 0.042)} width={Math.round(W * 0.46)} />
        </View>
        <Text style={[styles.tag, { marginTop: H * 0.004 }]}>Your Movies. Your Way.</Text>

        <Text style={[styles.desc, { marginTop: H * 0.018, maxWidth: W * 0.78 }]}>
          Discover, stream and enjoy the best movies, TV shows and more — all in one place.
        </Text>

        <View style={[styles.grid, { marginTop: H * 0.032 }]}>
          {features.map((f, i) => (
            <View key={i} style={styles.cell}>
              {f.icon}
              <Text style={styles.cellText}>{f.label}</Text>
            </View>
          ))}
        </View>

        <GradientButton
          label="Get Started"
          onPress={() => nav.navigate('CreateAccount')}
          style={{ marginTop: H * 0.055 }}
        />

        <View style={[styles.dots, { marginTop: H * 0.033 }]}>
          <View style={[styles.dotActive, { width: W * 0.048 }]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#050505' },
  body: { flex: 1, alignItems: 'center' },
  tag: { color: '#e6e8ff', fontSize: 14, letterSpacing: 3.2, marginTop: 4 },
  desc: { color: '#a0a6bb', fontSize: 15.5, lineHeight: 23, textAlign: 'center' },
  grid: { flexDirection: 'row', alignSelf: 'stretch', justifyContent: 'space-between' },
  cell: { width: '23%', alignItems: 'center' },
  cellText: { color: '#e0e3f5', fontSize: 11.5, lineHeight: 16, textAlign: 'center', marginTop: 10 },
  dots: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#2e3346', marginHorizontal: 5 },
  dotActive: { height: 8, borderRadius: 4, backgroundColor: '#5E24ED', marginHorizontal: 5 },
});

import React from 'react';
import {
  Image, StyleSheet, Text, View, useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { GradientButton, Wordmark } from '../components/ui';
import { FeatureBolt, FeatureClapper, FeatureDevices, FeatureHeart } from '../components/icons';

export default function WelcomeScreen() {
  const nav = useNavigation<any>();
  const { width: W, height: H } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  // Measured from the reference mockup (512x1024): logo at 33% height,
  // wordmark ~55%, tagline ~62%, desc ~66%, icons ~74%, button ~85%.
  const k = W / 512;
  // professional app sizes (sp), mock used for layout only
  const logoSize = Math.max(72, Math.round(k * 99));
  const wordmarkSize = Math.max(38, Math.round(k * 56));
  const tagSize = 17;
  const tagSpacing = k * 0.2;
  const descSize = 15;
  const iconSize = Math.max(24, Math.round(k * 30));
  const labelSize = 13;
  const btnHeight = 52;
  const btnText = 16;

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

      <View
        style={[
          styles.body,
          { alignItems: 'center', paddingTop: H * 0.451, paddingBottom: insets.bottom + H * 0.012 },
        ]}
      >
        <Image
          source={require('../assets/img/logo_splash.png')}
          style={{ width: logoSize, height: logoSize }}
          resizeMode="contain"
        />

        <View style={{ marginTop: H * 0.012 }}>
          <Wordmark size={wordmarkSize} />
        </View>

        <Text style={[styles.tag, { marginTop: H * 0.018, fontSize: tagSize, letterSpacing: tagSpacing }]}>
          Your Movies. Your Way.
        </Text>

        <Text style={[styles.desc, { marginTop: H * 0.022, fontSize: descSize, lineHeight: descSize * 1.5, maxWidth: W * 0.8 }]}>
          Discover, stream and enjoy the best movies, TV shows and more — all in one place.
        </Text>

        <View style={[styles.grid, { marginTop: H * 0.034, marginHorizontal: W * 0.030 }]}>
          {features.map((f, i) => (
            <View key={i} style={[styles.cell, { width: W * 0.235 }]}>
              {f.icon}
              <Text style={[styles.cellText, { fontSize: labelSize, lineHeight: labelSize * 1.3, marginTop: Math.round(k * 13) }]}>
                {f.label}
              </Text>
            </View>
          ))}
          {/* thin vertical separators between the four columns, like the reference */}
          <View style={[styles.sep, { left: '25%', top: '18%', height: '64%' }]} />
          <View style={[styles.sep, { left: '50%', top: '18%', height: '64%' }]} />
          <View style={[styles.sep, { left: '75%', top: '18%', height: '64%' }]} />
        </View>

        <GradientButton
          label="Get Started"
          onPress={() => nav.navigate('CreateAccount')}
          height={btnHeight}
          fontSize={btnText}
          style={{ marginTop: H * 0.036, alignSelf: 'stretch', marginHorizontal: W * 0.086 }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#050505' },
  body: { flex: 1 },
  tag: { color: '#ffffff', fontWeight: '400' },
  desc: { color: '#B1B4C5', textAlign: 'center', fontWeight: '300' },
  grid: { flexDirection: 'row', alignSelf: 'stretch', justifyContent: 'space-between' },
  cell: { alignItems: 'center' },
  cellText: { color: 'rgba(255,255,255,0.82)', textAlign: 'center', fontWeight: '500' },
  sep: { position: 'absolute', width: 1, backgroundColor: 'rgba(255,255,255,0.10)' },
});

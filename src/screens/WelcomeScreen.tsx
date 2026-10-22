import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { GradientButton, Lockup } from '../components/ui';
import { FeatureBolt, FeatureClapper, FeatureDevices, FeatureHeart } from '../components/icons';
import { colors } from '../theme/tokens';

const features = [
  { icon: <FeatureClapper />, label: 'Thousands of\nMovies & Shows' },
  { icon: <FeatureDevices />, label: 'Watch on\nAny Device' },
  { icon: <FeatureBolt />, label: 'High Quality\nStreaming' },
  { icon: <FeatureHeart />, label: 'Personalized\nJust for You' },
];

export default function WelcomeScreen() {
  const nav = useNavigation<any>();
  const { width } = useWindowDimensions();
  return (
    <View style={styles.root}>
      <ScrollView bounces={false} showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.heroWrap}>
          <Image
            source={require('../assets/img/welcome_hero_faded.png')}
            style={{ width, height: width * 1.02 }}
            resizeMode="cover"
          />
        </View>
        <View style={styles.body}>
          <Lockup scale={0.72} />
          <Text style={styles.desc}>
            Discover, stream and enjoy the best movies, TV shows and more — all in one place.
          </Text>
          <View style={styles.grid}>
            {features.map((f, i) => (
              <View key={i} style={styles.cell}>
                {f.icon}
                <Text style={styles.cellText}>{f.label}</Text>
              </View>
            ))}
          </View>
          <GradientButton label="Get Started" onPress={() => nav.navigate('CreateAccount')} style={{ marginTop: 26 }} />
          <View style={styles.dots}>
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  heroWrap: { marginTop: -34 },
  body: { flex: 1, alignItems: 'center', paddingHorizontal: 26, paddingBottom: 20, marginTop: -8 },
  desc: {
    color: colors.textMuted, fontSize: 14.5, lineHeight: 22, textAlign: 'center',
    marginTop: 16, maxWidth: 320,
  },
  grid: { flexDirection: 'row', marginTop: 26, alignSelf: 'stretch', justifyContent: 'space-between' },
  cell: { width: '23%', alignItems: 'center' },
  cellText: { color: '#e9ecff', fontSize: 11.5, lineHeight: 16, textAlign: 'center', marginTop: 10 },
  dots: { flexDirection: 'row', alignItems: 'center', marginTop: 24 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#33395a', marginHorizontal: 5 },
  dotActive: { width: 20, backgroundColor: '#00d2ff' },
});

import React, { useEffect } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Svg, { Path, Rect, Defs, LinearGradient as SvgGrad, Stop } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import { Spinner, Wordmark } from '../components/ui';
import { posters } from '../data/mock';
import { colors } from '../theme/tokens';

const FilmArc = ({ flip = false }: { flip?: boolean }) => (
  <View style={[styles.arc, flip ? { bottom: 0, right: 0, transform: [{ rotate: '180deg' }] } : { top: 0, left: 0 }]}>
    <Svg width={230} height={230} viewBox="0 0 230 230">
      <Defs>
        <SvgGrad id="fa" x1="0" y1="1" x2="1" y2="0">
          <Stop offset="0" stopColor="#00d2ff" />
          <Stop offset="1" stopColor="#b300ff" />
        </SvgGrad>
        <SvgGrad id="fb" x1="0" y1="1" x2="1" y2="0">
          <Stop offset="0" stopColor="#00d2ff" stopOpacity="0.35" />
          <Stop offset="1" stopColor="#b300ff" stopOpacity="0.35" />
        </SvgGrad>
      </Defs>
      <Path d="M226 4C226 100 132 200 4 226" stroke="url(#fb)" strokeWidth="16" fill="none" strokeLinecap="round" />
      <Path d="M226 4C226 100 132 200 4 226" stroke="url(#fa)" strokeWidth="4" fill="none" strokeLinecap="round" />
      <Path d="M226 18C226 98 142 186 18 226" stroke="#cfd6ff" strokeOpacity="0.75" strokeWidth="6" fill="none" strokeDasharray="7 11" strokeLinecap="round" />
    </Svg>
  </View>
);

export default function SplashScreen() {
  const nav = useNavigation<any>();
  const fade = new Animated.Value(0);
  useEffect(() => {
    Animated.sequence([
      Animated.timing(fade, { toValue: 1, duration: 650, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.delay(1500),
    ]).start();
    const t = setTimeout(() => nav.reset({ index: 0, routes: [{ name: 'Welcome' }] }), 2400);
    return () => clearTimeout(t);
  }, []);
  const { width } = useWindowDimensions();
  const cols = 5;
  const rows = 8;
  const tile = width / cols;
  return (
    <View style={styles.root}>
      <View style={StyleSheet.absoluteFill}>
        {(Array.from({ length: rows }) as number[]).map((_, r) => (
          <View key={r} style={{ flexDirection: 'row' }}>
            {(Array.from({ length: cols }) as number[]).map((_, c) => (
              <Image key={c} source={posters[(r * cols + c) % posters.length]} style={{ width: tile, height: tile * 1.5, opacity: 0.17 }} />
            ))}
          </View>
        ))}
      </View>
      <FilmArc />
      <FilmArc flip />
      <Animated.View style={[styles.center, { opacity: fade }]}>
        <Image source={require('../assets/img/logo_soft.png')} style={styles.logo} resizeMode="contain" />
        <Wordmark size={46} width={310} />
        <Text style={styles.tag}>Your Movies. Your Way.</Text>
        <View style={{ marginTop: 26 }}>
          <Spinner size={52} />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgNavy, overflow: 'hidden' },
  arc: { position: 'absolute' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  logo: { width: 150, height: 150 },
  tag: { color: '#e6e8ff', fontSize: 15, fontWeight: '400', letterSpacing: 3.5, marginTop: 4 },
});

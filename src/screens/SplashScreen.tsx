import React, { useEffect } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Svg, { Path, Defs, LinearGradient as SvgGrad, Stop } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import { Spinner, Wordmark } from '../components/ui';
import { resumeSession } from '../core/auth/authService';

const grad = (id: string, a: string, b: string) => (
  <Defs>
    <SvgGrad id={id} x1="0" y1="1" x2="1" y2="0">
      <Stop offset="0" stopColor={a} />
      <Stop offset="1" stopColor={b} />
    </SvgGrad>
  </Defs>
);

/** One sweeping translucent film-strip ribbon: soft band + gradient edge + sprocket holes. */
const Ribbon = ({ d, id }: { d: string; id: string }) => (
  <>
    <Path d={d} stroke={`url(#band${id})`} strokeWidth={34} fill="none" strokeLinecap="round" opacity={0.16} />
    <Path d={d} stroke={`url(#edge${id})`} strokeWidth={3} fill="none" strokeLinecap="round" opacity={0.9} />
    <Path d={d} stroke="#e8ecff" strokeWidth={5.5} fill="none" strokeLinecap="round" opacity={0.7} strokeDasharray="9 15" />
  </>
);

export default function SplashScreen() {
  const nav = useNavigation<any>();
  const fade = new Animated.Value(0);
  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
    const t = setTimeout(async () => {
    const user = await resumeSession();
    nav.reset({ index: 0, routes: [{ name: user ? 'Home' : 'Welcome' }] });
  }, 2400);
    return () => clearTimeout(t);
  }, []);
  const { width: W, height: H } = useWindowDimensions();
  // Top ribbon: sweeps from center-left up over the top-center. Bottom ribbon mirrors it.
  const topD = `M ${-0.10 * W} ${0.36 * H} C ${0.14 * W} ${0.07 * H} ${0.34 * W} ${0.015 * H} ${0.62 * W} ${-0.06 * H}`;
  const botD = `M ${1.10 * W} ${0.64 * H} C ${0.86 * W} ${0.93 * H} ${0.66 * W} ${0.985 * H} ${0.38 * W} ${1.06 * H}`;
  return (
    <View style={styles.root}>
      <Image source={require('../assets/img/splash_bg.png')} style={StyleSheet.absoluteFill} resizeMode="cover" />
      <Svg width={W} height={H} style={StyleSheet.absoluteFill}>
        {grad('bandA', '#00a2ff', '#d633ff')}
        {grad('edgeA', '#00c6ff', '#b44bff')}
        {grad('bandB', '#d633ff', '#00a2ff')}
        {grad('edgeB', '#b44bff', '#00c6ff')}
        <Ribbon d={topD} id="A" />
        <Ribbon d={botD} id="B" />
      </Svg>
      <Animated.View style={[styles.center, { opacity: fade }]}>
        <Image source={require('../assets/img/logo_splash.png')} style={styles.logo} resizeMode="contain" />
        <Wordmark size={46} />
        <Text style={styles.tag}>Your Movies. Your Way.</Text>
        <View style={{ marginTop: 26 }}>
          <Spinner size={52} />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#05070a' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  logo: { width: 168, height: 168 },
  tag: { color: '#e6e8ff', fontSize: 15, fontWeight: '400', letterSpacing: 3.5, marginTop: 4 },
});

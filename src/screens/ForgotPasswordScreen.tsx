import React, { useState } from 'react';
import {
  Image, Pressable, StyleSheet, Text, View, useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { Field, GradientButton, GradientText } from '../components/ui';
import { BackIcon, LockIcon, MailIcon } from '../components/icons';
import { gradients } from '../theme/tokens';
import * as auth from '../core/auth/authService';

/**
 * Forgot Password — fixed layout (no scrolling), positions measured from the
 * 683x1024 design mock as percentages of the screen height. The background is
 * the same login poster collage treated full-screen: visible band in the
 * upper-middle, darker at the sides, fading to black toward the bottom.
 */
export default function ForgotPasswordScreen() {
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const { width: W, height: H } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const k = W / 683;
  const padX = W * 0.095;

  const [email, setEmail] = useState(route.params?.email || '');
  const [err, setErr] = useState('');
  const [bad, setBad] = useState(false);

  const send = async () => {
    const e = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e)) {
      setBad(true); setErr('Enter a valid email address'); return;
    }
    const exists = await auth.emailExists(e);
    if (!exists) {
      setBad(true); setErr('No account found with this email'); return;
    }
    nav.navigate('NewPassword', { email: e });
  };

  const circleSize = Math.round(k * 186);

  return (
    <View style={styles.root}>
      <Image source={require('../assets/img/forgot_bg.png')} style={StyleSheet.absoluteFill} resizeMode="cover" />

      {/* back arrow */}
      <Pressable onPress={() => nav.goBack()} hitSlop={10} style={{ position: 'absolute', top: insets.top + 8, left: W * 0.059 }}>
        <BackIcon size={Math.round(k * 26)} color="#fff" />
      </Pressable>

      {/* No worries! */}
      <Text style={[styles.h1, { top: H * 0.199, fontSize: Math.round(k * 38) }]}>No worries!</Text>

      {/* padlock in glowing gradient ring */}
      <View style={{ position: 'absolute', top: H * 0.369 - circleSize / 2, left: (W - circleSize) / 2, width: circleSize, height: circleSize }}>
        <View style={[StyleSheet.absoluteFill, { borderRadius: circleSize / 2, overflow: 'hidden' }]}>
          <LinearGradient
            colors={['rgba(108,99,255,0.45)', 'rgba(0,210,255,0.38)']}
            style={StyleSheet.absoluteFill}
          />
        </View>
        <LinearGradient
          colors={gradients.brand}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ flex: 1, margin: Math.round(k * 15), borderRadius: (circleSize - k * 30) / 2, padding: Math.round(k * 7) }}
        >
          <View style={{ flex: 1, borderRadius: (circleSize - k * 44) / 2, backgroundColor: '#0b0f2b', alignItems: 'center', justifyContent: 'center' }}>
            <LockIcon size={Math.round(k * 54)} color="#fff" />
          </View>
        </LinearGradient>
      </View>

      {/* Forgot Password? */}
      <View style={[styles.titleRow, { top: H * 0.479 }]}>
        <Text style={[styles.titleWhite, { fontSize: Math.round(k * 50) }]}>Forgot </Text>
        <GradientText text="Password?" size={Math.round(k * 50)} width={Math.round(k * 252)} height={Math.round(k * 64)} weight="800" colorsArr={gradients.brand} />
      </View>

      {/* subtitle */}
      <Text style={[styles.sub, {
        top: H * 0.545, width: W * 0.655, left: W * 0.1725,
        fontSize: Math.round(k * 15.5), lineHeight: Math.round(k * 29),
      }]}>
        Enter your email address and we&apos;ll send you a code to reset your password.
      </Text>

      {/* email field */}
      <View style={{ position: 'absolute', top: H * 0.632, left: padX, right: padX }}>
        <Field
          h={Math.round(k * 66)}
          fs={Math.round(k * 16)}
          error={bad}
          icon={<MailIcon size={Math.round(k * 24)} />}
          placeholder="Email address"
          value={email}
          onChangeText={v => { setEmail(v); setBad(false); setErr(''); }}
          keyboardType="email-address"
          autoCapitalize="none"
          focused
          style={styles.fieldBox}
        />
      </View>

      {/* error line */}
      <Text style={[styles.errorLine, { top: H * 0.709, left: padX, right: padX, fontSize: Math.round(k * 12.5) }]} numberOfLines={1}>{err}</Text>

      {/* Send Reset Link */}
      <View style={{ position: 'absolute', top: H * 0.745, left: padX, right: padX }}>
        <GradientButton label="Send Reset Code" height={Math.round(k * 68)} fontSize={Math.round(k * 21)} onPress={send} />
      </View>

      {/* footer */}
      <View style={[styles.footer, { top: H * 0.87 }]}>
        <Text style={[styles.footText, { fontSize: Math.round(k * 16) }]}>Remember your password? </Text>
        <Pressable onPress={() => nav.goBack()}>
          <Text style={[styles.footLink, { fontSize: Math.round(k * 16) }]}>Sign In</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#05070a' },
  h1: { position: 'absolute', left: 0, right: 0, color: '#fff', fontWeight: '800', textAlign: 'center' },
  titleRow: { position: 'absolute', left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  titleWhite: { color: '#fff', fontWeight: '800' },
  sub: { position: 'absolute', color: '#b0b0b0', textAlign: 'center' },
  fieldBox: { backgroundColor: '#0b1026', borderColor: '#232a44' },
  errorLine: { position: 'absolute', color: '#ff4d6d', textAlign: 'center', fontWeight: '600' },
  footer: { position: 'absolute', left: 0, right: 0, flexDirection: 'row', justifyContent: 'center' },
  footText: { color: '#d8dce8' },
  footLink: { color: '#00D2FF', fontWeight: '700' },
});

import React, { useState } from 'react';
import {
  Alert, Image, Pressable, StyleSheet, Text, View, useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { Field, GradientButton, GradientText } from '../components/ui';
import { BackIcon, LockIcon } from '../components/icons';
import { gradients } from '../theme/tokens';
import * as auth from '../core/auth/authService';

/**
 * New Password — step 2 of the forgot-password flow, same visual language:
 * poster background, back arrow, padlock in the gradient ring, split title,
 * two password fields, gradient button with arrow.
 */
export default function NewPasswordScreen() {
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const { width: W, height: H } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const k = W / 683;
  const padX = W * 0.095;
  const email: string = route.params?.email || '';
  const code: string = route.params?.code || '';

  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [err, setErr] = useState('');
  const [bad, setBad] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState(false);

  const update = async () => {
    setBusy(true);
    const r = await auth.resetPassword({ email, code, password: pw, confirm: pw2 });
    setBusy(false);
    if (!r.ok) {
      setBad({ [r.field || 'password']: true });
      setErr(r.message || 'Something went wrong');
      return;
    }
    Alert.alert('Password reset', 'Your new password is ready — log in with it.', [
      { text: 'OK', onPress: () => nav.reset({ index: 0, routes: [{ name: 'Login' }] }) },
    ]);
  };

  const circleSize = Math.round(k * 186);

  return (
    <View style={styles.root}>
      <Image source={require('../assets/img/forgot_bg.png')} style={StyleSheet.absoluteFill} resizeMode="cover" />

      {/* back arrow */}
      <Pressable onPress={() => nav.goBack()} hitSlop={10} style={{ position: 'absolute', top: insets.top + 8, left: W * 0.059 }}>
        <BackIcon size={Math.round(k * 26)} color="#fff" />
      </Pressable>

      {/* padlock in glowing gradient ring */}
      <View style={{ position: 'absolute', top: H * 0.309 - circleSize / 2, left: (W - circleSize) / 2, width: circleSize, height: circleSize }}>
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

      {/* Reset Password? */}
      <View style={[styles.titleRow, { top: H * 0.419 }]}>
        <Text style={[styles.titleWhite, { fontSize: Math.round(k * 50) }]}>Reset </Text>
        <GradientText text="Password?" size={Math.round(k * 50)} width={Math.round(k * 252)} height={Math.round(k * 64)} weight="800" colorsArr={gradients.brand} />
      </View>

      {/* subtitle */}
      <Text style={[styles.sub, {
        top: H * 0.485, width: W * 0.655, left: W * 0.1725,
        fontSize: Math.round(k * 15.5), lineHeight: Math.round(k * 29),
      }]}>
        Choose a new password to secure your account.
      </Text>

      {/* password fields */}
      <View style={{ position: 'absolute', top: H * 0.552, left: padX, right: padX, gap: Math.round(k * 16) }}>
        <Field
          h={Math.round(k * 60)} fs={Math.round(k * 16)} error={bad.password}
          icon={<LockIcon size={Math.round(k * 22)} />} placeholder="New password" value={pw}
          onChangeText={v => { setPw(v); setBad({}); setErr(''); }} secure style={styles.fieldBox}
        />
        <Field
          h={Math.round(k * 60)} fs={Math.round(k * 16)} error={bad.confirm}
          icon={<LockIcon size={Math.round(k * 22)} />} placeholder="Confirm new password" value={pw2}
          onChangeText={v => { setPw2(v); setBad({}); setErr(''); }} secure style={styles.fieldBox}
        />
      </View>

      {/* error line */}
      <Text style={[styles.errorLine, { top: H * 0.727, left: padX, right: padX, fontSize: Math.round(k * 12.5) }]} numberOfLines={1}>{err}</Text>

      {/* Update Password */}
      <View style={{ position: 'absolute', top: H * 0.762, left: padX, right: padX }}>
        <GradientButton label={busy ? 'Updating…' : 'Update Password'} height={Math.round(k * 68)} fontSize={Math.round(k * 21)} onPress={update} />
      </View>

      {/* footer */}
      <View style={[styles.footer, { top: H * 0.885 }]}>
        <Pressable onPress={() => nav.reset({ index: 0, routes: [{ name: 'Login' }] })}>
          <Text style={[styles.footLink, { fontSize: Math.round(k * 16) }]}>Back to Sign In</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#05070a' },
  titleRow: { position: 'absolute', left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  titleWhite: { color: '#fff', fontWeight: '800' },
  sub: { position: 'absolute', color: '#b0b0b0', textAlign: 'center' },
  fieldBox: { backgroundColor: '#0b1026', borderColor: '#232a44' },
  errorLine: { position: 'absolute', color: '#ff4d6d', textAlign: 'center', fontWeight: '600' },
  footer: { position: 'absolute', left: 0, right: 0, flexDirection: 'row', justifyContent: 'center' },
  footLink: { color: '#00D2FF', fontWeight: '700' },
});

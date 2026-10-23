import React, { useState } from 'react';
import {
  Image, Pressable, StyleSheet, Text, View, useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { GradientButton, GradientText, Lockup, TopToast, Field, useToast } from '../components/ui';
import { BackIcon, CheckIcon, LockIcon } from '../components/icons';
import { gradients } from '../theme/tokens';
import * as auth from '../core/auth/authService';

/**
 * New Password (Reset Password) — final step of the forgot-password flow.
 * Flat deep-navy background (#07091A) with the designed top aurora (indigo
 * corner glow + sweeping blue ribbon) and the login bottom wave glow.
 * Positions measured from the 683x1024 design reference.
 */
export default function NewPasswordScreen() {
  const nav = useNavigation<any>();
  const toast = useToast();
  const route = useRoute<any>();
  const { width: W, height: H } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const k = W / 683;
  const padX = W * 0.095;
  const email: string = route.params?.email || '';

  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  // live requirement checks
  const rules = [
    { label: 'At least 8 characters', ok: pw.length >= 8 },
    { label: 'Includes a letter (A-Z / a-z)', ok: /[A-Za-z]/.test(pw) },
    { label: 'Includes a number (0-9)', ok: /\d/.test(pw) },
    { label: 'Includes a symbol (!@#$%^&*)', ok: /[^A-Za-z0-9]/.test(pw) },
  ];

  const update = async () => {
    if (rules.some(r => !r.ok)) {
      setErr('Please meet all the password requirements');
      return;
    }
    if (pw !== pw2) {
      setErr("Passwords don't match");
      return;
    }
    setBusy(true);
    const r = await auth.completeReset({ email, password: pw, confirm: pw2 });
    setBusy(false);
    if (!r.ok) {
      setErr(r.message || 'Something went wrong');
      return;
    }
    toast('Your new password is ready — log in with it.', 'info');
    nav.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  const circleSize = Math.max(96, Math.round(k * 124));

  return (
    <View style={styles.root}>
      {/* designed top aurora: indigo corner glow + sweeping blue ribbon */}
      <Image
        source={require('../assets/img/reset_top_aurora.png')}
        style={StyleSheet.absoluteFill}
        resizeMode="stretch"
      />

      {/* back arrow */}
      <Pressable onPress={() => nav.goBack()} hitSlop={10} style={{ position: 'absolute', top: insets.top + 8, left: W * 0.051 }}>
        <BackIcon size={26} color="#fff" />
      </Pressable>

      {/* logo + wordmark lockup */}
      <View style={{ position: 'absolute', top: H * 0.088, left: 0, right: 0, alignItems: 'center' }}>
        <Lockup scale={k * 0.88} />
      </View>

      {/* padlock in the glowing blue-violet ring */}
      <View style={{ position: 'absolute', top: H * 0.226 - circleSize / 2, left: (W - circleSize) / 2, width: circleSize, height: circleSize }}>
        <View style={[StyleSheet.absoluteFill, { borderRadius: circleSize / 2, overflow: 'hidden' }]}>
          <LinearGradient colors={['rgba(108,99,255,0.35)', 'rgba(0,210,255,0.28)']} style={StyleSheet.absoluteFill} />
        </View>
        <LinearGradient
          colors={gradients.brand}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ flex: 1, margin: 8, borderRadius: (circleSize - 16) / 2, padding: 4 }}
        >
          <View style={{ flex: 1, borderRadius: (circleSize - k * 24) / 2, backgroundColor: '#070B22', alignItems: 'center', justifyContent: 'center' }}>
            <LockIcon size={44} color="#fff" />
          </View>
        </LinearGradient>
      </View>

      {/* Reset Password */}
      <View style={[styles.titleRow, { top: H * 0.310 }]}>
        <Text style={[styles.titleWhite, { fontSize: 34 }]}>Reset </Text>
        <GradientText text="Password" size={34} width={168} height={42} weight="800" colorsArr={gradients.brand} />
      </View>

      {/* instruction */}
      <Text style={[styles.sub, {
        top: H * 0.378, left: W * 0.14, right: W * 0.14,
        fontSize: 15, lineHeight: 22,
      }]}>
        Enter your new password below. Make sure it's at least 8 characters long and includes a mix of letters, numbers and symbols.
      </Text>

      {/* password fields */}
      <View style={{ position: 'absolute', top: H * 0.472, left: padX, right: padX, gap: 12 }}>
        <Field
          h={52} fs={16}
          icon={<LockIcon size={22} />} placeholder="New password" placeholderTextColor="#6575A3"
          value={pw} onChangeText={v => { setPw(v); setErr(''); }} secure style={styles.fieldBox}
        />
        <Field
          h={52} fs={16}
          icon={<LockIcon size={22} />} placeholder="Confirm new password" placeholderTextColor="#6575A3"
          value={pw2} onChangeText={v => { setPw2(v); setErr(''); }} secure style={styles.fieldBox}
        />
      </View>

      {/* requirements checklist */}
      <View style={{ position: 'absolute', top: H * 0.651, left: W * 0.123, gap: 10 }}>
        {rules.map(r => (
          <View key={r.label} style={styles.ruleRow}>
            <CheckIcon size={18} color={r.ok ? '#0386FF' : '#39406B'} />
            <Text style={[styles.ruleText, { fontSize: 14 }, r.ok ? { color: '#C9D5F0' } : null]}>{r.label}</Text>
          </View>
        ))}
      </View>

      {/* errors pop up at the top */}
      <TopToast message={err} />

      {/* Reset Password button */}
      <View style={{ position: 'absolute', top: H * 0.781, left: padX, right: padX }}>
        <GradientButton label={busy ? 'Resetting…' : 'Reset Password'} height={56} fontSize={16} onPress={update} />
      </View>

      {/* footer */}
      <View style={[styles.footer, { top: H * 0.883 }]}>
        <Pressable onPress={() => nav.reset({ index: 0, routes: [{ name: 'Login' }] })}>
          <Text style={[styles.footLink, { fontSize: 15 }]}>Back to Login</Text>
        </Pressable>
      </View>

      {/* designed bottom wave: same blue-violet glow as the login screen */}
      <Image
        source={require('../assets/img/login_bottom_glow.png')}
        style={{ position: 'absolute', bottom: 0, width: W, height: H * 0.132 }}
        resizeMode="stretch"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#07091A' },
  titleRow: { position: 'absolute', left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  titleWhite: { color: '#fff', fontWeight: '800' },
  sub: { position: 'absolute', color: '#8E97B8', textAlign: 'center' },
  fieldBox: { backgroundColor: '#0A1026', borderColor: '#0D296B', borderRadius: 14 },
  ruleRow: { flexDirection: 'row', alignItems: 'center', gap: 13 },
  ruleText: { color: '#9AA6C8' },
  footer: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  footLink: { color: '#8094C2', fontWeight: '600' },
});

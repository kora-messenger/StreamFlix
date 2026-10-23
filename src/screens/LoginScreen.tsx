import React, { useState } from 'react';
import {
  Image, Pressable, StyleSheet, Text, View, useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import {
  Field, GradientButton, GradientText, Lockup, OrDivider, OutlineButton, TopToast, useToast } from '../components/ui';
import { AppleLogo, CheckIcon, GoogleG, LockIcon, MailIcon } from '../components/icons';

import * as auth from '../core/auth/authService';

/**
 * FIXED layout (no scrolling). Positions are percentages of the screen height,
 * measured from the 512x1024 design reference. Pure black background; the top
 * image is dark at the center and fades to black at both sides.
 */
export default function LoginScreen() {
  const nav = useNavigation<any>();
  const toast = useToast();
  const { width: W, height: H } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const k = W / 512;
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [remember, setRemember] = useState(true);
  const [banner, setBanner] = useState('');
  const [bad, setBad] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState(false);
  const fix = (field: string) => () => { setBanner(''); setBad(b => ({ ...b, [field]: false })); };

  const doLogin = async () => {
    setBusy(true);
    const chk = await auth.checkPassword(email, pw);
    if (!chk.ok) {
      setBusy(false);
      setBanner(chk.message || 'Something went wrong');
      setBad({ [chk.field || 'email']: true });
      return;
    }
    const r = await auth.requestCode(email, 'login');
    setBusy(false);
    if (!r.ok) {
      setBanner(r.message || 'Could not send the login code');
      return;
    }
    toast('Login code sent to your email.', 'info');
    nav.navigate('EnterCode', { email: email.trim().toLowerCase(), purpose: 'login', password: pw, remember });
  };

  const googleCode = async () => {
    const e = email.trim().toLowerCase();
    if (!/^([^\s@]+@[^\s@]+\.[^\s@]{2,})$/.test(e)) {
      setBanner('Enter your email address first — we send a Google sign-in code to it.');
      setBad({ email: true });
      return;
    }
    const r = await auth.requestCode(e, 'google');
    if (!r.ok) { setBanner(r.message || 'Could not send the code'); return; }
    toast('Google sign-in code sent to your email.', 'info');
    nav.navigate('EnterCode', { email: e, purpose: 'google' });
  };

  const fieldPad = W * 0.092;   // fields + buttons: x 47-464 of 512
  const textPad = W * 0.164;    // heading + sub: x 84 of 512
  const fieldH = Math.round(k * 46);
  const fieldGap = Math.round(k * 14);
  const fieldFs = Math.round(k * 14);
  const btnH = Math.round(k * 46);
  const socialH = Math.round(k * 42);

  return (
    <View style={[styles.root, { backgroundColor: '#000000' }]}>
      {/* darkened collage: visible at the center, fading to black on both sides */}
      <Image
        source={require('../assets/img/login_hero_fade.png')}
        style={{ position: 'absolute', top: 0, width: W, height: H * 0.285 }}
        resizeMode="cover"
      />
      {/* designed bottom glow: deep blue-violet rising from the bottom edge, purple-shifted left */}
      <Image
        source={require('../assets/img/login_bottom_glow.png')}
        style={{ position: 'absolute', bottom: 0, width: W, height: H * 0.132 }}
        resizeMode="stretch"
      />

      {/* logo + app name + tagline (one centered block) */}
      <View style={{ position: 'absolute', top: H * 0.098, left: 0, right: 0, alignItems: 'center' }}>
        <Lockup scale={1.05} />
      </View>

      {/* heading + sub (left-aligned in the reference) */}
      <View style={[styles.titleRow, { top: H * 0.246, left: textPad }]}>
        <Text style={[styles.title, { fontSize: Math.round(k * 40) }]}>Welcome </Text>
        <GradientText text="Back" size={Math.round(k * 40)} width={Math.round(k * 100)} height={Math.round(k * 48)} weight="800" colorsArr={['#3A78FF', '#A044FF']} />
      </View>
      <Text style={[styles.sub, { top: H * 0.30, left: textPad, width: W * 0.55, fontSize: Math.round(k * 16), lineHeight: Math.round(k * 22) }]}>
        Log in to continue watching your favorite movies and shows.
      </Text>

      {/* fields */}
      <View style={{ position: 'absolute', top: H * 0.373, left: fieldPad, right: fieldPad, gap: fieldGap }}>
        <Field h={fieldH} fs={fieldFs} error={bad.email} icon={<MailIcon />} placeholder="Email address" value={email} onChangeText={v => { setEmail(v); fix('email')(); }} keyboardType="email-address" autoCapitalize="none" focused />
        <Field h={fieldH} fs={fieldFs} error={bad.password} icon={<LockIcon />} placeholder="Password" value={pw} onChangeText={v => { setPw(v); fix('password')(); }} secure />
      </View>

      {/* remember / forgot */}
      <View style={[styles.rememberRow, { top: H * 0.505, left: fieldPad, right: fieldPad }]}>
        <Pressable style={styles.remember} onPress={() => setRemember(r => !r)}>
          <View style={[styles.check, remember ? styles.checkOn : null]}>
            {remember ? <CheckIcon size={14} /> : null}
          </View>
          <Text style={[styles.rememberText, { fontSize: Math.round(k * 13) }]}>Remember me</Text>
        </Pressable>
        <Pressable onPress={() => nav.navigate('ForgotPassword', { email })}><Text style={[styles.forgot, { fontSize: Math.round(k * 13) }]}>Forgot password?</Text></Pressable>
      </View>

      {/* validation message */}
      {/* errors pop up at the top */}
      <TopToast message={banner} />

      {/* log in button (arrow like the reference) */}
      <View style={{ position: 'absolute', top: H * 0.573, left: fieldPad, right: fieldPad }}>
        <GradientButton label={busy ? 'Logging in…' : 'Log In'} height={btnH} fontSize={Math.round(k * 17)} onPress={doLogin} />
      </View>

      {/* or divider */}
      <View style={{ position: 'absolute', top: H * 0.665, left: fieldPad, right: fieldPad }}>
        <OrDivider compact />
      </View>

      {/* social */}
      <View style={{ position: 'absolute', top: H * 0.70, left: fieldPad, right: fieldPad }}>
        <OutlineButton label="Continue with Google" icon={<GoogleG />} height={socialH} fontSize={Math.round(k * 14)} onPress={googleCode} />
      </View>
      <View style={{ position: 'absolute', top: H * 0.77, left: fieldPad, right: fieldPad }}>
        <OutlineButton label="Continue with Apple" icon={<AppleLogo />} height={socialH} fontSize={Math.round(k * 14)} />
      </View>

      {/* sign up row */}
      <View style={[styles.signRow, { top: H * 0.858 }]}>
        <Text style={[styles.signText, { fontSize: Math.round(k * 13) }]}>Don't have an account? </Text>
        <Pressable onPress={() => nav.navigate('CreateAccount')}>
          <Text style={[styles.signLink, { fontSize: Math.round(k * 14.5) }]}>Sign Up</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  titleRow: { position: 'absolute', flexDirection: 'row', alignItems: 'center' },
  title: { color: '#fff', fontWeight: '800', letterSpacing: -0.5 },
  sub: { position: 'absolute', color: '#9CA3AF' },
  rememberRow: { position: 'absolute', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  remember: { flexDirection: 'row', alignItems: 'center' },
  check: { width: 20, height: 20, borderRadius: 6, borderWidth: 1.5, borderColor: '#3a4268', alignItems: 'center', justifyContent: 'center' },
  checkOn: { backgroundColor: '#7B2CBF', borderColor: '#7B2CBF' },
  rememberText: { color: '#e4e6f5', marginLeft: 10 },
  forgot: { color: '#6C63FF', fontWeight: '600' },
  signRow: { position: 'absolute', left: 0, right: 0, flexDirection: 'row', justifyContent: 'center' },
  signText: { color: '#d7d9ea' },
  signLink: { color: '#6C63FF', fontWeight: '700' },
});

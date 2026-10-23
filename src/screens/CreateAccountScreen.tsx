import React, { useState } from 'react';
import {
  Image, Pressable, StyleSheet, Text, View, useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import {
  Field, GradientButton, GradientText, Lockup, OrDivider, OutlineButton, TopToast, useToast } from '../components/ui';
import { AppleLogo, BackIcon, GoogleG, LockIcon, MailIcon, UserIcon } from '../components/icons';
import { colors } from '../theme/tokens';
import * as auth from '../core/auth/authService';
import { googleSignInToken, isGoogleSdkReady } from '../core/auth/googleAuth';

/**
 * FIXED layout (no scrolling). Every element is positioned as a percentage of the
 * screen height, taken from the 512x1024 design reference.
 */
export default function CreateAccountScreen() {
  const nav = useNavigation<any>();
  const toast = useToast();
  const { width: W, height: H } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const k = W / 512;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [banner, setBanner] = useState('');
  const [bad, setBad] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState(false);

  const fix = (field: string) => () => { setBanner(''); setBad(b => ({ ...b, [field]: false })); };

  const createAccount = async () => {
    setBusy(true);
    const pre = await auth.precheckRegister({ fullName: name, email, password: pw, confirm: pw2 });
    if (!pre.ok) {
      setBusy(false);
      setBanner(pre.message || 'Something went wrong');
      setBad({ [pre.field || 'email']: true });
      return;
    }
    const r = await auth.requestCode(email, 'signup');
    setBusy(false);
    if (!r.ok) {
      setBanner(r.message || 'Could not send the verification code');
      return;
    }
    toast('Verification code sent to your email.', 'info');
    nav.navigate('EnterCode', { email: email.trim().toLowerCase(), purpose: 'signup', fullName: name, password: pw, confirm: pw2 });
  };

  const [gBusy, setGBusy] = useState(false);
  const [aBusy, setABusy] = useState(false);
  const appleSoon = async () => {
    if (aBusy) return;
    setABusy(true);
    await new Promise(r => { setTimeout(() => r(undefined), 900); });
    setABusy(false);
    toast('Apple sign-in is coming soon.', 'info');
  };
  const googleCode = async () => {
    if (gBusy) return;
    if (isGoogleSdkReady()) {
      setGBusy(true);   // logo -> spinner until the picker + verification finish
      try {
        const g = await googleSignInToken();
        if (!g.ok) { if (g.message) setBanner(g.message); return; }
        const r = await auth.googleTokenLogin(g.idToken!);
        if (!r.ok) { setBanner(r.message || 'Google sign-in failed. Try again.'); return; }
        nav.reset({ index: 0, routes: [{ name: 'Home' }] });
      } finally {
        setGBusy(false);
      }
      return;
    }
    // SDK not configured: fall back to the emailed Google code
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
  };;

  const padX = W * 0.102;
  // professional app sizes (dp/sp), mock used for layout only
  const fieldH = 50;
  const fieldGap = 12;
  const fieldFs = 16;
  const btnH = 52;
  const socialH = 48;

  /* compact vertical chain: the button sits directly under the field stack
     and everything below follows sequentially, so the legal footer never
     gets pushed off-screen. */
  const fieldsTop = H * 0.314;
  const stackH = 4 * fieldH + 3 * fieldGap;
  const btnTop = fieldsTop + stackH + H * 0.022;
  const orTop = btnTop + btnH + H * 0.024;
  const soc1Top = orTop + H * 0.026;
  const soc2Top = soc1Top + socialH + H * 0.03;
  const legalLH = 18;
  const legalBottom = insets.bottom + 10;
  const signBottom = legalBottom + legalLH * 2 + 12;

  return (
    <View style={styles.root}>
      {/* Spider-Man corner graphic, top-right, fading into the black bg */}
      <Image
        source={require('../assets/img/create_hero_corner.png')}
        style={[styles.hero, { width: W * 0.45, height: W * 0.39, top: -W * 0.062 }]}
        resizeMode="cover"
      />

      <Pressable hitSlop={14} onPress={() => nav.goBack()} style={[styles.back, { top: insets.top + H * 0.008, left: padX * 0.55 }]}>
        <BackIcon />
      </Pressable>

      {/* lockup + tagline */}
      <View style={{ position: 'absolute', top: H * 0.075, left: 0, right: 0, alignItems: 'center' }}>
        <Lockup scale={1.05} />
      </View>

      {/* heading + sub */}
      <View style={[styles.titleRow, { top: H * 0.202, left: padX }]}>
        <Text style={[styles.title, { fontSize: 32 }]}>Create Your </Text>
        <GradientText text="Account" size={32} width={175} height={40} weight="800" />
      </View>
      <Text style={[styles.sub, { top: H * 0.257, left: padX, width: W * 0.8, fontSize: 15, lineHeight: 22 }]}>
        Join StreamMax and get unlimited access to your favorite movies, TV shows and more.
      </Text>

      {/* fields */}
      <View style={{ position: 'absolute', top: fieldsTop, left: padX, right: padX, gap: fieldGap }}>
        <Field h={fieldH} fs={fieldFs} error={bad.name} icon={<UserIcon />} placeholder="Full name" value={name} onChangeText={v => { setName(v); fix('name')(); }}  />
        <Field h={fieldH} fs={fieldFs} error={bad.email} icon={<MailIcon />} placeholder="Email address" value={email} onChangeText={v => { setEmail(v); fix('email')(); }} keyboardType="email-address" autoCapitalize="none" />
        <Field h={fieldH} fs={fieldFs} error={bad.password} icon={<LockIcon />} placeholder="Password" value={pw} onChangeText={v => { setPw(v); fix('password')(); }} secure />
        <Field h={fieldH} fs={fieldFs} error={bad.confirm} icon={<LockIcon />} placeholder="Confirm password" value={pw2} onChangeText={v => { setPw2(v); fix('confirm')(); }} secure />
      </View>

      {/* primary button */}
      <View style={{ position: 'absolute', top: btnTop, left: padX, right: padX }}>
        <GradientButton label="Create Account" arrow={false} height={btnH} fontSize={16} onPress={createAccount} />
      </View>

      {/* or divider */}
      <View style={{ position: 'absolute', top: orTop, left: padX, right: padX }}>
        <OrDivider compact />
      </View>

      {/* social */}
      <View style={{ position: 'absolute', top: soc1Top, left: padX, right: padX }}>
        <OutlineButton label="Continue with Google" icon={<GoogleG />} loading={gBusy} height={socialH} fontSize={15} onPress={googleCode} />
      </View>
      <View style={{ position: 'absolute', top: soc2Top, left: padX, right: padX }}>
        <OutlineButton label="Continue with Apple" icon={<AppleLogo />} loading={aBusy} height={socialH} fontSize={15} onPress={appleSoon} />
      </View>

      {/* sign in + legal */}
      <View style={[styles.signRow, { bottom: signBottom }]}>
        <Text style={[styles.signText, { fontSize: 15 }]}>Already have an account? </Text>
        <Pressable onPress={() => nav.navigate('Login')}>
          <Text style={[styles.signLink, { fontSize: 16 }]}>Sign In</Text>
        </Pressable>
      </View>
      <Text style={[styles.legal, { bottom: legalBottom, fontSize: 13, lineHeight: legalLH }]}>
        By creating an account, you agree to our{'\n'}
        <Text style={styles.legalLink}>Terms of Service</Text>  •  <Text style={styles.legalLink}>Privacy Policy</Text>
      </Text>

      {/* errors pop up at the top */}
      <TopToast message={banner} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  hero: { position: 'absolute', top: 0, right: 0 },
  back: { position: 'absolute', width: 36, height: 36, justifyContent: 'center' },
  titleRow: { position: 'absolute', flexDirection: 'row', alignItems: 'center' },
  title: { color: '#fff', fontWeight: '800', letterSpacing: -0.3 },
  sub: { position: 'absolute', color: '#94a3b8' },
  signRow: { position: 'absolute', left: 0, right: 0, flexDirection: 'row', justifyContent: 'center' },
  signText: { color: '#d7d9ea' },
  signLink: { color: '#3b82f6', fontWeight: '600' },
  legal: { position: 'absolute', left: 0, right: 0, color: '#8a90a5', textAlign: 'center' },
  legalLink: { color: '#3b82f6' },
});

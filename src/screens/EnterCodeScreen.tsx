import React, { useEffect, useRef, useState } from 'react';
import {
  Image, Pressable, StyleSheet, Text, Vibration, View, useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { GradientText, Lockup, TopToast, useToast } from '../components/ui';
import { BackIcon, ClockIcon, MessageLockIcon } from '../components/icons';
import { gradients } from '../theme/tokens';
import * as auth from '../core/auth/authService';

/**
 * Enter Reset Code — fixed layout (no scrolling), positions measured from the
 * 683x1024 design mock as percentages of screen height. Same full-screen login
 * poster background as the Forgot Password screen.
 *
 * The 6 digits are typed on a CUSTOM in-app dark keypad at the bottom — the OS
 * keyboard never appears (no theme clash, no layout obstruction), and the code
 * auto-verifies the moment the sixth digit is entered.
 */
const CODE_LEN = 6;
const RESEND_SECONDS = 83; // mock shows 01:23

export default function EnterCodeScreen() {
  const nav = useNavigation<any>();
  const toast = useToast();
  const route = useRoute<any>();
  const { width: W, height: H } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const k = W / 683;
  const padX = W * 0.113;

  const email: string = route.params?.email || '';
  const purpose: 'reset' | 'signup' | 'login' | 'google' = route.params?.purpose || 'reset';
  const pending: { fullName?: string; password?: string; confirm?: string; remember?: boolean } = {
    fullName: route.params?.fullName, password: route.params?.password,
    confirm: route.params?.confirm, remember: route.params?.remember,
  };
  const [code, setCode] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [left, setLeft] = useState(RESEND_SECONDS);
  const [blink, setBlink] = useState(true);
  const submitting = useRef(false);

  useEffect(() => {
    const t = setInterval(() => setLeft(s => (s > 0 ? s - 1 : 0)), 1000);
    const b = setInterval(() => setBlink(v => !v), 530);
    return () => { clearInterval(t); clearInterval(b); };
  }, []);

  const mm = Math.floor(left / 60).toString().padStart(2, '0');
  const ss = (left % 60).toString().padStart(2, '0');

  const verify = async (full: string) => {
    if (submitting.current) return;
    submitting.current = true;
    setBusy(true);
    const v = await auth.checkCode(email, purpose, full);
    if (!v.ok) {
      setBusy(false);
      submitting.current = false;
      setCode('');
      setErr(v.message || 'Incorrect code. Please try again.');
      return;
    }
    if (purpose === 'reset') {
      nav.navigate('NewPassword', { email });
      return;
    }
    if (purpose === 'signup') {
      const r = await auth.register({
        fullName: pending.fullName || '', email, password: pending.password || '', confirm: pending.confirm || '',
      });
      if (r.ok) { nav.reset({ index: 0, routes: [{ name: 'Home' }] }); return; }
      setBusy(false); submitting.current = false;
      setErr(r.message || 'Could not create your account');
      return;
    }
    if (purpose === 'login') {
      const r = await auth.login({ email, password: pending.password || '', remember: !!pending.remember });
      if (r.ok) { nav.reset({ index: 0, routes: [{ name: 'Home' }] }); return; }
      setBusy(false); submitting.current = false;
      setErr(r.message || 'Could not sign you in');
      return;
    }
    // google
    const r = await auth.googleVerified(email);
    if (r.ok) { nav.reset({ index: 0, routes: [{ name: 'Home' }] }); return; }
    setBusy(false); submitting.current = false;
    setErr(r.message || 'Could not sign you in');
  };

  const press = (d: string) => {
    if (busy) return;
    Vibration.vibrate(8);
    const next = (code + d).slice(0, CODE_LEN);
    setCode(next);
    setErr('');
    if (next.length === CODE_LEN) verify(next);   // auto-verify on the final digit
  };

  const backspace = () => {
    if (busy) return;
    Vibration.vibrate(8);
    setCode(c => c.slice(0, -1));
    setErr('');
  };

  const resend = async () => {
    if (left > 0 || busy) return;
    const r = await auth.requestCode(email, purpose);
    if (!r.ok) { setErr(r.message || 'Could not resend the code'); return; }
    setCode(''); setErr('');
    setLeft(RESEND_SECONDS);
    toast('Code sent to your email.', 'info');
  };

  const gap = 10;
  const boxW = Math.floor((W * 0.88 - 5 * gap) / 6);
  const boxH = Math.round(boxW * 1.12);
  const circleSize = Math.round(k * 186);
  const active = code.length < CODE_LEN ? code.length : CODE_LEN - 1;

  // custom keypad geometry: four rows anchored above the safe area
  const keyH = Math.round(H * 0.062);
  const keyR = Math.round(keyH / 2.2);
  const keyGap = Math.round(H * 0.011);
  const keypadW = W - padX * 2;
  const keyW = Math.floor((keypadW - keyGap * 2) / 3);
  const keypadBottom = insets.bottom + Math.round(H * 0.014);
  const keypadH = keyH * 4 + keyGap * 3;
  const keypadTop = H - keypadBottom - keypadH;

  const Key = ({ label, onPress, dim, children }: { label?: string; onPress: () => void; dim?: boolean; children?: React.ReactNode }) => (
    <Pressable
      onPress={onPress}
      disabled={busy}
      style={({ pressed }) => [styles.key, {
        width: keyW, height: keyH, borderRadius: keyR,
        backgroundColor: dim ? 'rgba(16,20,42,0.35)' : pressed ? '#1a2145' : '#10142a',
        borderColor: dim ? 'transparent' : '#232b52',
        opacity: busy ? 0.6 : 1,
      }]}
    >
      {children || <Text style={[styles.keyText, { fontSize: Math.round(H * 0.026) }]}>{label}</Text>}
    </Pressable>
  );

  return (
    <View style={styles.root}>
      <Image source={require('../assets/img/forgot_bg.png')} style={StyleSheet.absoluteFill} resizeMode="cover" />

      {/* back arrow */}
      <Pressable onPress={() => nav.goBack()} hitSlop={10} style={{ position: 'absolute', top: insets.top + 8, left: W * 0.059 }}>
        <BackIcon size={Math.round(k * 26)} color="#fff" />
      </Pressable>

      {/* lockup: icon + StreamMax wordmark + tagline */}
      <View style={{ position: 'absolute', top: H * 0.104, left: 0, right: 0 }}>
        <Lockup scale={Math.max(0.75, k * 0.88)} />
      </View>

      {/* message bubble with padlock, in glowing gradient ring */}
      <View style={{ position: 'absolute', top: H * 0.300 - circleSize / 2, left: (W - circleSize) / 2, width: circleSize, height: circleSize }}>
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
            <MessageLockIcon size={Math.round(k * 74)} color="#fff" />
          </View>
        </LinearGradient>
      </View>

      {/* Enter Reset Code */}
      <View style={[styles.titleRow, { top: H * 0.395 }]}>
        <Text style={[styles.titleWhite, { fontSize: 34 }]}>Enter </Text>
        <GradientText text={purpose === 'reset' ? 'Reset Code' : 'Code'} size={34} width={purpose === 'reset' ? 230 : 110} height={42} weight="800" colorsArr={gradients.brand} />
      </View>

      {/* subtitle */}
      <Text style={[styles.sub, {
        top: H * 0.455, width: W * 0.84, left: W * 0.08,
        fontSize: 17, lineHeight: 26,
      }]}>
        We&apos;ve sent a 6-digit code to your email address.{'\n'}{purpose === 'reset' ? 'Enter the code below to reset your password.' : 'Enter the code below to continue.'}
      </Text>

      {/* six code boxes */}
      <View style={[styles.boxRow, { top: H * 0.535 - 20, paddingVertical: 20, gap }]}>
        {Array.from({ length: CODE_LEN }).map((_, i) => {
          const isActive = i === active;
          const box = (
            <View style={[styles.box, {
              width: boxW, height: boxH, borderRadius: Math.round(k * 16),
              borderColor: isActive ? 'transparent' : '#2d3348',
            }]}>
              <Text style={[styles.digit, { fontSize: 32 }]}>{code[i] || ''}</Text>
              {isActive && !code[i] && blink && <View style={[styles.cursor, { height: Math.round(k * 26) }]} />}
            </View>
          );
          if (!isActive) return <View key={i}>{box}</View>;
          return (
            <LinearGradient
              key={i}
              colors={gradients.brand}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={{ borderRadius: Math.round(k * 18), padding: Math.round(k * 2.5) }}
            >
              {box}
            </LinearGradient>
          );
        })}
      </View>

      {/* errors pop up at the top */}
      <TopToast message={err} />

      {/* custom dark keypad — the OS keyboard never opens on this screen */}
      <View style={[styles.keypad, { top: keypadTop, left: padX, right: padX, gap: keyGap }]}>
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(d => (
          <Key key={d} label={d} onPress={() => press(d)} />
        ))}
        <Key dim onPress={resend}>
          <View style={styles.auxWrap}>
            {left > 0 && <ClockIcon size={Math.round(H * 0.018)} color="#8f9bff" />}
            <Text style={[styles.keyAux, { fontSize: Math.round(H * 0.016), opacity: left > 0 ? 0.65 : 1 }]}>
              {left > 0 ? `${mm}:${ss}` : 'Resend'}
            </Text>
          </View>
        </Key>
        <Key label="0" onPress={() => press('0')} />
        <Key onPress={backspace}>
          <View style={styles.backWrap}>
            <BackIcon size={Math.round(H * 0.03)} color="#fff" />
          </View>
        </Key>
      </View>

      {busy && (
        <View style={[styles.verifying, { top: keypadTop + keypadH / 2 - 12 }]}>
          <Text style={styles.verifyingText}>Verifying…</Text>
        </View>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#05070a' },
  titleRow: { position: 'absolute', left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  titleWhite: { color: '#fff', fontWeight: '800' },
  sub: { position: 'absolute', color: '#b0b0b0', textAlign: 'center' },
  boxRow: { position: 'absolute', left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  box: { backgroundColor: '#0b1026', borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  digit: { color: '#fff', fontWeight: '700' },
  cursor: { position: 'absolute', width: 2, backgroundColor: '#fff', borderRadius: 1 },
  auxWrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  keypad: { position: 'absolute', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  key: { alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  keyText: { color: '#fff', fontWeight: '600' },
  keyAux: { color: '#8f9bff', fontWeight: '600', textAlign: 'center' },
  backWrap: { alignItems: 'center', justifyContent: 'center' },
  verifying: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  verifyingText: { color: '#fff', fontSize: 16, fontWeight: '600', opacity: 0.9 },
});

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
 * Enter Code — rebuilt on a flex column: back arrow, lockup, heading and code
 * boxes centered in the flexible middle, custom dark keypad anchored to the
 * bottom above the safe area. The OS keyboard never appears on this screen,
 * and the code auto-verifies the moment the sixth digit is typed.
 */
const CODE_LEN = 6;
const RESEND_SECONDS = 83; // 01:23

export default function EnterCodeScreen() {
  const nav = useNavigation<any>();
  const toast = useToast();
  const route = useRoute<any>();
  const { width: W } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const k = W / 683;

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
  const boxW = Math.floor((W - 56 - 5 * gap) / 6);
  const boxH = Math.round(boxW * 1.12);
  const circleSize = Math.round(k * 186);
  const active = code.length < CODE_LEN ? code.length : CODE_LEN - 1;

  const Key = ({ onPress, dim, children }: { onPress: () => void; dim?: boolean; children?: React.ReactNode }) => (
    <Pressable
      onPress={onPress}
      disabled={busy}
      style={({ pressed }) => [styles.key, dim && styles.keyDim, pressed && styles.keyPressed, busy && { opacity: 0.6 }]}
    >
      {children}
    </Pressable>
  );

  return (
    <View style={styles.root}>
      <Image source={require('../assets/img/forgot_bg.png')} style={StyleSheet.absoluteFill} resizeMode="cover" />

      {/* back arrow */}
      <Pressable onPress={() => nav.goBack()} hitSlop={10} style={{ position: 'absolute', top: insets.top + 12, left: 22, zIndex: 5 }}>
        <BackIcon size={Math.round(k * 26)} color="#fff" />
      </Pressable>

      {/* centered content above the keypad */}
      <View style={[styles.upper, { paddingTop: insets.top + 18, paddingBottom: 14 }]}>
        <View style={{ flexGrow: 1 }} />
        <Lockup scale={Math.max(0.78, k * 0.9)} />

        {/* message bubble with padlock, in glowing gradient ring */}
        <View style={{ width: circleSize, height: circleSize, marginTop: 26 }}>
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

        {/* heading */}
        <View style={styles.titleRow}>
          <Text style={styles.titleWhite}>Enter </Text>
          <GradientText
            text={purpose === 'reset' ? 'Reset Code' : 'Code'}
            size={32}
            width={purpose === 'reset' ? 215 : 105}
            height={40}
            weight="800"
            colorsArr={gradients.wordmark}
          />
        </View>
        <Text style={styles.sub}>
          We&apos;ve sent a 6-digit code to your email address.{'\n'}
          {purpose === 'reset' ? 'Enter the code below to reset your password.' : 'Enter the code below to continue.'}
        </Text>

        {/* six code boxes */}
        <View style={[styles.boxRow, { gap }]}>
          {Array.from({ length: CODE_LEN }).map((_, i) => {
            const isActive = i === active;
            const box = (
              <View style={[styles.box, isActive ? styles.boxActive : null, { width: boxW, height: boxH }]}>
                <Text style={styles.digit}>{code[i] || ''}</Text>
                {isActive && !code[i] && blink && <View style={styles.cursor} />}
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

        {/* resend countdown caption */}
        {left > 0 ? (
          <View style={styles.timerRow}>
            <ClockIcon size={16} color="#00D2FF" />
            <Text style={styles.timerText}>  Resend code in </Text>
            <Text style={styles.timerTime}>{mm}:{ss}</Text>
          </View>
        ) : null}

        {busy ? <Text style={styles.verifying}>Verifying…</Text> : null}

        <View style={{ flexGrow: 1 }} />
      </View>

      {/* errors pop up at the top */}
      <TopToast message={err} />

      {/* custom dark keypad — the OS keyboard never opens on this screen */}
      <View style={[styles.keypad, { paddingBottom: insets.bottom + 12 }]}>
        <View style={styles.keyRow}>
          <Key onPress={() => press('1')}><Text style={styles.keyText}>1</Text></Key>
          <Key onPress={() => press('2')}><Text style={styles.keyText}>2</Text></Key>
          <Key onPress={() => press('3')}><Text style={styles.keyText}>3</Text></Key>
        </View>
        <View style={styles.keyRow}>
          <Key onPress={() => press('4')}><Text style={styles.keyText}>4</Text></Key>
          <Key onPress={() => press('5')}><Text style={styles.keyText}>5</Text></Key>
          <Key onPress={() => press('6')}><Text style={styles.keyText}>6</Text></Key>
        </View>
        <View style={styles.keyRow}>
          <Key onPress={() => press('7')}><Text style={styles.keyText}>7</Text></Key>
          <Key onPress={() => press('8')}><Text style={styles.keyText}>8</Text></Key>
          <Key onPress={() => press('9')}><Text style={styles.keyText}>9</Text></Key>
        </View>
        <View style={styles.keyRow}>
          {/* aux key: resend countdown, then Resend */}
          <Key onPress={resend} dim>
            <View style={styles.auxWrap}>
              {left > 0 ? <ClockIcon size={16} color="#8f9bff" /> : null}
              <Text style={[styles.keyAux, left > 0 ? styles.keyAuxDim : null]}>
                {left > 0 ? `${mm}:${ss}` : 'Resend'}
              </Text>
            </View>
          </Key>
          <Key onPress={() => press('0')}><Text style={styles.keyText}>0</Text></Key>
          <Key onPress={backspace}>
            <View style={styles.backWrap}>
              <BackIcon size={22} color="#fff" />
            </View>
          </Key>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#05070a' },
  upper: { flex: 1, alignItems: 'center', paddingHorizontal: 28 },
  titleRow: { flexDirection: 'row', alignItems: 'center', marginTop: 30 },
  titleWhite: { color: '#fff', fontSize: 32, fontWeight: '800', letterSpacing: -0.5 },
  sub: { color: '#b0b0b0', fontSize: 15, lineHeight: 23, textAlign: 'center', marginTop: 10 },
  boxRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 30 },
  box: { backgroundColor: '#0b1026', borderWidth: 2, borderColor: '#2d3348', borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  boxActive: { borderWidth: 2, borderColor: 'transparent' },
  digit: { color: '#fff', fontSize: 26, fontWeight: '700' },
  cursor: { position: 'absolute', width: 2, height: 26, backgroundColor: '#fff', borderRadius: 1 },
  timerRow: { flexDirection: 'row', alignItems: 'center', marginTop: 16 },
  timerText: { color: '#d8dce8', fontSize: 14 },
  timerTime: { color: '#00D2FF', fontSize: 14, fontWeight: '600' },
  verifying: { color: '#fff', fontSize: 15, fontWeight: '600', marginTop: 14, opacity: 0.9 },
  keypad: { paddingHorizontal: 28 },
  keyRow: { flexDirection: 'row', gap: 12 },
  key: {
    flex: 1, height: 58, borderRadius: 16, marginVertical: 6,
    backgroundColor: '#10142a', borderWidth: 1, borderColor: '#232b52',
    alignItems: 'center', justifyContent: 'center',
  },
  keyDim: { backgroundColor: 'rgba(16,20,42,0.35)', borderColor: 'transparent' },
  keyPressed: { backgroundColor: '#1a2145' },
  keyText: { color: '#fff', fontSize: 24, fontWeight: '600' },
  keyAux: { color: '#8f9bff', fontSize: 15, fontWeight: '600', textAlign: 'center' },
  keyAuxDim: { opacity: 0.65 },
  auxWrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  backWrap: { alignItems: 'center', justifyContent: 'center' },
});

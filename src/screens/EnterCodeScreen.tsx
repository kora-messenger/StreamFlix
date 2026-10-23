import React, { useEffect, useRef, useState } from 'react';
import {
  Alert, Image, Pressable, StyleSheet, Text, TextInput, View, useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { GradientButton, GradientText, Lockup, OrDivider, OutlineButton, TopToast } from '../components/ui';
import { AppleLogo, BackIcon, ClockIcon, GoogleG, MessageLockIcon } from '../components/icons';
import { gradients } from '../theme/tokens';
import * as auth from '../core/auth/authService';

/**
 * Enter Reset Code — fixed layout (no scrolling), positions measured from the
 * 683x1024 design mock as percentages of screen height. Same full-screen login
 * poster background as the Forgot Password screen.
 */
const CODE_LEN = 6;
const RESEND_SECONDS = 83; // mock shows 01:23

export default function EnterCodeScreen() {
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const { width: W, height: H } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const k = W / 683;
  const padX = W * 0.113;

  const email: string = route.params?.email || '';
  const [code, setCode] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [left, setLeft] = useState(RESEND_SECONDS);
  const [focused, setFocused] = useState(true);
  const input = useRef<any>(null);

  useEffect(() => {
    const t = setInterval(() => setLeft(s => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);

  const mm = Math.floor(left / 60).toString().padStart(2, '0');
  const ss = (left % 60).toString().padStart(2, '0');

  const next = async () => {
    if (code.length < CODE_LEN || busy) return;
    setBusy(true);
    const v = await auth.verifyResetCode(email, code);
    setBusy(false);
    if (!v.ok) { setErr(v.message || 'Incorrect code. Please try again.'); return; }
    nav.navigate('NewPassword', { email, code });
  };

  const resend = async () => {
    if (left > 0) return;
    const c = await auth.sendResetCode(email);
    setCode(''); setErr('');
    setLeft(RESEND_SECONDS);
    Alert.alert('Your reset code', `${c}\n\nThis code expires in 10 minutes.`);
  };

  const boxW = Math.round(k * 71);
  const boxH = Math.round(k * 78);
  const gap = Math.round(k * 12);
  const circleSize = Math.round(k * 186);
  const active = focused && code.length < CODE_LEN ? code.length : CODE_LEN - 1;

  return (
    <View style={styles.root}>
      <Image source={require('../assets/img/forgot_bg.png')} style={StyleSheet.absoluteFill} resizeMode="cover" />

      {/* hidden digit capture */}
      <TextInput
        ref={input}
        value={code}
        onChangeText={t => { setCode(t.replace(/\D/g, '').slice(0, CODE_LEN)); setErr(''); }}
        keyboardType="number-pad"
        maxLength={CODE_LEN}
        autoFocus
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={styles.hiddenInput}
        textContentType="oneTimeCode"
      />

      {/* back arrow */}
      <Pressable onPress={() => nav.goBack()} hitSlop={10} style={{ position: 'absolute', top: insets.top + 8, left: W * 0.059 }}>
        <BackIcon size={Math.round(k * 26)} color="#fff" />
      </Pressable>

      {/* lockup: icon + StreamMax wordmark + tagline */}
      <View style={{ position: 'absolute', top: H * 0.104, left: 0, right: 0 }}>
        <Lockup scale={k * 0.88} />
      </View>

      {/* message bubble with padlock, in glowing gradient ring */}
      <View style={{ position: 'absolute', top: H * 0.316 - circleSize / 2, left: (W - circleSize) / 2, width: circleSize, height: circleSize }}>
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
      <View style={[styles.titleRow, { top: H * 0.409 }]}>
        <Text style={[styles.titleWhite, { fontSize: Math.round(k * 42) }]}>Enter </Text>
        <GradientText text="Reset Code" size={Math.round(k * 42)} width={Math.round(k * 272)} height={Math.round(k * 54)} weight="800" colorsArr={gradients.brand} />
      </View>

      {/* subtitle */}
      <Text style={[styles.sub, {
        top: H * 0.474, width: W * 0.66, left: W * 0.17,
        fontSize: Math.round(k * 16), lineHeight: Math.round(k * 30),
      }]}>
        We&apos;ve sent a 6-digit code to your email address.{'\n'}Enter the code below to reset your password.
      </Text>

      {/* six code boxes */}
      <Pressable style={[styles.boxRow, { top: H * 0.561, gap }]} onPress={() => input.current?.focus()}>
        {Array.from({ length: CODE_LEN }).map((_, i) => {
          const isActive = i === active;
          const box = (
            <View style={[styles.box, {
              width: boxW, height: boxH, borderRadius: Math.round(k * 16),
              borderColor: isActive ? 'transparent' : '#2d3348',
            }]}>
              <Text style={[styles.digit, { fontSize: Math.round(k * 28) }]}>{code[i] || ''}</Text>
              {isActive && !code[i] && focused && <View style={[styles.cursor, { height: Math.round(k * 26) }]} />}
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
      </Pressable>

      {/* timer */}
      {left > 0 && (
        <View style={[styles.timerRow, { top: H * 0.676 }]}>
          <ClockIcon size={Math.round(k * 15)} color="#00D2FF" />
          <View style={{ width: Math.round(k * 6) }} />
          <Text style={[styles.timerText, { fontSize: Math.round(k * 15) }]}>Resend code in </Text>
          <Text style={[styles.timerTime, { fontSize: Math.round(k * 15) }]}>{mm}:{ss}</Text>
        </View>
      )}

      {/* errors pop up at the top */}
      <TopToast message={err} />

      {/* Next */}
      <View style={{ position: 'absolute', top: H * 0.745, left: padX, right: padX }}>
        <GradientButton label={busy ? 'Verifying…' : 'Next'} height={Math.round(k * 68)} fontSize={Math.round(k * 20)} onPress={next} />
      </View>

      {/* footer */}
      <View style={[styles.footer, { top: H * 0.820 }]}>
        <Text style={[styles.footText, { fontSize: Math.round(k * 14.5) }]}>Didn&apos;t receive the code? </Text>
        <Pressable onPress={resend}>
          <Text style={[styles.footLink, { fontSize: Math.round(k * 14.5) }]}>Resend</Text>
        </Pressable>
      </View>

      {/* same bottom design as the login screen: or divider + social buttons */}
      <View style={{ position: 'absolute', top: H * 0.852, left: padX, right: padX }}>
        <OrDivider compact />
      </View>
      <View style={{ position: 'absolute', top: H * 0.876, left: padX, right: padX }}>
        <OutlineButton label="Continue with Google" icon={<GoogleG size={Math.round(k * 20)} />} height={Math.round(k * 52)} fontSize={Math.round(k * 15)} />
      </View>
      <View style={{ position: 'absolute', top: H * 0.933, left: padX, right: padX }}>
        <OutlineButton label="Continue with Apple" icon={<AppleLogo size={Math.round(k * 20)} />} height={Math.round(k * 52)} fontSize={Math.round(k * 15)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#05070a' },
  hiddenInput: { position: 'absolute', width: 1, height: 1, opacity: 0 },
  titleRow: { position: 'absolute', left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  titleWhite: { color: '#fff', fontWeight: '800' },
  sub: { position: 'absolute', color: '#b0b0b0', textAlign: 'center' },
  boxRow: { position: 'absolute', left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  box: { backgroundColor: '#0b1026', borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  digit: { color: '#fff', fontWeight: '700' },
  cursor: { position: 'absolute', width: 2, backgroundColor: '#fff', borderRadius: 1 },
  timerRow: { position: 'absolute', left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  timerText: { color: '#d8dce8' },
  timerTime: { color: '#00D2FF', fontWeight: '600' },
  footer: { position: 'absolute', left: 0, right: 0, flexDirection: 'row', justifyContent: 'center' },
  footText: { color: '#d8dce8' },
  footLink: { color: '#00D2FF', fontWeight: '700' },
});

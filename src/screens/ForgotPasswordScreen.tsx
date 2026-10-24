import React, { useState } from 'react';
import {
  Image, Pressable, StyleSheet, Text, View, useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Field, GradientButton, GradientText, Lockup, TopToast, useToast } from '../components/ui';
import { BackIcon, MailIcon } from '../components/icons';
import * as auth from '../core/auth/authService';

/**
 * Forgot Password — fixed layout (no scrolling), measured from the 683x1024
 * design mock. Same login poster collage at the top (fading to black before
 * the heading) with the StreamMax logo lockup over it (y 0.176H, centered),
 * then: "Forgot Password?" (white + blue-to-purple gradient),
 * two-line centered subtitle, tall email field, gradient pill button
 * "Send Reset Code" with arrow, footer "Remember your password? Sign In".
 */
export default function ForgotPasswordScreen() {
  const nav = useNavigation<any>();
  const toast = useToast();
  const route = useRoute<any>();
  const { width: W, height: H } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const k = W / 683;
  const padX = W * 0.104; // field + button: x 71-611 of 683

  const [email, setEmail] = useState(route.params?.email || '');
  const [err, setErr] = useState('');
  const [bad, setBad] = useState(false);
  const [busy, setBusy] = useState(false);

  const send = async () => {
    if (busy) return;
    const e = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e)) {
      setBad(true); setErr('Enter a valid email address'); return;
    }
    setBusy(true);
    const exists = await auth.emailExists(e);
    if (!exists) {
      setBusy(false);
      setBad(true); setErr('No account found with this email'); return;
    }
    const r = await auth.requestCode(e, 'reset');
    setBusy(false);
    if (!r.ok) {
      setBad(true); setErr(r.message || 'Could not send the code'); return;
    }
    toast('Code sent to your email. It expires in 10 minutes.', 'info');
    nav.navigate('EnterCode', { email: e, purpose: 'reset' });
  };

  return (
    <View style={[styles.root, { backgroundColor: '#000000' }]}>
      {/* same poster as the login screen — fading to black toward the heading */}
      <Image
        source={require('../assets/img/login_hero_fade.png')}
        style={{ position: 'absolute', top: 0, width: W, height: H * 0.465 }}
        resizeMode="cover"
      />

      {/* logo + app name + tagline over the poster (mock: block at y 180/1024, centered) */}
      <View style={{ position: 'absolute', top: H * 0.176, left: 0, right: 0, alignItems: 'center' }}>
        <Lockup scale={1.05} />
      </View>

      {/* back arrow over the poster */}
      <Pressable onPress={() => nav.goBack()} hitSlop={10} style={{ position: 'absolute', top: insets.top + 8, left: W * 0.059 }}>
        <BackIcon size={26} color="#fff" />
      </Pressable>

      {/* heading: "Forgot " white + "Password?" blue-to-purple gradient, centered */}
      <View style={[styles.titleRow, { top: H * 0.476 }]}>
        <Text style={[styles.titleWhite, { fontSize: 34 }]}>Forgot </Text>
        <GradientText
          text="Password?"
          size={34}
          width={186}
          height={42}
          weight="800"
          colorsArr={['#0E80E8', '#7623EB']}
        />
      </View>

      {/* two-line centered subtitle */}
      <Text style={[styles.sub, {
        top: H * 0.545, left: (W - W * 0.655) / 2, width: W * 0.655,
        fontSize: 16, lineHeight: 24,
      }]}>
        No worries! Enter your email address and we&apos;ll send you a 6-digit code to reset your password.
      </Text>

      {/* email field — tall, rounded, dark navy with blue border */}
      <View style={{ position: 'absolute', top: H * 0.629, left: padX, right: padX }}>
        <Field
          h={56}
          radius={18}
          fs={16}
          error={bad}
          icon={<MailIcon size={22} color="#5B7FB8" />}
          placeholderTextColor="#4F6FA6"
          placeholder="Email address"
          value={email}
          onChangeText={v => { setEmail(v); setBad(false); setErr(''); }}
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.fieldBox}
          focused={false}
        />
      </View>

      {/* errors pop up at the top */}
      <TopToast message={err} />

      {/* gradient pill button with arrow */}
      <View style={{ position: 'absolute', top: H * 0.745, left: padX, right: padX }}>
        <GradientButton label="Send Reset Code" loading={busy} height={56} fontSize={16} onPress={send} />
      </View>

      {/* footer */}
      <View style={[styles.footer, { top: H * 0.872 }]}>
        <Text style={[styles.footText, { fontSize: 15 }]}>Remember your password? </Text>
        <Pressable onPress={() => nav.goBack()} hitSlop={8}>
          <GradientText text="Sign In" size={15} width={52} height={20} weight="700" colorsArr={['#0E80E8', '#7623EB']} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  titleRow: { position: 'absolute', left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start' },
  titleWhite: { color: '#fff', fontWeight: '800' },
  sub: { position: 'absolute', color: '#CDD4E8', textAlign: 'center', fontWeight: '400' },
  fieldBox: { backgroundColor: '#061028', borderColor: '#203D7B' },
  footer: { position: 'absolute', left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start' },
  footText: { color: '#D8E1F4' },
});

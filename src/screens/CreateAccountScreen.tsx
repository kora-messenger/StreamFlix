import React, { useState } from 'react';
import {
  Image, Pressable, StyleSheet, Text, View, useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import {
  Field, GradientButton, GradientText, Lockup, OrDivider, OutlineButton,
} from '../components/ui';
import { AppleLogo, BackIcon, GoogleG, LockIcon, MailIcon, UserIcon } from '../components/icons';
import { colors } from '../theme/tokens';

/**
 * FIXED layout (no scrolling). Every element is positioned as a percentage of the
 * screen height, taken from the 512x1024 design reference.
 */
export default function CreateAccountScreen() {
  const nav = useNavigation<any>();
  const { width: W, height: H } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const k = W / 512;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');

  const padX = W * 0.102;
  const fieldH = Math.round(k * 46);      // compact input boxes
  const fieldGap = Math.round(k * 12);
  const fieldFs = Math.round(k * 14);
  const btnH = Math.round(k * 46);
  const socialH = Math.round(k * 42);

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
        <Text style={[styles.title, { fontSize: Math.round(k * 40) }]}>Create Your </Text>
        <GradientText text="Account" size={Math.round(k * 40)} width={Math.round(k * 165)} height={Math.round(k * 48)} weight="800" />
      </View>
      <Text style={[styles.sub, { top: H * 0.257, left: padX, width: W * 0.65, fontSize: Math.round(k * 16), lineHeight: Math.round(k * 22) }]}>
        Join StreamMax and get unlimited access to your favorite movies, TV shows and more.
      </Text>

      {/* fields */}
      <View style={{ position: 'absolute', top: H * 0.314, left: padX, right: padX, gap: fieldGap }}>
        <Field h={fieldH} fs={fieldFs} icon={<UserIcon />} placeholder="Full name" value={name} onChangeText={setName} focused={name.length === 0} />
        <Field h={fieldH} fs={fieldFs} icon={<MailIcon />} placeholder="Email address" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <Field h={fieldH} fs={fieldFs} icon={<LockIcon />} placeholder="Password" value={pw} onChangeText={setPw} secure />
        <Field h={fieldH} fs={fieldFs} icon={<LockIcon />} placeholder="Confirm password" value={pw2} onChangeText={setPw2} secure />
      </View>

      {/* primary button */}
      <View style={{ position: 'absolute', top: H * 0.604, left: padX, right: padX }}>
        <GradientButton label="Create Account" arrow={false} height={btnH} fontSize={Math.round(k * 15)} onPress={() => nav.reset({ index: 0, routes: [{ name: 'Home' }] })} />
      </View>

      {/* or divider */}
      <View style={{ position: 'absolute', top: H * 0.674, left: padX, right: padX }}>
        <OrDivider compact />
      </View>

      {/* social */}
      <View style={{ position: 'absolute', top: H * 0.723, left: padX, right: padX }}>
        <OutlineButton label="Continue with Google" icon={<GoogleG />} height={socialH} fontSize={Math.round(k * 14)} />
      </View>
      <View style={{ position: 'absolute', top: H * 0.792, left: padX, right: padX }}>
        <OutlineButton label="Continue with Apple" icon={<AppleLogo />} height={socialH} fontSize={Math.round(k * 14)} />
      </View>

      {/* sign in + legal */}
      <View style={[styles.signRow, { top: H * 0.879 }]}>
        <Text style={[styles.signText, { fontSize: Math.round(k * 13) }]}>Already have an account? </Text>
        <Pressable onPress={() => nav.navigate('Login')}>
          <Text style={[styles.signLink, { fontSize: Math.round(k * 14) }]}>Sign In</Text>
        </Pressable>
      </View>
      <Text style={[styles.legal, { top: H * 0.925, fontSize: Math.round(k * 11), lineHeight: Math.round(k * 17) }]}>
        By creating an account, you agree to our{'\n'}
        <Text style={styles.legalLink}>Terms of Service</Text>  •  <Text style={styles.legalLink}>Privacy Policy</Text>
      </Text>
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

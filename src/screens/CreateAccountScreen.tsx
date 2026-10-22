import React, { useState } from 'react';
import {
  Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import {
  Field, GradientButton, GradientText, Lockup, OrDivider, OutlineButton,
} from '../components/ui';
import { AppleLogo, BackIcon, GoogleG, LockIcon, MailIcon, UserIcon } from '../components/icons';
import { colors } from '../theme/tokens';

export default function CreateAccountScreen() {
  const nav = useNavigation<any>();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const heroW = width * 0.62;

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Image
        source={require('../assets/img/create_account_hero_faded.png')}
        style={[styles.hero, { width: heroW, height: heroW * 1.38 }]}
        resizeMode="cover"
      />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 24, paddingHorizontal: 24 }}>
        <Pressable hitSlop={14} onPress={() => nav.goBack()} style={styles.back}>
          <BackIcon />
        </Pressable>
        <View style={{ marginTop: 6, marginLeft: -18 }}>
          <Lockup scale={0.74} />
        </View>

        <View style={styles.titleRow}>
          <Text style={styles.title}>Create Your </Text>
          <GradientText text="Account" size={36} width={190} height={46} weight="800" />
        </View>
        <Text style={styles.sub}>
          Join StreamFlix and get unlimited access to your favorite movies, TV shows and more.
        </Text>

        <View style={{ marginTop: 26, gap: 14 }}>
          <Field icon={<UserIcon />} placeholder="Full name" value={name} onChangeText={setName} focused={name.length === 0} />
          <Field icon={<MailIcon />} placeholder="Email address" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <Field icon={<LockIcon />} placeholder="Password" value={pw} onChangeText={setPw} secure />
          <Field icon={<LockIcon />} placeholder="Confirm password" value={pw2} onChangeText={setPw2} secure />
        </View>

        <GradientButton label="Create Account" onPress={() => nav.reset({ index: 0, routes: [{ name: 'Home' }] })} style={{ marginTop: 26 }} />
        <OrDivider />
        <View style={{ gap: 12 }}>
          <OutlineButton label="Continue with Google" icon={<GoogleG />} />
          <OutlineButton label="Continue with Apple" icon={<AppleLogo />} />
        </View>

        <View style={styles.signRow}>
          <Text style={styles.signText}>Already have an account? </Text>
          <Pressable onPress={() => nav.navigate('Login')}>
            <Text style={styles.signLink}>Sign In</Text>
          </Pressable>
        </View>
        <Text style={styles.legal}>
          By creating an account, you agree to our{'\n'}
          <Text style={styles.legalLink}>Terms of Service</Text>  •  <Text style={styles.legalLink}>Privacy Policy</Text>
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  hero: { position: 'absolute', top: 0, right: 0 },
  back: { width: 36, height: 36, justifyContent: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', marginTop: 26, flexWrap: 'wrap' },
  title: { color: '#fff', fontSize: 36, fontWeight: '800', letterSpacing: -0.5 },
  sub: { color: colors.textMuted, fontSize: 15.5, lineHeight: 24, marginTop: 10, maxWidth: 330 },
  signRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 28 },
  signText: { color: '#d7d9ea', fontSize: 14.5 },
  signLink: { color: '#3b9bff', fontSize: 14.5, fontWeight: '700' },
  legal: { color: '#8a8fa8', fontSize: 12, textAlign: 'center', marginTop: 24, lineHeight: 19 },
  legalLink: { color: '#4f7dff' },
});

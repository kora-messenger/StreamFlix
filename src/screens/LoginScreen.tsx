import React, { useState } from 'react';
import {
  Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import {
  Field, GradientButton, GradientText, Lockup, OrDivider, OutlineButton,
} from '../components/ui';
import { AppleLogo, CheckIcon, GoogleG, LockIcon, MailIcon } from '../components/icons';
import { colors } from '../theme/tokens';

export default function LoginScreen() {
  const nav = useNavigation<any>();
  const { width: W, height: H } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [remember, setRemember] = useState(true);

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Darkened character collage, top ~28% */}
      <Image
        source={require('../assets/img/login_hero_dark.png')}
        style={{ position: 'absolute', top: 0, width: W, height: H * 0.285 }}
        resizeMode="cover"
      />
      {/* Purple/blue corner glows at the bottom */}
      <Image
        source={require('../assets/img/bottom_glow.png')}
        style={{ position: 'absolute', bottom: 0, width: W, height: H * 0.125 }}
        resizeMode="stretch"
      />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + H * 0.055,
          paddingBottom: insets.bottom + H * 0.035,
          paddingHorizontal: W * 0.09,
        }}>
        <View style={{ alignItems: 'center' }}>
          <Lockup scale={0.72} />
        </View>
        <Text style={[styles.tag, { marginTop: H * 0.085 }]}>Your Movies. Your Way.</Text>

        <View style={[styles.titleRow, { marginTop: H * 0.025 }]}>
          <Text style={styles.title}>Welcome </Text>
          <GradientText text="Back" size={40} width={122} height={50} weight="800" colorsArr={['#3A78FF', '#A044FF']} />
        </View>
        <Text style={[styles.sub, { marginTop: H * 0.008 }]}>Log in to continue watching your favorite movies and shows.</Text>

        <View style={{ marginTop: H * 0.028, gap: 12 }}>
          <Field icon={<MailIcon />} placeholder="Email address" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" focused />
          <Field icon={<LockIcon />} placeholder="Password" value={pw} onChangeText={setPw} secure focused />
        </View>

        <View style={[styles.rememberRow, { marginTop: H * 0.018 }]}>
          <Pressable style={styles.remember} onPress={() => setRemember(r => !r)}>
            <View style={[styles.check, remember ? styles.checkOn : null]}>
              {remember ? <CheckIcon size={15} /> : null}
            </View>
            <Text style={styles.rememberText}>Remember me</Text>
          </Pressable>
          <Pressable><Text style={styles.forgot}>Forgot password?</Text></Pressable>
        </View>

        <GradientButton label="Log In" onPress={() => nav.reset({ index: 0, routes: [{ name: 'Home' }] })} style={{ marginTop: H * 0.028 }} />
        <View style={{ marginTop: H * 0.032 }}>
          <OrDivider />
        </View>
        <View style={{ marginTop: H * 0.026 }}>
          <OutlineButton label="Continue with Google" icon={<GoogleG />} />
        </View>
        <View style={{ marginTop: H * 0.012 }}>
          <OutlineButton label="Continue with Apple" icon={<AppleLogo />} />
        </View>

        <View style={[styles.signRow, { marginTop: H * 0.028 }]}>
          <Text style={styles.signText}>Don't have an account? </Text>
          <Pressable onPress={() => nav.navigate('CreateAccount')}>
            <Text style={styles.signLink}>Sign Up</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  tag: { color: '#aab0c4', fontSize: 13, letterSpacing: 2.4, textAlign: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  title: { color: '#fff', fontSize: 40, fontWeight: '800', letterSpacing: -0.5 },
  sub: { color: '#9fb0d8', fontSize: 15, lineHeight: 23, textAlign: 'center', maxWidth: 320, alignSelf: 'center' },
  rememberRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  remember: { flexDirection: 'row', alignItems: 'center' },
  check: { width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: '#3a4268', alignItems: 'center', justifyContent: 'center' },
  checkOn: { backgroundColor: '#7B2CBF', borderColor: '#7B2CBF' },
  rememberText: { color: '#e4e6f5', fontSize: 14.5, marginLeft: 11 },
  forgot: { color: '#6C63FF', fontSize: 14.5, fontWeight: '600' },
  signRow: { flexDirection: 'row', justifyContent: 'center' },
  signText: { color: '#d7d9ea', fontSize: 14.5 },
  signLink: { color: '#6C63FF', fontSize: 14.5, fontWeight: '700' },
});

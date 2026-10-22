import React, { useState } from 'react';
import {
  Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import {
  Field, GradientButton, GradientText, Lockup, OrDivider, OutlineButton,
} from '../components/ui';
import { AppleLogo, CheckIcon, GoogleG, LockIcon, MailIcon } from '../components/icons';
import { colors } from '../theme/tokens';

export default function LoginScreen() {
  const nav = useNavigation<any>();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [remember, setRemember] = useState(true);

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Image
        source={require('../assets/img/login_posters_faded.png')}
        style={{ position: 'absolute', top: 0, width, height: width * 0.95 }}
        resizeMode="cover"
      />
      <LinearGradient
        colors={['rgba(5,5,7,0)', 'rgba(5,5,7,0.55)', colors.bg]}
        style={{ position: 'absolute', top: width * 0.1, width, height: width * 0.85 }}
        pointerEvents="none"
      />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top + 36, paddingBottom: insets.bottom + 40, paddingHorizontal: 24 }}>
        <Lockup scale={0.78} />

        <View style={styles.titleRow}>
          <Text style={styles.title}>Welcome </Text>
          <GradientText text="Back" size={40} width={120} height={50} weight="800" colorsArr={['#6C63FF', '#00D2FF']} />
        </View>
        <Text style={styles.sub}>Log in to continue watching your favorite movies and shows.</Text>

        <View style={{ marginTop: 26, gap: 14 }}>
          <Field icon={<MailIcon />} placeholder="Email address" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" focused={email.length === 0} />
          <Field icon={<LockIcon />} placeholder="Password" value={pw} onChangeText={setPw} secure />
        </View>

        <View style={styles.rememberRow}>
          <Pressable style={styles.remember} onPress={() => setRemember(r => !r)}>
            <View style={[styles.check, remember ? styles.checkOn : null]}>
              {remember ? <CheckIcon size={15} /> : null}
            </View>
            <Text style={styles.rememberText}>Remember me</Text>
          </Pressable>
          <Pressable><Text style={styles.forgot}>Forgot password?</Text></Pressable>
        </View>

        <GradientButton label="Log In" onPress={() => nav.reset({ index: 0, routes: [{ name: 'Home' }] })} style={{ marginTop: 22 }} />
        <OrDivider />
        <View style={{ gap: 12 }}>
          <OutlineButton label="Continue with Google" icon={<GoogleG />} />
          <OutlineButton label="Continue with Apple" icon={<AppleLogo />} />
        </View>

        <View style={styles.signRow}>
          <Text style={styles.signText}>Don't have an account? </Text>
          <Pressable onPress={() => nav.navigate('CreateAccount')}>
            <Text style={styles.signLink}>Sign Up</Text>
          </Pressable>
        </View>
      </ScrollView>
      <LinearGradient
        colors={['rgba(108,99,255,0)', 'rgba(108,99,255,0.35)']}
        style={{ position: 'absolute', bottom: 0, width, height: 90 }}
        pointerEvents="none"
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  titleRow: { flexDirection: 'row', alignItems: 'center', marginTop: 22 },
  title: { color: '#fff', fontSize: 40, fontWeight: '800', letterSpacing: -0.5 },
  sub: { color: '#9fb0d8', fontSize: 16, lineHeight: 25, marginTop: 8, maxWidth: 300 },
  rememberRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 18 },
  remember: { flexDirection: 'row', alignItems: 'center' },
  check: { width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: '#3a4268', alignItems: 'center', justifyContent: 'center' },
  checkOn: { backgroundColor: '#7a3cff', borderColor: '#7a3cff' },
  rememberText: { color: '#e4e6f5', fontSize: 14.5, marginLeft: 11 },
  forgot: { color: colors.link, fontSize: 14.5, fontWeight: '600' },
  signRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 28 },
  signText: { color: '#d7d9ea', fontSize: 14.5 },
  signLink: { color: colors.link, fontSize: 14.5, fontWeight: '700' },
});

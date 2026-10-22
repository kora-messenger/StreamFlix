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
  const { width: W, height: H } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Spider-Man corner graphic, top-right, fading into the black bg */}
      <Image
        source={require('../assets/img/create_hero_corner.png')}
        style={[styles.hero, { width: W * 0.74, height: H * 0.295 }]}
        resizeMode="cover"
      />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + H * 0.004,
          paddingBottom: H * 0.04,
          paddingHorizontal: W * 0.09,
        }}>
        <Pressable hitSlop={14} onPress={() => nav.goBack()} style={styles.back}>
          <BackIcon />
        </Pressable>

        <View style={{ marginTop: H * 0.03, alignItems: 'center' }}>
          <Lockup scale={0.7} />
        </View>
        <Text style={[styles.tag, { marginTop: H * 0.012 }]}>Your Movies. Your Way.</Text>

        <View style={[styles.titleRow, { marginTop: H * 0.032 }]}>
          <Text style={styles.title}>Create Your </Text>
          <GradientText text="Account" size={30} width={168} height={38} weight="800" />
        </View>
        <Text style={[styles.sub, { marginTop: H * 0.02 }]}>
          Join StreamFlix and get unlimited access to your favorite movies, TV shows and more.
        </Text>

        <View style={{ marginTop: H * 0.04, gap: 11 }}>
          <Field icon={<UserIcon />} placeholder="Full name" value={name} onChangeText={setName} focused={name.length === 0} />
          <Field icon={<MailIcon />} placeholder="Email address" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <Field icon={<LockIcon />} placeholder="Password" value={pw} onChangeText={setPw} secure />
          <Field icon={<LockIcon />} placeholder="Confirm password" value={pw2} onChangeText={setPw2} secure />
        </View>

        <GradientButton label="Create Account" onPress={() => nav.reset({ index: 0, routes: [{ name: 'Home' }] })} style={{ marginTop: H * 0.03 }} />
        <View style={{ marginTop: H * 0.05 }}>
          <OrDivider />
        </View>
        <View style={{ marginTop: H * 0.02 }}>
          <OutlineButton label="Continue with Google" icon={<GoogleG />} />
        </View>
        <View style={{ marginTop: H * 0.012 }}>
          <OutlineButton label="Continue with Apple" icon={<AppleLogo />} />
        </View>

        <View style={[styles.signRow, { marginTop: H * 0.036 }]}>
          <Text style={styles.signText}>Already have an account? </Text>
          <Pressable onPress={() => nav.navigate('Login')}>
            <Text style={styles.signLink}>Sign In</Text>
          </Pressable>
        </View>
        <Text style={[styles.legal, { marginTop: H * 0.033 }]}>
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
  tag: { color: '#aab0c4', fontSize: 13, letterSpacing: 2.4, textAlign: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  title: { color: '#fff', fontSize: 30, fontWeight: '800', letterSpacing: -0.3 },
  sub: { color: '#94a3b8', fontSize: 14, lineHeight: 21, textAlign: 'center', maxWidth: 320, alignSelf: 'center' },
  signRow: { flexDirection: 'row', justifyContent: 'center' },
  signText: { color: '#d7d9ea', fontSize: 14.5 },
  signLink: { color: '#3b82f6', fontSize: 14.5, fontWeight: '600' },
  legal: { color: '#8a90a5', fontSize: 11.5, textAlign: 'center', lineHeight: 18 },
  legalLink: { color: '#3b82f6' },
});

import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { BackIcon } from '../components/icons';

/* About us screen — cloned from the MovieBox reference recording:
   fixed top bar (back chevron, centered bold "About us"), the app logo and
   version number vertically centered in the body, and the disclaimer pinned
   to the bottom: "By continuing, you agree to our Terms of Service and Privacy
   Policy." with the two links in the StreamMax accent color. */

const APP_VERSION = 'v1.0.0';

export default function AboutScreen() {
  const insets = useSafeAreaInsets();
  const nav = useNavigation<any>();

  const open = (doc: string) => () => nav.navigate('Browser', { doc });

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* header */}
      <View style={styles.header}>
        <Pressable hitSlop={14} onPress={() => nav.goBack()} style={styles.back}>
          <BackIcon size={24} />
        </Pressable>
        <Text style={styles.headTitle}>About us</Text>
      </View>
      <View style={styles.headLine} />

      {/* centered logo + version */}
      <View style={styles.body}>
        <Image source={require('../assets/img/logo_clear.png')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.version}>{APP_VERSION}</Text>
      </View>

      {/* bottom disclaimer */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 18 }]}>
        <Text style={styles.disclaimer}>
          By continuing, you agree to our{' '}
          <Text style={styles.link} onPress={open('terms')}>Terms of Service</Text>
          {' '}and{' '}
          <Text style={styles.link} onPress={open('privacy')}>Privacy Policy</Text>.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0c0d11' },
  header: { height: 52, justifyContent: 'center', alignItems: 'center' },
  back: { position: 'absolute', left: 14, top: 0, bottom: 0, justifyContent: 'center' },
  headTitle: { color: '#fff', fontSize: 17, fontWeight: '700' },
  headLine: { height: 1, backgroundColor: 'rgba(255,255,255,0.06)' },
  body: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  logo: { width: 132, height: 132 },
  version: { color: '#fff', fontSize: 15, fontWeight: '500', marginTop: 14 },
  footer: { paddingHorizontal: 32 },
  disclaimer: { color: 'rgba(255,255,255,0.85)', fontSize: 13, lineHeight: 19, textAlign: 'center' },
  link: { color: '#9d8bff', fontWeight: '600' },
});

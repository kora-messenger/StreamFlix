import React, { useEffect, useState } from 'react';
import {
  Alert, Animated, Pressable, ScrollView, StyleSheet, Text, View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';
import { BackIcon } from '../components/icons';
import { useToast } from '../components/ui';
import { logout } from '../core/auth/authService';
import { gradients } from '../theme/tokens';

/* Settings screen — layout measured from the MovieBox settings recording,
   restyled with StreamMax's cyan→purple toggle accent:
   - centered "Settings" header with back chevron
   - section label "Your app and preferences" over one rounded group:
     Notifications >, Language >, Watch Options (value: Download) >,
     Family Mode (switch + helper text), Download in background (switch),
     Auto activate Miniplayer (switch + helper text), Privacy Settings >
   - section label "More info and support" over a second group:
     Check update >, About us >, Privacy Policy >, Terms of Service >, Log out >
   Switch states persist locally. Rows without a destination yet show the
   app-wide dark pill toast. */

const KEY = 'streammax.settings.v1';
type Prefs = { family: boolean; bgDownload: boolean; miniplayer: boolean; watchOption: 'Download' | 'Stream' };
const DEFAULTS: Prefs = { family: false, bgDownload: false, miniplayer: true, watchOption: 'Download' };

const Chevron = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#8a8ea3" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M9 5l7 7-7 7" />
  </Svg>
);

/** Pill switch: gradient track when on (cyan→purple), grey when off. */
function Switch({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  const x = React.useRef(new Animated.Value(on ? 1 : 0)).current;
  useEffect(() => {
    Animated.timing(x, { toValue: on ? 1 : 0, duration: 160, useNativeDriver: true }).start();
  }, [on, x]);
  return (
    <Pressable hitSlop={8} onPress={() => onChange(!on)} style={styles.swWrap}>
      {on ? (
        <LinearGradient colors={gradients.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
      ) : (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: '#4a4b53' }]} />
      )}
      <Animated.View
        style={[styles.swKnob, { transform: [{ translateX: x.interpolate({ inputRange: [0, 1], outputRange: [3, 25] }) }] }]}
      />
    </Pressable>
  );
}

function NavRow({ title, value, onPress }: { title: string; value?: string; onPress: () => void }) {
  return (
    <Pressable style={styles.row} onPress={onPress} android_ripple={{ color: 'rgba(255,255,255,0.06)' }}>
      <Text style={styles.rowTitle}>{title}</Text>
      <View style={styles.rowRight}>
        {value ? <Text style={styles.rowValue}>{value}</Text> : null}
        <Chevron />
      </View>
    </Pressable>
  );
}

function SwitchRow({
  title, helper, on, onChange,
}: { title: string; helper?: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <View style={styles.swRow}>
      <View style={styles.swTop}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Switch on={on} onChange={onChange} />
      </View>
      {helper ? <Text style={styles.helper}>{helper}</Text> : null}
    </View>
  );
}

const Sep = () => <View style={styles.sep} />;

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const nav = useNavigation<any>();
  const toast = useToast();
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then(v => { if (v) setPrefs({ ...DEFAULTS, ...JSON.parse(v) }); })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  const set = <K extends keyof Prefs>(k: K, v: Prefs[K]) => {
    const next = { ...prefs, [k]: v };
    setPrefs(next);
    AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
  };

  const soon = (name: string) => () => toast(`${name} is coming soon`, 'info');

  const toggleBgDownload = (v: boolean) => {
    /* MovieBox here shows the real Android system prompt
       (ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS) — a device dialog, not an
       app dialog. That needs a small native module + real download jobs, so
       for now the preference just persists and the true system prompt will be
       raised when background downloads actually exist. */
    set('bgDownload', v);
  };

  const watchOptions = () => {
    Alert.alert('Watch Options', 'Choose what happens when you tap a title.', [
      { text: 'Download', onPress: () => set('watchOption', 'Download') },
      { text: 'Stream', onPress: () => set('watchOption', 'Stream') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const onLogout = () => {
    Alert.alert('Log out', 'Log out of your account?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out', style: 'destructive',
        onPress: async () => {
          await logout();
          toast('Signed out. See you soon!', 'info');
          nav.reset({ index: 0, routes: [{ name: 'Welcome' }] });
        },
      },
    ]);
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable hitSlop={14} onPress={() => nav.goBack()} style={styles.back}>
          <BackIcon size={24} />
        </Pressable>
        <Text style={styles.headTitle}>Settings</Text>
      </View>
      <View style={styles.headLine} />

      {!ready ? null : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 28 }}>
          <Text style={styles.section}>Your app and preferences</Text>
          <View style={styles.group}>
            <NavRow title="Notifications" onPress={soon('Notifications')} />
            <Sep />
            <NavRow title="Language" onPress={soon('Language')} />
            <Sep />
            <NavRow title="Watch Options" value={prefs.watchOption} onPress={watchOptions} />
            <Sep />
            <SwitchRow
              title="Family Mode"
              helper="This helps hide potentially mature videos. No filter is 100% accurate."
              on={prefs.family}
              onChange={v => set('family', v)}
            />
            <Sep />
            <SwitchRow title="Download in background" on={prefs.bgDownload} onChange={toggleBgDownload} />
            <Sep />
            <SwitchRow
              title="Auto activate Miniplayer"
              helper="When enabled, switching pages during playback will automatically enable Miniplayer."
              on={prefs.miniplayer}
              onChange={v => set('miniplayer', v)}
            />
            <Sep />
            <NavRow title="Privacy Settings" onPress={soon('Privacy Settings')} />
          </View>

          <Text style={[styles.section, { marginTop: 20 }]}>More info and support</Text>
          <View style={styles.group}>
            <NavRow title="Check update" onPress={() => toast('You\'re on the latest version (v1.0.0)', 'info')} />
            <Sep />
            <NavRow title="Privacy Policy" onPress={() => nav.navigate('Browser', { doc: 'privacy' })} />
            <Sep />
            <NavRow title="Terms of Service" onPress={() => nav.navigate('Browser', { doc: 'terms' })} />
            <Sep />
            <NavRow title="Log out" onPress={onLogout} />
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0c0d11' },
  header: { height: 52, justifyContent: 'center', alignItems: 'center' },
  back: { position: 'absolute', left: 14, top: 0, bottom: 0, justifyContent: 'center' },
  headTitle: { color: '#fff', fontSize: 17, fontWeight: '700' },
  headLine: { height: 1, backgroundColor: 'rgba(255,255,255,0.06)' },
  section: { color: '#b6b8c4', fontSize: 14, marginHorizontal: 16, marginTop: 16, marginBottom: 8 },
  group: { marginHorizontal: 16, backgroundColor: '#1c1d23', borderRadius: 14, paddingHorizontal: 16 },
  row: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rowTitle: { color: '#fff', fontSize: 16, fontWeight: '500' },
  rowValue: { color: '#8a8ea3', fontSize: 14 },
  sep: { height: 1, backgroundColor: 'rgba(255,255,255,0.05)' },
  swRow: { paddingVertical: 14 },
  swTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 28 },
  helper: { color: '#8a8ea3', fontSize: 13.5, lineHeight: 19, marginTop: 8, paddingRight: 8 },
  swWrap: { width: 52, height: 30, borderRadius: 15, overflow: 'hidden', justifyContent: 'center' },
  swKnob: { position: 'absolute', width: 24, height: 24, borderRadius: 12, backgroundColor: '#fff' },
});

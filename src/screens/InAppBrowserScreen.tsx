import React from 'react';
import { Share, StyleSheet, Text, View, Pressable, useWindowDimensions } from 'react-native';
import { WebView } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';
import { useToast } from '../components/ui';

/* In-app browser — cloned from the ChatGPT/OpenAI in-app browser reference:
   white chrome bar with X (close), down-chevron, centered URL, share icon
   and vertical ellipsis, faint gray divider, then the white content area.
   Opens legal documents (Terms of Service / Privacy Policy) as locally
   rendered white document pages until the real .com URLs exist; a `url`
   param loads any external page instead. */

type XIconProps = { size?: number; color?: string };

const XIcon = ({ size = 20, color = '#000' }: XIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.7} strokeLinecap="round">
    <Path d="M5 5l14 14M19 5L5 19" />
  </Svg>
);
const ChevronDown = ({ size = 20, color = '#000' }: XIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M5 9l7 7 7-7" />
  </Svg>
);
const ShareIcon = ({ size = 19, color = '#000' }: XIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M12 15V4m0 0L8 8m4-4l4 4M5 13v6h14v-6" />
  </Svg>
);
const DotsIcon = ({ size = 19, color = '#000' }: XIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <Path d="M12 5.6a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2Zm0 8a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2Zm0 8a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2Z" />
  </Svg>
);

/* --- placeholder legal documents (white document pages, reference styling) --- */
const page = (title: string, updated: string, paragraphs: string[]) => `<!DOCTYPE html>
<html><head><meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  body { background:#fff; color:#000; font-family:-apple-system,'Roboto',sans-serif;
         padding:28px 20px 60px; box-sizing:border-box; }
  h1 { text-align:center; font-size:26px; font-weight:700; margin:0 0 8px; }
  .updated { text-align:center; font-size:13px; color:#000; margin-bottom:34px; }
  p { font-size:15px; line-height:1.65; margin:0 0 18px; }
</style></head><body>
<h1>${title}</h1>
<div class="updated">Updated: ${updated}</div>
${paragraphs.map(t => `<p>${t}</p>`).join('')}
</body></html>`;

const DOCS: Record<string, { host: string; html: string }> = {
  terms: {
    host: 'streammax.app',
    html: page('Terms of Service', 'October 23, 2026', [
      'Welcome to StreamMax. By using the app you agree to these terms, so please read them carefully.',
      'StreamMax provides streaming of movies and short dramas for personal, non-commercial use. You agree not to download, redistribute or resell content except through features the app explicitly provides.',
      'You are responsible for keeping your account credentials secure. Accounts are for individual use; sharing an account across many simultaneous devices may be limited.',
      'We may update these terms as the service grows. Continued use of StreamMax after an update means you accept the revised terms.',
      'These placeholder terms will be replaced by the full legal document when StreamMax launches publicly.',
    ]),
  },
  privacy: {
    host: 'streammax.app',
    html: page('Privacy policy', 'October 23, 2026', [
      'Your privacy matters to us. This policy explains what StreamMax collects and why.',
      'We collect the account details you provide (name, email) and basic usage information such as what you watch, so the app can sync your history, favorites and downloads.',
      'We do not sell your personal data. Analytics are limited to what is needed to keep the app working and improve it.',
      'You can request deletion of your account and data at any time from your profile screen.',
      'This placeholder policy will be replaced by the full legal document when StreamMax launches publicly.',
    ]),
  },
};

export default function InAppBrowserScreen() {
  const insets = useSafeAreaInsets();
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const toast = useToast();
  const { width: W } = useWindowDimensions();

  const { doc, url } = route.params || {};
  const entry = doc ? DOCS[doc] : undefined;
  const host = entry ? entry.host : url ? (() => { try { return new URL(url).hostname; } catch { return url; } })() : 'streammax.app';

  const share = () => {
    const message = url ?? 'StreamMax — Your Movies. Your Way.';
    Share.share({ message, title: 'StreamMax' }).catch(() => {});
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* chrome header */}
      <View style={styles.bar}>
        <Pressable hitSlop={12} onPress={() => nav.goBack()} style={styles.btn}>
          <XIcon />
        </Pressable>
        <Pressable hitSlop={12} style={styles.btn} onPress={() => toast('No other pages open', 'info')}>
          <ChevronDown />
        </Pressable>
        <Text numberOfLines={1} style={[styles.url, { maxWidth: W - 190 }]}>{host}</Text>
        <Pressable hitSlop={12} style={styles.btn} onPress={share}>
          <ShareIcon />
        </Pressable>
        <Pressable hitSlop={12} style={styles.btn} onPress={() => toast('More options coming soon', 'info')}>
          <DotsIcon />
        </Pressable>
      </View>

      {/* content */}
      {url ? (
        <WebView source={{ uri: url }} style={styles.web} />
      ) : (
        <WebView source={{ html: entry?.html ?? DOCS.privacy.html }} style={styles.web} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  bar: {
    height: 46, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    paddingHorizontal: 12, gap: 6, borderBottomWidth: 1, borderBottomColor: '#D3D3D3',
  },
  btn: { width: 34, height: 34, justifyContent: 'center', alignItems: 'center' },
  url: { flex: 1, textAlign: 'center', color: '#000', fontSize: 15.5, fontWeight: '500' },
  web: { flex: 1, backgroundColor: '#fff' },
});

import React from 'react';
import {
  Image, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { BackIcon, DownloadIcon, PlayIcon } from '../components/icons';
import { colors, gradients } from '../theme/tokens';

export default function MovieViewScreen() {
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { title, year, genre, image } = route.params ?? {};
  const backdropH = width * 0.62;

  return (
    <View style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={{ height: backdropH }}>
          <Image source={image} style={{ width, height: backdropH }} resizeMode="cover" />
          <LinearGradient
            pointerEvents="none"
            colors={['rgba(5,5,7,0.65)', 'rgba(5,5,7,0)']}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, height: insets.top + 60 }}
          />
          <LinearGradient
            pointerEvents="none"
            colors={['rgba(5,5,7,0)', colors.bg]}
            style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: backdropH * 0.55 }}
          />
          <Pressable hitSlop={14} onPress={() => nav.goBack()} style={[styles.back, { marginTop: insets.top + 8 }]}>
            <BackIcon />
          </Pressable>
        </View>

        <View style={{ paddingHorizontal: 20, marginTop: 6 }}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.meta}>{year} | {genre}</Text>

          <View style={styles.actions}>
            <LinearGradient colors={gradients.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.play}>
              <PlayIcon size={18} />
              <Text style={styles.playText}>Play</Text>
            </LinearGradient>
            <View style={styles.dlBtn}>
              <DownloadIcon size={18} />
              <Text style={styles.dlText}>Download</Text>
            </View>
          </View>

          <Text style={styles.synopsis}>
            {title} ({year}) — a {genre.toLowerCase()} story that follows its lead into a world where
            every choice carries weight. Packed with striking visuals and a relentless pace, it is
            one of the most-watched {genre.toLowerCase()} titles on StreamFlix right now.
          </Text>

          <Text style={styles.subHead}>More Like This</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            {['Bonus features', 'Behind the scenes', 'Cast interviews', 'Top 10 today'].map(t => (
              <View key={t} style={styles.chip}><Text style={styles.chipText}>{t}</Text></View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  back: { position: 'absolute', left: 16, width: 36, height: 36, justifyContent: 'center' },
  title: { color: '#fff', fontSize: 28, fontWeight: '900', letterSpacing: -0.4 },
  meta: { color: '#9a9db0', fontSize: 14.5, marginTop: 4 },
  actions: { flexDirection: 'row', marginTop: 20, gap: 12 },
  play: { flex: 1, height: 50, borderRadius: 25, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  playText: { color: '#fff', fontSize: 15.5, fontWeight: '800' },
  dlBtn: { flex: 1, height: 50, borderRadius: 25, borderWidth: 1.5, borderColor: '#2c3252', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  dlText: { color: '#e2e5f2', fontSize: 15.5, fontWeight: '700' },
  synopsis: { color: '#b9bdd2', fontSize: 14.5, lineHeight: 23, marginTop: 22 },
  subHead: { color: '#fff', fontSize: 18, fontWeight: '800', marginTop: 26, marginBottom: 12 },
  chip: { backgroundColor: '#14161f', borderRadius: 18, paddingHorizontal: 16, paddingVertical: 9, borderWidth: 1, borderColor: '#242941' },
  chipText: { color: '#c7cadb', fontSize: 13 },
});

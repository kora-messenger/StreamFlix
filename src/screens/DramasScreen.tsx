import React, { useState } from 'react';
import {
  FlatList, Image, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import BottomNavBar, { BottomTabId } from '../components/BottomNavBar';
import { colors, gradients } from '../theme/tokens';
import { Drama, dramaChips, dramaHero, dramasAsian, dramasNew, dramasTop } from '../data/mock';

/* Dramas screen — MovieBox-style short-drama layout measured from the
   reference recording:
   - snap hero carousel of tall portrait cards with a gradient play button
     at each card's bottom-right corner and a title/meta overlay
   - Latest / Hottest / All chip row (dark pills with round icon badges)
   - content shelves (New Arrivals, Top Searches, Asian Land): horizontal
     poster rows with a two-line title and episode count
   Placeholder episodes per Ijezie; premium banner and error state were
   explicitly removed from the spec. */

const ChipIcon = ({ i }: { i: number }) => {
  // Latest: clock · Hottest: spark · All: grid
  const glyphs = ['\u25F7', '\u2726', '\u25A6'];
  return (
    <LinearGradient colors={gradients.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.chipBadge}>
      <Text style={styles.chipGlyph}>{glyphs[i]}</Text>
    </LinearGradient>
  );
};

function HeroCard({ item, cardW }: { item: Drama; cardW: number }) {
  const nav = useNavigation<any>();
  const ch = Math.round(cardW * 1.45);
  const open = () =>
    nav.navigate('MovieView', { title: item.title, year: item.episodes + ' ep', genre: 'Drama', image: item.poster });
  return (
    <Pressable style={{ width: cardW, height: ch }} onPress={open}>
      <Image source={item.poster} style={[styles.heroImg, { width: cardW, height: ch }]} />
      <LinearGradient
        colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.6)']}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <LinearGradient colors={gradients.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.play}>
        <View style={styles.playTri} />
      </LinearGradient>
      <View style={styles.heroText}>
        <Text numberOfLines={1} style={styles.heroTitle}>{item.title}</Text>
        <Text numberOfLines={1} style={styles.heroMeta}>{item.meta} · {item.episodes} episodes</Text>
      </View>
    </Pressable>
  );
}

function DramaCard({ item }: { item: Drama }) {
  const nav = useNavigation<any>();
  return (
    <Pressable
      style={styles.dcard}
      onPress={() => nav.navigate('MovieView', { title: item.title, year: item.episodes + ' ep', genre: 'Drama', image: item.poster })}
    >
      <Image source={item.poster} style={styles.dimg} />
      <Text numberOfLines={2} style={styles.dtitle}>{item.title}</Text>
      <Text style={styles.dmeta}>{item.episodes} episodes</Text>
    </Pressable>
  );
}

function Shelf({ heading, data }: { heading: string; data: Drama[] }) {
  return (
    <View style={{ marginTop: 22 }}>
      <Text style={styles.shelfHead}>{heading}</Text>
      <FlatList
        horizontal
        data={data}
        keyExtractor={d => d.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingLeft: 16 }}
        ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
        renderItem={({ item }) => <DramaCard item={item} />}
      />
    </View>
  );
}

export default function DramasScreen() {
  const insets = useSafeAreaInsets();
  const nav = useNavigation<any>();
  const { width: W } = useWindowDimensions();
  const [chip, setChip] = useState('latest');
  const cardW = Math.round(W * 0.62);
  const newArrivals =
    chip === 'latest' ? dramasNew : chip === 'hottest' ? dramasTop : [...dramasNew, ...dramasTop].slice(0, 10);
  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>
        {/* hero carousel */}
        <FlatList
          horizontal
          data={dramaHero}
          keyExtractor={d => d.id}
          showsHorizontalScrollIndicator={false}
          snapToInterval={cardW + 14}
          decelerationRate="fast"
          contentContainerStyle={{ paddingHorizontal: (W - cardW) / 2 }}
          ItemSeparatorComponent={() => <View style={{ width: 14 }} />}
          style={{ marginTop: 6, flexGrow: 0 }}
          renderItem={({ item }) => <HeroCard item={item} cardW={cardW} />}
        />
        {/* chips */}
        <View style={styles.chipRow}>
          {dramaChips.map((c, i) => {
            const on = chip === c.id;
            return (
              <Pressable key={c.id} onPress={() => setChip(c.id)} style={[styles.chip, on && styles.chipOn]}>
                <ChipIcon i={i} />
                <Text style={[styles.chipLabel, on && styles.chipLabelOn]}>{c.label}</Text>
              </Pressable>
            );
          })}
        </View>
        <Shelf heading="New Arrivals" data={newArrivals} />
        <Shelf heading="Top Searches" data={dramasTop} />
        <Shelf heading="Asian Land" data={dramasAsian} />
      </ScrollView>
      <BottomNavBar
        active="search"
        onPress={(id: BottomTabId) => { if (id === 'home') nav.goBack(); }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  heroImg: { borderRadius: 14 },
  play: {
    position: 'absolute', right: 10, bottom: 46, width: 38, height: 38, borderRadius: 19,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.35, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 4,
  },
  playTri: {
    marginLeft: 2, borderLeftWidth: 10, borderRightWidth: 0, borderTopWidth: 6, borderBottomWidth: 6,
    borderLeftColor: '#fff', borderTopColor: 'transparent', borderBottomColor: 'transparent',
  },
  heroText: { position: 'absolute', left: 12, bottom: 10, right: 12 },
  heroTitle: { color: '#fff', fontSize: 15, fontWeight: '700' },
  heroMeta: { color: '#A7ADC2', fontSize: 10.5, marginTop: 2 },
  chipRow: { flexDirection: 'row', paddingHorizontal: 16, marginTop: 14 },
  chip: {
    flexDirection: 'row', alignItems: 'center', height: 32, borderRadius: 16,
    paddingHorizontal: 8, marginRight: 8, backgroundColor: '#12141C', borderWidth: 1, borderColor: '#222636',
  },
  chipOn: { borderColor: 'rgba(0,210,255,0.4)', backgroundColor: '#161B2B' },
  chipBadge: { width: 18, height: 18, borderRadius: 9, marginRight: 6, justifyContent: 'center', alignItems: 'center' },
  chipGlyph: { color: '#fff', fontSize: 8 },
  chipLabel: { color: '#A7ADC2', fontSize: 12, fontWeight: '600' },
  chipLabelOn: { color: '#fff' },
  shelfHead: { color: '#fff', fontSize: 15, fontWeight: '700', marginBottom: 10, paddingLeft: 16 },
  dcard: { width: 104 },
  dimg: { width: 104, height: 148, borderRadius: 8, backgroundColor: '#101322' },
  dtitle: { color: '#DDE1EE', fontSize: 11, marginTop: 6, lineHeight: 14 },
  dmeta: { color: '#7A8296', fontSize: 10, marginTop: 1 },
});

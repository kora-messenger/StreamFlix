import React, { useEffect, useRef, useState } from 'react';
import {
  Animated, FlatList, Image, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions,
  NativeSyntheticEvent, NativeScrollEvent,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { categories, heroBanners, rotatingSearch, titles, Title } from '../data/mock';
import { GradientText } from '../components/ui';
import { DownloadIcon, SearchIcon } from '../components/icons';
import { colors, gradients } from '../theme/tokens';

const BAR_H = 52;
const TABS_H = 44;

function RotatingPlaceholder() {
  const [i, setI] = useState(0);
  const y = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const t = setInterval(() => {
      Animated.timing(y, { toValue: -18, duration: 220, useNativeDriver: true }).start(() => {
        setI(p => (p + 1) % rotatingSearch.length);
        y.setValue(18);
        Animated.timing(y, { toValue: 0, duration: 220, useNativeDriver: true }).start();
      });
    }, 2800);
    return () => clearInterval(t);
  }, [y]);
  return (
    <View style={{ flex: 1, height: 22, overflow: 'hidden', justifyContent: 'center' }}>
      <Animated.Text numberOfLines={1} style={[styles.ph, { transform: [{ translateY: y }] }]}>
        {rotatingSearch[i]}
      </Animated.Text>
    </View>
  );
}

function TitleCard({ item }: { item: Title }) {
  return (
    <View style={styles.card}>
      <Image source={item.poster} style={styles.cardImg} />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text numberOfLines={1} style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardMeta}>{item.year} | {item.genre}</Text>
      </View>
      <LinearGradient colors={gradients.brand} style={styles.dl} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <DownloadIcon size={17} />
      </LinearGradient>
    </View>
  );
}

function Section({ heading, data }: { heading: string; data: Title[] }) {
  return (
    <View style={{ marginTop: 22 }}>
      <Text style={styles.sectionTitle}>{heading}</Text>
      <FlatList
        horizontal
        data={data}
        keyExtractor={d => d.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
        renderItem={({ item }) => <TitleCard item={item} />}
      />
    </View>
  );
}

export default function HomeScreen() {
  const nav = useNavigation<any>();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState(1);
  const [slide, setSlide] = useState(0);
  const listRef = useRef<FlatList>(null);
  const heroH = width * 1.12;

  useEffect(() => {
    const t = setInterval(() => {
      setSlide(p => {
        const n = (p + 1) % heroBanners.length;
        listRef.current?.scrollToOffset({ offset: n * width, animated: true });
        return n;
      });
    }, 4200);
    return () => clearInterval(t);
  }, [width]);

  const onEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) =>
    setSlide(Math.round(e.nativeEvent.contentOffset.x / width));

  return (
    <View style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }} stickyHeaderIndices={[]}>
        {/* Hero banner sits behind the bar + tabs */}
        <View style={{ height: heroH }}>
          <FlatList
            ref={listRef}
            data={heroBanners}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={onEnd}
            keyExtractor={h => h.id}
            getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
            renderItem={({ item }) => (
              <View style={{ width, height: heroH }}>
                <Image source={item.image} style={{ width, height: heroH }} resizeMode="cover" />
                <View style={styles.heroText}>
                  <Text style={styles.heroTitle}>{item.title}</Text>
                  <Text style={styles.heroMeta}>{item.meta}</Text>
                </View>
              </View>
            )}
          />
          <LinearGradient
            pointerEvents="none"
            colors={['rgba(5,5,7,0.85)', 'rgba(5,5,7,0)']}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, height: insets.top + BAR_H + TABS_H + 30 }}
          />
          <LinearGradient
            pointerEvents="none"
            colors={['rgba(5,5,7,0)', 'rgba(5,5,7,0.7)', colors.bg]}
            style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: heroH * 0.42 }}
          />
          <View style={styles.dots} pointerEvents="none">
            {heroBanners.map((h, i) => (
              <View key={h.id} style={[styles.dot, i === slide ? styles.dotOn : null]} />
            ))}
          </View>
        </View>

        <View style={{ marginTop: -50 }}>
          <Section heading="Trending Now" data={titles.slice(0, 8)} />
          <Section heading="Popular Movies" data={titles.slice(4, 12)} />
          <Section heading="New Releases" data={[...titles].reverse().slice(0, 8)} />
        </View>
      </ScrollView>

      {/* Fixed top bar + tabs (overlay) */}
      <View style={[styles.top, { paddingTop: insets.top + 6 }]} pointerEvents="box-none">
        <View style={styles.bar}>
          <Image source={require('../assets/img/logo_soft.png')} style={styles.logo} resizeMode="contain" />
          <Pressable style={styles.pill} onPress={() => nav.navigate('Search')}>
            <SearchIcon size={19} color="#a9adc2" />
            <View style={{ width: 10 }} />
            <RotatingPlaceholder />
            <View style={styles.searchWord}>
              <GradientText text="Search" size={15} width={52} height={20} weight="700" colorsArr={gradients.brand} />
            </View>
          </Pressable>
          {/* Ad slot: intentionally empty until ads are introduced */}
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
          {categories.map((c, i) => (
            <Pressable key={c} onPress={() => setTab(i)} style={{ marginRight: 26 }}>
              <Text style={[styles.tab, i === tab ? styles.tabOn : null]}>{c}</Text>
              {i === tab ? (
                <LinearGradient colors={gradients.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.tabLine} />
              ) : null}
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  top: { position: 'absolute', top: 0, left: 0, right: 0 },
  bar: { height: BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14 },
  logo: { width: 40, height: 40, marginRight: 10 },
  pill: {
    flex: 1, height: 40, borderRadius: 20, backgroundColor: 'rgba(40,42,52,0.88)',
    flexDirection: 'row', alignItems: 'center', paddingLeft: 14, paddingRight: 4, marginRight: 12,
  },
  ph: { color: '#c7cadb', fontSize: 14.5 },
  searchWord: { paddingLeft: 12, paddingRight: 6 },
  tabs: { paddingHorizontal: 16, height: TABS_H, alignItems: 'center' },
  tab: { color: '#a9adc2', fontSize: 17, fontWeight: '500', paddingVertical: 6 },
  tabOn: { color: '#fff', fontWeight: '800' },
  tabLine: { height: 3, borderRadius: 2, marginTop: -1 },
  heroText: { position: 'absolute', left: 20, bottom: 70 },
  heroTitle: { color: '#fff', fontSize: 30, fontWeight: '900', letterSpacing: -0.5, textShadowColor: 'rgba(0,0,0,0.6)', textShadowRadius: 8 },
  heroMeta: { color: '#d4d7e6', fontSize: 14, marginTop: 4 },
  dots: { position: 'absolute', bottom: 66, alignSelf: 'center', flexDirection: 'row' },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.35)', marginHorizontal: 3 },
  dotOn: { width: 18, backgroundColor: '#00D2FF' },
  sectionTitle: { color: '#fff', fontSize: 19, fontWeight: '800', marginLeft: 16, marginBottom: 12 },
  card: {
    width: 232, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface,
    borderRadius: 14, padding: 10,
  },
  cardImg: { width: 58, height: 84, borderRadius: 8 },
  cardTitle: { color: '#fff', fontSize: 15, fontWeight: '700' },
  cardMeta: { color: '#9a9db0', fontSize: 12.5, marginTop: 4 },
  dl: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
});

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, Animated, Image, PanResponder, Pressable, StyleSheet, Text, View, useWindowDimensions,
} from 'react-native';
import Video from 'react-native-video';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { TEST_HLS } from '../components/VideoPlayer';
import {
  BookmarkRibbonIcon, ChevronDownIcon, CrownIcon, DialIcon, DownloadTrayIcon, ShareIcon, StackIcon,
} from '../components/icons';

/* Drama player — MovieBox-style full-screen short-drama player measured
   from the reference screenshots. Behavior per Ijezie:
   - every overlay (top EP bar, right icon column, bottom meta, episode
     pill, utility row, seek line, subtitle) auto-hides after 3s
   - tap with overlays hidden brings them back
   - tap while overlays are visible pauses the video (and vice versa);
     while paused the overlays stay put
   - the thin line at the very bottom is the ONLY way to seek/forward
     (no double-tap seeks, no hold-to-2x in this player) */

const SPEEDS = [1, 1.25, 1.5, 2];

const BackChev = ({ size = 26, color = '#fff' }: { size?: number; color?: string }) => (
  <Text style={{ color, fontSize: size, lineHeight: size + 2, fontWeight: '300' }}>{'\u2039'}</Text>
);

const PlayTri = ({ size = 26 }: { size?: number }) => (
  <View
    style={{
      width: 0, height: 0, marginLeft: size * 0.06,
      borderLeftWidth: size * 0.42, borderRightWidth: 0,
      borderTopWidth: size * 0.25, borderBottomWidth: size * 0.25,
      borderLeftColor: '#fff', borderTopColor: 'transparent', borderBottomColor: 'transparent',
    }}
  />
);

export default function DramaPlayerScreen() {
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const { width: W } = useWindowDimensions();
  const { title, episodes = 32, poster, epLabel = 'EP01' } = route.params ?? {};

  const [paused, setPaused] = useState(false);
  const [controls, setControls] = useState(true);
  const [pos, setPos] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffering, setBuffering] = useState(true);
  const [scrub, setScrub] = useState(false);
  const [saved, setSaved] = useState(false);
  const [expand, setExpand] = useState(false);
  const [speed, setSpeed] = useState(0);
  const player = useRef<any>(null);
  const hideT = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fade = useRef(new Animated.Value(1)).current;
  const posRef = useRef(0);
  posRef.current = pos;

  /* ---- overlay auto-hide: 3s, only while playing ---- */
  const armHide = useCallback(() => {
    if (hideT.current) clearTimeout(hideT.current);
    hideT.current = setTimeout(() => setControls(false), 3000);
  }, []);
  useEffect(() => {
    armHide();
    return () => { if (hideT.current) clearTimeout(hideT.current); };
  }, [armHide]);
  /* paused = overlays stay visible */
  useEffect(() => {
    if (paused && hideT.current) clearTimeout(hideT.current);
    if (paused) setControls(true);
  }, [paused]);
  useEffect(() => {
    Animated.timing(fade, { toValue: controls ? 1 : 0, duration: 240, useNativeDriver: true }).start();
  }, [controls, fade]);

  /* ---- single tap: hidden -> show overlays; visible -> pause/resume ---- */
  const onScreenTap = () => {
    if (!controls) { setControls(true); armHide(); return; }
    if (paused) { setPaused(false); armHide(); } else { setPaused(true); }
  };

  /* ---- the bottom line is the only seek surface ---- */
  const startX = useRef(0);
  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        setScrub(true);
        startX.current = e.nativeEvent.locationX;
        seek(startX.current / W);
      },
      onPanResponderMove: (_e, g) => seek((startX.current + g.dx) / W),
      onPanResponderRelease: () => setScrub(false),
      onPanResponderTerminate: () => setScrub(false),
    }),
  ).current;
  const seek = (ratio: number) => {
    const r = Math.max(0, Math.min(0.999, ratio));
    const t = r * (duration || 0);
    setPos(t);
    player.current?.seek?.(t);
  };

  const pct = duration > 0 ? Math.min(1, pos / duration) : 0;

  return (
    <View style={styles.root}>
      <Video
        ref={player}
        source={{ uri: TEST_HLS }}
        style={StyleSheet.absoluteFill}
        paused={paused}
        rate={SPEEDS[speed]}
        resizeMode="cover"
        onProgress={(e: any) => { if (!scrub) { setPos(e.currentTime); setBuffering(false); } }}
        onLoad={(e: any) => { setDuration(e.duration); setBuffering(false); }}
        onError={() => setBuffering(false)}
      />

      {/* tap catcher */}
      <Pressable style={StyleSheet.absoluteFill} onPress={onScreenTap} />

      {buffering ? (
        <View style={styles.center} pointerEvents="none">
          <ActivityIndicator color="#fff" />
        </View>
      ) : paused && controls ? (
        <View style={styles.center} pointerEvents="none">
          <View style={styles.playBtn}>
            <PlayTri size={30} />
          </View>
        </View>
      ) : null}

      {/* overlays */}
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: fade }]} pointerEvents="box-none">
        {/* top bar */}
        <View style={[styles.top, { paddingTop: insets.top + 8 }]}>
          <Pressable style={styles.back} onPress={() => nav.goBack()}>
            <BackChev />
            <Text style={styles.epTitle}>{epLabel}</Text>
          </Pressable>
        </View>

        {/* subtitle */}
        <View style={styles.subWrap} pointerEvents="none">
          <Text style={styles.sub}>Oh come out</Text>
        </View>

        {/* right icon column */}
        <View style={styles.rightCol}>
          <Pressable style={styles.rBtn} onPress={() => {}}>
            <DownloadTrayIcon size={23} />
          </Pressable>
          <Pressable style={styles.rBtn} onPress={() => setSaved(s => !s)}>
            <BookmarkRibbonIcon size={21} color={saved ? '#0FFFB0' : '#fff'} filled={saved} />
            <Text style={styles.rCount}>{saved ? 79 : 78}</Text>
          </Pressable>
          <Pressable style={styles.rBtn} onPress={() => {}}>
            <ShareIcon size={21} />
          </Pressable>
        </View>

        {/* bottom block */}
        <View style={[styles.bottom, { paddingBottom: insets.bottom + 6 }]} pointerEvents="box-none">
          <View style={styles.metaRow}>
            <Image source={poster} style={styles.thumb} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text numberOfLines={1} style={styles.dTitle}>{title}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text numberOfLines={expand ? 4 : 1} style={styles.dDesc}>
                  {epLabel} | {title}: a scholarship student by day, masked singer by night. Secrets stack up faster than she can sing them away.
                </Text>
                <Pressable style={styles.more} onPress={() => setExpand(x => !x)}>
                  <Text style={styles.moreTxt}>{expand ? 'Less ^' : 'More v'}</Text>
                </Pressable>
              </View>
            </View>
          </View>

          {/* episode selector pill */}
          <Pressable style={styles.epPill} onPress={() => {}}>
            <StackIcon size={14} />
            <Text style={styles.epPillTxt}>{epLabel} / EP{episodes}</Text>
            <ChevronDownIcon size={13} color="#fff" />
          </Pressable>

          {/* utility row */}
          <View style={styles.utilRow}>
            <Pressable style={styles.premium} onPress={() => {}}>
              <CrownIcon size={11} color="#B8860B" />
              <Text style={styles.premiumTxt}>Premium Pro</Text>
            </Pressable>
            <View style={{ flex: 1 }} />
            <Pressable style={styles.speedWrap} onPress={() => setSpeed(s => (s + 1) % SPEEDS.length)}>
              <Text style={styles.speedTxt}>{SPEEDS[speed]}x</Text>
              <DialIcon size={15} />
            </Pressable>
            <View style={styles.qPill}>
              <Text style={styles.qTxt}>HD 480P</Text>
            </View>
          </View>
        </View>
      </Animated.View>

      {/* seek line — always tappable, the only way to forward */}
      <View style={[styles.seekZone, { bottom: insets.bottom + 6 }]} {...pan.panHandlers}>
        <View style={[styles.track, scrub && styles.trackScrub]}>
          <View style={[styles.fill, { width: `${pct * 100}%` }]} />
        </View>
        <View style={[styles.handle, { left: `${pct * 100}%` }, scrub && styles.handleScrub]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  center: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' },
  playBtn: {
    width: 62, height: 62, borderRadius: 31, backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center', alignItems: 'center',
  },
  top: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row' },
  back: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingRight: 14, paddingLeft: 10 },
  epTitle: { color: '#fff', fontSize: 16, fontWeight: '600', marginLeft: 8 },
  subWrap: { position: 'absolute', left: 0, right: 0, bottom: '34%', alignItems: 'center' },
  sub: { color: '#fff', fontSize: 16, fontWeight: '600', textShadowColor: 'rgba(0,0,0,0.9)', textShadowRadius: 4 },
  rightCol: { position: 'absolute', right: 10, bottom: '31%', alignItems: 'center' },
  rBtn: { alignItems: 'center', paddingVertical: 9, paddingHorizontal: 6 },
  rCount: { color: '#fff', fontSize: 10, marginTop: 2 },
  bottom: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.55)', paddingTop: 10, paddingHorizontal: 14 },
  metaRow: { flexDirection: 'row', alignItems: 'center' },
  thumb: { width: 42, height: 42, borderRadius: 6, backgroundColor: '#222' },
  dTitle: { color: '#fff', fontSize: 14, fontWeight: '700' },
  dDesc: { color: '#B9BFCF', fontSize: 10.5, flex: 1, lineHeight: 14 },
  more: { backgroundColor: '#3A3F4B', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3, marginLeft: 6 },
  moreTxt: { color: '#E5E8F0', fontSize: 9.5, fontWeight: '600' },
  epPill: {
    flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start',
    backgroundColor: 'rgba(51,51,51,0.92)', borderRadius: 15, height: 30,
    paddingHorizontal: 10, marginTop: 10, gap: 6,
  },
  epPillTxt: { color: '#fff', fontSize: 12, fontWeight: '600' },
  utilRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12, marginBottom: 26 },
  premium: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFD700',
    borderRadius: 13, height: 26, paddingHorizontal: 10, gap: 4,
  },
  premiumTxt: { color: '#111', fontSize: 11.5, fontWeight: '800' },
  speedWrap: { flexDirection: 'row', alignItems: 'center', marginRight: 10, gap: 4, paddingVertical: 4, paddingLeft: 4 },
  speedTxt: { color: '#fff', fontSize: 12.5, fontWeight: '700' },
  qPill: {
    borderWidth: 1, borderColor: '#6B7180', borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  qTxt: { color: '#fff', fontSize: 10.5, fontWeight: '600' },
  seekZone: { position: 'absolute', left: 0, right: 0, height: 16, justifyContent: 'center' },
  track: { height: 2.5, backgroundColor: 'rgba(255,255,255,0.35)', borderRadius: 1.5 },
  trackScrub: { height: 5 },
  fill: { height: '100%', backgroundColor: '#fff', borderRadius: 1.5 },
  handle: {
    position: 'absolute', width: 11, height: 11, borderRadius: 5.5, backgroundColor: '#fff',
    marginLeft: -5, top: 2.5,
  },
  handleScrub: { width: 15, height: 15, borderRadius: 7.5, marginLeft: -7, top: 0.5 },
});

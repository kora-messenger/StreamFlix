import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated, PanResponder, Pressable, StatusBar, StyleSheet, Text, View, useWindowDimensions,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Video, { SelectedTrackType, VideoRef, type TextTrack } from 'react-native-video';
import Orientation from 'react-native-orientation-locker';
import { LinearGradient } from 'react-native-linear-gradient';
import {
  BackIcon, BrightnessIcon, CastIcon, CcIcon, DotsIcon, Forward10Icon,
  FullscreenIcon, PauseIcon, PlayIcon, Rewind10Icon, SpeedIcon, VolumeIcon,
} from '../components/icons';
import { GradientText } from '../components/ui';

const TEST_HLS = 'https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_ts/master.m3u8';
const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];
const fmt = (s: number) => {
  if (!Number.isFinite(s) || s < 0) s = 0;
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = Math.floor(s % 60);
  const mm = h > 0 ? `${String(m).padStart(2, '0')}` : `${m}`;
  return (h > 0 ? `${h}:` : '') + `${mm}:${String(sec).padStart(2, '0')}`;
};

/**
 * Video player — real playback (HLS/MP4 through native Media3/ExoPlayer) with
 * the MovieBox-style gesture layer, built on StreamFlix's design:
 * double-tap left/right = ±10s, vertical swipe = brightness (left) / volume (right),
 * auto-hiding controls, speed sheet, subtitle sheet, purple seek bar.
 */
export default function VideoPlayerScreen() {
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const { width: W, height: H } = useWindowDimensions();
  const land = W > H; // landscape
  const k = Math.min(W, H) / 683;

  const { title = '', url = TEST_HLS } = route.params ?? {};

  const player = useRef<VideoRef>(null);
  const [paused, setPaused] = useState(false);
  const [rate, setRate] = useState(1);
  const [volume, setVolume] = useState(1);
  const [brightness, setBrightness] = useState(1); // visual dim
  const [duration, setDuration] = useState(0);
  const [pos, setPos] = useState(0);
  const [buffering, setBuffering] = useState(true);
  const [controls, setControls] = useState(true);
  const [scrubbing, setScrubbing] = useState(false);
  const [fill, setFill] = useState(false); // contain <-> cover
  const [sheet, setSheet] = useState<null | 'speed' | 'subs'>(null);
  const [tracks, setTracks] = useState<TextTrack[]>([]);
  const [trackIdx, setTrackIdx] = useState(-1); // -1 = off
  const [ripple, setRipple] = useState<null | { side: 'l' | 'r'; key: number }>(null);
  const [hud, setHud] = useState<null | { kind: 'b' | 'v'; value: number }>(null);

  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hudTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rippleFade = useRef(new Animated.Value(0)).current;

  // lock to landscape for real playback, hide system bars
  useEffect(() => {
    Orientation.lockToLandscape();
    StatusBar.setHidden(true);
    return () => {
      Orientation.unlockAllOrientations();
      StatusBar.setHidden(false);
    };
  }, []);

  const showControls = useCallback(() => {
    setControls(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      setControls(false);
      setSheet(null);
    }, 3200);
  }, []);
  useEffect(() => { showControls(); return () => { if (hideTimer.current) clearTimeout(hideTimer.current); }; }, [showControls]);

  const seekBy = useCallback((delta: number) => {
    setPos(p => {
      const t = Math.max(0, Math.min(duration || 0, p + delta));
      player.current?.seek(t);
      return t;
    });
  }, [duration]);

  const flashRipple = useCallback((side: 'l' | 'r') => {
    setRipple({ side, key: Date.now() });
    rippleFade.setValue(1);
    Animated.timing(rippleFade, { toValue: 0, duration: 520, useNativeDriver: true }).start();
  }, [rippleFade]);

  // ---------- gesture layer (MovieBox-style) ----------
  const g = useRef({
    x0: 0, y0: 0, b0: 1, v0: 1, moved: false, mode: null as null | 'b' | 'v',
    lastTap: 0, tapSide: 'l' as 'l' | 'r',
  });
  const pan = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_e, gs) => Math.abs(gs.dy) > 10 && Math.abs(gs.dy) > Math.abs(gs.dx),
    onPanResponderGrant: (e) => {
      g.current.x0 = e.nativeEvent.locationX;
      g.current.y0 = e.nativeEvent.locationY;
      g.current.moved = false;
      g.current.b0 = brightness;
      g.current.v0 = volume;
      g.current.mode = null;
    },
    onPanResponderMove: (_e, gs) => {
      if (Math.abs(gs.dy) > 14 && !g.current.mode) {
        g.current.mode = g.current.x0 < W / 2 ? 'b' : 'v';
        g.current.moved = true;
      }
      if (g.current.mode === 'b') {
        const b = Math.max(0.25, Math.min(1, g.current.b0 - gs.dy / (H * 0.8)));
        setBrightness(b);
        setHud({ kind: 'b', value: b });
      } else if (g.current.mode === 'v') {
        const v = Math.max(0, Math.min(1, g.current.v0 - gs.dy / (H * 0.8)));
        setVolume(v);
        setHud({ kind: 'v', value: v });
      }
    },
    onPanResponderRelease: (_e, gs) => {
      if (g.current.mode) {
        if (hudTimer.current) clearTimeout(hudTimer.current);
        hudTimer.current = setTimeout(() => setHud(null), 650);
        return;
      }
      if (Math.abs(gs.dx) < 10 && Math.abs(gs.dy) < 10) {
        const now = Date.now();
        const side = g.current.x0 < W / 2 ? 'l' : 'r';
        if (now - g.current.lastTap < 300 && side === g.current.tapSide) {
          // double tap -> seek 10s like MovieBox
          if (tapTimer.current) { clearTimeout(tapTimer.current); tapTimer.current = null; }
          g.current.lastTap = 0;
          flashRipple(side);
          seekBy(side === 'l' ? -10 : 10);
        } else {
          g.current.lastTap = now;
          g.current.tapSide = side;
          // single tap -> toggle controls (delayed so double-tap can cancel)
          if (tapTimer.current) clearTimeout(tapTimer.current);
          tapTimer.current = setTimeout(() => {
            setControls(c => { if (c) { if (hideTimer.current) clearTimeout(hideTimer.current); return false; } showControls(); return true; });
          }, 290);
        }
      }
    },
  }), [W, H, brightness, volume, seekBy, showControls, flashRipple]);

  // ---------- seek bar ----------
  const barW = useRef(0);
  const barPan = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (e) => { setScrubbing(true); const f = e.nativeEvent.locationX / Math.max(1, barW.current); setPos(Math.max(0, Math.min(1, f)) * duration); },
    onPanResponderMove: (e) => { const f = e.nativeEvent.locationX / Math.max(1, barW.current); setPos(Math.max(0, Math.min(1, f)) * duration); },
    onPanResponderRelease: () => { player.current?.seek(pos); setScrubbing(false); },
  }), [duration, pos]);

  const knob = duration > 0 ? Math.min(1, pos / duration) : 0;

  // ---------- sheets ----------
  const Sheet = ({ kind, children }: { kind: 'speed' | 'subs'; children: React.ReactNode }) => (
    <View style={styles.sheetWrap} pointerEvents="box-none">
      <Pressable style={StyleSheet.absoluteFill} onPress={() => setSheet(null)} />
      <View style={styles.sheet}>
        <Text style={styles.sheetTitle}>{kind === 'speed' ? 'Playback speed' : 'Subtitles'}</Text>
        {children}
      </View>
    </View>
  );

  return (
    <View style={styles.root} {...pan.panHandlers}>
      <Video
        ref={player}
        source={{ uri: url }}
        style={StyleSheet.absoluteFill}
        resizeMode={fill ? 'cover' : 'contain'}
        paused={paused || scrubbing || sheet !== null}
        rate={rate}
        volume={volume}
        onProgress={({ currentTime, seekableDuration }) => { if (!scrubbing) setPos(currentTime); if (seekableDuration) setDuration(d => (seekableDuration > d ? seekableDuration : d)); }}
        onLoad={({ duration: d, textTracks: tt }) => { setDuration(d || 0); if (tt?.length) setTracks(tt); setBuffering(false); }}
        onBuffer={({ isBuffering }) => setBuffering(isBuffering)}
        onEnd={() => { setPaused(true); setPos(duration); setControls(true); }}
        onError={() => setBuffering(false)}
        selectedTextTrack={trackIdx >= 0 && tracks[trackIdx] ? { type: SelectedTrackType.INDEX, value: trackIdx } : { type: SelectedTrackType.DISABLED }}
        progressUpdateInterval={250}
      />

      {/* brightness dim layer */}
      {brightness < 1 && <View style={[styles.dim, { opacity: (1 - brightness) * 0.85 }]} pointerEvents="none" />}

      {/* buffering spinner */}
      {buffering && (
        <View style={styles.spinnerWrap} pointerEvents="none">
          <View style={styles.spinner}><PlayIcon size={30} color="rgba(255,255,255,0.25)" /></View>
        </View>
      )}

      {/* double-tap seek ripples */}
      {ripple && (
        <Animated.View key={ripple.key} style={[styles.ripple, { left: ripple.side === 'l' ? W * 0.08 : undefined, right: ripple.side === 'r' ? W * 0.08 : undefined, opacity: rippleFade }]} pointerEvents="none">
          {ripple.side === 'l' ? <Rewind10Icon size={34} /> : <Forward10Icon size={34} />}
          <Text style={styles.rippleText}>{ripple.side === 'l' ? '-10s' : '+10s'}</Text>
        </Animated.View>
      )}

      {/* gesture HUD (brightness / volume) */}
      {hud && (
        <View style={styles.hud} pointerEvents="none">
          {hud.kind === 'b' ? <BrightnessIcon size={20} /> : <VolumeIcon size={20} />}
          <View style={styles.hudTrack}>
            <View style={[styles.hudFill, { width: `${Math.round(hud.value * 100)}%` }]} />
          </View>
        </View>
      )}

      {/* ---------- controls overlay ---------- */}
      {controls && (
        <>
          <LinearGradient colors={['rgba(3,4,10,0.85)', 'rgba(3,4,10,0.45)', 'rgba(3,4,10,0)']} style={styles.topShade} pointerEvents="none" />
          <LinearGradient colors={['rgba(3,4,10,0)', 'rgba(3,4,10,0.45)', 'rgba(3,4,10,0.85)']} style={styles.botShade} pointerEvents="none" />

          {/* top bar: back + StreamFlix lockup ... cast, CC, dots */}
          <View style={[styles.topBar, { height: Math.max(52, H * 0.13) }]}>
            <Pressable hitSlop={12} onPress={() => nav.goBack()}>
              <BackIcon size={Math.round(k * 26)} />
            </Pressable>
            <View style={styles.lockup}>
              <PlayIcon size={Math.round(k * 22)} />
              <Text style={styles.lockupWm}>Stream</Text>
              <GradientText text="Flix" size={Math.round(k * 20)} width={Math.round(k * 42)} height={Math.round(k * 26)} weight="800" />
            </View>
            <View style={{ flex: 1 }} />
            <Pressable hitSlop={10} style={styles.topIcon}><CastIcon size={Math.round(k * 22)} /></Pressable>
            <Pressable hitSlop={10} onPress={() => setSheet('subs')} style={[styles.ccBox, trackIdx >= 0 && styles.ccOn]}>
              <CcIcon size={Math.round(k * 24)} color={trackIdx >= 0 ? '#00D2FF' : '#fff'} />
            </Pressable>
            <Pressable hitSlop={10} onPress={() => setSheet('speed')} style={styles.topIcon}><DotsIcon size={Math.round(k * 22)} /></Pressable>
          </View>

          {/* center: rewind / pause / forward on a subtle dark pill */}
          <View style={styles.centerPill} pointerEvents="box-none">
            <Pressable hitSlop={16} onPress={() => { seekBy(-10); showControls(); }}>
              <Rewind10Icon size={Math.round(k * 52)} />
            </Pressable>
            <Pressable hitSlop={16} onPress={() => { setPaused(p => !p); showControls(); }} style={styles.playWrap}>
              {paused ? <PlayIcon size={Math.round(k * 54)} /> : <PauseIcon size={Math.round(k * 54)} />}
            </Pressable>
            <Pressable hitSlop={16} onPress={() => { seekBy(10); showControls(); }}>
              <Forward10Icon size={Math.round(k * 52)} />
            </Pressable>
          </View>

          {/* bottom: time, seek bar, duration, fullscreen */}
          <View style={[styles.bottom, { paddingBottom: Math.max(10, H * 0.045) }]}>
            <Text style={styles.time}>{fmt(scrubbing ? pos : pos)}</Text>
            <View
              style={styles.bar}
              onLayout={e => { barW.current = e.nativeEvent.layout.width; }}
              {...barPan.panHandlers}
            >
              <View style={[styles.track, { backgroundColor: 'rgba(74,74,74,0.55)' }]} />
              <View style={[styles.track, styles.played, { width: `${knob * 100}%` }]} />
              <View style={[styles.knob, { left: `calc(${knob * 100}% - 6px)` }]} />
            </View>
            <Text style={styles.time}>{fmt(duration)}</Text>
            <Pressable hitSlop={10} onPress={() => { setFill(f => !f); showControls(); }}>
              <FullscreenIcon size={Math.round(k * 22)} />
            </Pressable>
          </View>
        </>
      )}

      {/* ---------- speed sheet ---------- */}
      {sheet === 'speed' && (
        <Sheet kind="speed">
          <View style={styles.chips}>
            {SPEEDS.map(s => (
              <Pressable key={s} style={[styles.chip, rate === s && styles.chipOn]} onPress={() => { setRate(s); setSheet(null); }}>
                <Text style={[styles.chipText, rate === s && styles.chipTextOn]}>{s === 1 ? 'Normal' : `${s}x`}</Text>
              </Pressable>
            ))}
          </View>
        </Sheet>
      )}

      {/* ---------- subtitle sheet ---------- */}
      {sheet === 'subs' && (
        <Sheet kind="subs">
          <View style={styles.subList}>
            <Pressable style={styles.subRow} onPress={() => { setTrackIdx(-1); setSheet(null); }}>
              <Text style={[styles.subText, trackIdx === -1 && styles.subTextOn]}>Off</Text>
              {trackIdx === -1 && <Text style={styles.subCheck}>✓</Text>}
            </Pressable>
            {tracks.map((t, i) => (
              <Pressable key={i} style={styles.subRow} onPress={() => { setTrackIdx(i); setSheet(null); }}>
                <Text style={[styles.subText, trackIdx === i && styles.subTextOn]}>{t.title || t.language || `Track ${i + 1}`}</Text>
                {trackIdx === i && <Text style={styles.subCheck}>✓</Text>}
              </Pressable>
            ))}
            {tracks.length === 0 && <Text style={styles.subEmpty}>No subtitles in this stream</Text>}
          </View>
        </Sheet>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  dim: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#000' },
  spinnerWrap: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  spinner: {
    width: 54, height: 54, borderRadius: 27, backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center', justifyContent: 'center',
  },
  topShade: { position: 'absolute', top: 0, left: 0, right: 0, height: '26%' },
  botShade: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '26%' },
  topBar: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 22, gap: 18 },
  lockup: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  lockupWm: { color: '#fff', fontWeight: '800', fontSize: 20, letterSpacing: 0.2 },
  topIcon: { paddingVertical: 8 },
  ccBox: {
    borderWidth: 1.6, borderColor: 'rgba(255,255,255,0.9)', borderRadius: 7,
    paddingHorizontal: 6, paddingVertical: 4, marginHorizontal: 4,
  },
  ccOn: { borderColor: '#00D2FF' },
  centerPill: {
    position: 'absolute', left: 0, right: 0, top: 0, bottom: 0,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '18%',
  },
  playWrap: {
    width: 78, height: 78, borderRadius: 39, backgroundColor: 'rgba(10,12,24,0.55)',
    alignItems: 'center', justifyContent: 'center',
  },
  bottom: {
    position: 'absolute', left: 0, right: 0, flexDirection: 'row',
    alignItems: 'center', gap: 14, paddingHorizontal: 22,
  },
  time: { color: '#fff', fontSize: 13, fontWeight: '600', fontVariant: ['tabular-nums'] },
  bar: { flex: 1, height: 30, justifyContent: 'center' },
  track: { position: 'absolute', left: 0, right: 0, height: 3.5, borderRadius: 2 },
  played: { right: 'auto', backgroundColor: '#8A2BE2' },
  knob: {
    position: 'absolute', width: 12, height: 12, borderRadius: 6, backgroundColor: '#fff',
    shadowColor: '#8A2BE2', shadowOpacity: 0.8, shadowRadius: 6, shadowOffset: { width: 0, height: 0 }, elevation: 4,
  },
  ripple: {
    position: 'absolute', top: '50%', marginTop: -46, alignItems: 'center',
    backgroundColor: 'rgba(8,9,20,0.5)', borderRadius: 40, paddingHorizontal: 22, paddingVertical: 12,
  },
  rippleText: { color: '#fff', fontSize: 14, fontWeight: '700', marginTop: 4 },
  hud: {
    position: 'absolute', left: '50%', marginLeft: -120, bottom: '18%',
    width: 240, flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: 'rgba(8,9,20,0.65)', borderRadius: 18, paddingHorizontal: 16, paddingVertical: 10,
  },
  hudTrack: { flex: 1, height: 3.5, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.25)', overflow: 'hidden' },
  hudFill: { height: '100%', backgroundColor: '#fff' },
  sheetWrap: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' },
  sheet: {
    width: 340, backgroundColor: 'rgba(10,12,26,0.96)', borderRadius: 16,
    paddingHorizontal: 20, paddingVertical: 16, borderWidth: 1, borderColor: 'rgba(108,99,255,0.35)',
  },
  sheetTitle: { color: '#fff', fontWeight: '700', fontSize: 15, marginBottom: 14 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'transparent',
  },
  chipOn: { backgroundColor: 'rgba(108,99,255,0.25)', borderColor: '#6C63FF' },
  chipText: { color: '#c9cbe0', fontSize: 13, fontWeight: '600' },
  chipTextOn: { color: '#fff' },
  subList: { gap: 4 },
  subRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 8 },
  subText: { color: '#c9cbe0', fontSize: 14, flex: 1 },
  subTextOn: { color: '#00D2FF', fontWeight: '700' },
  subCheck: { color: '#00D2FF', fontSize: 15, fontWeight: '800' },
  subEmpty: { color: '#8a8d9f', fontSize: 13, paddingVertical: 8 },
});

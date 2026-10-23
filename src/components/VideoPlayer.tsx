import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated, Modal, PanResponder, Pressable, StatusBar, StyleSheet, Text, View,
  useWindowDimensions,
} from 'react-native';
import Video, { SelectedTrackType, VideoRef, type TextTrack } from 'react-native-video';
import Orientation from 'react-native-orientation-locker';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import {
  BackIcon, FullscreenIcon, PauseIcon, PlayIcon, Rewind10Icon, Forward10Icon,
} from './icons';

export const TEST_HLS =
  'https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_ts/master.m3u8';
const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];
const ACCENT = '#00D2FF';
/* MovieBox volume/brightness HUD — exact colors sampled from the reference build */
const HUD_GREEN = '#0FA64C';   /* boost (100–200%) fill */
const HUD_WHITE = '#FFFFFF';   /* normal (0–100%) fill + boost track */

const fmt = (s: number) => {
  if (!Number.isFinite(s) || s < 0) s = 0;
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  const mm = String(m).padStart(2, '0');
  const ss = String(sec).padStart(2, '0');
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
};

/* ---------- small icons local to the player ---------- */
const HelpIcon = ({ size = 22 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9.2" stroke="#fff" strokeWidth="1.7" />
    <Path d="M9.4 9.4a2.7 2.7 0 1 1 3.9 2.4c-.8.45-1.3 1-1.3 1.9" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" fill="none" />
    <Circle cx="12" cy="16.9" r="1" fill="#fff" />
  </Svg>
);
const GearIcon = ({ size = 22 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="3.1" stroke="#fff" strokeWidth="1.7" />
    <Path d="M12 3.2l1.5 2.1 2.5-.5.9 2.4 2.4.9-.5 2.5 2.1 1.5-2.1 1.5.5 2.5-2.4.9-.9 2.4-2.5-.5L12 20.8l-1.5-2.1-2.5.5-.9-2.4-2.4-.9.5-2.5L3.1 12l2.1-1.5-.5-2.5 2.4-.9.9-2.4 2.5.5L12 3.2z" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
  </Svg>
);
const MiniWindowIcon = ({ size = 22 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M4 11V6.5A2.5 2.5 0 0 1 6.5 4H18a2 2 0 0 1 2 2v5" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" fill="none" />
    <Rect x="11" y="12" width="9" height="7" rx="1.6" stroke="#fff" strokeWidth="1.7" />
    <Path d="M3 17.5l3.6-3.6M3 14v3.6h3.6" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </Svg>
);
const LockOpenIcon = ({ size = 18, locked = false }: { size?: number; locked?: boolean }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="5" y="10.5" width="14" height="9.5" rx="2.2" stroke="#fff" strokeWidth="1.7" />
    <Path d={locked ? 'M8 10.5V8a4 4 0 0 1 8 0v2.5' : 'M8 10.5V8a4 4 0 0 1 7.6-1.7'} stroke="#fff" strokeWidth="1.7" strokeLinecap="round" fill="none" />
  </Svg>
);
const NextIcon = ({ size = 22 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M6 5.5l9 6.5-9 6.5v-13z" fill="#fff" />
    <Rect x="17" y="5.5" width="2.2" height="13" rx="1" fill="#fff" />
  </Svg>
);
const FitIcon = ({ size = 18 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="6" width="18" height="12" rx="2.2" stroke="#fff" strokeWidth="1.7" />
    <Path d="M8 10v-1h1.2M16 10v-1h-1.2M8 14v1h1.2M16 14v1h-1.2" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" fill="none" />
  </Svg>
);
const LangIcon = ({ size = 18 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="5" width="18" height="13" rx="2.4" stroke="#fff" strokeWidth="1.7" />
    <Path d="M7 10h4M13 10h4M7 13.5h6M15 13.5h2" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
    <Path d="M9 18l-2 3 4-3" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
  </Svg>
);
const SpeedGlyph = ({ size = 18 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M4.5 17a8.5 8.5 0 1 1 15 0" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" />
    <Path d="M12 14l4-4.5" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" />
    <Circle cx="12" cy="15" r="1.3" fill="#fff" />
  </Svg>
);
const RotateIcon = ({ size = 20 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="9" y="3" width="11" height="14" rx="2.2" stroke="#fff" strokeWidth="1.7" />
    <Path d="M4 9v8.5A2.5 2.5 0 0 0 6.5 20H14" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" fill="none" />
    <Path d="M11.5 17.5L14 20l-2.5 2.5" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </Svg>
);

/* ---- MovieBox-style quantized gesture HUD icons ----
   Volume: 4 states (mute / low 33 / high 66 / max 100), Brightness: 3 states.
   Icon swaps by level band exactly like MovieBox's
   ls_ic_player_feedback_volume_0/33/66/100 + brightness_33/66/100 drawables. */
const VolumeLevelIcon = ({ level, size = 20 }: { level: 0 | 1 | 2 | 3; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M4 9.4v5.2h3l4.1 3.3V6.1L7 9.4H4z" fill="#fff" />
    {level === 0 ? (
      <Path d="M14.6 9.2l4.6 5.6M19.2 9.2l-4.6 5.6" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" />
    ) : (
      <>
        {level >= 1 && <Path d="M14.4 9.3a4.2 4.2 0 0 1 0 5.4" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" />}
        {level >= 2 && <Path d="M16.8 7.2a7.4 7.4 0 0 1 0 9.6" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" />}
        {level >= 3 && <Path d="M19.2 5.1a10.6 10.6 0 0 1 0 13.8" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" />}
      </>
    )}
  </Svg>
);
const SunLevelIcon = ({ level, size = 20 }: { level: 1 | 2 | 3; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="4.1" stroke="#fff" strokeWidth="1.7" />
    {level >= 1 && <Path d="M12 3.4v2.4M12 18.2v2.4" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />}
    {level >= 2 && <Path d="M5.7 5.7l1.7 1.7M16.6 16.6l1.7 1.7M18.3 5.7l-1.7 1.7M7.4 16.6l-1.7 1.7" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />}
    {level >= 3 && <Path d="M3.4 12h2.4M18.2 12h2.4" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />}
  </Svg>
);

type Sheet = null | 'speed' | 'lang' | 'setting';

type Props = {
  /** stream url — HLS / MP4 */
  url?: string;
  title: string;
  /** shown in the fullscreen top bar, e.g. "FBI S01 E02 · Green Birds" */
  subtitle?: string;
  onBack: () => void;
  /** show the pre-roll ad before playback (free tier) */
  preRoll?: boolean;
  onGoAdFree?: () => void;
};

/**
 * MovieBox-style player. Portrait: a 16:9 slot that lives at the top of the
 * movie page (parent scrolls below it). Fullscreen: tap the corner icon to
 * take over the screen in landscape with the second control set.
 */
export default function VideoPlayer({
  url = TEST_HLS, title, subtitle, onBack, preRoll = true, onGoAdFree,
}: Props) {
  const { width: SW, height: SH } = useWindowDimensions();
  const portraitW = Math.min(SW, SH);
  const slotH = Math.round(portraitW * 9 / 16);

  const [full, setFull] = useState(false);
  const [paused, setPaused] = useState(false);
  const [rate, setRate] = useState(1);
  const [volume, setVolume] = useState(1);
  const [dim, setDim] = useState(0); // 0..0.75 brightness overlay
  const [pos, setPos] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffering, setBuffering] = useState(true);
  const [controls, setControls] = useState(true);
  const [locked, setLocked] = useState(false);
  const [showUnlock, setShowUnlock] = useState(false);
  const [fit, setFit] = useState<'contain' | 'cover'>('contain');
  const [sheet, setSheet] = useState<Sheet>(null);
  const [tracks, setTracks] = useState<TextTrack[]>([]);
  const [trackIdx, setTrackIdx] = useState(-1);
  const [scrubbing, setScrubbing] = useState(false);
  const [hud, setHud] = useState<null | { kind: 'b' | 'v'; value: number }>(null); // v: 0..2 (1 = 100%, >1 = boost)
  const [ripple, setRipple] = useState<null | { side: 'l' | 'r'; key: number }>(null);
  const [adLeft, setAdLeft] = useState(preRoll ? 30 : 0);

  const player = useRef<VideoRef>(null);
  const hideT = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tapT = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hudT = useRef<ReturnType<typeof setTimeout> | null>(null);
  const unlockT = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rippleA = useRef(new Animated.Value(0)).current;
  const hudA = useRef(new Animated.Value(1)).current;
  const posRef = useRef(0);
  posRef.current = pos;

  /* ---- pre-roll ad countdown ---- */
  useEffect(() => {
    if (adLeft <= 0) return;
    const t = setInterval(() => setAdLeft(s => (s <= 1 ? 0 : s - 1)), 1000);
    return () => clearInterval(t);
  }, [adLeft > 0]); // eslint-disable-line react-hooks/exhaustive-deps
  const adActive = adLeft > 0;

  /* ---- control auto-hide ---- */
  const armHide = useCallback(() => {
    if (hideT.current) clearTimeout(hideT.current);
    hideT.current = setTimeout(() => { setControls(false); setSheet(null); }, 3200);
  }, []);
  const showControls = useCallback(() => { setControls(true); armHide(); }, [armHide]);
  /* MovieBox Layer 2C: the "Tap to Unlock" chip behaves like the controls —
     appears on tap, then auto-hides after ~3s; a tap brings it back. */
  const showUnlockChip = useCallback(() => {
    setShowUnlock(true);
    if (unlockT.current) clearTimeout(unlockT.current);
    unlockT.current = setTimeout(() => setShowUnlock(false), 3200);
  }, []);
  useEffect(() => { armHide(); return () => { if (hideT.current) clearTimeout(hideT.current); }; }, [armHide]);
  useEffect(() => () => { if (unlockT.current) clearTimeout(unlockT.current); }, []);

  /* ---- orientation: fullscreen = landscape, inline = portrait ---- */
  const enterFull = () => { Orientation.lockToLandscape(); StatusBar.setHidden(true); setFull(true); showControls(); };
  const exitFull = () => { Orientation.lockToPortrait(); StatusBar.setHidden(false); setFull(false); setLocked(false); showControls(); };
  useEffect(() => () => { Orientation.lockToPortrait(); StatusBar.setHidden(false); }, []);

  /* ---- seeking ---- */
  const seekTo = useCallback((t: number) => {
    const c = Math.max(0, Math.min(duration || t, t));
    player.current?.seek(c);
    setPos(c);
  }, [duration]);
  const seekBy = useCallback((d: number) => seekTo(posRef.current + d), [seekTo]);

  useEffect(() => { if (hud) hudA.setValue(1); }, [hud, hudA]);

  const flash = useCallback((side: 'l' | 'r') => {
    setRipple({ side, key: Date.now() });
    rippleA.setValue(1);
    Animated.timing(rippleA, { toValue: 0, duration: 560, useNativeDriver: true }).start();
  }, [rippleA]);

  /* ---- gesture layer (tap = controls, double-tap = ±10s, swipe = brightness/volume) ---- */
  const g = useRef({ x0: 0, mode: null as null | 'b' | 'v', b0: 0, v0: 1, lastTap: 0, side: 'l' as 'l' | 'r', w: 1, h: 1 });
  const pan = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_e, s) => Math.abs(s.dy) > 8,
    onPanResponderGrant: e => {
      g.current.x0 = e.nativeEvent.locationX; g.current.mode = null;
      g.current.b0 = dim; g.current.v0 = volume;
    },
    onPanResponderMove: (_e, s) => {
      if (locked) return;
      if (!g.current.mode && Math.abs(s.dy) > 14) g.current.mode = g.current.x0 < g.current.w / 2 ? 'b' : 'v';
      if (g.current.mode === 'b') {
        const d = Math.max(0, Math.min(0.75, g.current.b0 + s.dy / (g.current.h * 1.1)));
        setDim(d); setHud({ kind: 'b', value: 1 - d / 0.75 });
      } else if (g.current.mode === 'v') {
        /* MovieBox two-stage volume: 0–1 = system range (white), 1–2 = boost (green) */
        const v = Math.max(0, Math.min(2, g.current.v0 - s.dy / (g.current.h * 0.62)));
        setVolume(v); setHud({ kind: 'v', value: v });
      }
    },
    onPanResponderRelease: (_e, s) => {
      if (g.current.mode) {
        if (hudT.current) clearTimeout(hudT.current);
        hudT.current = setTimeout(() => {
          Animated.timing(hudA, { toValue: 0, duration: 380, useNativeDriver: true })
            .start(({ finished }) => { if (finished) setHud(null); });
        }, 720);
        return;
      }
      if (Math.abs(s.dx) > 10 || Math.abs(s.dy) > 10) return;
      if (locked) { showUnlockChip(); return; }
      const now = Date.now();
      const side = g.current.x0 < g.current.w / 2 ? 'l' : 'r';
      if (now - g.current.lastTap < 300 && side === g.current.side) {
        if (tapT.current) { clearTimeout(tapT.current); tapT.current = null; }
        g.current.lastTap = 0;
        flash(side); seekBy(side === 'l' ? -10 : 10);
      } else {
        g.current.lastTap = now; g.current.side = side;
        if (tapT.current) clearTimeout(tapT.current);
        tapT.current = setTimeout(() => {
          setControls(c => {
            if (c) { if (hideT.current) clearTimeout(hideT.current); setSheet(null); return false; }
            armHide(); return true;
          });
        }, 290);
      }
    },
  }), [dim, volume, locked, flash, seekBy, armHide, showUnlockChip]);

  /* ---- seek bar ---- */
  const barW = useRef(1);
  const barPan = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: e => { setScrubbing(true); setPos((e.nativeEvent.locationX / barW.current) * duration); },
    onPanResponderMove: e => setPos(Math.max(0, Math.min(1, e.nativeEvent.locationX / barW.current)) * duration),
    onPanResponderRelease: () => { player.current?.seek(posRef.current); setScrubbing(false); armHide(); },
  }), [duration, armHide]);

  const frac = duration > 0 ? Math.min(1, pos / duration) : 0;

  /* ---- the video + gesture surface (shared by both modes) ---- */
  const surface = (w: number, h: number, isFull: boolean) => {
    g.current.w = w; g.current.h = h;
    const sz = isFull ? 1.35 : 1;
    return (
      <View style={{ width: w, height: h, backgroundColor: '#000', overflow: 'hidden' }} {...pan.panHandlers}>
        <Video
          ref={player}
          source={{ uri: url }}
          style={StyleSheet.absoluteFill}
          resizeMode={fit}
          paused={paused || scrubbing || adActive}
          rate={rate}
          volume={volume}
          progressUpdateInterval={250}
          onProgress={({ currentTime }) => { if (!scrubbing) setPos(currentTime); }}
          onLoad={({ duration: d, textTracks }) => { setDuration(d || 0); if (textTracks?.length) setTracks(textTracks); setBuffering(false); }}
          onBuffer={({ isBuffering }) => setBuffering(isBuffering)}
          onEnd={() => { setPaused(true); setControls(true); }}
          onError={() => setBuffering(false)}
          selectedTextTrack={trackIdx >= 0 && tracks[trackIdx]
            ? { type: SelectedTrackType.INDEX, value: trackIdx }
            : { type: SelectedTrackType.DISABLED }}
        />

        {dim > 0 && <View pointerEvents="none" style={[styles.fill, { backgroundColor: '#000', opacity: dim }]} />}

        {buffering && !adActive && (
          <View pointerEvents="none" style={[styles.fill, styles.center]}>
            <View style={styles.spinner}><PlayIcon size={26} color="rgba(255,255,255,0.3)" /></View>
          </View>
        )}

        {/* double-tap ripple: dim circle with "10 seconds" */}
        {ripple && !adActive && (
          <Animated.View
            key={ripple.key}
            pointerEvents="none"
            style={[
              styles.ripple,
              { opacity: rippleA, [ripple.side === 'l' ? 'left' : 'right']: -w * 0.18, width: w * 0.5, height: w * 0.5, borderRadius: w * 0.25 },
            ]}
          >
            <View style={[styles.rippleInner, ripple.side === 'l' ? { paddingLeft: w * 0.2 } : { paddingRight: w * 0.2 }]}>
              {ripple.side === 'l' ? <Rewind10Icon size={24} /> : <Forward10Icon size={24} />}
              <Text style={styles.rippleText}>10 seconds</Text>
            </View>
          </Animated.View>
        )}

        {/* brightness / volume HUD pill — MovieBox two-stage volume:
            0–100% fills white left→right; past 100% the track turns full white
            and a green boost segment grows over it. Icon swaps in quantized
            bands (volume: mute/33/66/100, brightness: 33/66/100). */}
        {hud && (
          <Animated.View
            pointerEvents="none"
            style={[styles.hud, { top: isFull ? h * 0.14 : h * 0.08, opacity: hudA }]}
          >
            {hud.kind === 'b' ? (
              <>
                <SunLevelIcon level={hud.value <= 0.33 ? 1 : hud.value <= 0.66 ? 2 : 3} size={18} />
                <View style={styles.hudTrack}>
                  <View style={[styles.hudFill, { width: `${Math.round(hud.value * 100)}%` }]} />
                </View>
              </>
            ) : hud.value > 1 ? (
              <>
                <VolumeLevelIcon level={3} size={18} />
                <View style={[styles.hudTrack, styles.hudTrackBoost]}>
                  <View style={[styles.hudFill, styles.hudFillBoost, { width: `${Math.round((Math.min(hud.value, 2) - 1) * 100)}%` }]} />
                </View>
              </>
            ) : (
              <>
                <VolumeLevelIcon
                  level={hud.value <= 0.001 ? 0 : hud.value <= 0.33 ? 1 : hud.value <= 0.66 ? 2 : 3}
                  size={18}
                />
                <View style={styles.hudTrack}>
                  <View style={[styles.hudFill, { width: `${Math.round(hud.value * 100)}%` }]} />
                </View>
              </>
            )}
          </Animated.View>
        )}

        {/* subtitle-style caption area is rendered natively by the video track */}

        {/* ------------ pre-roll ad ------------ */}
        {adActive && (
          <View style={[styles.fill, { backgroundColor: '#000' }]} pointerEvents="box-none">
            <View style={styles.adTag}><Text style={styles.adTagText}>AD</Text></View>
            <View style={styles.adTop}>
              <Text style={styles.adCount}>{adLeft}s</Text>
              <View style={styles.adSep} />
              <Pressable onPress={onGoAdFree} hitSlop={8} style={styles.adFreeBtn}>
                <Text style={styles.adFree}>Go ad-free</Text>
                <Text style={styles.adFree}> ›</Text>
              </Pressable>
            </View>
            <View style={[styles.center, styles.fill]} pointerEvents="none">
              <View style={[styles.adCard, { width: Math.min(w * 0.45, h * 1.0), height: h * 0.86 }]}>
                <Text style={styles.adCardTitle}>Sponsored</Text>
                <Text style={styles.adCardSub}>Your ad plays here</Text>
              </View>
            </View>
            <Pressable onPress={() => setAdLeft(0)} style={styles.adSkipRow}>
              <Text style={styles.adSkipText}>Tap and skip the ad</Text>
            </Pressable>
          </View>
        )}

        {/* ------------ controls ------------ */}
        {!adActive && controls && !locked && (isFull ? landscapeControls(w, h, sz) : portraitControls(w, h))}

        {/* locked: only the lock chip, tap screen to show it */}
        {!adActive && locked && showUnlock && (
          <Pressable
            onPress={() => {
              if (unlockT.current) clearTimeout(unlockT.current);
              setLocked(false); setShowUnlock(false); showControls();
            }}
            style={[styles.lockChip, styles.plainChip, { top: h * 0.45, left: w * 0.02 }]}
          >
            <LockOpenIcon size={18} locked />
            <Text style={styles.lockText}>Tap to Unlock</Text>
          </Pressable>
        )}
      </View>
    );
  };

  /* ---------------- portrait controls ---------------- */
  const portraitControls = (w: number, h: number) => (
    <>
      <LinearGradient colors={['rgba(0,0,0,0.55)', 'rgba(0,0,0,0)']} style={[styles.shadeTop, { height: h * 0.4 }]} pointerEvents="none" />
      <LinearGradient colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.6)']} style={[styles.shadeBot, { height: h * 0.45 }]} pointerEvents="none" />

      <Pressable onPress={onBack} hitSlop={14} style={{ position: 'absolute', left: w * 0.045, top: h * 0.06 }}>
        <BackIcon size={26} />
      </Pressable>
      <View style={{ position: 'absolute', right: w * 0.035, top: h * 0.04, alignItems: 'center' }}>
        <HelpIcon size={26} />
        <Text style={styles.tinyLabel}>Help</Text>
      </View>

      {/* bottom row: pause | seek | time | mini-window | fullscreen */}
      <View style={[styles.pRow, { paddingHorizontal: w * 0.04, bottom: h * 0.07 }]}>
        <Pressable hitSlop={12} onPress={() => { setPaused(p => !p); showControls(); }}>
          {paused ? <PlayIcon size={26} /> : <PauseIcon size={26} />}
        </Pressable>
        <View style={styles.bar} onLayout={e => { barW.current = e.nativeEvent.layout.width; }} {...barPan.panHandlers}>
          <View style={styles.trackBg} />
          <View style={[styles.trackFg, { width: `${frac * 100}%` }]} />
          <View style={[styles.knob, { left: `${frac * 100}%` }]} />
        </View>
        <Text style={styles.pTime}>{fmt(pos)}/{fmt(duration)}</Text>
        <Pressable hitSlop={10}><MiniWindowIcon size={26} /></Pressable>
        <Pressable hitSlop={10} onPress={enterFull}><FullscreenIcon size={26} /></Pressable>
      </View>
    </>
  );

  /* ---------------- landscape controls ---------------- */
  const landscapeControls = (w: number, h: number, _sz: number) => (
    <>
      <LinearGradient colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0)']} style={[styles.shadeTop, { height: h * 0.3 }]} pointerEvents="none" />
      <LinearGradient colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.7)']} style={[styles.shadeBot, { height: h * 0.4 }]} pointerEvents="none" />

      {/* top bar: back, title ........ Help, Setting */}
      <View style={[styles.lTop, { top: h * 0.055, paddingHorizontal: w * 0.03 }]}>
        <Pressable onPress={exitFull} hitSlop={14}><BackIcon size={24} /></Pressable>
        <Text numberOfLines={1} style={styles.lTitle}>{subtitle || title}</Text>
        <View style={{ flex: 1 }} />
        <View style={styles.lTopBtn}><HelpIcon size={22} /><Text style={styles.tinyLabel}>Help</Text></View>
        <Pressable style={styles.lTopBtn} onPress={() => { setSheet('setting'); showControls(); }}>
          <GearIcon size={22} /><Text style={styles.tinyLabel}>Setting</Text>
        </Pressable>
      </View>

      {/* left-middle: Tap to Lock */}
      <Pressable
        onPress={() => { setLocked(true); setControls(false); showUnlockChip(); }}
        style={[styles.lockChip, styles.plainChip, { top: h * 0.45, left: w * 0.015 }]}
      >
        <LockOpenIcon size={18} />
        <Text style={styles.lockText}>Tap to Lock</Text>
      </Pressable>

      {/* center: rewind / pause / forward */}
      <View style={[styles.lCenter, { top: h * 0.42 }]} pointerEvents="box-none">
        <Pressable hitSlop={16} onPress={() => { seekBy(-10); showControls(); }}><Rewind10Icon size={44} /></Pressable>
        <Pressable hitSlop={16} onPress={() => { setPaused(p => !p); showControls(); }}>
          {paused ? <PlayIcon size={44} /> : <PauseIcon size={44} />}
        </Pressable>
        <Pressable hitSlop={16} onPress={() => { seekBy(10); showControls(); }}><Forward10Icon size={44} /></Pressable>
      </View>

      {/* bottom: times + seek bar, then controls row */}
      <View style={[styles.lBottom, { bottom: h * 0.035, paddingHorizontal: w * 0.03 }]}>
        <View style={styles.lSeekRow}>
          <Text style={styles.lTime}>{fmt(pos)}</Text>
          <View style={styles.bar} onLayout={e => { barW.current = e.nativeEvent.layout.width; }} {...barPan.panHandlers}>
            <View style={styles.trackBg} />
            <View style={[styles.trackFg, { width: `${frac * 100}%` }]} />
            <View style={[styles.knob, { left: `${frac * 100}%` }]} />
          </View>
          <Text style={styles.lTime}>{fmt(duration)}</Text>
        </View>
        <View style={styles.lBtnRow}>
          <Pressable hitSlop={10} onPress={() => { setPaused(p => !p); showControls(); }}>
            {paused ? <PlayIcon size={22} /> : <PauseIcon size={22} />}
          </Pressable>
          <Pressable hitSlop={10} style={{ marginLeft: 18 }}><NextIcon size={22} /></Pressable>
          <View style={{ flex: 1 }} />
          <Pressable style={styles.lBtn} onPress={() => { setFit(f => (f === 'contain' ? 'cover' : 'contain')); showControls(); }}>
            <FitIcon /><Text style={styles.lBtnText}>Fit</Text>
          </Pressable>
          <Pressable style={styles.lBtn} onPress={() => { setSheet('lang'); showControls(); }}>
            <LangIcon /><Text style={styles.lBtnText}>Language</Text>
          </Pressable>
          <Pressable style={styles.lBtn} onPress={() => { setSheet('speed'); showControls(); }}>
            <SpeedGlyph /><Text style={styles.lBtnText}>{rate}x</Text>
          </Pressable>
          <Pressable style={styles.lBtn} onPress={exitFull}>
            <RotateIcon /><Text style={styles.lBtnText}>Rotate</Text>
          </Pressable>
        </View>
      </View>
    </>
  );

  /* ---------------- sheets ---------------- */
  const sheetView = sheet && (
    <View style={styles.fill}>
      <Pressable style={styles.fill} onPress={() => setSheet(null)} />
      <View style={styles.sheet}>
        <Text style={styles.sheetTitle}>
          {sheet === 'speed' ? 'Playback speed' : sheet === 'lang' ? 'Language' : 'Setting'}
        </Text>
        {sheet === 'speed' && (
          <View style={styles.chips}>
            {SPEEDS.map(s => (
              <Pressable key={s} onPress={() => { setRate(s); setSheet(null); }} style={[styles.chip, rate === s && styles.chipOn]}>
                <Text style={[styles.chipText, rate === s && { color: '#fff' }]}>{s === 1 ? 'Normal' : `${s}x`}</Text>
              </Pressable>
            ))}
          </View>
        )}
        {sheet === 'lang' && (
          <View>
            <Pressable style={styles.sRow} onPress={() => { setTrackIdx(-1); setSheet(null); }}>
              <Text style={[styles.sText, trackIdx === -1 && styles.sOn]}>Off</Text>
            </Pressable>
            {tracks.map((t, i) => (
              <Pressable key={i} style={styles.sRow} onPress={() => { setTrackIdx(i); setSheet(null); }}>
                <Text style={[styles.sText, trackIdx === i && styles.sOn]}>{t.title || t.language || `Track ${i + 1}`}</Text>
              </Pressable>
            ))}
            {tracks.length === 0 && <Text style={styles.sEmpty}>No subtitles in this stream</Text>}
          </View>
        )}
        {sheet === 'setting' && (
          <View>
            <Pressable style={styles.sRow} onPress={() => setSheet('speed')}><Text style={styles.sText}>Playback speed  ·  {rate}x</Text></Pressable>
            <Pressable style={styles.sRow} onPress={() => setSheet('lang')}><Text style={styles.sText}>Subtitles</Text></Pressable>
            <Pressable style={styles.sRow} onPress={() => { setFit(f => (f === 'contain' ? 'cover' : 'contain')); setSheet(null); }}>
              <Text style={styles.sText}>Picture  ·  {fit === 'contain' ? 'Fit' : 'Fill'}</Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );

  /* inline slot always renders; fullscreen renders in a landscape Modal */
  return (
    <>
      <View style={{ width: portraitW, height: slotH, backgroundColor: '#000' }}>
        {!full && surface(portraitW, slotH, false)}
        {!full && sheetView}
      </View>

      <Modal visible={full} animationType="fade" supportedOrientations={['landscape', 'landscape-left', 'landscape-right']} onRequestClose={exitFull} statusBarTranslucent>
        <View style={{ flex: 1, backgroundColor: '#000' }}>
          {full && surface(Math.max(SW, SH), Math.min(SW, SH), true)}
          {full && sheetView}
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fill: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  center: { alignItems: 'center', justifyContent: 'center' },
  spinner: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center' },
  shadeTop: { position: 'absolute', top: 0, left: 0, right: 0 },
  shadeBot: { position: 'absolute', bottom: 0, left: 0, right: 0 },
  tinyLabel: { color: '#fff', fontSize: 9, marginTop: 1 },

  /* portrait */
  pRow: { position: 'absolute', left: 0, right: 0, flexDirection: 'row', alignItems: 'center', gap: 12 },
  pTime: { color: '#fff', fontSize: 12.5, fontWeight: '500', fontVariant: ['tabular-nums'] },
  bar: { flex: 1, height: 28, justifyContent: 'center' },
  trackBg: { position: 'absolute', left: 0, right: 0, height: 2.5, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.35)' },
  trackFg: { position: 'absolute', left: 0, height: 2.5, borderRadius: 2, backgroundColor: '#fff' },
  knob: { position: 'absolute', width: 11, height: 11, borderRadius: 6, marginLeft: -5, backgroundColor: '#fff' },

  /* landscape */
  lTop: { position: 'absolute', left: 0, right: 0, flexDirection: 'row', alignItems: 'center', gap: 14 },
  lTitle: { color: '#fff', fontSize: 13.5, fontWeight: '500', maxWidth: '55%' },
  lTopBtn: { alignItems: 'center', marginLeft: 16 },
  lockChip: { position: 'absolute', flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(20,20,24,0.55)', borderRadius: 18, paddingHorizontal: 12, paddingVertical: 7 },
  plainChip: { backgroundColor: 'transparent', borderRadius: 0, paddingHorizontal: 0, paddingVertical: 10 },
  lockText: { color: '#fff', fontSize: 12 },
  lCenter: { position: 'absolute', left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 70 },
  lBottom: { position: 'absolute', left: 0, right: 0 },
  lSeekRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  lTime: { color: '#fff', fontSize: 10.5, fontVariant: ['tabular-nums'] },
  lBtnRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  lBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginLeft: 22 },
  lBtnText: { color: '#fff', fontSize: 12 },

  /* gestures */
  ripple: { position: 'absolute', top: '50%', marginTop: -9999, backgroundColor: 'rgba(255,255,255,0.18)' },
  rippleInner: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4 },
  rippleText: { color: '#fff', fontSize: 11 },
  hud: { position: 'absolute', alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(15,15,18,0.82)', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 10, width: 220 },
  hudTrack: { flex: 1, height: 9, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.22)', overflow: 'hidden' },
  hudTrackBoost: { backgroundColor: HUD_WHITE },
  hudFill: { height: '100%', backgroundColor: HUD_WHITE },
  hudFillBoost: { backgroundColor: HUD_GREEN },

  /* ad */
  adTag: { position: 'absolute', left: 14, top: '45%' },
  adTagText: { color: 'rgba(255,255,255,0.5)', fontSize: 8 },
  adTop: { position: 'absolute', right: 18, top: 14, flexDirection: 'row', alignItems: 'center' },
  adCount: { color: '#fff', fontSize: 12, fontWeight: '700' },
  adSep: { width: 1, height: 12, backgroundColor: 'rgba(255,255,255,0.5)', marginHorizontal: 9 },
  adFreeBtn: { flexDirection: 'row' },
  adFree: { color: '#F5B301', fontSize: 12, fontWeight: '600' },
  adCard: { backgroundColor: '#1a1a1f', borderRadius: 4, alignItems: 'center', justifyContent: 'center' },
  adCardTitle: { color: '#fff', fontWeight: '700', fontSize: 15 },
  adCardSub: { color: '#8b8d9c', fontSize: 11, marginTop: 4 },
  adSkipRow: { position: 'absolute', right: 18, bottom: 12 },
  adSkipText: { color: '#fff', fontSize: 11 },

  /* sheet */
  sheet: { position: 'absolute', right: 0, top: 0, bottom: 0, width: 300, backgroundColor: 'rgba(14,14,18,0.97)', paddingHorizontal: 18, paddingTop: 22 },
  sheetTitle: { color: '#fff', fontSize: 15, fontWeight: '700', marginBottom: 16 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.09)' },
  chipOn: { backgroundColor: 'rgba(0,210,255,0.28)' },
  chipText: { color: '#c9cbe0', fontSize: 13, fontWeight: '600' },
  sRow: { paddingVertical: 13, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(255,255,255,0.12)' },
  sText: { color: '#d7d9e6', fontSize: 14 },
  sOn: { color: ACCENT, fontWeight: '700' },
  sEmpty: { color: '#8b8d9c', fontSize: 13, paddingVertical: 10 },
});

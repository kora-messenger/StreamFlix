import React, { useEffect, useRef, useState } from 'react';
import {
  Animated, Easing, Image, Pressable, StyleSheet, Text, TextInput, TextInputProps, View, ViewStyle,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Defs, LinearGradient as SvgGrad, Stop, Text as SvgText, Circle } from 'react-native-svg';
import { colors, gradients } from '../theme/tokens';
import { ArrowRight, EyeIcon, EyeOffIcon } from './icons';

export const GradientButton = ({
  label, onPress, arrow = true, style, height, fontSize,
}: { label: string; onPress?: () => void; arrow?: boolean; style?: ViewStyle; height?: number; fontSize?: number }) => (
  <Pressable onPress={onPress} style={({ pressed }) => [{ opacity: pressed ? 0.88 : 1 }, style]}>
    <LinearGradient
      colors={gradients.button}
      start={{ x: 0, y: 0.5 }}
      end={{ x: 1, y: 0.5 }}
      style={[s.gradBtn, height ? { height, borderRadius: height / 2 } : null]}>
      <Text style={[s.gradBtnText, fontSize ? { fontSize } : null]}>{label}</Text>
      {arrow ? <ArrowRight size={fontSize ? fontSize + 4 : 22} color="#fff" /> : null}
    </LinearGradient>
  </Pressable>
);

export const OutlineButton = ({
  label, icon, onPress, height, fontSize,
}: { label: string; icon: React.ReactNode; onPress?: () => void; height?: number; fontSize?: number }) => (
  <Pressable onPress={onPress} style={({ pressed }) => [s.outlineBtn, height ? { height, borderRadius: height / 2 } : null, { opacity: pressed ? 0.8 : 1 }]}>
    <View style={s.outlineIcon}>{icon}</View>
    <Text style={[s.outlineText, fontSize ? { fontSize } : null]}>{label}</Text>
  </Pressable>
);

/** Gradient-filled text via SVG. Width should be passed to size the canvas. */
export const GradientText = ({
  text, size, width, height, weight = '700', colorsArr = gradients.wordmark, anchor = 'start', x = 0,
}: {
  text: string; size: number; width: number; height?: number; weight?: string;
  colorsArr?: string[]; anchor?: 'start' | 'middle' | 'end'; x?: number;
}) => {
  const h = height ?? Math.round(size * 1.25);
  const id = 'gt' + text.replace(/\W/g, '');
  return (
    <Svg width={width} height={h}>
      <Defs>
        <SvgGrad id={id} x1="0" y1="0" x2="1" y2="0">
          {colorsArr.map((c, i) => (
            <Stop key={i} offset={String(i / (colorsArr.length - 1))} stopColor={c} />
          ))}
        </SvgGrad>
      </Defs>
      <SvgText
        x={x} y={size} fontSize={size} fontWeight={weight} fill={`url(#${id})`} textAnchor={anchor}>
        {text}
      </SvgText>
    </Svg>
  );
};

export const Field = ({
  icon, secure, style, focused, h, fs, ...rest
}: TextInputProps & { icon: React.ReactNode; secure?: boolean; focused?: boolean; style?: ViewStyle; h?: number; fs?: number }) => {
  const [hidden, setHidden] = useState(!!secure);
  const [isFocus, setFocus] = useState(false);
  const active = focused || isFocus;
  const inner = (
    <View style={[s.field, active ? s.fieldActive : null, h ? { height: h, borderRadius: Math.min(15, h / 3) } : null]}>
      <View style={s.fieldIcon}>{icon}</View>
      <TextInput
        {...rest}
        secureTextEntry={hidden}
        placeholderTextColor="#7b7f96"
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        style={[s.fieldInput, h ? { height: h } : null, fs ? { fontSize: fs } : null]}
        selectionColor={colors.secondary}
      />
      {secure ? (
        <Pressable hitSlop={10} onPress={() => setHidden(h => !h)}>
          {hidden ? <EyeIcon color="#c9cbe0" /> : <EyeOffIcon color="#c9cbe0" />}
        </Pressable>
      ) : null}
    </View>
  );
  if (active) {
    return (
      <LinearGradient
        colors={['#00d2ff', '#6C63FF', '#b300ff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[s.fieldBorder, style]}>
        {inner}
      </LinearGradient>
    );
  }
  return <View style={[s.fieldBorderIdle, style]}>{inner}</View>;
};

export const OrDivider = ({ compact }: { compact?: boolean }) => (
  <View style={[s.orRow, compact ? { marginVertical: 0 } : null]}>
    <View style={s.orLine} />
    <Text style={s.orText}>or</Text>
    <View style={s.orLine} />
  </View>
);

/** Logo + wordmark lockup. `stacked` = logo above, else side-by-side like auth screens. */
export const Lockup = ({ stacked = false, scale = 1 }: { stacked?: boolean; scale?: number }) => {
  const logo = require('../assets/img/logo_soft.png');
  if (stacked) {
    return (
      <View style={{ alignItems: 'center' }}>
        <Image source={logo} style={{ width: 150 * scale, height: 150 * scale }} resizeMode="contain" />
      </View>
    );
  }
  return (
    <View style={{ alignItems: 'center' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Image source={logo} style={{ width: 92 * scale, height: 92 * scale, marginRight: -6 * scale }} resizeMode="contain" />
        <View>
          <View style={{ flexDirection: 'row' }}>
            <Text style={[s.wmWhite, { fontSize: 38 * scale }]}>Stream</Text>
            <GradientText text="Max" size={38 * scale} width={Math.round(78 * scale)} height={46 * scale} />
          </View>
          <Text style={[s.wmTag, { fontSize: 16 * scale }]}>Your Movies. Your Way.</Text>
        </View>
      </View>
    </View>
  );
};

export const Wordmark = ({ size = 56 }: { size?: number }) => (
  <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
    <Text style={{ color: '#fff', fontSize: size, fontWeight: '800', letterSpacing: -1.5 }}>Stream</Text>
    <GradientText text="Max" size={size} width={Math.round(size * 2.1)} height={size * 1.2} weight="800" />
  </View>
);

export const Spinner = ({ size = 50 }: { size?: number }) => {
  const rot = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const a = Animated.loop(
      Animated.timing(rot, { toValue: 1, duration: 1100, easing: Easing.linear, useNativeDriver: true }),
    );
    a.start();
    return () => a.stop();
  }, [rot]);
  const spin = rot.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const r = size / 2 - 3;
  const c = 2 * Math.PI * r;
  return (
    <Animated.View style={{ transform: [{ rotate: spin }], width: size, height: size }}>
      <Svg width={size} height={size}>
        <Defs>
          <SvgGrad id="spin" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#00d2ff" />
            <Stop offset="1" stopColor="#b300ff" />
          </SvgGrad>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke="#161a33" strokeWidth={3.5} fill="none" />
        <Circle
          cx={size / 2} cy={size / 2} r={r} stroke="url(#spin)" strokeWidth={3.5} fill="none"
          strokeLinecap="round" strokeDasharray={`${c * 0.7} ${c}`}
        />
      </Svg>
    </Animated.View>
  );
};

const s = StyleSheet.create({
  gradBtn: {
    height: 58, borderRadius: 29, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 10, alignSelf: 'stretch',
  },
  gradBtnText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  outlineBtn: {
    height: 56, borderRadius: 28, borderWidth: 1.3, borderColor: '#3a4268',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#070810',
  },
  outlineIcon: { marginRight: 14 },
  outlineText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  fieldBorder: { borderRadius: 16, padding: 1.4 },
  fieldBorderIdle: {
    borderRadius: 16, borderWidth: 1.2, borderColor: '#2d2f45', overflow: 'hidden',
  },
  field: {
    height: 56, borderRadius: 15, backgroundColor: '#0f121c',
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18,
  },
  fieldActive: { backgroundColor: '#0e1020' },
  fieldIcon: { width: 34 },
  fieldInput: { flex: 1, color: '#fff', fontSize: 16, paddingVertical: 0, height: 56 },
  orRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  orLine: { flex: 1, height: 1, backgroundColor: '#262a42' },
  orText: { color: '#8a8fa8', marginHorizontal: 18, fontSize: 14 },
  wmWhite: { color: '#fff', fontWeight: '800', letterSpacing: -1 },
  wmTag: { color: '#c9cbe0', marginTop: -6, marginLeft: 2 },
});

import React from 'react';
import Svg, { Path, Rect, Circle, Defs, LinearGradient as SvgGrad, Stop, G, Text as SvgText } from 'react-native-svg';

type P = { size?: number; color?: string; stroke?: number };
const base = (size = 22) => ({ width: size, height: size, viewBox: '0 0 24 24', fill: 'none' });
const st = (color = '#fff', w = 1.8) => ({ stroke: color, strokeWidth: w, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const });

// Message bubble with a padlock and three asterisks (reset-code screen)
export const MessageLockIcon = ({ size = 64, color = '#fff' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size * 0.82} viewBox="0 0 64 52" fill="none">
    <Rect x="5" y="4" width="54" height="38" rx="10" stroke={color} strokeWidth="2.6" />
    <Path d="M16 41.5 L12.5 49.5 L25 41.5" stroke={color} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    {/* padlock */}
    <Path d="M22 25.5 v-3.5 a4.5 4.5 0 0 1 9 0 v3.5" stroke={color} strokeWidth="2.6" strokeLinecap="round" fill="none" />
    <Rect x="18.5" y="25.5" width="16" height="12" rx="3" fill={color} />
    {/* three asterisks */}
    {[38, 46, 54].map((cx, i) => (
      <Path key={i} d={`M${cx - 2.6} 23 h5.2 M${cx - 1.3} ${23 - 2.25} l2.6 4.5 M${cx - 1.3} ${23 + 2.25} l2.6 -4.5`} stroke={color} strokeWidth="1.7" strokeLinecap="round" />
    ))}
  </Svg>
);

export const ClockIcon = ({ size = 16, color = '#d8dce8' }: P) => (
  <Svg {...base(size)}><Circle cx="12" cy="12" r="8.5" {...st(color, 1.8)} /><Path d="M12 7.5V12l3 2" {...st(color, 1.8)} /></Svg>
);

export const BackIcon = ({ size = 26, color = '#fff' }: P) => (
  <Svg {...base(size)}><Path d="M15 5l-7 7 7 7" {...st(color, 2)} /></Svg>
);
export const ArrowRight = ({ size = 22, color = '#fff' }: P) => (
  <Svg {...base(size)}><Path d="M5 12h14M13 6l6 6-6 6" {...st(color, 2)} /></Svg>
);
export const UserIcon = ({ size = 22, color = '#c9cbe0' }: P) => (
  <Svg {...base(size)}><Circle cx="12" cy="8" r="3.6" {...st(color)} /><Path d="M4.5 20c0-4 3.4-6.2 7.5-6.2s7.5 2.2 7.5 6.2" {...st(color)} /></Svg>
);
export const MailIcon = ({ size = 22, color = '#c9cbe0' }: P) => (
  <Svg {...base(size)}><Rect x="3" y="5.5" width="18" height="13" rx="2.5" {...st(color)} /><Path d="M3.8 7.5l8.2 6 8.2-6" {...st(color)} /></Svg>
);
export const LockIcon = ({ size = 22, color = '#c9cbe0' }: P) => (
  <Svg {...base(size)}><Rect x="5" y="10.5" width="14" height="10" rx="2.5" {...st(color)} /><Path d="M8 10.5V8a4 4 0 018 0v2.5" {...st(color)} /><Circle cx="12" cy="15.5" r="1.2" fill={color} /></Svg>
);
export const EyeIcon = ({ size = 22, color = '#c9cbe0' }: P) => (
  <Svg {...base(size)}><Path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z" {...st(color)} /><Circle cx="12" cy="12" r="3" {...st(color)} /></Svg>
);
export const EyeOffIcon = ({ size = 22, color = '#c9cbe0' }: P) => (
  <Svg {...base(size)}><Path d="M3 3l18 18" {...st(color)} /><Path d="M10.6 6a9.6 9.6 0 011.4-.1c6.4 0 10 6.1 10 6.1a17 17 0 01-3.2 3.9M6.5 7.5C3.8 9.3 2 12 2 12s3.6 6.5 10 6.5c1.5 0 2.9-.3 4.1-.9" {...st(color)} /><Path d="M9.9 9.9a3 3 0 004.2 4.2" {...st(color)} /></Svg>
);
export const CheckIcon = ({ size = 16, color = '#fff' }: P) => (
  <Svg {...base(size)}><Path d="M5 12.5l4.5 4.5L19 7.5" {...st(color, 2.6)} /></Svg>
);
export const SearchIcon = ({ size = 20, color = '#9a9db0' }: P) => (
  <Svg {...base(size)}><Circle cx="11" cy="11" r="6.5" {...st(color, 2)} /><Path d="M16 16l4.5 4.5" {...st(color, 2)} /></Svg>
);
export const MicIcon = ({ size = 22, color = '#fff' }: P) => (
  <Svg {...base(size)}><Rect x="9" y="3" width="6" height="11" rx="3" {...st(color)} /><Path d="M5.5 11.5a6.5 6.5 0 0013 0M12 18v3" {...st(color)} /></Svg>
);
export const GiftIcon = ({ size = 24, color = '#fff' }: P) => (
  <Svg {...base(size)}><Rect x="3.5" y="9" width="17" height="11" rx="2" {...st(color)} /><Path d="M3 9h18M12 9v11" {...st(color)} /><Path d="M12 9c-1.5-4-5.5-4-5.5-1.5S10 9 12 9zM12 9c1.5-4 5.5-4 5.5-1.5S14 9 12 9z" {...st(color)} /></Svg>
);
export const DownloadIcon = ({ size = 18, color = '#fff' }: P) => (
  <Svg {...base(size)}><Path d="M12 4v11M7 11l5 5 5-5M5 20h14" {...st(color, 2.2)} /></Svg>
);
export const TrashIcon = ({ size = 18, color = '#9a9db0' }: P) => (
  <Svg {...base(size)}><Path d="M4 7h16M10 4h4M6.5 7l.8 12a2 2 0 002 1.9h5.4a2 2 0 002-1.9l.8-12M10 11v6M14 11v6" {...st(color, 1.7)} /></Svg>
);
export const FlameIcon = ({ size = 18, color = '#ff6a3d' }: P) => (
  <Svg {...base(size)}><Path d="M12 2.5c.6 3-1.4 4.4-2.8 6.2C7.8 10.5 7 12 7 14a5 5 0 0010 0c0-1.6-.7-2.9-1.6-4 .2 1.2-.2 2-1 2.4.4-3.5-.8-7-2.4-9.9z" fill={color} /></Svg>
);
export const PlayIcon = ({ size = 18, color = '#fff' }: P) => (
  <Svg {...base(size)}><Path d="M8 5.5v13l11-6.5-11-6.5z" fill={color} /></Svg>
);
export const InfoIcon = ({ size = 18, color = '#fff' }: P) => (
  <Svg {...base(size)}><Circle cx="12" cy="12" r="9" {...st(color)} /><Path d="M12 11v5.5M12 7.8v.2" {...st(color, 2.2)} /></Svg>
);
export const GoogleG = ({ size = 26 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 48 48">
    <Path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" />
    <Path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z" />
    <Path fill="#FBBC05" d="M10.5 28.7a14.5 14.5 0 010-9.4l-7.9-6.1a24 24 0 000 21.6l7.9-6.1z" />
    <Path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.9 2.3-8.4 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
  </Svg>
);
export const AppleLogo = ({ size = 26, color = '#fff' }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path fill={color} d="M16.4 12.7c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.2-2.8.9-3.5.9-.7 0-1.8-.8-3-.8-1.5 0-3 .9-3.8 2.3-1.6 2.8-.4 7 1.2 9.3.8 1.1 1.7 2.4 2.9 2.3 1.2 0 1.6-.7 3-.7 1.4 0 1.8.7 3 .7 1.3 0 2.1-1.1 2.8-2.2.9-1.3 1.3-2.5 1.3-2.6 0 0-2.5-1-2.5-3.9zM14.1 5.9c.6-.8 1.1-1.8.9-2.9-.9 0-2 .6-2.7 1.4-.6.7-1.1 1.8-.9 2.8 1 .1 2-.5 2.7-1.3z" />
  </Svg>
);
export const FeatureClapper = ({ size = 34 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <Defs><SvgGrad id="fc" x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor="#00d2ff" /><Stop offset="1" stopColor="#b300ff" /></SvgGrad></Defs>
    <Rect x="5" y="15" width="30" height="20" rx="3" stroke="url(#fc)" strokeWidth="2.4" />
    <Path d="M5 15l4-8 6 3-4 5M17 11l4-8 6 3-4 5M29 11l4-5 3 2" stroke="url(#fc)" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
    <Path d="M17 21v8l7-4-7-4z" fill="url(#fc)" />
  </Svg>
);
export const FeatureDevices = ({ size = 34 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <Defs><SvgGrad id="fd" x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor="#00d2ff" /><Stop offset="1" stopColor="#b300ff" /></SvgGrad></Defs>
    <Rect x="12" y="7" width="24" height="17" rx="2.4" stroke="url(#fd)" strokeWidth="2.4" />
    <Path d="M20 31h8M24 24v7" stroke="url(#fd)" strokeWidth="2.4" strokeLinecap="round" />
    <Rect x="4" y="16" width="11" height="18" rx="2.4" stroke="url(#fd)" strokeWidth="2.4" fill="#050507" />
  </Svg>
);
export const FeatureBolt = ({ size = 34 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <Defs><SvgGrad id="fb" x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor="#00d2ff" /><Stop offset="1" stopColor="#b300ff" /></SvgGrad></Defs>
    <Circle cx="20" cy="20" r="14.5" stroke="url(#fb)" strokeWidth="2.4" strokeDasharray="70 22" strokeLinecap="round" />
    <Path d="M22.5 8.5L13 22h6.5L17.5 32 27 18h-6.5l2-9.5z" fill="url(#fb)" />
  </Svg>
);
export const FeatureHeart = ({ size = 34 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <Defs><SvgGrad id="fh" x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor="#6C63FF" /><Stop offset="1" stopColor="#b300ff" /></SvgGrad></Defs>
    <Path d="M20 33S6 24.5 6 14.8C6 10.5 9.2 7.5 13 7.5c2.9 0 5.2 1.6 7 4.2 1.8-2.6 4.1-4.2 7-4.2 3.8 0 7 3 7 7.3C34 24.5 20 33 20 33z" stroke="url(#fh)" strokeWidth="2.4" strokeLinejoin="round" />
  </Svg>
);

export const PauseIcon = ({ size = 18, color = '#fff' }: P) => (
  <Svg {...base(size)}><Path d="M8 5v14M16 5v14" {...st(color, 2.6)} /></Svg>
);
export const FullscreenIcon = ({ size = 20, color = '#fff' }: P) => (
  <Svg {...base(size)}><Path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" {...st(color, 2)} /></Svg>
);
export const CloseIcon = ({ size = 22, color = '#fff' }: P) => (
  <Svg {...base(size)}><Path d="M6 6l12 12M18 6L6 18" {...st(color, 2.2)} /></Svg>
);
export const ChevronDownIcon = ({ size = 16, color = '#9a9db0' }: P) => (
  <Svg {...base(size)}><Path d="M6 9l6 6 6-6" {...st(color, 2)} /></Svg>
);
export const PlusCircleIcon = ({ size = 22, color = '#c9cbe0' }: P) => (
  <Svg {...base(size)}><Circle cx="12" cy="12" r="9" {...st(color)} /><Path d="M12 8v8M8 12h8" {...st(color)} /></Svg>
);
export const ShareIcon = ({ size = 22, color = '#c9cbe0' }: P) => (
  <Svg {...base(size)}><Path d="M12 3v13" {...st(color)} /><Path d="M7.5 7.5L12 3l4.5 4.5" {...st(color)} /><Path d="M5 12v8h14v-8" {...st(color)} /></Svg>
);
export const StarIcon = ({ size = 14, color = '#f6b73c' }: P) => (
  <Svg {...base(size)} fill="none"><Path d="M12 3l2.7 5.8 6.3.7-4.7 4.3 1.3 6.2L12 16.9 6.4 20l1.3-6.2L3 9.5l6.3-.7L12 3z" fill={color} /></Svg>
);
export const CrownIcon = ({ size = 12, color = '#f6b73c' }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M3 18h18l1.5-11-6 4.5L12 4 7.5 11.5l-6-4.5L3 18z" fill={color} /></Svg>
);

// ---------- video player icons ----------
export const Rewind10Icon = ({ size = 44, color = '#fff' }: P) => (
  <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <Path d="M14.5 10.5A16 16 0 1 1 8 24" stroke={color} strokeWidth="2.6" strokeLinecap="round" fill="none" />
    <Path d="M15 4.5v6.5h-6.5" stroke={color} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <SvgText x="24" y="30" fontSize="14" fontWeight="700" fill={color} textAnchor="middle">10</SvgText>
  </Svg>
);
export const Forward10Icon = ({ size = 44, color = '#fff' }: P) => (
  <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <Path d="M33.5 10.5A16 16 0 1 0 40 24" stroke={color} strokeWidth="2.6" strokeLinecap="round" fill="none" />
    <Path d="M33 4.5v6.5h6.5" stroke={color} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <SvgText x="24" y="30" fontSize="14" fontWeight="700" fill={color} textAnchor="middle">10</SvgText>
  </Svg>
);
export const CastIcon = ({ size = 20, color = '#fff' }: P) => (
  <Svg {...base(size)}>
    <Path d="M3.5 15.5v3a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-3" {...st(color, 1.8)} fill="none" />
    <Path d="M3 3h18v12H3z" transform="translate(0,0)" {...st(color, 1.8)} fill="none" opacity="0" />
    <Rect x="3.5" y="3.5" width="17" height="11" rx="1.8" {...st(color, 1.8)} />
    <Path d="M2 8.5a9.5 9.5 0 0 1 7 7M2 12.5a5.5 5.5 0 0 1 4 4" {...st(color, 1.7)} />
    <Circle cx="2.6" cy="20.6" r="1.1" fill={color} />
  </Svg>
);
export const CcIcon = ({ size = 20, color = '#fff' }: P) => (
  <Svg width={size} height={size * 0.72} viewBox="0 0 26 19" fill="none">
    <Rect x="1" y="1" width="24" height="17" rx="4" stroke={color} strokeWidth="1.6" />
    <SvgText x="13" y="13.2" fontSize="9" fontWeight="700" fill={color} textAnchor="middle" fontFamily="sans-serif">CC</SvgText>
  </Svg>
);
export const DotsIcon = ({ size = 20, color = '#fff' }: P) => (
  <Svg {...base(size)}>
    <Circle cx="12" cy="5" r="1.5" fill={color} /><Circle cx="12" cy="12" r="1.5" fill={color} /><Circle cx="12" cy="19" r="1.5" fill={color} />
  </Svg>
);
export const SpeedIcon = ({ size = 20, color = '#fff' }: P) => (
  <Svg {...base(size)}>
    <Path d="M4.5 17a8.5 8.5 0 1 1 15 0" {...st(color, 1.8)} />
    <Path d="M12 13.5l4-4.5" {...st(color, 1.8)} /><Circle cx="12" cy="15" r="1.4" fill={color} />
  </Svg>
);
export const BrightnessIcon = ({ size = 22, color = '#fff' }: P) => (
  <Svg {...base(size)}>
    <Circle cx="12" cy="12" r="4" {...st(color, 1.8)} />
    <Path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5 5l1.8 1.8M17.2 17.2L19 19M19 5l-1.8 1.8M6.8 17.2L5 19" {...st(color, 1.7)} />
  </Svg>
);
export const VolumeIcon = ({ size = 22, color = '#fff' }: P) => (
  <Svg {...base(size)}>
    <Path d="M4 9.5v5h3.5L12 19V5L7.5 9.5H4z" fill={color} />
    <Path d="M15 9a4.5 4.5 0 0 1 0 6M17.5 6.5a8 8 0 0 1 0 11" {...st(color, 1.7)} />
  </Svg>
);

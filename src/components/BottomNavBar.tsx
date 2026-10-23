import React from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DownloadsTabIcon, HomeTabIcon, SearchIcon, UserIcon } from './icons';
import { GradientText } from './ui';

/**
 * BottomNavBar — MovieBox-style floating "round button bar".
 * A dark rounded bar (radius 22) hovering above the gesture area, four
 * evenly spaced items (Home / Search / Downloads / Mine), 22px icons with
 * 10sp labels. The active item renders its label as a cyan-to-purple
 * gradient (brand accent) with a white icon; inactive items are slate grey.
 * `onPress(id)` lets the host screen route tabs; the bar itself is dumb.
 */
export type BottomTabId = 'home' | 'search' | 'downloads' | 'mine';

const TABS: { id: BottomTabId; label: string; Icon: React.ComponentType<{ size?: number; color?: string }> }[] = [
  { id: 'home', label: 'Home', Icon: HomeTabIcon as React.ComponentType<{ size?: number; color?: string }> },
  { id: 'search', label: 'Dramas', Icon: SearchIcon },
  { id: 'downloads', label: 'Downloads', Icon: DownloadsTabIcon as React.ComponentType<{ size?: number; color?: string }> },
  { id: 'mine', label: 'Mine', Icon: UserIcon },
];

export default function BottomNavBar({
  active,
  onPress,
  downloadsCount = 15,
  downloadsWarning = false,
}: {
  active: BottomTabId;
  onPress?: (id: BottomTabId) => void;
  /** paused-but-not-yet-downloaded total shown in the Downloads badge */
  downloadsCount?: number;
  /** true when a download was interrupted / user is offline and resumes */
  downloadsWarning?: boolean;
}) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  return (
    <View style={[styles.wrap, { bottom: insets.bottom + 10, left: 14, right: 14, width: width - 28 }]} pointerEvents="box-none">
      <View style={styles.bar}>
        {TABS.map(({ id, label, Icon }) => {
          const on = id === active;
          return (
            <Pressable
              key={id}
              style={styles.item}
              hitSlop={6}
              onPress={() => onPress?.(id)}
            >
              {id === 'home' ? (
                <HomeTabIcon size={22} active={on} />
              ) : id === 'downloads' ? (
                <DownloadsTabIcon size={22} active={on} count={downloadsCount} warning={downloadsWarning} />
              ) : (
                <Icon size={22} color={on ? '#fff' : '#C1C4CC'} />
              )}
              <View style={styles.labelBox}>
                <Text style={on ? styles.labelOn : styles.label}>{label}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', borderRadius: 22 },
  bar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 62,
    borderRadius: 22,
    backgroundColor: 'rgba(13,15,23,0.97)',
    borderWidth: 1,
    borderColor: '#1C2132',
  },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4 },
  labelBox: { height: 13, justifyContent: 'center' },
  label: { color: '#C1C4CC', fontSize: 10, fontWeight: '600' },
  labelOn: { color: '#fff', fontSize: 10, fontWeight: '700' },
});

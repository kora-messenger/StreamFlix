import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle } from 'react-native';

/* Shared pulsing skeleton block (MovieBox-style dark placeholder).
   Used by the Dramas and Home loading states. */
export function usePulse() {
  const v = useRef(new Animated.Value(0.45)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(v, { toValue: 1, duration: 650, useNativeDriver: true }),
        Animated.timing(v, { toValue: 0.45, duration: 650, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [v]);
  return v;
}

export default function Skeleton({ style }: { style: ViewStyle | ViewStyle[] | any }) {
  const pulse = usePulse();
  return <Animated.View style={[style, { backgroundColor: '#141826', opacity: pulse }]} />;
}

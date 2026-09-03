import React, {useEffect, useRef} from 'react';
import {Animated, Easing, StyleSheet, Text, View} from 'react-native';
import {colors, radius, typography} from '../theme';

type Props = {
  /** false pinta la insignia apagada (retraso respecto al directo o VOD). */
  active?: boolean;
  label?: string;
};

/** Insignia "EN DIRECTO" con punto pulsante mientras la señal está en el borde. */
export function LiveBadge({active = true, label = 'EN DIRECTO'}: Props) {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!active) {
      pulse.setValue(0.45);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 0.25,
          duration: 800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [active, pulse]);

  return (
    <View style={[styles.badge, !active && styles.badgeIdle]}>
      <Animated.View
        style={[
          styles.dot,
          {opacity: pulse, backgroundColor: active ? colors.live : colors.textMuted},
        ]}
      />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,59,48,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,59,48,0.45)',
  },
  badgeIdle: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor: colors.border,
  },
  dot: {width: 12, height: 12, borderRadius: 6},
  label: {...typography.label, color: colors.text},
});

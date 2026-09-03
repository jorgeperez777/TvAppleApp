import React, {useCallback, useRef, useState} from 'react';
import {Animated, Pressable, StyleSheet, Text, View} from 'react-native';
import {colors, radius, typography} from '../theme';

type Props = {
  label: string;
  /** Glifo opcional a la izquierda del texto. */
  glyph?: string;
  onPress: () => void;
  /** Recibe el foco inicial al montarse el contenedor. */
  autoFocus?: boolean;
  /** Sin texto: botón circular sólo con glifo (transporte principal). */
  compact?: boolean;
  disabled?: boolean;
  /** Cualquier interacción cuenta como actividad del mando. */
  onActivity?: () => void;
};

/**
 * Botón con el idioma de foco de tvOS: al enfocarse se ilumina en blanco
 * y crece ligeramente. El parallax nativo se desactiva para que el
 * movimiento lo controle la animación de escala.
 */
export function TVButton({
  label,
  glyph,
  onPress,
  autoFocus = false,
  compact = false,
  disabled = false,
  onActivity,
}: Props) {
  const [focused, setFocused] = useState(false);
  const scale = useRef(new Animated.Value(1)).current;

  const animate = useCallback(
    (to: number) => {
      Animated.spring(scale, {
        toValue: to,
        useNativeDriver: true,
        speed: 30,
        bounciness: 6,
      }).start();
    },
    [scale],
  );

  const handleFocus = useCallback(() => {
    setFocused(true);
    animate(1.08);
    onActivity?.();
  }, [animate, onActivity]);

  const handleBlur = useCallback(() => {
    setFocused(false);
    animate(1);
  }, [animate]);

  return (
    <Animated.View style={{transform: [{scale}]}}>
      <Pressable
        hasTVPreferredFocus={autoFocus}
        tvParallaxProperties={{enabled: false}}
        disabled={disabled}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onPress={() => {
          onActivity?.();
          onPress();
        }}
        style={[
          styles.base,
          compact ? styles.compact : styles.wide,
          focused && styles.focused,
          disabled && styles.disabled,
        ]}>
        <View style={styles.content}>
          {glyph ? (
            <Text
              style={[
                compact ? styles.glyphLarge : styles.glyph,
                focused && styles.textFocused,
              ]}>
              {glyph}
            </Text>
          ) : null}
          {compact ? null : (
            <Text style={[styles.label, focused && styles.textFocused]}>{label}</Text>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wide: {
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: radius.pill,
    minWidth: 140,
  },
  compact: {
    width: 88,
    height: 88,
    borderRadius: 44,
  },
  focused: {
    backgroundColor: colors.cardFocused,
    borderColor: colors.cardFocused,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 24,
    shadowOffset: {width: 0, height: 12},
  },
  disabled: {opacity: 0.35},
  content: {flexDirection: 'row', alignItems: 'center', gap: 12},
  label: {...typography.body, fontWeight: '600', color: colors.text},
  glyph: {fontSize: 24, color: colors.text},
  glyphLarge: {fontSize: 34, color: colors.text, lineHeight: 40},
  textFocused: {color: colors.textOnFocus},
});

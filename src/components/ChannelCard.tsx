import React, {useCallback, useRef, useState} from 'react';
import {Animated, Pressable, StyleSheet, Text, View} from 'react-native';
import type {Channel} from '../types';
import {colors, radius, spacing, typography} from '../theme';
import {LiveBadge} from './LiveBadge';

type Props = {
  channel: Channel;
  onPress: () => void;
  autoFocus?: boolean;
};

export const CARD_WIDTH = 460;

export function ChannelCard({channel, onPress, autoFocus = false}: Props) {
  const [focused, setFocused] = useState(false);
  const scale = useRef(new Animated.Value(1)).current;

  const animate = useCallback(
    (to: number) => {
      Animated.spring(scale, {
        toValue: to,
        useNativeDriver: true,
        speed: 24,
        bounciness: 8,
      }).start();
    },
    [scale],
  );

  return (
    <Animated.View style={[styles.wrapper, {transform: [{scale}]}]}>
      <Pressable
        hasTVPreferredFocus={autoFocus}
        tvParallaxProperties={{enabled: false}}
        onFocus={() => {
          setFocused(true);
          animate(1.06);
        }}
        onBlur={() => {
          setFocused(false);
          animate(1);
        }}
        onPress={onPress}
        style={[styles.card, focused && styles.cardFocused]}>
        {/* Marcador visual del canal: iniciales grandes en lugar de una miniatura remota. */}
        <View style={[styles.poster, focused && styles.posterFocused]}>
          <Text style={styles.initials}>{initialsOf(channel.name)}</Text>
          <View style={styles.posterBadge}>
            <LiveBadge
              active={channel.isLive}
              label={channel.isLive ? 'EN DIRECTO' : 'BAJO DEMANDA'}
            />
          </View>
        </View>

        <View style={styles.meta}>
          <Text numberOfLines={1} style={[styles.name, focused && styles.nameFocused]}>
            {channel.name}
          </Text>
          <Text
            numberOfLines={2}
            style={[styles.description, focused && styles.descriptionFocused]}>
            {channel.description}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map(word => word[0]?.toUpperCase() ?? '')
    .join('');
}

const styles = StyleSheet.create({
  wrapper: {width: CARD_WIDTH},
  card: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardFocused: {
    backgroundColor: colors.cardFocused,
    borderColor: colors.cardFocused,
    shadowColor: '#000',
    shadowOpacity: 0.6,
    shadowRadius: 32,
    shadowOffset: {width: 0, height: 18},
  },
  poster: {
    aspectRatio: 16 / 9,
    backgroundColor: colors.backgroundElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  posterFocused: {backgroundColor: '#161B24'},
  initials: {fontSize: 84, fontWeight: '800', color: 'rgba(255,255,255,0.25)'},
  posterBadge: {position: 'absolute', top: spacing.sm, left: spacing.sm},
  meta: {padding: spacing.md, gap: spacing.xs},
  name: {...typography.subtitle, color: colors.text},
  nameFocused: {color: colors.textOnFocus},
  description: {...typography.body, fontSize: 20, color: colors.textMuted, lineHeight: 26},
  descriptionFocused: {color: colors.textMutedOnFocus},
});

import React, {useEffect, useRef} from 'react';
import {Animated, StyleSheet, Text, View} from 'react-native';
import type {Channel} from '../types';
import {colors, overscan, radius, spacing, typography} from '../theme';
import {formatClock} from '../format';
import {Fade} from './Fade';
import {LiveBadge} from './LiveBadge';
import {TVButton} from './TVButton';

type Props = {
  channel: Channel;
  paused: boolean;
  /** Segundos por detrás del borde del directo (0 = en directo). */
  behindLiveSeconds: number;
  atLiveEdge: boolean;
  /** Longitud de la ventana DVR en segundos, según el manifiesto. */
  dvrWindow: number;
  position: number;
  hasSiblings: boolean;
  onTogglePlay: () => void;
  onGoLive: () => void;
  onPrev: () => void;
  onNext: () => void;
  /** Ausente cuando el reproductor es la raíz: no hay a dónde salir. */
  onExit?: () => void;
  onActivity: () => void;
};

export function PlayerOverlay({
  channel,
  paused,
  behindLiveSeconds,
  atLiveEdge,
  dvrWindow,
  position,
  hasSiblings,
  onTogglePlay,
  onGoLive,
  onPrev,
  onNext,
  onExit,
  onActivity,
}: Props) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, [opacity]);

  const progress =
    dvrWindow > 0 ? Math.min(1, Math.max(0, position / dvrWindow)) : 1;

  return (
    <Animated.View style={[StyleSheet.absoluteFill, {opacity}]}>
      <Fade from="top" height={280} intensity={0.85} />
      <Fade from="bottom" height={420} intensity={0.95} />

      <View style={styles.top}>
        <View style={styles.topLeft}>
          <Text numberOfLines={1} style={styles.channelName}>
            {channel.name}
          </Text>
        </View>
        <View style={styles.topRight}>
          <LiveBadge
            active={channel.isLive && atLiveEdge}
            label={
              !channel.isLive
                ? 'BAJO DEMANDA'
                : atLiveEdge
                ? 'EN DIRECTO'
                : `-${formatClock(behindLiveSeconds)} DEL DIRECTO`
            }
          />
        </View>
      </View>

      <View style={styles.bottom}>
        {/* Barra DVR: al quedarse atrás se retrae, lo que da la lectura visual
            del retraso que la insignia da en texto. */}
        <View style={styles.track}>
          <View style={[styles.trackFill, {flex: progress}]} />
          <View style={{flex: 1 - progress}} />
        </View>

        <View style={styles.controls}>
          {hasSiblings ? (
            <TVButton glyph="◀◀" label="Anterior" onPress={onPrev} onActivity={onActivity} />
          ) : null}

          <TVButton
            compact
            autoFocus
            glyph={paused ? '▶' : '❚❚'}
            label={paused ? 'Reproducir' : 'Pausar'}
            onPress={onTogglePlay}
            onActivity={onActivity}
          />

          {hasSiblings ? (
            <TVButton glyph="▶▶" label="Siguiente" onPress={onNext} onActivity={onActivity} />
          ) : null}

          {channel.isLive ? (
            <TVButton
              glyph="●"
              label="Ir al directo"
              onPress={onGoLive}
              onActivity={onActivity}
            />
          ) : null}

          <View style={styles.spacer} />

          {onExit ? (
            <TVButton glyph="✕" label="Salir" onPress={onExit} onActivity={onActivity} />
          ) : null}
        </View>

      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  top: {
    position: 'absolute',
    top: overscan.vertical,
    left: overscan.horizontal,
    right: overscan.horizontal,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.lg,
  },
  topLeft: {flex: 1, gap: spacing.xs},
  topRight: {alignItems: 'flex-end', gap: spacing.sm},
  channelName: {...typography.display, fontSize: 48, color: colors.text},
  bottom: {
    position: 'absolute',
    bottom: overscan.vertical,
    left: overscan.horizontal,
    right: overscan.horizontal,
    gap: spacing.lg,
  },
  track: {
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.22)',
    flexDirection: 'row',
    overflow: 'hidden',
  },
  trackFill: {backgroundColor: colors.live},
  controls: {flexDirection: 'row', alignItems: 'center', gap: spacing.md},
  spacer: {flex: 1},
});

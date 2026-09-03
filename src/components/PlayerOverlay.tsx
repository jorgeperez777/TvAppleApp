import React, {useEffect, useRef} from 'react';
import {Animated, StyleSheet, Text, View} from 'react-native';
import type {Channel, PlaybackStats} from '../types';
import {colors, overscan, radius, spacing, typography} from '../theme';
import {describeStats, formatClock} from '../format';
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
  stats: PlaybackStats;
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
  stats,
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
          <Text numberOfLines={1} style={styles.channelDescription}>
            {channel.description}
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
          <Text style={styles.stats}>{describeStats(stats)}</Text>
        </View>
      </View>

      <View style={styles.bottom}>
        {/* Barra DVR: la posición dentro de la ventana que el origen mantiene disponible. */}
        <View style={styles.timeline}>
          <View style={styles.track}>
            <View style={[styles.trackFill, {flex: progress}]} />
            <View style={{flex: 1 - progress}} />
          </View>
          <View style={styles.timelineLabels}>
            <Text style={styles.timelineLabel}>
              {dvrWindow > 0 ? `Ventana DVR ${formatClock(dvrWindow)}` : 'Sin DVR'}
            </Text>
            <Text style={styles.timelineLabel}>
              {atLiveEdge ? 'Borde del directo' : `Retraso ${formatClock(behindLiveSeconds)}`}
            </Text>
          </View>
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

        <Text style={styles.hint}>
          {onExit
            ? 'Reproducir/Pausar en el mando alterna la señal · Menú vuelve a la lista'
            : 'Reproducir/Pausar en el mando alterna la señal · Menú sale de la app'}
        </Text>
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
  channelDescription: {...typography.body, color: colors.textMuted},
  stats: {...typography.body, fontSize: 18, color: colors.textMuted},
  bottom: {
    position: 'absolute',
    bottom: overscan.vertical,
    left: overscan.horizontal,
    right: overscan.horizontal,
    gap: spacing.lg,
  },
  timeline: {gap: spacing.sm},
  track: {
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.22)',
    flexDirection: 'row',
    overflow: 'hidden',
  },
  trackFill: {backgroundColor: colors.live},
  timelineLabels: {flexDirection: 'row', justifyContent: 'space-between'},
  timelineLabel: {...typography.body, fontSize: 18, color: colors.textMuted},
  controls: {flexDirection: 'row', alignItems: 'center', gap: spacing.md},
  spacer: {flex: 1},
  hint: {...typography.body, fontSize: 18, color: 'rgba(255,255,255,0.45)'},
});

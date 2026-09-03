import React from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {ChannelCard} from '../components/ChannelCard';
import type {Channel} from '../types';
import {colors, overscan, spacing, typography} from '../theme';

type Props = {
  channels: Channel[];
  onSelect: (index: number) => void;
  /** Al volver del reproductor, el foco regresa al canal que se estaba viendo. */
  initialFocusIndex?: number;
};

export function ChannelsScreen({channels, onSelect, initialFocusIndex = 0}: Props) {
  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.title}>TV en directo</Text>
        <Text style={styles.subtitle}>
          Elige una señal. Se abrirá a pantalla completa; pulsa Menú para volver.
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}>
        {channels.map((channel, index) => (
          <ChannelCard
            key={channel.id}
            channel={channel}
            autoFocus={index === initialFocusIndex}
            onPress={() => onSelect(index)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: colors.background},
  header: {
    paddingHorizontal: overscan.horizontal,
    paddingTop: overscan.vertical,
    paddingBottom: spacing.lg,
    gap: spacing.xs,
  },
  title: {...typography.display, color: colors.text},
  subtitle: {...typography.body, color: colors.textMuted},
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
    paddingHorizontal: overscan.horizontal,
    // Holgura extra: al enfocarse, las tarjetas crecen y no deben recortarse.
    paddingVertical: spacing.md,
    paddingBottom: overscan.vertical + spacing.lg,
  },
});

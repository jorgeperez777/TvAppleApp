import React from 'react';
import {Image, StyleSheet} from 'react-native';
import {SCRIM_DATA_URI} from './scrim';

type Props = {
  /** Borde por el que el negro es opaco. */
  from: 'top' | 'bottom';
  height: number;
  /** Opacidad en ese borde. */
  intensity?: number;
};

const SCRIM = {uri: SCRIM_DATA_URI};

/**
 * Velo degradado sobre el vídeo para que el texto del overlay se lea sin tapar
 * la imagen. Una rampa de alfa estirada da un degradado liso sin añadir una
 * dependencia nativa de gradientes.
 */
export function Fade({from, height, intensity = 0.9}: Props) {
  return (
    <Image
      source={SCRIM}
      resizeMode="stretch"
      style={[
        styles.scrim,
        {height, opacity: intensity},
        from === 'top' ? styles.top : styles.bottom,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  scrim: {position: 'absolute', left: 0, right: 0},
  // El PNG es opaco por abajo; para el velo superior se voltea en vertical.
  top: {top: 0, transform: [{scaleY: -1}]},
  bottom: {bottom: 0},
});

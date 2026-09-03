import React, {useCallback, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {CHANNELS} from './src/data/channels';
import {ChannelsScreen} from './src/screens/ChannelsScreen';
import {PlayerScreen} from './src/screens/PlayerScreen';
import {colors} from './src/theme';
import type {Route} from './src/types';

/**
 * Con una sola señal la lista sobra: sería un menú de un elemento delante de la
 * única cosa que la app hace. En ese caso el reproductor es la raíz y arranca
 * directamente. Al añadir una segunda señal, la lista vuelve sola.
 */
const HAS_CHANNEL_LIST = CHANNELS.length > 1;

/**
 * Navegación deliberadamente mínima: dos pantallas y un estado. Evita añadir
 * dependencias nativas de navegación, que en tvOS complican el motor de foco.
 */
export default function App() {
  const [route, setRoute] = useState<Route>(
    HAS_CHANNEL_LIST ? {name: 'channels'} : {name: 'player', index: 0},
  );
  const [lastWatched, setLastWatched] = useState(0);

  const openPlayer = useCallback((index: number) => {
    setLastWatched(index);
    setRoute({name: 'player', index});
  }, []);

  const closePlayer = useCallback(() => {
    setRoute({name: 'channels'});
  }, []);

  return (
    <View style={styles.root}>
      {route.name === 'player' ? (
        <PlayerScreen
          // Remontar por canal inicial garantiza un reproductor limpio en cada entrada.
          key={`player-${route.index}`}
          channels={CHANNELS}
          initialIndex={route.index}
          // Sin lista detrás no se pasa onExit: el botón Menú queda para el
          // sistema, que es lo que saca al usuario a la pantalla de inicio.
          onExit={HAS_CHANNEL_LIST ? closePlayer : undefined}
        />
      ) : (
        <ChannelsScreen
          channels={CHANNELS}
          initialFocusIndex={lastWatched}
          onSelect={openPlayer}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: colors.background},
});

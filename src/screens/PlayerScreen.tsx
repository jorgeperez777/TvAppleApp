import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TVEventControl,
  View,
  useTVEventHandler,
  type HWEvent,
} from 'react-native';
import Video, {
  type OnBufferData,
  type OnProgressData,
  type OnVideoErrorData,
  type VideoRef,
} from 'react-native-video';
import {PlayerOverlay} from '../components/PlayerOverlay';
import {TVButton} from '../components/TVButton';
import {useIdleTimer} from '../hooks/useIdleTimer';
import {playerConfig} from '../playerConfig';
import type {Channel} from '../types';
import {colors, radius, spacing, typography} from '../theme';

type Props = {
  channels: Channel[];
  initialIndex: number;
  /**
   * Ausente cuando el reproductor es la raíz de la app (una sola señal): no hay
   * lista a la que volver, así que el botón Menú se deja al sistema para que
   * salga a la pantalla de inicio del Apple TV, como espera cualquier app tvOS.
   */
  onExit?: () => void;
};

type PlaybackError = {
  message: string;
  attempt: number;
  willRetry: boolean;
};

export function PlayerScreen({channels, initialIndex, onExit}: Props) {
  const [index, setIndex] = useState(initialIndex);
  const channel = channels[index];

  const videoRef = useRef<VideoRef>(null);
  const [paused, setPaused] = useState(false);
  const [buffering, setBuffering] = useState(true);
  const [error, setError] = useState<PlaybackError | null>(null);
  /** Cambiar este token remonta el <Video>: es la forma fiable de rearrancar HLS. */
  const [reloadToken, setReloadToken] = useState(0);
  const [dvrWindow, setDvrWindow] = useState(0);
  const [behindLive, setBehindLive] = useState(0);

  const retriesRef = useRef(0);
  const retryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  /**
   * Estimación del borde del directo. AVPlayer expone la *longitud* de la
   * ventana DVR pero no su instante final, así que lo seguimos nosotros:
   * el borde nunca queda por detrás del tiempo reproducido y avanza con el
   * reloj de pared. Si la reproducción se atasca, el retraso crece solo.
   */
  const liveEdgeRef = useRef(0);
  const lastTickRef = useRef(0);
  /** Últimos valores que reportó el reproductor, para calcular el salto al directo. */
  const positionRef = useRef(0);
  const dvrWindowRef = useRef(0);

  // Los controles se ocultan solos mientras reproduce; en pausa o con error se quedan.
  const idleEnabled = !paused && !error;
  const {visible: overlayVisible, poke} = useIdleTimer(
    playerConfig.overlayIdleTimeout,
    idleEnabled,
  );

  const clearRetryTimer = useCallback(() => {
    if (retryTimer.current) {
      clearTimeout(retryTimer.current);
      retryTimer.current = null;
    }
  }, []);

  const reload = useCallback(() => {
    clearRetryTimer();
    setError(null);
    setBuffering(true);
    setReloadToken(token => token + 1);
  }, [clearRetryTimer]);

  /** Estado limpio al saltar de canal: nada del anterior debe sobrevivir. */
  const resetPlaybackState = useCallback(() => {
    clearRetryTimer();
    retriesRef.current = 0;
    liveEdgeRef.current = 0;
    lastTickRef.current = 0;
    positionRef.current = 0;
    dvrWindowRef.current = 0;
    setError(null);
    setBuffering(true);
    setPaused(false);
    setDvrWindow(0);
    setBehindLive(0);
  }, [clearRetryTimer]);

  useEffect(() => clearRetryTimer, [clearRetryTimer]);

  // El botón Menú del mando sólo llega a JS si se habilita explícitamente, y
  // habilitarlo se lo quita al sistema. Sólo se intercepta si hay una pantalla
  // anterior; si no, dejarlo pasar es lo que permite salir de la app.
  useEffect(() => {
    if (!onExit) {
      return;
    }
    TVEventControl.enableTVMenuKey();
    return () => TVEventControl.disableTVMenuKey();
  }, [onExit]);

  const changeChannel = useCallback(
    (delta: number) => {
      if (channels.length < 2) {
        return;
      }
      resetPlaybackState();
      setIndex(current => (current + delta + channels.length) % channels.length);
      poke();
    },
    [channels.length, poke, resetPlaybackState],
  );

  const togglePlay = useCallback(() => {
    setPaused(current => !current);
    poke();
  }, [poke]);

  const goLive = useCallback(() => {
    // No hace falta acertar el borde, sólo pasarse: AVPlayer recorta el seek al
    // final del rango buscable. Sumar la ventana DVR a la posición actual está
    // garantizado por delante de ese final.
    const target =
      positionRef.current +
      Math.max(dvrWindowRef.current, playerConfig.liveJumpMinSeconds);
    if (Number.isFinite(target) && target > 0) {
      videoRef.current?.seek(target);
    }

    // Re-anclar el estimador del borde. El salto que se recorta aterriza antes
    // de lo pedido, y sin reiniciar aquí la estimación se queda por delante de
    // la realidad: quedaría un retraso fantasma que ya nunca se cierra y que
    // volver a pulsar el botón no arregla.
    liveEdgeRef.current = 0;
    lastTickRef.current = 0;
    setBehindLive(0);

    setPaused(false);
    poke();
  }, [poke]);

  const handleTVEvent = useCallback(
    (event: HWEvent) => {
      // Android TV emite pulsación y liberación; nos quedamos con la primera.
      if (event.eventKeyAction === 1) {
        return;
      }
      switch (event.eventType) {
        case 'menu':
          onExit?.();
          break;
        case 'playPause':
          togglePlay();
          break;
        case 'focus':
        case 'blur':
        case 'pan':
          break;
        default:
          // Cualquier otra tecla cuenta como actividad y saca los controles.
          poke();
      }
    },
    [onExit, poke, togglePlay],
  );

  useTVEventHandler(handleTVEvent);

  const handleProgress = useCallback(
    (data: OnProgressData) => {
      const now = Date.now();
      const elapsed = lastTickRef.current > 0 ? (now - lastTickRef.current) / 1000 : 0;
      lastTickRef.current = now;

      const edge = Math.max(liveEdgeRef.current + elapsed, data.currentTime);
      liveEdgeRef.current = edge;
      positionRef.current = data.currentTime;
      dvrWindowRef.current = data.seekableDuration;

      setDvrWindow(data.seekableDuration);
      setBehindLive(Math.max(0, edge - data.currentTime));
    },
    [],
  );

  const handleBuffer = useCallback((data: OnBufferData) => {
    setBuffering(data.isBuffering);
  }, []);

  const handleReady = useCallback(() => {
    setBuffering(false);
    setError(null);
    // Una carga correcta devuelve el presupuesto completo de reintentos.
    retriesRef.current = 0;
  }, []);

  const handleError = useCallback(
    (event: OnVideoErrorData) => {
      const detail = event.error ?? {};
      const message =
        detail.localizedDescription ??
        detail.errorString ??
        detail.localizedFailureReason ??
        'No se pudo cargar la señal.';

      clearRetryTimer();
      const attempt = retriesRef.current + 1;
      retriesRef.current = attempt;
      const willRetry = attempt <= playerConfig.maxAutoRetries;

      setBuffering(false);
      setError({message, attempt, willRetry});

      if (willRetry) {
        // Espera creciente: un corte de red breve se resuelve solo sin martillear el origen.
        retryTimer.current = setTimeout(reload, playerConfig.retryBaseDelay * attempt);
      }
    },
    [clearRetryTimer, reload],
  );

  const manualRetry = useCallback(() => {
    retriesRef.current = 0;
    reload();
  }, [reload]);

  const source = useMemo(
    () => ({
      uri: channel.url,
      minLoadRetryCount: playerConfig.minLoadRetryCount,
    }),
    [channel.url],
  );

  const atLiveEdge =
    !channel.isLive || behindLive <= playerConfig.liveEdgeToleranceSeconds;
  const showSpinner = buffering && !error;

  return (
    <View style={styles.root}>
      <Video
        // El canal y el token de recarga identifican la instancia: al cambiar, se
        // crea un AVPlayer nuevo en lugar de reutilizar uno en mal estado.
        key={`${channel.id}-${reloadToken}`}
        ref={videoRef}
        source={source}
        style={StyleSheet.absoluteFill}
        resizeMode="contain"
        paused={paused}
        controls={false}
        playInBackground={false}
        playWhenInactive={false}
        preventsDisplaySleepDuringVideoPlayback
        progressUpdateInterval={playerConfig.progressUpdateInterval}
        preferredForwardBufferDuration={playerConfig.preferredForwardBufferDuration}
        onReadyForDisplay={handleReady}
        onBuffer={handleBuffer}
        onProgress={handleProgress}
        onError={handleError}
      />

      {showSpinner ? (
        <View pointerEvents="none" style={styles.centered}>
          <ActivityIndicator size="large" color={colors.text} />
          <Text style={styles.centeredText}>Conectando con {channel.name}…</Text>
        </View>
      ) : null}

      {error ? (
        <View style={styles.centered}>
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>Señal interrumpida</Text>
            <Text style={styles.errorMessage}>{error.message}</Text>
            <Text style={styles.errorMeta}>
              {error.willRetry
                ? `Reintentando… (intento ${error.attempt} de ${playerConfig.maxAutoRetries})`
                : 'Se agotaron los reintentos automáticos.'}
            </Text>
            <View style={styles.errorActions}>
              <TVButton
                glyph="↻"
                label="Reintentar"
                autoFocus
                onPress={manualRetry}
              />
              {onExit ? (
                <TVButton glyph="✕" label="Salir" onPress={onExit} />
              ) : null}
            </View>
          </View>
        </View>
      ) : null}

      {overlayVisible && !error ? (
        <PlayerOverlay
          channel={channel}
          paused={paused}
          behindLiveSeconds={behindLive}
          atLiveEdge={atLiveEdge}
          dvrWindow={dvrWindow}
          position={Math.max(0, dvrWindow - behindLive)}
          hasSiblings={channels.length > 1}
          onTogglePlay={togglePlay}
          onGoLive={goLive}
          onPrev={() => changeChannel(-1)}
          onNext={() => changeChannel(1)}
          onExit={onExit}
          onActivity={poke}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: '#000'},
  centered: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  centeredText: {...typography.subtitle, color: colors.textMuted},
  errorCard: {
    maxWidth: 900,
    padding: spacing.xl,
    borderRadius: radius.lg,
    backgroundColor: colors.scrim,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
    alignItems: 'center',
  },
  errorTitle: {...typography.title, color: colors.text},
  errorMessage: {...typography.body, color: colors.textMuted, textAlign: 'center'},
  errorMeta: {...typography.body, fontSize: 18, color: colors.textMuted},
  errorActions: {flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm},
});

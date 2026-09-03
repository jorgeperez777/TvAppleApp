import {useCallback, useEffect, useRef, useState} from 'react';

/**
 * Mantiene algo visible mientras haya actividad y lo oculta tras `timeout`.
 * Con `enabled` en false el temporizador no corre (p. ej. en pausa o con error,
 * donde los controles deben quedarse en pantalla).
 */
export function useIdleTimer(timeout: number, enabled: boolean = true) {
  const [visible, setVisible] = useState(true);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clear = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  const arm = useCallback(() => {
    clear();
    if (enabled) {
      timer.current = setTimeout(() => setVisible(false), timeout);
    }
  }, [clear, enabled, timeout]);

  /** Marca actividad: muestra y reinicia la cuenta atrás. */
  const poke = useCallback(() => {
    setVisible(true);
    arm();
  }, [arm]);

  const hide = useCallback(() => {
    clear();
    setVisible(false);
  }, [clear]);

  // Al cambiar `enabled` (pausa, error) se recalcula: visible y sin cuenta atrás.
  useEffect(() => {
    if (!enabled) {
      clear();
      setVisible(true);
    } else {
      arm();
    }
    return clear;
  }, [enabled, arm, clear]);

  return {visible, poke, hide};
}

/** Parámetros de reproducción, agrupados para poder afinar el directo en un solo sitio. */
export const playerConfig = {
  /** Segundos sin actividad del mando antes de ocultar los controles. */
  overlayIdleTimeout: 4000,
  /** Reintentos automáticos ante un error de red antes de pedir acción al usuario. */
  maxAutoRetries: 4,
  /** Espera base entre reintentos; crece de forma lineal con el intento. */
  retryBaseDelay: 2000,
  /** Reintentos internos de AVPlayer al cargar el manifiesto. */
  minLoadRetryCount: 5,
  /**
   * Búfer hacia delante. Bajo = menos latencia respecto al directo,
   * alto = menos cortes en redes inestables.
   */
  preferredForwardBufferDuration: 6,
  /** Frecuencia de onProgress (ms); mueve el indicador de retraso respecto al directo. */
  progressUpdateInterval: 500,
  /** A partir de este retraso (s) se deja de considerar "en el borde del directo". */
  liveEdgeToleranceSeconds: 12,
} as const;

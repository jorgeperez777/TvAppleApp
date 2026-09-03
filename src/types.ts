export type Channel = {
  /** Identificador estable; se usa como key para remontar el reproductor. */
  id: string;
  name: string;
  description: string;
  /** URL del manifiesto. HLS (.m3u8) es lo que AVPlayer reproduce de forma nativa en tvOS. */
  url: string;
  /** false = VOD/bucle de prueba; cambia la UI (sin insignia de directo). */
  isLive: boolean;
};

export type Route =
  | {name: 'channels'}
  | {name: 'player'; index: number};

/** Calidad efectiva que reporta el reproductor durante la reproducción. */
export type PlaybackStats = {
  /** Bits por segundo del variante HLS en curso. */
  bitrate: number;
  width: number;
  height: number;
};

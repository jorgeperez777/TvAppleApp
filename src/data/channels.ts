import type {Channel} from '../types';

/**
 * Señales de la app. Sustituye la URL por la tuya: cualquier HLS (.m3u8) en
 * directo funciona sin tocar el resto del código.
 *
 * El número de entradas decide la forma de la app:
 *
 * - **Una entrada** — el reproductor es la raíz y arranca a pantalla completa.
 *   El botón Menú del mando sale de la app, como en cualquier app de tvOS.
 * - **Dos o más** — aparece antes la rejilla de canales, y Menú vuelve a ella
 *   desde el reproductor.
 *
 * Si tu origen es HTTP (no HTTPS), ios/TvLiveApp/Info.plist ya trae
 * NSAllowsArbitraryLoadsForMedia activado para que AVFoundation lo permita.
 * Hay más señales de prueba verificadas en el README.
 */
export const CHANNELS: Channel[] = [
  {
    id: 'redbull',
    name: 'Red Bull TV',
    description: 'Deportes de acción y música, emisión continua 24/7.',
    url: 'https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master_928.m3u8',
    isLive: true,
  },
];

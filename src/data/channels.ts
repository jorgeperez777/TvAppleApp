import type {Channel} from '../types';

/**
 * Canales de ejemplo. Sustituye estas URLs por las tuyas: cualquier HLS
 * (.m3u8) en directo funciona sin tocar el resto de la app.
 *
 * Si tu origen es HTTP (no HTTPS), ios/TvLiveApp/Info.plist ya trae
 * NSAllowsArbitraryLoadsForMedia activado para que AVFoundation lo permita.
 */
export const CHANNELS: Channel[] = [
  {
    id: 'redbull',
    name: 'Red Bull TV',
    description: 'Deportes de acción y música, emisión continua 24/7.',
    url: 'https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master_928.m3u8',
    isLive: true,
  },
  {
    id: 'nasa',
    name: 'NASA TV',
    description: 'Señal pública de la NASA: lanzamientos y vistas orbitales.',
    url: 'https://ntv1.akamaized.net/hls/live/2014075/NASA-NTV1-HLS/master.m3u8',
    isLive: true,
  },
  {
    id: 'akamai-test',
    name: 'Akamai Live Test',
    description: 'Señal de prueba multi-bitrate con ventana DVR.',
    url: 'https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8',
    isLive: true,
  },
  {
    id: 'unified',
    name: 'Unified Streaming',
    description: 'Directo de referencia con reloj en pantalla.',
    url: 'https://demo.unified-streaming.com/k8s/live/stable/live.isml/.m3u8',
    isLive: true,
  },
  {
    id: 'bipbop',
    name: 'Apple BipBop (VOD)',
    description: 'Muestra HLS de Apple, útil para validar la reproducción.',
    url: 'https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8',
    isLive: false,
  },
];

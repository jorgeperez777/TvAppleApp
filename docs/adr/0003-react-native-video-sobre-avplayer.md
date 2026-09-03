# ADR 0003 — Reproducir con `react-native-video` sobre AVPlayer

- **Estado:** Aceptada
- **Fecha:** 2026-09-03

## Contexto

En tvOS, la reproducción de HLS la resuelve AVFoundation: AVPlayer entiende el
manifiesto, elige el variante por ancho de banda, mantiene la ventana DVR y
gestiona la reconexión de segmentos. No tiene sentido reimplementar nada de eso.

Lo que hace falta es un puente entre AVPlayer y React. `react-native-video` 6 es
la opción con recorrido: declara `tvos` en su podspec y expone los eventos que
necesita un directo (`onProgress`, `onBuffer`, `onError`, `onBandwidthUpdate`).

Un detalle relevante: la versión 6.19.2 **no declara `codegenConfig`** y su
componente se registra con `requireNativeComponent('RCTVideo')`. Bajo la New
Architecture eso no es un componente Fabric nativo, sino que pasa por la capa de
interoperabilidad de view managers antiguos (`RCTLegacyViewManagerInteropComponentView`),
que descubre el `RCTVideoManager` registrado en tiempo de ejecución.

## Decisión

Se usa `react-native-video@^6.19.2` como única capa de reproducción, con el
`<Video>` ocupando toda la pantalla (`StyleSheet.absoluteFill`, `resizeMode="contain"`,
fondo negro).

Los parámetros de directo (búfer hacia delante, reintentos internos de carga,
frecuencia de `onProgress`) se agrupan en `src/playerConfig.ts` en vez de
repartirse por el JSX, para poder afinar la latencia en un solo sitio.

## Alternativas consideradas

- **Módulo nativo propio sobre AVPlayer.** Da control total y evita la capa de
  interoperabilidad, pero hay que escribir y mantener Swift más el puente de
  eventos para algo que la librería ya cubre.
- **`react-native-video@7.0.0-beta`.** Tiene soporte Fabric de primera clase,
  pero está en beta y no aporta nada que aquí haga falta.
- **Un SDK comercial (Bitmovin, THEOplayer).** Traen DRM y analítica listos.
  Desproporcionado para un reproductor de señales abiertas, y añaden licencia.

## Consecuencias

- El vídeo se pinta a través de la capa de interoperabilidad de Fabric, no como
  componente nativo. Está verificado que funciona en el simulador de Apple TV
  (vídeo, eventos de progreso, ancho de banda y errores), pero es una capa de
  compatibilidad: si una versión futura de React Native la retira, hay que subir
  a `react-native-video` 7 o superior.
- Se depende de que la librería siga declarando la plataforma `tvos` en su
  podspec. Es lo primero que hay que comprobar al actualizarla.
- Ciertos datos que expone AVPlayer no llegan a JavaScript por esta vía, lo que
  obliga a estimar el borde del directo (ver [ADR 0006](0006-estimacion-del-borde-del-directo.md)).

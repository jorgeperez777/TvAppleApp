# ADR 0004 — Controles propios en lugar de los nativos de tvOS

- **Estado:** Aceptada
- **Fecha:** 2026-09-03

## Contexto

`react-native-video` acepta `controls={true}`, y en tvOS eso levanta el
`AVPlayerViewController` de Apple: la barra de transporte del sistema, con el
comportamiento del mando y las gestos que los usuarios de Apple TV ya conocen,
sin escribir una línea de interfaz.

El encargo, sin embargo, es un reproductor **de livestreams**, y ahí hacen falta
cosas que la barra del sistema no da: distinguir «en el borde del directo» de
«retrasado», mostrar el estado de la reconexión, y saltar entre señales sin salir
de la pantalla completa.

## Decisión

Se dibuja un overlay propio (`src/components/PlayerOverlay.tsx`) sobre el vídeo,
con `controls={false}`, y se atiende el mando con `useTVEventHandler`.

Reglas de la interfaz:

- Los controles se ocultan tras 4 s de inactividad y **se desmontan** al ocultarse.
  Mientras no están, no hay nada enfocable en la pantalla, así que cualquier tecla
  de dirección sólo sirve para volver a sacarlos. Es lo que mantiene predecible el
  motor de foco de tvOS.
- En pausa o con un error visible el temporizador se detiene y los controles se
  quedan fijos.
- El botón Menú vuelve a la lista de canales. Sólo llega a JavaScript si se llama
  a `TVEventControl.enableTVMenuKey()`; se activa al entrar en el reproductor y se
  desactiva al salir, para no secuestrarlo en el resto de la app.

## Alternativas consideradas

- **`controls={true}` (AVPlayerViewController).** Gratis y familiar, pero no deja
  añadir el estado de directo, ni la insignia de reconexión, ni el zapping, que
  son justamente el motivo del encargo.
- **Overlay siempre montado, oculto con `opacity` y `pointerEvents`.** Permite
  animar la salida, pero en tvOS un elemento invisible puede seguir siendo
  enfocable: se acaba con el foco atrapado en botones que no se ven.

## Consecuencias

- Hay que sostener a mano el comportamiento del mando y del foco. Dos trampas ya
  encontradas y evitadas: un botón que se deshabilita mientras está enfocado deja
  el foco huérfano (por eso «Ir al directo» nunca se deshabilita), y una tarjeta
  de error sin nada enfocado es una pantalla muerta (por eso «Reintentar» siempre
  toma el foco al aparecer).
- Al desmontarse el overlay no hay animación de salida, sólo de entrada.
- Se pierden gratis funciones del reproductor del sistema (selección de subtítulos
  y pistas de audio). Si hacen falta, hay que construirlas.

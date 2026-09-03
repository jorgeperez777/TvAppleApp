# ADR 0006 — Estimar el borde del directo con reloj de pared

- **Estado:** Aceptada
- **Fecha:** 2026-09-03

## Contexto

Un reproductor de directo necesita responder a dos preguntas: *¿cuánto voy por
detrás de la emisión?* y *¿a dónde salto para volver al borde?*

`react-native-video` entrega en `onProgress` tres números: `currentTime`,
`playableDuration` y `seekableDuration`. El último es engañoso. En su
implementación de iOS, `seekableDuration` sale de
`CMTimeGetSeconds(seekableTimeRange.duration)`: es la **longitud** de la ventana
DVR, no el instante en que termina. El inicio de esa ventana (`seekableTimeRange.start`),
que en un directo avanza constantemente, no llega a JavaScript.

Con la longitud de la ventana y el tiempo actual no se puede derivar la distancia
al borde: falta el origen.

## Decisión

Se estima el borde en `PlayerScreen` con dos referencias que sí están disponibles:

```
borde = max(borde_anterior + segundos_de_reloj_transcurridos, currentTime)
```

El estimador arranca en el primer `onProgress` con el `currentTime` de ese momento
—AVPlayer entra en un directo por el borde—, nunca queda por detrás del tiempo
reproducido, y avanza con el reloj de pared. El retraso es `borde - currentTime`.

Se comporta bien en los casos que importan:

- **Reproducción normal:** `currentTime` avanza un segundo por segundo de reloj,
  el máximo los mantiene igualados y el retraso se queda en cero.
- **Atasco o pausa:** `currentTime` se congela pero el reloj sigue, así que el
  retraso crece solo, que es exactamente lo que pasa en la realidad.
- **Salto al directo:** `currentTime` da un salto adelante, el máximo adopta ese
  valor y el retraso vuelve a cero sin arrastrar error.

`playerConfig.liveEdgeToleranceSeconds` define a partir de cuántos segundos se
deja de considerar que estamos en el borde.

**«Ir al directo» no usa la estimación como destino.** Salta a
`posición + ventana DVR`, que está garantizado por delante del final del rango
buscable, y deja que AVPlayer recorte al borde real: para llegar al directo no
hace falta acertar, basta con pasarse. Acto seguido **reinicia el estimador**,
que vuelve a anclarse en el siguiente `onProgress`.

Ese reinicio no es cosmético. Medido en el simulador tras una pausa de 200 s
sobre una ventana DVR de 162 s: el salto aterrizaba en el borde real, pero la
estimación se quedaba 25,7 s por delante de la realidad, así que la app seguía
informando de un retraso que ya no existía y que volver a pulsar el botón no
cerraba. Con el reanclaje, la misma prueba deja el retraso en 0,2 s.

## Alternativas consideradas

- **`EXT-X-PROGRAM-DATE-TIME` vía `currentPlaybackTime`.** La librería emite ese
  campo en `onProgress`, y comparado con `Date.now()` daría la latencia real
  contra el reloj mural. Se descarta como base porque no está en los tipos
  públicos de `OnProgressData`, no todos los manifiestos publican la etiqueta, y
  el valor incluye la latencia del codificador. Es la vía a seguir si algún día
  hace falta precisión de verdad.
- **`seek()` a un valor enorme y dejar que AVPlayer recorte al borde.** Resolvería
  el salto, pero no la lectura del retraso, que es la mitad de la funcionalidad.
- **No mostrar el retraso.** Descarta la pregunta en lugar de responderla.

## Consecuencias

- **Lo que se muestra es una estimación, no un dato del manifiesto.** El indicador
  de retraso y la barra DVR no deben usarse como medida exacta de latencia.
- La estimación sólo alimenta lo que se muestra en pantalla; el destino del salto
  al directo no depende de ella.
- El estimador supone velocidad de reproducción 1×. Si se añade reproducción
  acelerada, hay que ponderar el avance del reloj por `rate`.
- El estado vive en refs (`liveEdgeRef`, `lastTickRef`) y se reinicia al cambiar
  de canal, junto con el resto del estado de reproducción.

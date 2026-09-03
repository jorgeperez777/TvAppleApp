# ADR 0007 — Recuperar errores remontando el componente de vídeo

- **Estado:** Aceptada
- **Fecha:** 2026-09-03

## Contexto

Un directo se cae. El origen deja de responder, la red se corta, el manifiesto
caduca. Un reproductor de salón tiene que recuperarse solo: nadie va a levantarse
a buscar el mando cada vez que parpadea la conexión.

AVPlayer reintenta la carga de segmentos por su cuenta —de ahí
`source.minLoadRetryCount`—, pero cuando el `AVPlayerItem` entra en estado fallido
ya no se recupera: hay que darle un item nuevo. Reutilizar la instancia existente
desde JavaScript deja al reproductor en un estado que no siempre se puede limpiar.

## Decisión

La recuperación consiste en **crear un reproductor nuevo**, cambiando la `key` de
`<Video>`:

```tsx
key={`${channel.id}-${reloadToken}`}
```

`onError` incrementa el contador de intentos y programa una recarga con espera
creciente (`retryBaseDelay × intento`), hasta `maxAutoRetries`. Agotados los
intentos automáticos, la tarjeta de error ofrece «Reintentar», que pone el
contador a cero y recarga. Una carga correcta (`onReadyForDisplay`) devuelve el
presupuesto completo de reintentos, para que un corte posterior vuelva a tener
sus cuatro oportunidades.

El mismo mecanismo sirve para el zapping: cambiar de canal cambia la `key`.

## Alternativas consideradas

- **`videoRef.setSource()` sobre la misma instancia.** Evita reconstruir la vista,
  pero hereda el estado del reproductor anterior, que es justo de lo que hay que
  salir cuando el item ha fallado.
- **Reintento con espera fija.** Más simple, pero un origen caído recibe la misma
  cadencia de peticiones indefinidamente. La espera creciente da margen a que un
  corte breve se resuelva sin martillear al servidor.
- **Reintento infinito.** Deja al usuario ante una pantalla que nunca dice nada.
  Cuatro intentos y luego una tarjeta explícita es más honesto.

## Consecuencias

- Cada recuperación rearranca el búfer: hay un hueco visible de reconexión. Es el
  precio de garantizar un estado limpio.
- Todo el estado de reproducción del componente (retraso, calidad, ventana DVR) se
  reinicia con el remontaje. Es deseable: son datos del reproductor anterior.
- Los parámetros (`maxAutoRetries`, `retryBaseDelay`, `minLoadRetryCount`) están en
  `src/playerConfig.ts` para ajustarlos sin tocar la lógica.

# ADR 0009 — Velo degradado embebido como data URI

- **Estado:** Aceptada
- **Fecha:** 2026-09-03

## Contexto

El overlay del reproductor escribe texto blanco sobre vídeo en movimiento. Sin un
velo que oscurezca los bordes, el texto desaparece en cuanto pasa un plano claro.
Hace falta un degradado a negro arriba y abajo.

Se probaron tres formas, en este orden:

1. **Pila de vistas con opacidad creciente.** Renderiza, pero con doce bandas el
   escalonado se ve en las zonas planas de la imagen. Subir a sesenta bandas lo
   disimula a costa de más de cien vistas por overlay.
2. **PNG con rampa de alfa vía `require()`.** Lo esperable. **No se pinta en tvOS.**
   Comprobado en el simulador: la vista se maqueta en la posición y el tamaño
   correctos —al darle un fondo rojo de diagnóstico, las bandas aparecen
   exactamente donde deben—, Metro sirve el archivo correctamente (HTTP 200, 781
   bytes), pero el contenido de la imagen nunca llega a dibujarse.
3. **El mismo PNG como data URI.** Funciona: degradado liso, sin escalonado.

## Decisión

El velo es un PNG RGBA de 4×512 —negro, con `alfa = (y/511)² · 255`— embebido como
data URI en `src/components/scrim.ts` y estirado con `resizeMode="stretch"`. El
velo superior es el mismo recurso volteado con `scaleY: -1`.

Son unos 1000 caracteres de base64 en el repositorio. El archivo lleva en su
cabecera la fórmula para regenerarlo.

## Alternativas consideradas

- **`react-native-linear-gradient` o `react-native-svg`.** Es la respuesta
  ortodoxa y daría un degradado real. Se descarta por no añadir una dependencia
  nativa a un proyecto sobre un fork de tvOS (ver [ADR 0001](0001-react-native-sobre-fork-tvos.md))
  para resolver un adorno.
- **Volver a las bandas, con sesenta en vez de doce.** Sin dependencias y
  demostradamente funcional, pero cambia un artefacto visual por más de cien
  vistas en la pantalla más sensible al rendimiento de la app.
- **`require()` del PNG.** Es lo que debería usarse. No funciona aquí.

## Consecuencias

- Hay un blob en base64 en el código fuente. **No es basura ni un accidente**: si
  alguien lo «limpia» sustituyéndolo por un `require()`, el degradado desaparece
  sin ningún error visible. El comentario del archivo y este ADR existen para
  evitarlo.
- El data URI se comporta igual en depuración y en release, sin depender de la
  resolución de assets de Metro.
- No se ha investigado la causa de fondo del fallo de `require()`. Merece la pena
  volver a probarlo al subir de versión de `react-native-tvos`; si se arregla,
  esta decisión se puede reemplazar por el asset normal.

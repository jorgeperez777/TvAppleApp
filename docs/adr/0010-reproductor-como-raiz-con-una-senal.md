# ADR 0010 — El reproductor es la raíz cuando hay una sola señal

- **Estado:** Aceptada
- **Fecha:** 2026-09-03

## Contexto

El diseño inicial ([ADR 0005](0005-navegacion-por-estado-sin-libreria.md)) asumía
una rejilla de canales delante del reproductor. Con una única señal esa pantalla
es un menú de un elemento delante de lo único que la app hace.

Se revisaron las App Store Review Guidelines: **ninguna directriz exige una
pantalla de índice**. La que aplica es la 4.2 (Minimum Functionality) —«si tu app
no es particularmente útil, única o "app-like", no pertenece a la App Store»— y su
4.2.2, sobre apps que son sobre todo agregadores o colecciones de enlaces.

Leída así, una lista de un elemento no ayuda: es exactamente el tipo de relleno
que la 4.2 mira con lupa. Lo que sostiene el caso frente a esa directriz es lo que
el reproductor hace —controles de directo, reconexión con reintentos, indicador de
retraso y calidad—, no un menú previo.

La directriz que sí impone una condición dura sobre la navegación es la **2.4.3**:
la app debe poder usarse sólo con el mando Siri. Y en tvOS eso implica un contrato
que es fácil romper: **desde la pantalla raíz, el botón Menú tiene que devolver a
la pantalla de inicio del Apple TV.**

Ahí está la trampa. `TVEventControl.enableTVMenuKey()` entrega el botón Menú a
JavaScript, y al hacerlo **se lo quita al sistema**. Un reproductor que sea la raíz
de la app y siga interceptando Menú deja al usuario encerrado: pulsa Menú y no
pasa nada.

## Decisión

La forma de la app la deriva `App.tsx` del número de señales configuradas:

```ts
const HAS_CHANNEL_LIST = CHANNELS.length > 1;
```

- **Una señal:** el reproductor arranca como raíz. No se le pasa `onExit`, y sin
  `onExit` no llama a `enableTVMenuKey()`: Menú queda para el sistema y sale a la
  pantalla de inicio. El botón «Salir» del overlay no se dibuja, y la pista de
  teclas lo refleja.
- **Dos o más:** aparece la rejilla, el reproductor recibe `onExit`, intercepta
  Menú y vuelve a la lista.

`onExit` opcional es lo que codifica la regla: su ausencia *significa* «esta
pantalla es la raíz». No hay una bandera aparte que se pueda desincronizar.

## Alternativas consideradas

- **Mantener siempre la rejilla.** Un menú de un elemento, que además debilita la
  app frente a la 4.2 en lugar de reforzarla.
- **Reproductor siempre como raíz y zapping sin lista.** Con muchas señales obliga
  a recorrerlas a ciegas con «Siguiente». Se descarta por escalar mal.
- **Una constante de configuración manual.** Un interruptor más que mantener en
  sincronía con el contenido, y que al desincronizarse produce justo el fallo de
  Menú que esta decisión evita.

## Consecuencias

- Añadir una segunda señal a `src/data/channels.ts` restaura la rejilla sin tocar
  código; volver a una deja el reproductor como raíz. La lista sigue en el
  repositorio y probada.
- **Nunca se debe llamar a `enableTVMenuKey()` sin ofrecer una salida propia.** Es
  la regla que hay que respetar si en el futuro se añaden pantallas.
- Esto no garantiza la aprobación en la App Store: la 4.2 se valora caso por caso
  y depende del contenido y de la ficha. Lo que sí queda es que la ausencia de
  índice no es en sí misma un incumplimiento.

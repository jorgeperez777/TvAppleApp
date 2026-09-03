# ADR 0005 — Navegación por estado, sin librería

- **Estado:** Aceptada
- **Fecha:** 2026-09-03

## Contexto

La app tiene dos pantallas: la rejilla de canales y el reproductor. La transición
entre ellas es en un solo sentido y sin parámetros más allá del canal elegido.

React Navigation funciona en tvOS, pero arrastra dependencias nativas
(`react-native-screens`, `react-native-gesture-handler`) que introducen sus
propios contenedores de vista. En tvOS el recurso escaso es el motor de foco: cada
capa que se interpone entre la jerarquía de vistas y `UIFocusEngine` es una fuente
de fallos de foco difíciles de diagnosticar.

## Decisión

La navegación es un `useState` en `App.tsx` sobre un tipo suma:

```ts
type Route = {name: 'channels'} | {name: 'player'; index: number};
```

`App.tsx` monta una pantalla u otra. Al entrar al reproductor se remonta por
`key`, y al volver el foco regresa a la tarjeta del canal que se estaba viendo,
vía `initialFocusIndex`.

## Alternativas consideradas

- **React Navigation (stack nativo).** Aporta historial, transiciones y enlaces
  profundos. Ninguno de los tres hace falta con dos pantallas, y el coste en
  dependencias nativas y en riesgo de foco es inmediato (ver [ADR 0001](0001-react-native-sobre-fork-tvos.md)).

## Nota posterior

[ADR 0010](0010-reproductor-como-raiz-con-una-senal.md) matiza esta decisión: con
una sola señal configurada la rejilla no se monta y el reproductor pasa a ser la
raíz. El mecanismo de navegación no cambia.

## Consecuencias

- No hay historial ni enlaces profundos. Si la app crece a tres o cuatro pantallas
  con navegación cruzada, esta decisión toca revisarla; el punto de cambio está
  concentrado en `App.tsx`.
- El estado del reproductor no sobrevive al volver a la lista, porque la pantalla
  se desmonta. Es deliberado: evita arrastrar un AVPlayer vivo fuera de su pantalla.

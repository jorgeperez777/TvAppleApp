# ADR 0001 — React Native sobre el fork de tvOS, no Swift nativo

- **Estado:** Aceptada
- **Fecha:** 2026-09-03

## Contexto

El encargo es un reproductor de livestreams a pantalla completa para Apple TV, y
pedía React Native de forma explícita. React Native oficial no publica soporte de
tvOS desde la versión 0.61: el soporte vive en `react-native-tvos`, un fork que
sigue a la rama principal con unas semanas de retraso y añade el motor de foco,
los eventos del mando (`useTVEventHandler`, `TVEventControl`) y `TVFocusGuideView`.

Trabajar sobre un fork tiene un coste real: las versiones van por detrás, el
ecosistema de librerías no lo prueba, y algunas piezas de la plataforma se
comportan distinto que en iOS (ver [ADR 0009](0009-velo-degradado-como-data-uri.md)).

## Decisión

Se construye con `react-native-tvos` como sustituto de `react-native`, declarado
en `package.json` mediante un alias de npm:

```json
"react-native": "npm:react-native-tvos@0.83.10-1"
```

El alias hace que todo el ecosistema (Metro, el CLI, las librerías que importan
`react-native`) resuelva al fork sin cambiar ni un `import`.

## Alternativas consideradas

- **Swift + SwiftUI/AVKit nativo.** Es la vía de menor fricción para tvOS: el
  foco, el mando y `AVPlayerViewController` vienen resueltos. Se descarta porque
  el encargo pedía React Native, y porque no permite compartir código con otras
  plataformas más adelante.
- **Expo.** `@react-native-tvos/config-tv` existe y funciona, pero añade una capa
  de configuración sobre un fork que ya va por detrás, y aquí no se necesita
  ninguno de los módulos de Expo.

## Consecuencias

- Las versiones de React Native disponibles van por detrás de la rama oficial
  (ver [ADR 0002](0002-fijar-version-react-native-tvos.md)).
- Cada dependencia nativa nueva es un riesgo de compilación: hay que comprobar
  que su podspec declare la plataforma `tvos`. Por eso se retiraron del andamiaje
  `react-native-safe-area-context` y `@react-native/new-app-screen`, y por eso no
  se añadió una librería de navegación (ver [ADR 0005](0005-navegacion-por-estado-sin-libreria.md)).
- El proyecto Android que trae la plantilla compila para Android TV sin trabajo
  extra, pero no está afinado y no es el objetivo.

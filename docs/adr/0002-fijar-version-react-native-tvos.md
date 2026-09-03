# ADR 0002 — Fijar la línea 0.83 de `react-native-tvos`

- **Estado:** Aceptada
- **Fecha:** 2026-09-03

## Contexto

En el momento de arrancar, `react-native-tvos` publicaba hasta **0.87.1-0** en
`latest`. La tentación es coger lo más nuevo, pero el andamiaje de un proyecto
tvOS no sale del paquete de React Native: sale de `@react-native-tvos/template-tv`,
que se consume con `npx @react-native-community/cli init --template`.

Ese paquete de plantilla está publicado **sólo hasta 0.83.0-0**. Para 0.84–0.87
no hay plantilla oficial de tvOS: habría que generar un proyecto iOS y convertir
a mano el target (SDKROOT, `TVOS_DEPLOYMENT_TARGET`, el Podfile, el Info.plist),
sin una referencia con la que contrastar el resultado.

Además, `react-native-video` 6.19.2 —la versión estable en uso— es de abril de
2026, contemporánea de la línea 0.83/0.85, no de la 0.87.

## Decisión

Se genera el proyecto con `@react-native-tvos/template-tv@0.83.0-0` y se sube
React Native al último parche de esa misma línea, **0.83.10-1**, junto con los
paquetes `@react-native/*` a 0.83.10 para que el conjunto sea coherente.

## Alternativas consideradas

- **`react-native-tvos@0.87.1-0` (`latest`).** Sin plantilla de tvOS publicada
  para esa línea. El proyecto nativo habría que armarlo a mano y sin referencia,
  con `react-native-video` sin probar contra esa versión. Riesgo alto por una
  ganancia que aquí no se aprovecha.
- **Quedarse en `0.83.0-0`, la versión exacta que fija la plantilla.** Es lo que
  genera el andamiaje, pero se pierden diez parches de correcciones y hay que
  compilar con Xcode 26.6, bastante posterior a esa publicación.

## Consecuencias

- El proyecto va una línea o dos por detrás de la rama principal de React Native.
  Es un desfase asumido, no un descuido.
- Al subir de línea habrá que comprobar antes que exista plantilla de tvOS para
  ella, o aceptar convertir el target a mano. Ese es el trabajo real de la
  actualización, no el `npm install`.
- Verificado: compila con Xcode 26.6 contra el SDK de tvOS y arranca en el
  simulador de Apple TV 4K con tvOS 26.5.

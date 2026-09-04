# Registro de decisiones de arquitectura (ADR)

Cada archivo recoge una decisión con consecuencias difíciles de revertir, junto
con el contexto en el que se tomó y lo que se descartó. El objetivo es que quien
llegue después entienda **por qué** algo está como está antes de cambiarlo.

Un ADR no se edita para cambiar de idea: se escribe uno nuevo que reemplace al
anterior y se marca el viejo como *Reemplazada por ADR NNNN*.

## Índice

| # | Decisión | Estado |
| --- | --- | --- |
| [0001](0001-react-native-sobre-fork-tvos.md) | React Native sobre el fork de tvOS, no Swift nativo | Aceptada |
| [0002](0002-fijar-version-react-native-tvos.md) | Fijar la línea 0.83 de `react-native-tvos` | Aceptada |
| [0003](0003-react-native-video-sobre-avplayer.md) | Reproducir con `react-native-video` sobre AVPlayer | Aceptada |
| [0004](0004-controles-propios-en-lugar-de-nativos.md) | Controles propios en lugar de los nativos de tvOS | Aceptada |
| [0005](0005-navegacion-por-estado-sin-libreria.md) | Navegación por estado, sin librería | Aceptada |
| [0006](0006-estimacion-del-borde-del-directo.md) | Estimar el borde del directo con reloj de pared | Aceptada |
| [0007](0007-recuperacion-por-remontaje.md) | Recuperar errores remontando el componente de vídeo | Aceptada |
| [0008](0008-excepcion-ats-acotada-a-medios.md) | Excepción de ATS acotada a medios | Aceptada |
| [0009](0009-velo-degradado-como-data-uri.md) | Velo degradado embebido como data URI | Aceptada |
| [0010](0010-reproductor-como-raiz-con-una-senal.md) | El reproductor es la raíz cuando hay una sola señal | Aceptada |
| [0011](0011-assets-tvos-generados-desde-un-solo-logo.md) | Los assets de tvOS se generan por script desde un solo logo | Aceptada |

## Plantilla

```md
# ADR NNNN — Título

- **Estado:** Propuesta | Aceptada | Reemplazada por ADR NNNN
- **Fecha:** AAAA-MM-DD

## Contexto
Qué presionaba a decidir: restricciones, hechos comprobados, fuerzas en conflicto.

## Decisión
Qué se hace, en presente y en afirmativo.

## Alternativas consideradas
Qué más se evaluó y por qué se descartó.

## Consecuencias
Lo que ganamos y lo que aceptamos pagar. Incluye lo que habría que rehacer si
la decisión se revierte.
```

# ADR 0008 — Excepción de ATS acotada a medios

- **Estado:** Aceptada
- **Fecha:** 2026-09-03

## Contexto

App Transport Security bloquea por defecto el tráfico HTTP sin TLS. Es la postura
correcta y la que exige la revisión de la App Store.

El problema es el dominio de la app: buena parte de los orígenes de livestream
reales —cabeceras internas, encoders en la red local, señales heredadas— sirven
HLS por HTTP plano. Un reproductor de directo que sólo admita HTTPS rechaza una
parte importante de aquello para lo que existe.

La plantilla de React Native trae `NSAllowsArbitraryLoads` en `false` con un
comentario advirtiendo de que activarlo arriesga el rechazo de la app.

## Decisión

Se mantiene `NSAllowsArbitraryLoads` en `false` y se añade
**`NSAllowsArbitraryLoadsForMedia`**:

```xml
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <false/>
    <key>NSAllowsArbitraryLoadsForMedia</key>
    <true/>
    <key>NSAllowsLocalNetworking</key>
    <true/>
</dict>
```

Esa clave levanta la restricción **sólo para los medios cargados a través de
AVFoundation**. Cualquier otra petición de la app —una API, telemetría, una
imagen— sigue exigiendo HTTPS. La excepción está donde está el problema y no un
milímetro más allá.

## Alternativas consideradas

- **`NSAllowsArbitraryLoads` en `true`.** Resuelve lo mismo abriendo toda la
  superficie de red de la app. Es exactamente contra lo que advierte la plantilla,
  y convierte un requisito acotado del reproductor en una rebaja general.
- **Sólo HTTPS, sin excepciones.** La postura más segura, pero deja fuera una
  parte del caso de uso. Si el despliegue final sólo apunta a orígenes con TLS,
  esta clave se debería quitar.
- **`NSExceptionDomains` por dominio.** Es lo más estricto y sería preferible con
  una lista de orígenes conocida y fija. Aquí las señales son configurables por
  quien use el proyecto, así que enumerar dominios no es viable.

## Consecuencias

- La app puede reproducir orígenes HLS por HTTP, con el tráfico de medios en claro:
  interceptable y manipulable en la red. Preferir HTTPS siempre que el origen lo
  ofrezca.
- Al enviar a la App Store puede pedirse justificación de la clave. La
  justificación es este documento.
- Si el despliegue acaba usando un conjunto cerrado de orígenes, conviene
  reemplazar esta decisión por `NSExceptionDomains`.

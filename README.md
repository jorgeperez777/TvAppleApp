# TV en directo — reproductor a pantalla completa para Apple TV

App de **tvOS** hecha con **React Native** (`react-native-tvos`) y **`react-native-video`**
(AVPlayer). Muestra una lista de señales y las reproduce a pantalla completa, con
controles pensados para el mando de Apple TV.

## Qué hace

- **Reproducción HLS a pantalla completa.** AVPlayer nativo, ajuste `contain`,
  fondo negro y sin barra de estado.
- **Controles que se ocultan solos.** Aparecen con cualquier tecla del mando y se
  esconden tras 4 s de inactividad; en pausa o con error se quedan fijos.
- **Estado real del directo.** Insignia *EN DIRECTO*, retraso respecto al borde,
  ventana DVR, resolución y bitrate en curso.
- **Botón «Ir al directo»** para saltar al borde de la emisión tras una pausa.
- **Reconexión automática** con espera creciente (4 intentos) y reintento manual
  si se agotan.
- **Zapping** entre señales sin salir del reproductor.

## Requisitos

- macOS con **Xcode** (SDK de tvOS) y un simulador de Apple TV instalado.
- **Node ≥ 20** y **CocoaPods**.

Se usa la instalación de CocoaPods del sistema. Si prefieres fijar la versión
con bundler, el `Gemfile` está incluido: `bundle install` y luego
`cd ios && bundle exec pod install`.

## Puesta en marcha

```sh
npm install
npm run pods        # cd ios && pod install
npm run tv          # arranca Metro, compila y abre el simulador de Apple TV
```

`npm run tv` levanta Metro por su cuenta si no está ya corriendo. Para verlo en
su propia terminal, arráncalo antes con `npm start`.

Si el puerto 8081 está ocupado por otro proyecto, hay que pasar el mismo puerto
a las dos partes:

```sh
npm start -- --port 8082
npm run tv -- --port 8082
```

Para un Apple TV físico: abre `ios/TvLiveApp.xcworkspace` en Xcode, elige tu
equipo de firma en *Signing & Capabilities* y ejecuta sobre el dispositivo
(o `npm run tv:device`).

## Mando a distancia

| Acción | Efecto |
| --- | --- |
| Cualquier dirección | Muestra los controles |
| Selección | Activa el botón enfocado |
| Reproducir/Pausar | Alterna la señal desde cualquier punto |
| Menú | Vuelve a la lista de canales |

## Cambiar las señales

Edita [`src/data/channels.ts`](src/data/channels.ts). Cada entrada es un objeto
`Channel`; sirve cualquier URL HLS (`.m3u8`):

```ts
{
  id: 'mi-canal',
  name: 'Mi canal',
  description: 'Descripción corta',
  url: 'https://origen.example/live/master.m3u8',
  isLive: true,
}
```

Los orígenes **HTTP** (sin TLS) funcionan: `ios/TvLiveApp/Info.plist` activa
`NSAllowsArbitraryLoadsForMedia`, una excepción de App Transport Security acotada
a la carga de medios por AVFoundation. El resto del tráfico de la app sigue
exigiendo HTTPS.

Los parámetros de latencia, búfer y reintentos están agrupados en
[`src/playerConfig.ts`](src/playerConfig.ts).

## Estructura

```
App.tsx                        Navegación entre las dos pantallas
src/data/channels.ts           Señales disponibles
src/playerConfig.ts            Búfer, reintentos, tiempo de ocultado
src/format.ts                  Formato de reloj y de calidad
src/hooks/useIdleTimer.ts      Ocultado por inactividad
src/screens/ChannelsScreen.tsx Rejilla de canales
src/screens/PlayerScreen.tsx   Reproductor, mando y reconexión
src/components/                Overlay, botones y tarjetas con foco de tvOS
```

## Notas de implementación

- **Sin librería de navegación.** Dos pantallas y un estado en `App.tsx`: menos
  dependencias nativas y menos interferencias con el motor de foco de tvOS.
- **El botón Menú** sólo llega a JavaScript si se llama a
  `TVEventControl.enableTVMenuKey()`; `PlayerScreen` lo activa al entrar y lo
  desactiva al salir.
- **Estimación del borde del directo.** AVPlayer expone la *longitud* de la
  ventana DVR (`seekableDuration`), no su instante final. `PlayerScreen` sigue el
  borde con un estimador que nunca queda por detrás del tiempo reproducido y
  avanza con el reloj de pared, de modo que un atasco se refleja como retraso
  creciente y «Ir al directo» vuelve a alcanzarlo.
- **Recarga por remontaje.** Cambiar de canal o reintentar cambia la `key` del
  `<Video>`: se crea un `AVPlayer` nuevo en vez de reutilizar uno en mal estado.
- **Foco.** Los controles se desmontan al ocultarse, así que mientras no están
  no hay nada enfocable y las teclas de dirección sólo sirven para volver a
  mostrarlos.

## Comprobaciones

```sh
npm run tsc    # TypeScript
npm run lint   # ESLint
npm test       # Jest
```

## Android TV

La plantilla base incluye el proyecto Android, así que la app también compila
para Android TV (`npm run androidtv`). El objetivo de este repositorio es Apple
TV; esa parte no está afinada.

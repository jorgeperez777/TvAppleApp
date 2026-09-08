# ADR 0011 — Los assets de tvOS se generan por script desde un solo logo

- **Estado:** Aceptada
- **Fecha:** 2026-09-04

## Contexto

Para subir a producción, tvOS exige un grupo de assets que no se parece al de
iOS. La plantilla de React Native dejaba un `AppIcon.appiconset` con idiomas
`iphone` e `ios-marketing` y sin una sola imagen: compilaba para el simulador,
pero App Store Connect habría rechazado el binario.

Lo que hace falta, según valida `actool` de Xcode 26.6:

| Pieza | Tamaño |
| --- | --- |
| App Icon (en capas) | 400×240 @1x, 800×480 @2x |
| App Icon - App Store (en capas) | 1280×768 |
| Top Shelf Image | 1920×720 @1x, 3840×1440 @2x |
| Top Shelf Image Wide | 2320×720 @1x, 4640×1440 @2x |

Los iconos no son imágenes planas: son `.imagestack` de entre dos y cinco capas,
que tvOS separa para el efecto de parallax al enfocarlos.

El material de partida son dos archivos en `assets/`: un splash de 1920×1080 y un
póster de 540×405. Ambos son el mismo logotipo sobre blanco opaco. El logo útil
mide **1717×373 px**, y es todo lo que hay.

## Decisión

Las nueve piezas se generan con `scripts/generate-tv-assets.py` a partir del
splash, que es la fuente de mayor resolución. Tres decisiones dentro del script:

- **Separación del fondo deshaciendo la premultiplicación.** El logo viene como
  tinta sobre blanco opaco. En vez de recortarlo con un umbral, que dentaría los
  bordes, se calcula `alfa = 255 − min(R,G,B)` y se recupera el color original.
  La capa resultante, compuesta sobre el blanco de la capa de fondo, reproduce el
  original exactamente y conserva el suavizado.
- **Iconos de dos capas:** blanco liso detrás, logo con alfa delante. Es el
  mínimo que admite tvOS y el que corresponde a una marca que ya se presenta
  sobre blanco. **El logo va sólo en la capa delantera:** si también estuviera en
  el fondo, al enfocar el icono el parallax separaría las capas y se vería el
  logotipo duplicado y desplazado. La primera versión tenía justamente ese fallo.
- **Margen del 10 % en iconos y del 16 % en los banners.** El parallax desplaza
  las capas dentro del marco; el contenido pegado al borde se recorta al
  enfocarse.

Se escribe el catálogo entero desde cero en cada ejecución, para que no queden
restos de una generación anterior.

## Alternativas consideradas

- **Arte a mano por un diseñador.** Es lo correcto para un icono definitivo, y el
  logotipo horizontal (4,6:1) no es una gran forma para un marco 5:3. Se descarta
  *por ahora* porque no hay más material que este.
- **Usar el póster de 540×405.** Tiene el mismo logo a un tercio de resolución.
- **Un splash a pantalla completa como pantalla de lanzamiento.** Habría obligado
  a ampliar el logo ×2 para 4K. En su lugar, la pantalla de lanzamiento es un
  storyboard con fondo blanco y el logo centrado al 44,8 % del ancho: la
  maquetación es independiente de la resolución y el `@2x` sale a 1720 px, justo
  por debajo del original, sin ampliar nada.

## Consecuencias

- **Dos piezas amplían el logo y no hay forma de evitarlo con este material:**
  Top Shelf @2x (×1,52) y Top Shelf Image Wide @2x (×1,84). Las otras siete son
  reducciones o 1:1. Se ven correctas a distancia de sofá, pero un logotipo
  vectorial —o un PNG de al menos 3200 px de ancho— las dejaría nítidas. **Es lo
  único pendiente para que el arte sea definitivo.**
- El icono es un logotipo muy apaisado dentro de un marco 5:3, así que queda una
  banda de blanco arriba y abajo. Una marca compacta pensada para el icono
  llenaría mejor el espacio.
- Regenerar es reproducible: `actool` valida la estructura sin compilar la app, y
  la cabecera del script trae el comando.

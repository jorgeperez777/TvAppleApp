"""Genera el catálogo de assets de tvOS a partir del logo de la marca.

Se ejecuta desde la raíz del repositorio y reescribe por completo el grupo
`tvOS App Icon & Top Shelf Image.brandassets` y `LaunchLogo.imageset`. La única
fuente es assets/splash-screen-fhd.jpeg, del que se recorta el logo.

Necesita Pillow, que no es dependencia del proyecto:

    python3 -m venv /tmp/tvassets && /tmp/tvassets/bin/pip install pillow
    /tmp/tvassets/bin/python scripts/generate-tv-assets.py

Validar el resultado sin compilar toda la app:

    xcrun actool ios/TvLiveApp/Images.xcassets --compile /tmp/out \
      --platform appletvos --minimum-deployment-target 15.1 \
      --app-icon "tvOS App Icon & Top Shelf Image" \
      --output-partial-info-plist /tmp/out/partial.plist \
      --target-device tv --errors --warnings --notices
"""
import json, os, shutil
from PIL import Image, ImageChops

SRC = 'assets/splash-screen-fhd.jpeg'
OUT = 'ios/TvLiveApp/Images.xcassets/tvOS App Icon & Top Shelf Image.brandassets'
WHITE = (255, 255, 255)

def logo_with_alpha():
    """Recorta el logo y lo separa del blanco recuperando el alfa.

    El original es tinta sobre blanco opaco. Deshacer la premultiplicación
    contra blanco da una capa que, compuesta sobre el fondo blanco del icono,
    reproduce el original exactamente, con los bordes suavizados intactos.
    """
    im = Image.open(SRC).convert('RGB')
    diff = ImageChops.difference(im, Image.new('RGB', im.size, WHITE)).convert('L')
    box = diff.point(lambda v: 255 if v > 18 else 0).getbbox()
    im = im.crop(box)

    out = Image.new('RGBA', im.size)
    px, op = im.load(), out.load()
    for y in range(im.size[1]):
        for x in range(im.size[0]):
            r, g, b = px[x, y]
            a = 255 - min(r, g, b)
            if a <= 2:
                op[x, y] = (0, 0, 0, 0)
            else:
                f = 255.0 / a
                op[x, y] = (
                    max(0, min(255, int(round((r - (255 - a)) * f)))),
                    max(0, min(255, int(round((g - (255 - a)) * f)))),
                    max(0, min(255, int(round((b - (255 - a)) * f)))),
                    a,
                )
    return out

def solid(w, h):
    """Lienzo blanco opaco, sin nada encima."""
    return Image.new('RGBA', (w, h), WHITE + (255,))

def compose(logo, w, h, margin, transparent):
    """Logo centrado sobre un lienzo de w x h, dejando `margin` de margen relativo."""
    scale = min(w * (1 - 2 * margin) / logo.width, h * (1 - 2 * margin) / logo.height)
    lw, lh = max(1, round(logo.width * scale)), max(1, round(logo.height * scale))
    resized = logo.resize((lw, lh), Image.LANCZOS)
    canvas = Image.new('RGBA', (w, h), (255, 255, 255, 0) if transparent else WHITE + (255,))
    canvas.alpha_composite(resized, ((w - lw) // 2, (h - lh) // 2))
    return canvas

def write_json(path, data):
    with open(path, 'w') as fh:
        json.dump(data, fh, indent=2)
        fh.write('\n')

INFO = {'author': 'xcode', 'version': 1}

def imageset(path, entries):
    os.makedirs(path, exist_ok=True)
    images = []
    for scale, img in entries:
        name = f'image{"" if scale == "1x" else "@" + scale}.png'
        img.save(os.path.join(path, name))
        images.append({'filename': name, 'idiom': 'tv', 'scale': scale})
    write_json(os.path.join(path, 'Contents.json'), {'images': images, 'info': INFO})

def imagestack(path, size, scales, logo, margin):
    """Icono en capas: blanco liso detrás, logo flotando delante."""
    os.makedirs(path, exist_ok=True)
    w, h = size
    layers = []
    # El logo va SÓLO en la capa delantera. Si también estuviera en el fondo, al
    # enfocar el icono el parallax separaría las capas y se vería duplicado.
    for name, is_front in (('Front', True), ('Back', False)):
        layer = os.path.join(path, f'{name}.imagestacklayer')
        os.makedirs(layer, exist_ok=True)
        write_json(os.path.join(layer, 'Contents.json'), {'info': INFO})
        entries = []
        for scale in scales:
            k = int(scale[0])
            img = (compose(logo, w * k, h * k, margin, True) if is_front
                   else solid(w * k, h * k))
            entries.append((scale, img))
        imageset(os.path.join(layer, 'Content.imageset'), entries)
        layers.append({'filename': f'{name}.imagestacklayer'})
    write_json(os.path.join(path, 'Contents.json'), {'layers': layers, 'info': INFO})

logo = logo_with_alpha()
print(f'logo recortado: {logo.size}')

shutil.rmtree(OUT, ignore_errors=True)
os.makedirs(OUT)

# Iconos en capas. Margen amplio: el parallax desplaza las capas dentro del marco.
imagestack(os.path.join(OUT, 'App Icon.imagestack'), (400, 240), ['1x', '2x'], logo, 0.10)
imagestack(os.path.join(OUT, 'App Icon - App Store.imagestack'), (1280, 768), ['1x'], logo, 0.10)

# Top Shelf: banners muy apaisados, el logo pide más aire.
imageset(os.path.join(OUT, 'Top Shelf Image.imageset'),
         [('1x', compose(logo, 1920, 720, 0.16, False)),
          ('2x', compose(logo, 3840, 1440, 0.16, False))])
imageset(os.path.join(OUT, 'Top Shelf Image Wide.imageset'),
         [('1x', compose(logo, 2320, 720, 0.16, False)),
          ('2x', compose(logo, 4640, 1440, 0.16, False))])

write_json(os.path.join(OUT, 'Contents.json'), {
    'assets': [
        {'filename': 'App Icon - App Store.imagestack', 'idiom': 'tv',
         'role': 'primary-app-icon', 'size': '1280x768'},
        {'filename': 'App Icon.imagestack', 'idiom': 'tv',
         'role': 'primary-app-icon', 'size': '400x240'},
        {'filename': 'Top Shelf Image Wide.imageset', 'idiom': 'tv',
         'role': 'top-shelf-image-wide', 'size': '2320x720'},
        {'filename': 'Top Shelf Image.imageset', 'idiom': 'tv',
         'role': 'top-shelf-image', 'size': '1920x720'},
    ],
    'info': INFO,
})
print('catálogo generado')

# Logo de la pantalla de lanzamiento. Se dibuja a 860 pt de ancho, así que el
# @2x sale a 1720 px: por debajo de los 1717 px del original, sin reescalar
# hacia arriba en ningún momento.
LAUNCH = 'ios/TvLiveApp/Images.xcassets/LaunchLogo.imageset'
shutil.rmtree(LAUNCH, ignore_errors=True)
lw = 860
entries = []
for scale in ('1x', '2x'):
    k = int(scale[0])
    w = lw * k
    h = max(1, round(logo.height * w / logo.width))
    entries.append((scale, logo.resize((w, h), Image.LANCZOS)))
imageset(LAUNCH, entries)
print('logo de lanzamiento:', [e[1].size for e in entries])

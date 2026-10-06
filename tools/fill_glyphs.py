#!/usr/bin/env python3
"""Fill glyphs missing from src/glyphs.js from GNU Unifont, leaving every existing glyph as is.

    python3 tools/fill_glyphs.py [unifont.otf]

tools/make_font.py bakes the dialogue font from SimSun (Windows) and is the tool of record:
run it there after adding Chinese text and every character comes out in SimSun. Where SimSun
is not at hand, this adds just the characters the source now uses but glyphs.js lacks, from
Unifont's 16 px Han bitmaps (the WenQuanYi 16 px Song strikes - practically the same shapes
as SimSun's), so the player never falls back to '?'.
"""
import glob, json, re, sys
from PIL import Image, ImageDraw, ImageFont

UNIFONT = sys.argv[1] if len(sys.argv) > 1 else '/usr/share/fonts/opentype/unifont/unifont.otf'
PATH = 'src/glyphs.js'
HEAD, SEP = 'window.MV_GLYPHS = ', ';\nwindow.MV_BTN_GLYPHS = '

src = open(PATH, encoding='utf-8').read()
a, b = src.index(HEAD) + len(HEAD), src.index(SEP)
glyphs = json.loads(src[a:b])

# every non-ASCII character used anywhere in src/ (the same scan as make_font.py)
used = ''
for f in glob.glob('src/*.js'):
    if f.replace('\\', '/').endswith(('glyphs.js', 'assets.js', 'analysis.js')):
        continue
    used += ''.join(re.findall(r'[^\x00-\x7f]', open(f, encoding='utf-8').read()))
missing = [ch for ch in dict.fromkeys(used) if ch.isprintable() and ch not in '♥★←→↑↓◀▶●' and ch not in glyphs]

font = ImageFont.truetype(UNIFONT, 16)
for ch in missing:
    img = Image.new('1', (16, 16), 0)
    d = ImageDraw.Draw(img)
    d.fontmode = '1'
    d.text((0, 0), ch, font=font, fill=1)
    glyphs[ch] = [16, [sum(1 << (15 - x) for x in range(16) if img.getpixel((x, y))) for y in range(16)]]

head = src[:a].splitlines()[0]
if 'fill_glyphs' not in head:
    head += ' Characters SimSun was not run for: GNU Unifont, tools/fill_glyphs.py.'
with open(PATH, 'w', encoding='utf-8') as f:
    f.write(head + '\n' + HEAD)
    json.dump(glyphs, f, ensure_ascii=False, separators=(',', ':'))
    f.write(src[b:])
print(len(missing), 'glyphs added:', ''.join(missing))

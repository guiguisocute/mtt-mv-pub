#!/usr/bin/env python3
"""Cut the Mettaton sprite sheets (asset/...Mettaton EX.png, asset/...Mettaton.png)
into frames.

Both sheets have a dark purple page (138,90,157), and every frame sits on a
light purple cell (195,134,255). Each connected non-page region is one cell;
the cell colour becomes transparent. White section titles on the page are
dropped by the name tables (only listed cells are exported). The box-form
cells all share one 108x92 canvas, so its arm overlays line up with the body
frames as they are.

    python tools/slice_sheet.py [ex|box]            # -> work/<sheet>_index.png (numbered cells)
    python tools/slice_sheet.py [ex|box] --export   # -> work/parts/<sheet>/<name>.png

The name tables map cell index -> part name; the index is stable (sorted
top-to-bottom, left-to-right by the cell's top-left corner).
"""
import sys, os
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

SHEET = 'asset/PC _ Computer - Undertale - Enemies & Bosses - Mettaton EX.png'
SHEET_BOX = 'asset/PC _ Computer - Undertale - Enemies & Bosses - Mettaton.png'
PAGE = (138, 90, 157)
CELL = (195, 134, 255)


def cells(sheet=SHEET):
    im = np.array(Image.open(sheet).convert('RGBA'))
    page = (im[..., 0] == PAGE[0]) & (im[..., 1] == PAGE[1]) & (im[..., 2] == PAGE[2])
    lab, n = ndimage.label(~page)
    out = []
    for i, sl in enumerate(ndimage.find_objects(lab)):
        y0, y1, x0, x1 = sl[0].start, sl[0].stop, sl[1].start, sl[1].stop
        sub = im[y0:y1, x0:x1].copy()
        m = lab[y0:y1, x0:x1] == i + 1
        cellpx = (sub[..., 0] == CELL[0]) & (sub[..., 1] == CELL[1]) & (sub[..., 2] == CELL[2])
        sub[~m | cellpx] = 0
        out.append(dict(x=x0, y=y0, w=x1 - x0, h=y1 - y0, img=sub, cell=cellpx.sum() > 0.2 * m.sum()))
    out.sort(key=lambda c: (round(c['y'] / 6), c['x']))
    return out, im


def _seq(prefix, idx):
    return {i: f'{prefix}{k}' for k, i in enumerate(idx)}


# cell index -> part name (see work/sheet_index.png)
NAMES = {}
NAMES.update(_seq('body', range(4, 10)))          # torso: core closed ... core open
NAMES.update({10: 'puff0', 11: 'puff1'})           # small puffs
NAMES.update(_seq('arm', range(16, 24)))
NAMES.update(_seq('leg', range(28, 37)))
NAMES.update(_seq('face', range(42, 53)))
NAMES.update(_seq('hurt', range(63, 66)))
NAMES.update(_seq('defeat', range(80, 88)))
NAMES.update(_seq('faceU', range(100, 104)))
NAMES.update({111: 'legBarL', 112: 'legBarR', 113: 'legBarFlat', 114: 'legBarRed'})
NAMES.update(_seq('umb', range(115, 126)))         # umbrella mini Mettaton, 11 frames
NAMES.update({126: 'heartFace', 127: 'bomb', 128: 'bombB', 129: 'ball', 130: 'cup0', 131: 'cup1'})
NAMES.update(_seq('yblock', range(132, 136)))
NAMES.update({136: 'bar'})
NAMES.update(_seq('boom', range(137, 144)))        # block -> plus
NAMES.update(_seq('beamV', range(144, 151)))       # vertical arm of the plus, fading
NAMES.update(_seq('beamH', range(151, 158)))       # horizontal arm of the plus, fading
NAMES.update({158: 'heartW', 159: 'heartB', 160: 'bolt', 161: 'spark0', 162: 'spark1', 163: 'spark2'})
NAMES.update({164: 'disco0', 165: 'disco1'})
NAMES.update({180: 'spotOff', 181: 'spotOn', 182: 'smoke', 183: 'breaktime'})
NAMES.update(_seq('twinkle', range(184, 189)))
NAMES.update({189: 'rec', 190: 'rew'})
NAMES.update(_seq('mini', range(197, 209)))        # unused dancing box robots
NAMES.update({209: 'tv0', 210: 'tv1'})
NAMES.update(_seq('icon', range(211, 222)))
NAMES.update({222: 'smile', 223: 'smileB', 224: 'arrowBlock', 225: 'egg'})


# box form (phase one): every body / arm cell is the same 108x92 canvas (blast off: 108x110)
NAMES_BOX = {}
NAMES_BOX.update(_seq('idle', range(10, 14)))       # screen face + dials + wheel, no arms
NAMES_BOX.update({20: 'shirt'})
NAMES_BOX.update(_seq('armsIn', range(27, 33)))     # arms fold into the body
NAMES_BOX.update({41: 'blast0', 42: 'blast1'})      # jet under the body
NAMES_BOX.update({52: 'switchOff', 53: 'switchOn', 54: 'switchOffJP', 55: 'switchOnJP'})  # back view
NAMES_BOX.update({98: 'armMic0', 99: 'armMic1', 100: 'armAsk0', 101: 'armAsk1', 102: 'armYes0', 103: 'armYes1'})
NAMES_BOX.update({138: 'armBack0', 139: 'armBack1', 140: 'armShock', 141: 'armShocked'})
NAMES_BOX.update({143: 'zap0', 144: 'zap1', 145: 'zap2', 162: 'pop0', 163: 'pop1'})
NAMES_BOX.update(_seq('quiz', range(158, 162)))
NAMES_BOX.update({176: 'jar', 177: 'fly', 206: 'boxBullet', 207: 'bullet0', 208: 'bullet1', 214: 'phone'})
NAMES_BOX.update(_seq('confetti', range(193, 197)))

SHEETS = {'ex': (SHEET, NAMES), 'box': (SHEET_BOX, NAMES_BOX)}


if __name__ == '__main__':
    which = next((a for a in sys.argv[1:] if a in SHEETS), 'ex')
    path, names = SHEETS[which]
    cs, im = cells(path)
    if '--export' in sys.argv:
        os.makedirs(f'work/parts/{which}', exist_ok=True)
        for k, name in names.items():
            Image.fromarray(cs[k]['img']).save(f'work/parts/{which}/{name}.png')
        print(len(names), f'parts -> work/parts/{which}')
    else:
        vis = Image.fromarray(im).convert('RGB').resize((im.shape[1] * 2, im.shape[0] * 2), Image.NEAREST)
        d = ImageDraw.Draw(vis)
        for k, c in enumerate(cs):
            d.rectangle([c['x'] * 2, c['y'] * 2, (c['x'] + c['w']) * 2 - 1, (c['y'] + c['h']) * 2 - 1], outline=(0, 255, 0) if c['cell'] else (255, 128, 0))
            d.text((c['x'] * 2 + 2, c['y'] * 2 + 1), str(k), fill=(255, 0, 0))
        os.makedirs('work', exist_ok=True)
        vis.save(f'work/{which}_index.png')
        for k, c in enumerate(cs):
            print(k, c['x'], c['y'], c['w'], c['h'], 'cell' if c['cell'] else 'free')

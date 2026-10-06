#!/usr/bin/env python3
"""Pack every sprite / font / sound the MV uses into src/assets.js (data URIs),
so the player works from file:// with no loader.

    python tools/import_assets.py <dir-with-src/assets.js>

The packed src/assets.js in this repo is enough to run the player. This script
rebuilds it when you have the original sprite sheets and SFX under asset/.

Sources:
  * Mettaton EX parts + box form: cut from the sprite sheets in asset/ by tools/slice_sheet.py
  * battle UI (soul, buttons, HP, fonts, a few UI sounds): copied from the given packed assets.js
    (UNDERTALE battle UI, originally from github.com/Jcw87/c2-sans-fight)
  * sound effects: asset/.../Sound Effects, converted to mono 96k mp3 with ffmpeg
"""
import base64, io, json, os, subprocess, sys, tempfile
from PIL import Image

sys.path.insert(0, os.path.dirname(__file__))
import slice_sheet

if len(sys.argv) < 2:
    sys.exit('usage: python tools/import_assets.py <dir-with-src/assets.js>')
BT = sys.argv[1]
OUT = 'src/assets.js'
SFXDIR = 'asset/PC _ Computer - Undertale - Miscellaneous - Sound Effects'

# UNDERTALE battle UI keys (c2-sans-fight)
UI_IMG = ['PlayerHeart/Default/0', 'PlayerHeart/Split/0', 'HeartShard/Default/0', 'HeartShard/Default/1',
          'HeartShard/Default/2', 'HeartShard/Default/3', 'UIFight/Default/0', 'UIFight/Highlight/0',
          'UIAct/Default/0', 'UIAct/Highlight/0', 'UIItem/Default/0', 'UIItem/Highlight/0', 'UIMercy/Default/0',
          'UIMercy/Highlight/0', 'HP/Default/0', 'BattleFont', 'DamageFont', 'DefaultFont']
UI_META = ['PlayerHeart', 'HeartShard', 'UIFight', 'UIAct', 'UIItem', 'UIMercy', 'HP']
UI_SFX = ['MenuCursor', 'MenuSelect', 'BattleText', 'Ding', 'Flash', 'Warning', 'Slam', 'HeartShatter']

# key -> file in SFXDIR
SFX = {
    'OhYes': 'mus_ohyes.ogg', 'MttYeah': 'mus_mt_yeah.wav',
    **{f'Mtt{i}': f'snd_mtt{i}.wav' for i in range(1, 10)},  # Mettaton's text voice
    'Burst': 'snd_mtt_burst.wav', 'MttHit': 'snd_mtt_hit.wav', 'PreBomb': 'snd_mtt_prebomb.wav',
    'Bomb': 'snd_bomb.wav', 'BombFall': 'snd_bombfall.wav', 'BombSplode': 'snd_bombsplosion.wav',
    'Cheer': 'mus_mett_cheer.ogg', 'Applause': 'mus_mett_applause.ogg', 'Phone': 'snd_phone.wav',
    'LightSwitch': 'snd_lightswitch.wav', 'SwitchPull': 'snd_switchpull_n.wav', 'HeartShot': 'snd_heartshot.wav',
    'Saber': 'snd_saber3.wav', 'Swipe': 'mus_sfx_a_swipe.wav', 'SwipeShort': 'mus_sfx_swipe.wav',
    'CineCut': 'mus_sfx_cinematiccut.wav', 'RainbowBeam': 'mus_sfx_rainbowbeam_1.wav', 'Rimshot': 'mus_rimshot.ogg',
    'Cymbal': 'mus_cymbal.ogg', 'DrumRoll': 'snd_drumroll.wav', 'OrchHit': 'mus_f_orchhit.wav', 'Shock': 'snd_shock.wav',
    'Break1': 'snd_break1.wav', 'Break2': 'snd_break2.wav', 'Explosion': 'mus_explosion.wav',
    'ScreenShake': 'snd_screenshake.wav', 'Impact': 'snd_impact.wav', 'Sparkle': 'snd_sparkle1.wav',
    'BallChime': 'snd_ballchime.ogg', 'Bell': 'snd_bell.wav', 'DoorShut': 'snd_elecdoor_shutheavy.wav',
    'Noise': 'snd_noise.wav', 'Select': 'snd_select.wav', 'Squeak': 'snd_squeak.wav', 'Star': 'mus_sfx_star.wav',
    'Sparkles': 'mus_sfx_sparkles.wav', 'EyeFlash': 'mus_sfx_eyeflash.wav', 'Power': 'snd_power.wav',
    'SpearAppear': 'snd_spearappear.wav', 'Arrow': 'snd_arrow.wav', 'Damage': 'snd_damage.wav',
    'LevelUp': 'snd_levelup.wav', 'SegaPower': 'mus_sfx_segapower.wav', 'Gunshot': 'snd_curtgunshot.ogg',
    'Dununnn': 'mus_dununnn.ogg', 'MettSmash': 'mus_mettsmash.wav', 'Generate': 'mus_sfx_generate.wav',
    'Victor': 'snd_victor.wav', 'Target': 'mus_sfx_a_target.wav', 'DoorOpen': 'snd_elecdoor_open.wav',
    'Buzzing': 'snd_buzzing.wav', 'Escaped': 'snd_escaped.wav',
    # EX attack sounds (legs reaching in / snapping back, the yellow block lit), menus, misc
    'Item': 'snd_item.wav', 'Pullback': 'mus_sfx_a_pullback.wav', 'LitHit': 'mus_sfx_a_lithit.wav',
    'LitHit2': 'mus_sfx_a_lithit2.wav', 'ABreak': 'mus_sfx_abreak.wav', 'ABullet': 'mus_sfx_a_bullet.wav',
    'SwordAppear': 'mus_sfx_a_swordappear.wav', 'Rotate': 'mus_rotate.wav', 'SlideWhistle': 'snd_slidewhist.wav',
    'SpearRise': 'snd_spearrise.wav', 'GlassBreak': 'snd_glassbreak.wav', 'HeavyDamage': 'snd_heavydamage.wav',
    'Chime': 'mus_chime.wav', 'PunchStrong': 'snd_punchstrong.wav', 'Txt1': 'SND_TXT1.wav', 'Txt2': 'SND_TXT2.wav',
    'Alarm': 'mus_f_alarm.ogg', 'SegaPower2': 'mus_sfx_segapower2.wav', 'Spellcast': 'mus_sfx_spellcast.wav',
    'Create': 'mus_create.wav', 'Fall2': 'snd_fall2.wav', 'Hero': 'snd_hero.wav',
}


def png_uri(img):
    b = io.BytesIO()
    img.save(b, 'PNG', optimize=True)
    return 'data:image/png;base64,' + base64.b64encode(b.getvalue()).decode()


def main():
    src = open(os.path.join(BT, 'src/assets.js'), encoding='utf-8').read()
    bt = json.loads(src[src.index('{'):src.rindex('}') + 1])
    assets = dict(img={}, meta={}, sfx={}, parts={})
    for k in UI_IMG:
        assets['img'][k] = bt['img'][k]
    for k in UI_META:
        assets['meta'][k] = bt['meta'][k]
    for k in UI_SFX:
        assets['sfx'][k] = bt['sfx'][k]

    for prefix, (sheet, names) in (('mtt', (slice_sheet.SHEET, slice_sheet.NAMES)), ('box', (slice_sheet.SHEET_BOX, slice_sheet.NAMES_BOX))):
        cs, _ = slice_sheet.cells(sheet)
        for i, name in names.items():
            img = Image.fromarray(cs[i]['img'])
            assets['img'][prefix + '/' + name] = png_uri(img)
            assets['parts'][prefix + '/' + name] = [img.width, img.height]

    with tempfile.TemporaryDirectory() as td:
        for key, fn in SFX.items():
            dst = os.path.join(td, key + '.mp3')
            subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', os.path.join(SFXDIR, fn), '-ac', '1', '-b:a', '96k', dst], check=True)
            assets['sfx'][key] = 'data:audio/mpeg;base64,' + base64.b64encode(open(dst, 'rb').read()).decode()

    with open(OUT, 'w') as f:
        f.write('// Generated by tools/import_assets.py. Packed sprites and SFX. Do not edit.\n')
        f.write('window.MV_ASSETS = ')
        json.dump(assets, f, separators=(',', ':'))
        f.write(';\n')
    print('images', len(assets['img']), 'sounds', len(assets['sfx']), 'bytes', os.path.getsize(OUT))


if __name__ == '__main__':
    main()

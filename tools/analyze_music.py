#!/usr/bin/env python3
"""Analyse music.mp3 (Death by Glamour) and write src/analysis.js for the MV engine.

Outputs a JS file (window.MV_ANALYSIS = {...}) so the player works from file://.
Requires: numpy, scipy, librosa, and an ffmpeg binary on PATH.

    python tools/analyze_music.py [music.mp3] [src/analysis.js]

All times are MUSIC time (0 = first sample of music.mp3). The video plays a
silent pre-roll before the music; the engine adds that offset (T.pre).
"""
import json, subprocess, sys, tempfile, os
import numpy as np
import librosa

SRC = sys.argv[1] if len(sys.argv) > 1 else 'music.mp3'
OUT = sys.argv[2] if len(sys.argv) > 2 else 'src/analysis.js'
SR = 22050

with tempfile.TemporaryDirectory() as td:
    wav = os.path.join(td, 'm.wav')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', SRC, '-ac', '1', '-ar', str(SR), wav], check=True)
    y, sr = librosa.load(wav, sr=SR, mono=True)
dur = len(y) / sr

# ---------------------------------------------------------------- tempo grid
# Brute-force the constant tempo on the onset envelope (the track is
# machine-tight: every 20 s window lands on 147.9-148.1 BPM), then take the
# 16th phase from the ATTACK times (backtracked onsets). Peak-picking a centred
# STFT flux reports hits ~20-40 ms early and puts the grid half a 16th off.
hop = 64
oenv = librosa.onset.onset_strength(y=y, sr=sr, hop_length=hop, n_fft=1024)
ft = librosa.frames_to_time(np.arange(len(oenv)), sr=sr, hop_length=hop)
best = None
for bpm in np.arange(140, 156, 0.01):
    per = 60 / bpm / 4
    for ph in np.arange(0, per, 0.004):
        s = np.interp(np.arange(ph, dur - 1, per), ft, oenv).mean()
        if best is None or s > best[0]:
            best = (s, bpm, ph)
bpm = round(best[1])  # 147.98 -> the score's 148
s16 = 60 / bpm / 4
on = librosa.onset.onset_detect(onset_envelope=oenv, sr=sr, hop_length=hop, backtrack=True, units='time')
ang = np.mod(on, s16) / s16 * 2 * np.pi
phase = (np.angle(np.mean(np.exp(1j * ang))) % (2 * np.pi)) / (2 * np.pi) * s16
# the raw waveform: first hit at 5-20 ms, then every beat (0.415, 0.820 ...)
# -> bar 0 starts on the first grid point. Snare lands on beats 2 and 4 from
# bar 12 on, which confirms the downbeat.
offset = round(float(phase), 3)
bar_len = s16 * 16
nbars = int(np.ceil((dur - offset) / bar_len))
nslots = nbars * 16

# --------------------------------------------------------------- band fluxes
# short, non-centred frames: a frame's END time is right after the attack
yh, yp = librosa.effects.hpss(y)
def flux_of(sig, lo, hi, n_fft=512):
    S = np.abs(librosa.stft(sig, n_fft=n_fft, hop_length=hop, center=False))
    f = librosa.fft_frequencies(sr=sr, n_fft=n_fft)
    L = np.log1p(S[(f >= lo) & (f < hi)] * 20)
    d = np.diff(L, axis=1, prepend=L[:, :1]); d[d < 0] = 0
    return d.mean(0)
ftt = (np.arange(1 + (len(y) - 512) // hop) * hop + 512) / sr

def per_slot(v):
    return np.array([v[(ftt >= offset + i * s16 - 0.01) & (ftt < offset + i * s16 + 0.04)].max(initial=0)
                     for i in range(nslots)])

def local_norm(v, win_bars=8):
    out = np.zeros_like(v)
    for b in range(nbars):
        w = v[max(0, b - win_bars // 2) * 16:min(nbars, b + win_bars // 2) * 16]
        lo, hi = np.percentile(w, 30), np.percentile(w, 98)
        out[b * 16:(b + 1) * 16] = np.clip((v[b * 16:(b + 1) * 16] - lo) / (hi - lo + 1e-9), 0, 1)
    return out

full = local_norm(per_slot(flux_of(y, 30, 11000)))
low = local_norm(per_slot(flux_of(y, 30, 150)))
mid = local_norm(per_slot(flux_of(y, 250, 2000)))
high = local_norm(per_slot(flux_of(y, 2000, 8000)))
kick = local_norm(per_slot(flux_of(y, 30, 130)))
snare = local_norm(per_slot(flux_of(yp, 1500, 5000)))
hat = local_norm(per_slot(flux_of(yp, 7000, 11000)))
tone = local_norm(per_slot(flux_of(yh, 300, 3000)))  # brass stabs / lead attacks

# --------------------------------------------------------------- pitch
# CQT on the harmonic part: bass note per beat, lead note per 16th (MIDI, -1 = none)
C = librosa.amplitude_to_db(np.abs(librosa.cqt(yh, sr=sr, hop_length=256, fmin=librosa.note_to_hz('C1'),
                                                n_bins=84, bins_per_octave=12)), ref=np.max)
ct = librosa.frames_to_time(np.arange(C.shape[1]), sr=sr, hop_length=256)
def pitch(t0, t1, lo, hi, floor=-45):
    m = (ct >= t0) & (ct < t1)
    if not m.any():
        return -1
    seg = C[lo - 24:hi - 24, m].mean(1)
    i = int(np.argmax(seg))
    return -1 if seg[i] < floor else lo + i
E1, E3, G4, C7 = (int(librosa.note_to_midi(n)) for n in ('E1', 'E3', 'G4', 'C7'))
bass = [pitch(offset + k * 4 * s16, offset + (k + 1) * 4 * s16, E1, E3) for k in range(nbars * 4)]
lead = [pitch(offset + i * s16, offset + (i + 1) * s16 + 0.03, G4, C7) for i in range(nslots)]

# ---------------------------------------------------------------- envelopes
ehop = 512
rms = librosa.feature.rms(y=y, hop_length=ehop)[0]
et = librosa.frames_to_time(np.arange(len(rms)), sr=sr, hop_length=ehop)
E = np.abs(librosa.stft(y, n_fft=2048, hop_length=ehop)) ** 2
ef = librosa.fft_frequencies(sr=sr, n_fft=2048)
def band_env(lo, hi):
    return E[(ef >= lo) & (ef < hi)].sum(0)
FPS = 60
tt = np.arange(0, dur, 1 / FPS)
def env(v, db=False):
    v = np.interp(tt, et, v)
    if db:
        v = 10 * np.log10(v + 1e-9)
        v = (v - np.percentile(v, 2)) / (np.percentile(v, 99.5) - np.percentile(v, 2))
    else:
        v = v / np.percentile(v, 99.5)
    return np.clip(v, 0, 1)
env_rms = env(rms)
env_low = env(band_env(20, 150), db=True)
env_high = env(band_env(2500, 11000), db=True)

# ---------------------------------------------------------------- sections
# Boundaries from the bar-level novelty curve + band energies + a bar-gridded
# mel spectrogram (see README). Bars are 1.6216 s long at 148 BPM.
bar_rms = [float(rms[(et >= offset + b * bar_len) & (et < offset + (b + 1) * bar_len)].mean()) for b in range(nbars)]
SECTIONS = [
    ('stabs',   0,  4, 'dry brass stabs, 2-bar cycle: 1 2 3 3a 4 4& / 1& 3 3a 4'),
    ('groove',  4,  8, 'funk bass enters: B E D E / E G A D'),
    ('lead',    8, 12, 'synth lead + sustained pad, no hats; 11 swells into the drop'),
    ('themeA', 12, 24, 'full band, main theme in 2-bar phrases, snare on 2 and 4'),
    ('themeB', 24, 40, 'second theme, bass E-D-G# / A-F-A#-G, 32-39 repeats 24-31, fill + gap end of 39'),
    ('climax', 40, 55, 'loudest: brass melody, 4-bar phrases 40/44/48 + 52-54, bass walks E F# G A on 43/47/51'),
    ('break',  55, 56, 'bass and kick drop out: 3-3-2 stabs (16ths 0 3 6 8 11 12)'),
    ('disco',  56, 71, 'key change to C# minor, kick every 8th, 8-bar phrase (56-63 = 64-71)'),
    ('stop',   71, 72, 'drums empty out, riser into the finale'),
    ('finale', 72, 80, 'back to E minor, broad half-time melody, 2-bar phrases'),
    ('ending', 80, nbars, 'filter sweep + snare roll (80), closing stabs (81), last hit on 82 then ring-out'),
]
mx = max(bar_rms)
sections = [dict(name=n, bar0=a, bar1=b, note=d, energy=round(float(np.mean(bar_rms[a:b]) / mx), 3))
            for n, a, b, d in SECTIONS]

q = lambda a, k=2: [round(float(x), k) for x in a]
data = dict(
    bpm=bpm, offset=offset, sixteenth=round(s16, 6), barLength=round(bar_len, 6),
    duration=round(dur, 3), bars=nbars,
    barRms=q(np.array(bar_rms) / mx, 3), sections=sections,
    slots=dict(full=q(full), low=q(low), mid=q(mid), high=q(high), kick=q(kick), snare=q(snare), hat=q(hat), tone=q(tone)),
    bass=bass, lead=lead,
    envFps=FPS, env=dict(rms=q(env_rms, 3), low=q(env_low, 3), high=q(env_high, 3)),
)
os.makedirs(os.path.dirname(OUT) or '.', exist_ok=True)
with open(OUT, 'w') as f:
    f.write('// Generated by tools/analyze_music.py - do not edit by hand.\n')
    f.write('window.MV_ANALYSIS = ')
    json.dump(data, f, separators=(',', ':'))
    f.write(';\n')
print(f'bpm={bpm} (fit {best[1]:.2f}) offset={offset}s bars={nbars} duration={dur:.2f}s -> {OUT}')
for s in sections:
    print(f"  {s['name']:7s} bars {s['bar0']:2d}-{s['bar1']:2d}  t={offset + s['bar0'] * bar_len:7.2f}s  energy {s['energy']:.2f}  {s['note']}")

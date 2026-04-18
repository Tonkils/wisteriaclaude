---
name: Audio Engineering Reference
description: Deep-dive on audio processing — signal chain, EQ, compression, loudness standards, common fixes
type: reference
created: 2026-04-18
updated: 2026-04-18
session_user: jaret
author: claude
---

## Signal Chain (Processing Order)

Apply audio processing in this order. Order matters — each step feeds the next.

```
Raw Audio
  → 1. Noise Reduction (remove background noise, hum, buzz)
  → 2. High-Pass Filter (cut everything below 70-80 Hz)
  → 3. EQ (shape the tone)
  → 4. De-esser (tame harsh sibilance)
  → 5. Compression (smooth dynamics)
  → 6. Additional EQ (optional — fine-tune after compression)
  → 7. Limiter (catch peaks, set ceiling)
  → 8. Loudness Normalization (hit target LUFS)
Final Output
```

## EQ Frequency Reference

| Frequency Range | What Lives Here | Common Action |
|----------------|-----------------|---------------|
| 20-80 Hz | Rumble, AC hum, handling noise | **Cut** — high-pass filter at 70-80 Hz |
| 80-250 Hz | Body, warmth, chest resonance | Boost slightly for warmth, cut if boomy |
| 250-500 Hz | Boxiness, muddiness | **Cut** if voice sounds boxy or muddy |
| 500 Hz - 2 kHz | Midrange, nasal quality | Cut narrowly if nasal, generally leave alone |
| 2-5 kHz | Presence, clarity, intelligibility | **Boost** 2-3 dB for clarity and cut-through |
| 5-8 kHz | Sibilance ("s", "sh", "ch" sounds) | De-esser target range. Cut if harsh. |
| 8-10 kHz | Air, brightness | Gentle boost for "air," cut if hissy |
| 10+ kHz | Hiss, noise, extreme highs | **Cut** — low-pass filter at ~10 kHz for speech |

**Key rule**: Human voice rarely goes below 80 Hz or above 10 kHz. Everything outside that range is almost certainly noise.

## Compression Settings by Use Case

| Use Case | Ratio | Attack | Release | Threshold | Notes |
|----------|-------|--------|---------|-----------|-------|
| Podcast dialogue | 2:1 - 4:1 | 10-20 ms | 100-300 ms | -20 to -15 dB | Smooth, natural. 3-6 dB gain reduction. |
| Aggressive podcast (loud hosts) | 4:1 - 6:1 | 5-10 ms | 50-150 ms | -25 to -20 dB | Tighter control, still sounds natural. |
| YouTube voiceover | 3:1 - 4:1 | 10-15 ms | 100-200 ms | -18 to -12 dB | Consistent, present, not squashed. |
| Music under dialogue | 2:1 | 20-30 ms | 200-400 ms | -15 dB | Gentle leveling. Music should duck naturally. |

**Attack**: How fast the compressor reacts. Faster = catches transients. Too fast = squashed, unnatural.
**Release**: How fast it lets go. Too fast = pumping. Too slow = volume stays ducked too long.
**Threshold**: Level at which compression kicks in. Lower = more compression applied.

## Loudness Standards by Platform

| Platform | Target LUFS | True Peak | Standard | Notes |
|----------|-------------|-----------|----------|-------|
| Podcasts (general) | **-16 LUFS** | -1 dB | — | Widely accepted standard |
| Apple Podcasts | -16 LKFS (±1 dB) | -1 dB FS | ITU-R BS.1770-5 | Embed loudness metadata |
| Spotify (podcasts) | **-14 LUFS** | -1 dB | ITU 1770 | Louder than Apple |
| YouTube | **-14 LUFS** | -1 dB | — | YouTube normalizes if off target |
| Instagram Reels | -14 LUFS | -1 dB | — | Match YouTube |
| TikTok | -14 LUFS | -1 dB | — | Match YouTube |
| Broadcast TV | -24 LUFS | -2 dB TP | EBU R128 / ATSC A/85 | Much quieter than streaming |

**LUFS** = Loudness Units Full Scale. Measures perceived loudness, not just peak levels.
**True Peak** = The absolute maximum sample level. Keep below -1 dB to avoid clipping on conversion/playback.
**LKFS** = Loudness K-weighted Full Scale. Same as LUFS, different name (used in broadcast specs).

## Common Audio Problems and Fixes

### Background Noise / Hum
- **Tool**: Noise reduction plugin (Audacity, Audition, RX)
- **Method**: Sample a "silent" section as noise profile, then apply reduction to entire track
- **Amount**: Start with moderate reduction. Too aggressive = robotic artifacts.
- **Prevention**: Record in quiet room, use directional mic, distance from AC/fans

### Plosives (Harsh "P" and "B" Sounds)
- **Tool**: High-pass filter, de-plosive plugin, or manual volume automation
- **Method**: HPF at 80-100 Hz catches most. For stubborn ones, manually reduce the plosive's volume.
- **Prevention**: Pop filter, mic at 45° angle (not directly in front of mouth), 15-30 cm distance

### Sibilance (Harsh "S" Sounds)
- **Tool**: De-esser plugin
- **Method**: Target 4-8 kHz. Set threshold so it only catches harsh sibilants, not all "s" sounds.
- **Prevention**: Slight off-axis mic positioning, windscreen

### Room Echo / Reverb
- **Tool**: De-reverb plugin (iZotope RX, Acon DeVerberate)
- **Method**: Reduce reverb tail. Hard to fix completely — prevention is better.
- **Prevention**: Acoustic treatment (foam panels, blankets, bookshelves), record in small rooms with soft surfaces

### Clipping (Audio Distortion from Too-Loud Signal)
- **Tool**: De-clip plugin (iZotope RX), or re-record
- **Method**: De-clip can salvage mild clipping. Severe clipping = re-record.
- **Prevention**: Record at -12 to -6 dB peak level. Leave headroom.

### Inconsistent Volume Between Speakers
- **Tool**: Compressor, auto-leveler (Auphonic, Hindenburg), manual gain adjustment
- **Method**: Match RMS/LUFS levels between speakers. Compress each track independently.
- **Prevention**: Set levels before recording, use same mic type for all speakers

### Mouth Clicks and Lip Smacks
- **Tool**: De-click plugin (iZotope RX) or manual edit
- **Method**: RX Mouth De-click is best automated solution. Manual: zoom in, reduce click volume.
- **Prevention**: Stay hydrated, green apples (reduce mouth noise — old radio trick)

## Music Mixing Under Dialogue

- Music level: **-20 to -30 dB below dialogue**
- Use **sidechain compression / ducking**: music automatically drops when speech is detected
- Bring music up during pauses, transitions, and intro/outro
- Match music energy to content energy — shift tracks at emotional transitions
- Always check the mix on headphones AND speakers — balance sounds different
- Keep music relatively quiet; its job is to set mood, not compete with speech

## Recording Best Practices

- **Room**: Small, quiet, soft surfaces. Closets work. Avoid large empty rooms.
- **Mic distance**: 15-30 cm (6-12 inches), at a 45° angle to reduce plosives
- **Gain**: Set so peaks hit -12 to -6 dB. Never clip. Headroom is free.
- **Monitoring**: Wear closed-back headphones while recording to catch issues live
- **Separate tracks**: Record each speaker on a separate track (essential for editing)
- **Room tone**: Record 30 seconds of silence in the room — use as noise profile for noise reduction
- **Pop filter**: Always use one for close-mic recording
- **Sample rate**: 44.1 kHz (standard) or 48 kHz (video standard). Don't mix rates.
- **Bit depth**: 24-bit for recording (more headroom). Deliver at 16-bit if required.

---
name: Podcast Editing Reference
description: Complete reference for podcast editing — workflow, audio specs, video podcast, clip creation
type: reference
created: 2026-04-18
updated: 2026-04-18
session_user: jaret
author: claude
---

## Workflow (Start to Finish)

### 1. Full Listen-Through
- Listen to the entire recording with notes
- Mark timestamps: key moments, problems, highlights, clip-worthy segments
- Note sections to cut: tangents, dead air, technical issues

### 2. Rough Cut
- Remove weak sections, small talk, redundant Q&A
- Cut false starts, long pauses, and rambling
- Keep the total in mind — most podcasts land between 30-90 minutes

### 3. Rearrange for Narrative
- Move the strongest content to the opening (after the intro)
- Create a hook: pull a compelling sound bite from later in the conversation
- Impose structure: setup → exploration → payoff
- Use three-act structure when the content supports it
- **Jay Shetty transformation arc (preferred for interview/healing content):**
  1. Universal pain — open with a feeling everyone recognizes
  2. Guest intro — who they are and why they speak to this
  3. Transformation journey — the story, emotionally not just factually
  4. Earned wisdom — the insight that came *from* the journey
  5. Actionable takeaway — what the listener can do or feel differently right now

### 4. Tighten Pacing
- Remove filler words: "um," "uh," "you know," "like," "so," "right"
- Balance: polished, not robotic. Keep natural pauses for comedic timing and emphasis.
- Guiding question: "Does this moment add to the story?" If not, cut it.

### 5. Audio Processing Chain
Apply in this order:
1. **Noise reduction** — always first. Remove background noise, hum, buzz.
2. **High-pass filter** — 70-80 Hz. Cuts rumble and low-frequency noise.
3. **EQ** — Low-pass at ~10 kHz (cuts hiss). Presence boost at 2-5 kHz for clarity. Cut muddy frequencies at 200-500 Hz if boxy.
4. **Compression** — Ratio 2:1 to 4:1. Attack 10-20 ms. Release 100-300 ms. Smooths volume differences between speakers.
5. **De-esser** — Tame sibilance (harsh "s" sounds). Target 4-8 kHz range.
6. **Limiter** — Catch peaks. Set ceiling at -1 dB true peak.
7. **Loudness normalization** — Target -16 LUFS for podcasts. See audio-engineering.md for platform-specific targets.

### 6. Sound Design
- **Intro/outro**: Custom theme music, 15-30 seconds. Establishes brand identity.
- **Transitions**: Music stings or sound effects between segments. Keep subtle.
- **Background music**: -20 to -30 dB below dialogue. Use ducking (auto-lower when speech detected). Use strategically — not under the entire episode.
- **Archival material**: Historical recordings or media clips where relevant.

### 7. Video Polish (Video Podcasts)
- **Multi-cam switching**: 2-4 angles (wide, close-ups per speaker, over-shoulder). Switch on speaker changes. Use wide shot as the "safe" default.
- **Zoom cuts**: 10-20% zoom for visual variety with a single camera. Zoom in for intensity, zoom out for transitions.
- **Lower thirds**: Speaker name/title cards within first 30 seconds. Topic title cards at segment changes.
- **B-roll**: Product demos, screenshots, location footage, screen recordings. Use to cover jump cuts.
- **Graphics**: Data visualizations, pull quotes, contextual images.
- **Captions**: Animated word-by-word highlighting is the current standard. 85% of social video is watched without sound.

### 8. Master and QC
- Loudness normalize to target (see below)
- Full listen on headphones — check for clicks, pops, level inconsistencies
- Check that music ducking sounds natural
- Verify intro/outro levels match body

### 9. Export
- **Audio only**: MP3 128-192 kbps (mono 96-128 kbps) or AAC (preferred over MP3 for quality). 44.1 kHz sample rate. Apple recommends WAV/FLAC 24-bit for source, then encode.
- **Video**: 1080p or 4K for YouTube. H.264 or H.265 codec. Audio embedded, not separate.

### 10. Clip Creation for Social Media
- **Volume**: 3-10 clips per episode
- **Duration**: 30-90 seconds each
- **Format**: 9:16 vertical (1080x1920) for TikTok/Reels/Shorts. 1:1 for Instagram feed/LinkedIn. 16:9 for YouTube.
- **Hook**: First 1-3 seconds must grab — question, bold claim, emotional moment, surprising statement
- **Captions**: Always on. Large, animated, word-by-word. Centered in safe zones.
- **Reframing**: Center the active speaker. AI auto-layouts can handle this (Riverside, OpusClip).
- **CTA**: End card with subscribe/follow prompt
- **Selection criteria**: Emotional peaks, surprising insights, controversial takes, actionable advice
- **Naming**: Always name after the exact insight delivered, never a generic label. "What 30 years of therapy couldn't fix in 8 hours" beats "Clip 3."
- **Self-contained**: Every clip must start with its own hook and end with its own payoff — no clip should require context from the episode to land

## Loudness Targets by Platform

| Platform | Target | True Peak | Notes |
|----------|--------|-----------|-------|
| General podcast | -16 LUFS | -1 dB | Widely accepted standard |
| Apple Podcasts | -16 LKFS (±1 dB) | -1 dB FS | ITU-R BS.1770-5 |
| Spotify | -14 LUFS | -1 dB | ITU 1770 |
| YouTube | -14 LUFS | -1 dB | Will normalize if off |

## Time Estimates

- Manual editing: 3-5 minutes of work per 1 minute of audio
- 60-minute episode = 3-5 hours of editing
- AI tools (Descript, Auphonic) can reduce by 50-75%
- Professional editors charge $30-200/hour of finished audio

## Gold Standard Shows (What to Study)

| Show | What to Learn |
|------|---------------|
| Radiolab | Layered sound design — the edit IS the storytelling |
| This American Life | Narrative structure, act breaks, music as argument |
| 99% Invisible | Rhythm and musicality in spoken-word storytelling |
| Serial | Serialized investigative narrative, pacing across episodes |
| The Daily (NYT) | Clean daily format, theme music as brand identity |
| Darknet Diaries | Solo production quality, hypnotic narration pacing |
| Joe Rogan Experience | Raw long-form, minimal editing = authenticity at scale |
| Lex Fridman | Minimalist aesthetic, letting conversations breathe |
| Colin & Samir | Polished video podcast, strong clip creation pipeline |
| Huberman Lab | Educational structure, graphics for explanation, chapter markers |
| Diary of a CEO | Professional multi-cam studio, consistent branding |
| **Jay Shetty — On Purpose** | **The gold standard for warmth + wisdom interview content. Transformation arc structure, witness host style, earthy visual aesthetic, insight-first clip naming. Study this for ALL interview and healing content.** |

## Jay Shetty Editing Style — Apply to All Interview/Healing Content

This is Hiya's benchmark for how Wisteria Farms content should feel at the high end. Apply to TRA, Car Collective interviews, any talking-head content.

**Visual production:**
- Soft warm lighting — never harsh or bright studio light
- Clean talking-head; no visual distractions in the background
- Earthy, desaturated color grade — calm, not punchy
- Both speakers equally framed and lit
- Intentional, propped background — curated but lived-in

**Host/interview editing behavior — protect these moments:**
- Never cut a pause where a guest is processing emotion
- Never cut the moment right before a breakthrough — silence is the setup
- If the host asks a question and the guest pauses, keep the pause
- Let reactions breathe — host leaning in, nodding, tearing up — these ARE the content

**Clip creation from Jay Shetty style content:**
- Every clip is self-contained: starts with its own hook, ends with its own payoff
- Name after the exact insight: never "Episode 12 clip" — always "What no one tells you about grief"
- Warm earthy caption font, no jarring animations — let the words land
- No branded intro on clips — starts instantly

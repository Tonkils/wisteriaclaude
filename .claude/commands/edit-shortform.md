---
description: Edit short-form content for Instagram Reels, TikTok, or YouTube Shorts
argument-hint: <path-to-source-media or clip description>
---

Short-form editing pipeline. Creates vertical (9:16) clips optimized for social platforms.

## Pipeline

### Step 1: Determine Source Type

Ask the user:
- **Clipping from long-form?** (podcast, YouTube video, interview) → Extract the best moments
- **Original short-form?** (filmed specifically for Reels/TikTok) → Edit the existing footage
- **Generated content?** (motion graphics, animated captions) → Route to Branch A (Remotion `/render`)

### Step 2: Audio-First (Transcription)

Extract and transcribe audio:
```bash
ffmpeg -i input.mp4 -vn -acodec pcm_s16le -ar 16000 -ac 1 audio.wav
```

Transcribe with word-level timestamps (Deepgram preferred for short-form — millisecond precision for caption sync):
- See `/transcribe` for method details

### Step 3: Clip Selection (if clipping from long-form)

Read `orchestrator/skills.md` "Clip Selection Criteria" section. Analyze transcript for:

1. **Emotional peaks** — laughter, surprise, anger, vulnerability
2. **Surprising insights** — counterintuitive statements, "I never thought of it that way"
3. **Actionable advice** — concrete steps, tips, frameworks
4. **Controversial takes** — opinions that provoke discussion
5. **Quotable one-liners** — shareable, standalone statements
6. **Story climaxes** — payoff moments of narratives

For each candidate clip:
- Define in/out points (30-90 second target)
- Verify it's self-contained (makes sense without context)
- Identify the hook moment (must be in first 1-3 seconds)
- Rate hook strength: strong / medium / weak

Present clip candidates to user with hook strength ratings. Target: 3-10 clips per hour of source.

### Step 4: Edit Each Clip

Read `memory/references/video-editing/shortform-editing.md` for full specs.

**Pacing:**
- Cut every 2-3 seconds — no dead air
- Remove ALL filler words (more aggressive than podcast editing)
- Jump cuts are expected and welcomed in short-form

**Hook Construction:**
- Place the strongest moment first (before context/setup)
- If the clip is a response, show the question/claim first (0.5-1 second)
- No preamble, no greetings, no "so basically..."

**Safe Zones:**
```
Top 14% (250px)    — AVOID (UI overlays)
Middle 66%         — SAFE (design here)
Bottom 20% (340px) — AVOID (captions/description)
```

### Step 5: Technical Execution

**Extract clip:**
```bash
ffmpeg -i source.mp4 -ss [start] -to [end] -c copy clip_raw.mp4
```

**Reframe to 9:16 (if source is 16:9):**
```bash
# Center crop to vertical
ffmpeg -i clip_raw.mp4 -vf "crop=ih*9/16:ih,scale=1080:1920" -c:a copy clip_vertical.mp4
```

**Speed adjustments (if needed):**
```bash
# Speed up boring transitions
ffmpeg -i clip.mp4 -filter:v "setpts=0.5*PTS" -filter:a "atempo=2.0" clip_fast.mp4
```

**Audio processing:**
- Loudness: -14 LUFS (matches YouTube/Instagram/TikTok)
- True peak: -1 dB
```bash
ffmpeg -i clip.mp4 -af "loudnorm=I=-14:TP=-1:LRA=11" clip_normalized.mp4
```

### Step 6: Caption Generation

Generate caption timing from word-level timestamps:
- Format: SRT or VTT
- Style guidance from `orchestrator/brand.md` (font, color, position)
- Kinetic typography timing: each word/phrase appears synced to speech

```bash
# Burn captions into video (if no NLE polish step)
ffmpeg -i clip.mp4 -vf "subtitles=captions.srt:force_style='FontName=Arial,FontSize=24,PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,Outline=2,Alignment=2'" clip_captioned.mp4
```

Or generate caption data for the user's editing tool (CapCut, Premiere, etc.).

### Step 7: Output

For each clip, deliver:
- Vertical video file (1080x1920, MP4)
- Caption file (SRT/VTT)
- Suggested caption text for the post
- Suggested hashtags (based on content)

### Platform-Specific Specs

| Platform | Max Duration | Aspect | Resolution | Notes |
|----------|-------------|--------|------------|-------|
| Instagram Reels | 90s | 9:16 | 1080x1920 | Cover photo matters |
| TikTok | 10 min | 9:16 | 1080x1920 | 60s sweet spot |
| YouTube Shorts | 60s | 9:16 | 1080x1920 | Must be ≤60s |

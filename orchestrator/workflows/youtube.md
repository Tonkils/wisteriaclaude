---
name: YouTube Long-Form Editing Workflow
description: State machine for YouTube video editing — structure analysis, retention optimization, FCPXML export
created: 2026-04-18
updated: 2026-04-18
session_user: jaret
author: claude
---

## State Machine

```
[START]
  │
  ▼
[INGEST] ─── Validate file, get duration/resolution/fps via ffprobe
  │           Determine content type → select editing style
  │           Confirm style with user
  ▼
[EXTRACT AUDIO] ─── ffmpeg extract to WAV (16kHz mono for transcription)
  │
  ▼
[TRANSCRIBE] ─── AssemblyAI preferred (preserves disfluencies = cut points)
  │               Fallback: Whisper local
  │               Save to orchestrator/workspace/transcripts/
  ▼
[STRUCTURAL ANALYSIS] ─── Identify natural structure:
  │                        - Where does the content naturally break into sections?
  │                        - What's the strongest moment? (→ hook)
  │                        - Where does energy dip? (→ pattern interrupt needed)
  │                        - What's the payoff/climax?
  │                        Generate 4-8 chapter boundaries
  ▼
[EDITORIAL ANALYSIS] ─── Load skills.md heuristics
  │                       Apply editing style rules:
  │                       - Retention: cuts every 3-8s, SFX markers, zoom markers
  │                       - Cinematic: motivated cuts, slow-mo markers, transitions
  │                       - Explainer: graphic markers, screen recording markers
  │                       - Vlog: jump cuts, music-driven markers
  │                       Generate Edit Decision List (EDL)
  ▼
[RETENTION AUDIT] ─── Predict retention curve:
  │                    - Hook strength (first 5-15 seconds)
  │                    - Energy dips (potential drop-off points)
  │                    - Pattern interrupt density (every 30-60s?)
  │                    - Payoff timing (too late = viewers leave)
  │                    Flag issues and suggest fixes
  ▼
[USER REVIEW] ─── Present:
  │                1. Proposed video structure with chapters
  │                2. Edit Decision List
  │                3. Retention audit with flagged issues
  │                4. Thumbnail-worthy frame timestamps
  │                User approves / overrides / adjusts
  │                Record corrections → feedback/ → skills.md
  ▼
[GENERATE FCPXML] ─── Branch B output:
  │                    - Clips placed on timeline per approved EDL
  │                    - Chapter markers at boundaries
  │                    - Audio baseline: -16 LUFS dialogue
  │                    - Markers where B-roll/graphics needed
  │                    - Notes explaining each marker
  │                    Validate XML structure
  ▼
[SUPPLEMENTARY OUTPUTS]
  │   ├── Chapter list (YouTube format with timestamps)
  │   ├── Description draft with key points
  │   ├── Thumbnail candidate timestamps
  │   ├── Social clip candidates (→ /edit-shortform)
  │   └── Audio processing notes for NLE editor
  ▼
[DELIVER] ─── Output FCPXML + supplementary files
              User imports into NLE (Premiere, Resolve, FCP)
              All edits non-destructive — human polishes
              Log decisions, update skills.md if needed
```

## Editing Style Parameters

### Retention Editing
```
cut_pace: 3-8 seconds per shot
zoom_frequency: every emphasis word/number
sfx_density: on every visual change
pattern_interrupt_interval: 30-60 seconds
hook_window: first 5 seconds (must create question or promise)
max_shot_hold: 5-8 seconds (absolute maximum before visual change)
energy_target: escalating throughout
b_roll_usage: constant (cover every non-essential talking head moment)
```

### Cinematic Editing
```
cut_pace: 5-15 seconds per shot
zoom_frequency: motivated only (reveal, emphasis)
sfx_density: minimal (ambient, subtle)
pattern_interrupt_interval: 60-120 seconds
hook_window: first 10-15 seconds (visual + narrative)
max_shot_hold: 15-20 seconds (let visuals breathe)
energy_target: controlled, building
b_roll_usage: purposeful (establishes, reveals, demonstrates)
```

### Explainer Editing
```
cut_pace: 5-10 seconds per shot
zoom_frequency: for emphasis on key data/concepts
sfx_density: transition sounds, UI sounds for graphics
pattern_interrupt_interval: 45-90 seconds
hook_window: first 10 seconds (pose the question)
max_shot_hold: 10-15 seconds
energy_target: steady, clear
b_roll_usage: graphics-heavy (diagrams, maps, data viz, screen recordings)
```

### Vlog Editing
```
cut_pace: 2-5 seconds per shot
zoom_frequency: jump cuts on talking head
sfx_density: moderate (music-driven)
pattern_interrupt_interval: 30-45 seconds
hook_window: first 3-5 seconds (action or statement)
max_shot_hold: 5-8 seconds
energy_target: dynamic, music-driven
b_roll_usage: lifestyle moments, travel, establishing shots
```

## Retention Curve Prediction

Map the proposed edit to a predicted retention curve:

```
100% ┤ ████
     │ █████
 75% ┤ ██████████
     │ ███████████████
 50% ┤ ████████████████████
     │ ██████████████████████████
 25% ┤ ██████████████████████████████████
     │ ████████████████████████████████████████
  0% ┤─────────────────────────────────────────
     0%        25%        50%        75%      100%
                    Video Duration
```

Flag any predicted sharp drops and suggest interventions:
- Add pattern interrupt before the drop
- Move stronger content earlier
- Cut the weak section entirely
- Add B-roll or visual change to maintain interest

## Error Handling

| Error | Recovery |
|-------|----------|
| Video > 2 hours | Split into manageable chunks for transcript analysis |
| No clear structure | Suggest restructuring, present options to user |
| FCPXML validation fails | Check XML structure, verify frame rate/resolution |
| NLE can't import FCPXML | Generate alternative format (Premiere XML, EDL file) |
| Content doesn't match any style | Ask user to describe desired style, create custom params |

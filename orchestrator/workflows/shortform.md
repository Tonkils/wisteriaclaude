---
name: Short-Form Editing Workflow
description: State machine for short-form content — Reels, TikTok, Shorts from clip extraction to final vertical output
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
[SOURCE TYPE?]
  │
  ├─── Clip from long-form ──▶ [TRANSCRIBE SOURCE]
  │                               │
  │                               ▼
  │                            [CLIP SELECTION] ─── Analyze transcript for clip-worthy moments
  │                               │                 Rate hook strength per candidate
  │                               │                 Target: 3-10 clips per hour of source
  │                               ▼
  │                            [USER PICKS CLIPS] ─── Present candidates, user selects
  │                               │
  │                               ▼
  │                            [EXTRACT CLIPS] ─── FFmpeg extract each segment
  │
  ├─── Original short-form ──▶ [TRANSCRIBE CLIP]
  │                               │
  │                               ▼
  │                            [EDIT FOOTAGE]
  │
  └─── Generated content ───▶ [ROUTE TO /render] ─── Branch A (Remotion)
                                  │
                                  ▼
                               [EXIT — handled by render pipeline]

[AFTER EXTRACTION OR EDIT]
  │
  ▼
[REFRAME] ─── Crop/scale to 9:16 (1080x1920)
  │            Center on speaker face if talking head
  │            Respect safe zones (top 14%, bottom 20%)
  ▼
[PACING] ─── Cut every 2-3 seconds
  │           Remove ALL dead air and filler
  │           Add zoom punches on emphasis words (10-20% scale)
  │           Speed ramp through boring transitions
  ▼
[CAPTIONS] ─── Generate SRT/VTT from word timestamps
  │             Apply brand font/color from brand.md
  │             Kinetic typography: word-by-word sync
  │             Position in safe zone (center of middle 66%)
  ▼
[AUDIO] ─── Loudness normalize to -14 LUFS
  │          True peak: -1 dB
  │          Test on phone speakers (most viewers have no headphones)
  ▼
[HOOK CHECK] ─── Verify first 1-3 seconds grab attention
  │               If weak hook: suggest reordering (payoff before setup)
  │               If no clear hook: flag for user review
  ▼
[EXPORT] ─── Per platform specs:
  │           Instagram Reels: ≤90s, 9:16, 1080x1920, MP4
  │           TikTok: ≤10min (60s sweet spot), 9:16, 1080x1920, MP4
  │           YouTube Shorts: ≤60s, 9:16, 1080x1920, MP4
  ▼
[DELIVER] ─── Output files + caption files + suggested post text
              Log decisions to session log
              Update skills.md if corrections received
```

## Clip Selection Scoring

When selecting clips from long-form, score each candidate:

| Factor | Weight | Criteria |
|--------|--------|----------|
| Hook strength | 30% | Does the first moment grab? Question, bold claim, emotion? |
| Self-contained | 25% | Makes sense without outside context? |
| Engagement potential | 20% | Would you comment, share, or save this? |
| Visual interest | 15% | Is there something to look at beyond a talking head? |
| Duration fit | 10% | Naturally fits 30-90 second sweet spot? |

Score each 1-5 per factor, multiply by weight. Present top candidates sorted by score.

## Error Handling

| Error | Recovery |
|-------|----------|
| Source is vertical already | Skip reframe, proceed to pacing |
| No clear hook in clip | Suggest alternative clip or reorder content |
| Clip too long (>90s for Reels) | Suggest splitting or tightening cuts |
| Clip too short (<15s) | Suggest combining with adjacent moment |
| Caption timing drift | Re-sync from word-level timestamps |

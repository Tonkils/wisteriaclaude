---
name: Podcast Editing Workflow
description: Detailed state machine for the podcast editing pipeline — from raw audio to final output and clips
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
[INGEST] ─── Validate input file exists, get duration, format info (ffprobe)
  │
  ▼
[EXTRACT AUDIO] ─── If video: ffmpeg extract audio to WAV (16kHz mono for transcription)
  │                  If audio: convert to WAV if needed
  ▼
[TRANSCRIBE] ─── Route to best available transcription method:
  │               1. AssemblyAI (preferred for editing — preserves disfluencies)
  │               2. Deepgram (preferred for timestamp sync)
  │               3. Local Whisper (fallback — no API key needed)
  │               Save JSON + markdown transcript to orchestrator/workspace/transcripts/
  ▼
[EDITORIAL ANALYSIS] ─── Load orchestrator/skills.md heuristics
  │                       Analyze transcript for:
  │                       - Dead air, filler words, false starts
  │                       - Hook-worthy moments, clip candidates
  │                       - Chapter boundaries, segment structure
  │                       Generate Edit Decision List (EDL)
  ▼
[USER REVIEW] ─── Present EDL to user
  │               User approves, overrides, or adjusts
  │               Record corrections → orchestrator/feedback/
  │               Update skills.md if heuristics change
  ▼
[BRANCH DECISION]
  │
  ├─── Audio-only podcast ──▶ [AUDIO PROCESSING]
  │                              │
  │                              ▼
  │                           [DIRECT EDIT] ─── FFmpeg segment extraction + concatenation
  │                              │               OR generate DAW-compatible cut list
  │                              ▼
  │                           [LOUDNESS] ─── Normalize to target LUFS
  │                              │
  │                              ▼
  │                           [EXPORT AUDIO] ─── MP3/AAC/WAV per platform
  │
  └─── Video podcast ──▶ [FCPXML GENERATION]
                            │
                            ▼
                         [MULTI-CAM] ─── If multiple angles: assign camera switches
                            │            Default: switch on speaker change, wide as safe
                            ▼
                         [CHAPTERS] ─── Add chapter markers from editorial analysis
                            │
                            ▼
                         [EXPORT XML] ─── Generate FCPXML for NLE import
                                          Edits are non-destructive
                                          Human polishes in NLE

[CLIP CREATION] ─── Optional, triggered by user request or strong clip candidates
  │                 For each clip:
  │                 1. Extract segment (FFmpeg)
  │                 2. Reframe to 9:16 if needed
  │                 3. Generate caption timing from transcript timestamps
  │                 4. Apply platform specs from shortform-editing.md
  ▼
[COMPLETE] ─── Report output files
               Log session decisions
               Update skills.md if needed
```

## Error Handling

| Error | Recovery |
|-------|----------|
| File not found | Ask user to verify path |
| FFmpeg not installed | Direct to `/status` for installation instructions |
| Whisper not installed + no API keys | Suggest `pip install openai-whisper` |
| Transcription fails | Try next method in priority order |
| Audio too long for API (> 4 hours) | Split into chunks, transcribe separately, merge |
| FCPXML import fails in NLE | Validate XML structure, check version compatibility |

## Checkpointing

The workflow saves intermediate outputs so it can resume if interrupted:
- `orchestrator/workspace/transcripts/` — saved after transcription
- `orchestrator/workspace/edl/` — saved after editorial analysis
- `orchestrator/workspace/output/` — final output files

If a session is interrupted, the next session can check for existing workspace files and resume from the last completed step.

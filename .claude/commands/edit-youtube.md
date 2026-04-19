---
description: Edit a YouTube long-form video — retention editing, structure, B-roll, chapters
argument-hint: <path-to-video or description of content>
---

YouTube long-form editing pipeline. Optimizes for Average View Duration (AVD) and retention.

## Pipeline

### Step 1: Ingest and Analyze

Verify the input file and get metadata:
```bash
ffprobe -v quiet -print_format json -show_format -show_streams input.mp4
```

Determine content type to select editing style:
- **Entertainment/challenge** → Retention editing (MrBeast school)
- **Tech review/product** → Cinematic editing (MKBHD school)
- **Educational/explainer** → Explainer editing (Johnny Harris school)
- **Vlog/personal** → Vlog editing (Casey Neistat school)
- **Interview/conversation** → Podcast-style with YouTube pacing

Confirm style with user before proceeding.

### Step 2: Audio-First (Transcription)

Extract and transcribe:
```bash
ffmpeg -i input.mp4 -vn -acodec pcm_s16le -ar 16000 -ac 1 audio.wav
```

Transcribe with word-level timestamps. For YouTube, preserve disfluencies (AssemblyAI preferred) — they're cut points.

### Step 3: Editorial Analysis

Read `orchestrator/skills.md` and `memory/references/video-editing/youtube-editing.md`.

**Structure Analysis:**
- Identify the natural structure: setup → main content → climax → conclusion
- Find the strongest hook moment (goes in first 5-15 seconds)
- Identify 4-8 chapter boundaries
- Flag where pattern interrupts are needed (every 30-60 seconds)

**Generate Edit Decision List:**

```markdown
## Video Structure
- [00:00:00 - 00:00:05] HOOK — Teaser of [strongest moment] from [timestamp]
- [00:00:05 - 00:00:30] CONTEXT — Setup: why this matters
- [00:00:30 - 00:03:00] CHAPTER 1: [topic] — Main content begins
  - [00:01:15] PATTERN INTERRUPT — B-roll / graphic / zoom needed here
  - [00:02:30] PATTERN INTERRUPT — Change angle or energy
- [00:03:00 - 00:06:00] CHAPTER 2: [topic]
  ...
- [00:XX:XX] CLIMAX — The payoff
- [00:XX:XX] CTA — Subscribe, comment question, next video tease
- [00:XX:XX] END SCREEN — Last 20 seconds for end screen elements

## Cuts
| Timestamp | Action | Reason |
|-----------|--------|--------|
| ... | CUT / KEEP / MOVE / B-ROLL | ... |

## Retention Notes
- Potential drop-off points: [timestamps where energy dips]
- Suggested pattern interrupts: [what to insert where]
- Thumbnail-worthy frames: [timestamps of visually strong moments]
```

### Step 4: User Review

Present the structural analysis and EDL. The user may:
- Approve the structure
- Rearrange sections
- Override cut decisions
- Specify B-roll they have available
- Choose different chapter titles

Record corrections → `orchestrator/feedback/` → update `orchestrator/skills.md`.

### Step 5: Output Generation (Branch B — FCPXML)

YouTube editing almost always goes through Branch B (FCPXML for NLE import).

Generate FCPXML containing:
- All clips placed on timeline with in/out points per the approved EDL
- Chapter markers at identified boundaries
- Audio levels set (-16 LUFS dialogue baseline)
- Placeholder markers where B-roll/graphics are needed
- Notes on each marker explaining what goes there

```xml
<!-- Example FCPXML structure (simplified) -->
<fcpxml version="1.11">
  <resources>
    <format id="r1" frameDuration="1001/30000s" width="1920" height="1080"/>
    <asset id="r2" src="file:///path/to/source.mp4" hasVideo="1" hasAudio="1"/>
  </resources>
  <library>
    <event name="YouTube Edit">
      <project name="[Video Title]">
        <sequence format="r1">
          <spine>
            <!-- Clips placed here per EDL -->
          </spine>
        </sequence>
      </project>
    </event>
  </library>
</fcpxml>
```

### Step 6: Supplementary Outputs

Beyond the main edit, generate:
- **Chapter list** in YouTube format:
  ```
  0:00 Introduction
  0:30 [Chapter 1 Title]
  3:00 [Chapter 2 Title]
  ...
  ```
- **Description draft** with key points and timestamps
- **Thumbnail candidates** — timestamps of visually strong frames
- **Social media clips** — flag 3-5 clip-worthy moments for `/edit-shortform`

### Step 7: Audio Processing Notes

For the NLE editor (human) to apply:
- Dialogue: -16 LUFS target
- Music: -20 to -30 dB below dialogue, duck on speech
- SFX: match energy of visual cuts
- Loudness normalize final export to -14 LUFS (YouTube target)

### Editing Style Quick Reference

| Style | Cut Pace | Zooms | SFX | B-Roll | Music |
|-------|----------|-------|-----|--------|-------|
| Retention | 3-8s per shot | Every emphasis | Every change | Constant | Always, shifts with energy |
| Cinematic | 5-15s per shot | Motivated only | Minimal | Purposeful | Atmospheric |
| Explainer | 5-10s per shot | For emphasis | Transitions | Graphics-heavy | Subtle background |
| Vlog | 2-5s per shot | Jump cuts | Moderate | Lifestyle | Music-driven |

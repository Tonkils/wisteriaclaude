---
description: Edit a podcast episode — audio-first pipeline with transcription, editorial analysis, and optional clip creation
argument-hint: <path-to-podcast-audio-or-video>
---

Full podcast editing pipeline. Follows the Audio-First principle from the orchestrator.

## Pipeline

### Step 1: Audio Extraction + Transcription

If the input is video, extract the audio track first:
```
ffmpeg -i input.mp4 -vn -acodec pcm_s16le -ar 16000 -ac 1 podcast_audio.wav
```

Transcribe using the best available method:
- **Preferred for editing:** AssemblyAI with `disfluencies: true` (preserves ums, ahs, stutters — these are your cut points)
- **Fallback:** Local Whisper with `--word_timestamps True`
- See `/transcribe` for detailed instructions

Save transcript to `orchestrator/workspace/transcripts/`.

### Step 2: Editorial Analysis

Read `orchestrator/skills.md` for current editorial heuristics. Then analyze the transcript:

**Identify and flag:**
- Dead air (pauses > threshold from skills.md, typically > 2 seconds)
- Filler words: um, uh, er, ah, "you know", "like", "so", "right" (contextual — remove filler, keep meaningful)
- False starts and restarts
- Tangents that don't serve the main topic
- Rambling or redundant Q&A
- Technical issues (audio drops, background noise spikes)

**Identify and highlight:**
- Hook-worthy moments (emotional peaks, surprising statements, laughter, strong opinions)
- Natural segment boundaries / chapter break points
- The strongest opening moment (may not be the chronological start)
- Clip-worthy segments for social media (30-90 second standalone moments)

**Generate an Edit Decision List (EDL):**
```markdown
| Timestamp | Action | Reason |
|-----------|--------|--------|
| 00:00:00 - 00:00:15 | CUT | Small talk, not relevant |
| 00:00:15 - 00:03:42 | KEEP | Strong opening, sets up topic |
| 00:03:42 - 00:03:48 | CUT | Dead air (6 seconds) |
| 00:03:48 - 00:04:02 | CUT | Filler words, false start |
| 00:04:02 - 00:12:30 | KEEP | Core discussion |
| 00:08:15 - 00:09:00 | CLIP | Hook-worthy: strong emotional moment |
| ... | ... | ... |
```

### Step 3: Present to User for Review

Show the EDL and ask for approval. The user may:
- Approve all cuts
- Override specific decisions ("keep that section, it's important")
- Ask for more aggressive or conservative editing
- Request specific clips

**Record any corrections to `orchestrator/feedback/` and update `orchestrator/skills.md`.**

### Step 4: Audio Processing

Read `memory/references/video-editing/audio-engineering.md` for the signal chain.

Execute via FFmpeg:
```bash
# High-pass filter + compression + loudness normalization
ffmpeg -i podcast_audio.wav \
  -af "highpass=f=70,compand=attacks=0.01:decays=0.3:points=-80/-80|-45/-25|-27/-15|0/-10:gain=5,loudnorm=I=-16:TP=-1:LRA=11" \
  -ar 44100 podcast_processed.wav
```

Ask user for target platform to set loudness:
- Podcast (general): -16 LUFS
- Spotify: -14 LUFS
- YouTube: -14 LUFS

### Step 5: Output Generation

Based on the dual-path routing:

**If video podcast → Branch B (FCPXML):**
- Generate FCPXML with cut decisions applied
- Include multi-cam switching points (if multiple angles)
- Add chapter markers
- User imports into NLE for final polish

**If audio-only podcast:**
- Generate a cut list for the user's DAW
- Or execute FFmpeg commands to produce the edited audio directly:
  ```bash
  # Example: extract segments and concatenate
  ffmpeg -i podcast.wav -ss 00:00:15 -to 00:03:42 segment1.wav
  ffmpeg -i podcast.wav -ss 00:04:02 -to 00:12:30 segment2.wav
  # Concatenate
  ffmpeg -f concat -safe 0 -i segments.txt -c copy podcast_edited.wav
  ```

### Step 6: Clip Creation (Optional)

If the user wants social media clips, for each clip-worthy moment:
1. Define in/out points from the EDL
2. Extract with FFmpeg
3. If video: reframe to 9:16 (1080x1920) for Reels/TikTok/Shorts
4. Generate caption text from transcript timestamps
5. Refer to `memory/references/video-editing/shortform-editing.md` for platform specs

### Step 7: Session Close

- Log all decisions and corrections to session log
- Update `orchestrator/skills.md` if any heuristics were refined
- Report final output file paths to user

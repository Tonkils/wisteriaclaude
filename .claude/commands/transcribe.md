---
description: Transcribe audio or video with word-level timestamps
argument-hint: <path-to-audio-or-video>
---

Transcribe the provided audio or video file with word-level timestamps.

## Steps

1. **Verify the file exists** at the provided path. If it's a video file, extract audio first:
   ```
   ffmpeg -i input.mp4 -vn -acodec pcm_s16le -ar 16000 -ac 1 output.wav
   ```

2. **Choose transcription method** (ask user if unclear):

   **Option A — Local Whisper (no API key needed):**
   ```
   whisper audio.wav --model medium --language en --output_format json --word_timestamps True
   ```
   - Best for: privacy, no cost, offline use
   - Requires: `pip install openai-whisper`
   - Output: JSON with word-level timestamps

   **Option B — AssemblyAI API (preserves disfluencies):**
   ```
   curl -X POST https://api.assemblyai.com/v2/transcript \
     -H "authorization: $ASSEMBLYAI_API_KEY" \
     -H "content-type: application/json" \
     -d '{"audio_url": "...", "disfluencies": true}'
   ```
   - Best for: speech editing (keeps ums, ahs, stutters for cut point identification)
   - Requires: ASSEMBLYAI_API_KEY environment variable

   **Option C — Deepgram API (millisecond word timestamps):**
   ```
   curl -X POST https://api.deepgram.com/v1/listen?punctuate=true&utterances=true&words=true \
     -H "Authorization: Token $DEEPGRAM_API_KEY" \
     -H "Content-Type: audio/wav" \
     --data-binary @audio.wav
   ```
   - Best for: programmatic animation sync (Remotion), precise timestamp alignment
   - Requires: DEEPGRAM_API_KEY environment variable

3. **Process the output:**
   - Save raw JSON to `orchestrator/workspace/transcripts/` (create if needed)
   - Generate a clean markdown transcript with timestamps:
     ```
     [00:00:05] Speaker: First sentence of the transcript.
     [00:00:12] Speaker: Second sentence continues here.
     ```
   - Save markdown transcript alongside the JSON

4. **Report to user:**
   - Total duration
   - Word count
   - Number of detected speakers (if multi-speaker)
   - Any quality issues noticed (background noise, overlapping speech)
   - Path to saved transcript files

## Audio-First Principle

This transcription is typically the FIRST step in any editing workflow. The transcript drives all editorial decisions — cut points, pacing, clip selection — before any visual editing happens.

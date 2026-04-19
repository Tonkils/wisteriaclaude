---
description: Render motion graphics, animated captions, or title cards using Remotion (Branch A)
argument-hint: <description of what to render, or path to .tsx component>
---

Branch A — Programmatic Rendering via Remotion. For generating content from scratch: motion graphics, animated captions, title cards, explainer visuals.

## Prerequisites

Check that Remotion is installed:
```bash
npx remotion --version 2>/dev/null || echo "Remotion not installed — run: npm init remotion@latest"
```

If not installed, guide the user through setup:
```bash
npm init remotion@latest
# or within existing project:
npm install remotion @remotion/cli @remotion/bundler
```

## Pipeline

### Step 1: Determine Render Type

| Request | Component Type | Key APIs |
|---------|---------------|----------|
| Animated captions / subtitles | Caption overlay synced to audio | `useCurrentFrame()`, `interpolate()`, word timestamps |
| Title card / intro | Text animation with brand colors | `spring()`, `Sequence`, brand.md colors |
| Lower third | Name/title overlay | `interpolate()`, `Sequence` with delay |
| Data visualization | Animated chart/graph | `useCurrentFrame()`, `interpolate()` for values |
| Full explainer video | Multi-scene composition | `Composition`, multiple `Sequence` blocks |
| Progress bar / timer | Overlay element | `useCurrentFrame()`, `useVideoConfig()` |

### Step 2: Load Context

- Read `orchestrator/brand.md` for colors, fonts, logo path, style
- If audio timestamps are available (from `/transcribe`), load the JSON timing data
- Read `memory/references/video-editing/shortform-editing.md` or `youtube-editing.md` for platform specs

### Step 3: Write the Component

Create a `.tsx` file using Remotion's APIs. Example structure:

```tsx
import { useCurrentFrame, useVideoConfig, interpolate, spring, Sequence } from "remotion";

export const MyComponent: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  
  // Animation logic using frame number
  const opacity = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: "clamp" });
  
  return (
    <div style={{ opacity }}>
      {/* Content here */}
    </div>
  );
};
```

**Key Remotion patterns:**
- `useCurrentFrame()` — returns current frame number, drives all animation
- `interpolate(frame, inputRange, outputRange)` — maps frame to any value
- `spring({ frame, fps, config })` — natural spring animation
- `<Sequence from={30} durationInFrames={60}>` — delays and durations
- `<Audio src={audioSrc} />` — sync audio
- `<AbsoluteFill>` — full-frame container

### Step 4: Audio Sync (if applicable)

When syncing visuals to audio (captions, word-by-word reveals):

1. Load word-level timestamps from transcription JSON
2. Convert millisecond timestamps to frame numbers: `frame = (ms / 1000) * fps`
3. Use `interpolate()` to trigger visual changes at exact word boundaries
4. Verify sync by rendering preview frames at known word timestamps

### Step 5: Preview and Iterate

```bash
# Start dev server for live preview
npx remotion studio

# Render a single frame to verify
npx remotion still MyComposition --frame=30 --output=preview.png

# Render full video
npx remotion render MyComposition --output=output.mp4
```

The agent should:
1. Write the component
2. Render a preview frame
3. Show the preview to the user (if possible) or describe what it looks like
4. Iterate based on feedback
5. Render the full video once approved

### Step 6: Final Render

```bash
# Standard render
npx remotion render MyComposition --output=output.mp4 --codec=h264

# High quality
npx remotion render MyComposition --output=output.mp4 --codec=h264 --crf=18

# With specific dimensions
npx remotion render MyComposition --output=output.mp4 --width=1080 --height=1920
```

### Step 7: Cloud Render (Future — Phase 4)

When Shotstack MCP is configured:
- Submit the composition to Shotstack API via MCP
- Track render progress
- Download completed render
- This bypasses local compute limitations

## Common Recipes

### Kinetic Caption Overlay
- Input: audio file + word-level timestamps JSON
- Output: video with animated word-by-word captions
- Sync: each word appears at its timestamp, highlight/scale on emphasis

### Branded Intro
- Input: brand.md config (colors, fonts, logo)
- Output: 5-10 second animated intro
- Style: logo reveal, text animation, brand colors

### Lower Third
- Input: speaker name, title, brand colors
- Output: animated name overlay (3-5 seconds)
- Style: slide in, hold, slide out

### Chapter Title Card
- Input: chapter title text, brand colors
- Output: 2-3 second title card for between sections
- Style: fade in text, hold, fade out

## Notes

- Remotion renders are deterministic — same code = same output every time
- All rendering is headless (no GUI needed)
- Components are React — full CSS, SVG, canvas capabilities
- The agent writes the code, so any visual effect expressible in code is possible
- Keep components simple and focused — one visual effect per component

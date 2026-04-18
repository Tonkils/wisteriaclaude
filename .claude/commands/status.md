---
description: Check video editing tool availability and project state
---

Check the current environment for video editing readiness.

## Tool Availability Check

Run these commands and report results:

```
which ffmpeg || echo "NOT INSTALLED"
which ffprobe || echo "NOT INSTALLED"
which node || echo "NOT INSTALLED"
which npx || echo "NOT INSTALLED"
which whisper || echo "NOT INSTALLED"
which auto-editor || echo "NOT INSTALLED"
which yt-dlp || echo "NOT INSTALLED"
node --version 2>/dev/null
npm --version 2>/dev/null
ffmpeg -version 2>/dev/null | head -1
```

## Project State

1. Check if `orchestrator/skills.md` exists and report the last updated date
2. Check if `orchestrator/brand.md` has been configured (or is still template)
3. List any files in `orchestrator/feedback/` (correction history)
4. Check git status for uncommitted changes

## Report Format

Present results as a clear status table:

| Tool | Status | Version |
|------|--------|---------|
| FFmpeg | ✓ / ✗ | version |
| Node.js | ✓ / ✗ | version |
| Whisper | ✓ / ✗ | version |
| etc. | | |

Then note any missing tools with installation instructions:
- FFmpeg: `winget install ffmpeg` or download from ffmpeg.org
- Node.js: `winget install OpenJS.NodeJS.LTS`
- Whisper: `pip install openai-whisper`
- yt-dlp: `pip install yt-dlp`
- auto-editor: `pip install auto-editor`

---
name: Video Editing Knowledge Base
description: Shared reference library for expert-level editing guidance across podcast, short-form, and YouTube
type: project
created: 2026-04-18
updated: 2026-04-18
session_user: jaret
author: claude
---

## Goal

A shared video editing reference library stored in this repo so that any Claude session — regardless of who's working — can provide expert-level editing guidance and eventually assist with real editing workflows.

## Domains Covered

1. Podcast editing (audio + video podcasts, clip creation)
2. Instagram / short-form (Reels, TikTok, Shorts)
3. YouTube long-form (retention editing, cinematic, explainer)

## Reference Files

All stored in `memory/references/video-editing/`:
- `overview.md` — Entry point and decision tree
- `podcast-editing.md` — Podcast-specific workflow and specs
- `shortform-editing.md` — Short-form techniques and specs
- `youtube-editing.md` — YouTube editing styles and workflow
- `tools-and-software.md` — Cross-domain tool reference
- `audio-engineering.md` — Audio processing deep-dive
- `tutorials-and-courses.md` — Curated learning resources
- `creators-and-benchmarks.md` — Gold standard creators to study

## Status

- [x] Initial research completed across all three domains
- [x] Reference files created and populated
- [ ] Real-world application: use knowledge to guide an actual edit
- [ ] Feedback loop: update files based on actual editing experience
- [ ] Determine primary NLE (DaVinci Resolve, Premiere, etc.) and add tool-specific workflows
- [ ] Add automation recipes (FFmpeg, scripting, batch processing)

## Growth Protocol

When editing work happens in a session, Claude should:
1. Load the relevant reference file(s)
2. Provide specific guidance based on the reference
3. After the session, update the reference file with anything new learned
4. Record what worked and what didn't here in this project file

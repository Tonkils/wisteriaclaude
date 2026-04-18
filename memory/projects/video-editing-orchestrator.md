---
name: Video Editing Orchestrator Agent System
description: Agent orchestration system for automated video editing — slash commands, dual-path routing, editorial heuristics, feedback loop
type: project
created: 2026-04-18
updated: 2026-04-18
session_user: jaret
author: claude
---

## Goal

Build an orchestrator agent system inside the wisteriaclaude repo that activates when video editing work starts, routes to specialized sub-workflows, and improves through a feedback loop. Based on the "Hybrid Programmatic Architecture" from Jaret's Google Doc analysis of 10 agentic video editing implementations.

## Source Document

Google Doc: "Architecting Autonomous Media: A Strategic Evaluation of Agentic Video Editing Workflows Using Large Language Models"
- URL: https://docs.google.com/document/d/1zalOyVb2itL4QDfnO9XvBkSYLyQQSkVtoMsiBHdgYxc/edit
- Key conclusion: code-based rendering (Remotion/React) for motion graphics + XML export (FCPXML) for live-action footage. GUI automation is fundamentally flawed.

## Architecture (3 Layers)

1. **CLAUDE.md orchestrator section** — routing brain (intent recognition → workflow selection → dual-path routing)
2. **`.claude/commands/`** — user-facing slash commands (`/edit`, `/edit-podcast`, `/transcribe`, `/status`, etc.)
3. **`orchestrator/`** — persistent state: editorial heuristics (`skills.md`), brand config (`brand.md`), feedback logs

## Core Design Decisions

### Dual-Path Routing
- **Branch A (Remotion)**: Generated content — motion graphics, animated captions, title cards. Agent writes .tsx, renders headlessly.
- **Branch B (FCPXML)**: Live-action footage editing. Agent makes editorial decisions from transcript, exports non-destructive XML for NLE import.

### Audio-First Enforcement
Every workflow: extract audio → transcribe (word-level timestamps) → analyze against skills.md → make cut decisions → then visuals.

### Model Tier Optimization
- **Opus** for editorial judgment (subjective, highest-value)
- **Sonnet** for everything else (FFmpeg, XML, code generation)

### Feedback Loop
User corrections → `orchestrator/feedback/` → update `orchestrator/skills.md` → next session reads updated heuristics.

## File Structure

```
wisteriaclaude/
  CLAUDE.md                              # MODIFY: add orchestrator routing section
  MEMORY.md                              # MODIFY: add orchestrator entries
  .claude/
    settings.json                        # project-level permissions + future MCP
    commands/
      edit.md                            # main entry — routes to sub-workflow
      edit-podcast.md                    # podcast editing pipeline
      edit-shortform.md                  # short-form (Reels/TikTok/Shorts) [Phase 2]
      edit-youtube.md                    # YouTube long-form [Phase 2]
      transcribe.md                      # standalone transcription
      render.md                          # Remotion render workflow [Phase 3]
      status.md                          # check tool availability + project state
  orchestrator/
    skills.md                            # editorial heuristics (evolves via feedback)
    brand.md                             # brand identity config (colors, fonts, tone)
    workflows/
      podcast.md                         # detailed podcast state machine
      shortform.md                       # detailed short-form state machine [Phase 2]
      youtube.md                         # detailed YouTube state machine [Phase 2]
    feedback/
      .gitkeep                           # correction logs accumulate here
```

## Implementation Phases

### Phase 1: Foundation + Orchestrator ← CURRENT
1. [x] Create `.claude/commands/` directory
2. [x] Create `orchestrator/` directory structure
3. [x] Create `.claude/settings.json` with permissions
4. [x] Add orchestrator section to `CLAUDE.md`
5. [x] Write `.claude/commands/edit.md`
6. [x] Write `.claude/commands/status.md`
7. [x] Write `.claude/commands/transcribe.md`
8. [x] Write `.claude/commands/edit-podcast.md`
9. [x] Write `orchestrator/workflows/podcast.md`
10. [x] Write `orchestrator/skills.md`
11. [x] Write `orchestrator/brand.md`
12. [x] Update `MEMORY.md` with orchestrator entries
13. [ ] Commit and push

### Phase 2: Short-Form + YouTube + FCPXML
- Write edit-shortform.md, edit-youtube.md commands
- Write shortform.md, youtube.md workflows
- Test audio processing chain and FCPXML generation

### Phase 3: Remotion + Motion Graphics
- Install Remotion, write render.md command
- Test animated caption generation and headless rendering

### Phase 4: Cloud + API Integration
- Shotstack MCP server for cloud rendering
- AssemblyAI/Deepgram for transcription APIs

## Related Files
- Reference library: `memory/references/video-editing/` (8 files, already built)
- Project tracker for reference library: `memory/projects/video-editing-knowledge.md`

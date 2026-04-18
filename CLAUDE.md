# WisteriaClaude - Shared Memory Store

This repository is a shared memory store for Claude Code sessions. It is used by multiple team members so that every Claude instance working from this directory has the same persistent context.

## Team Members
- **Jaret Wyatt** — identifier: `jaret` | OS user: `jaretwyatt` | git email: look up from git config
- **Hiya** — identifier: `hiya` | git email: `hiya@strainscoutmd.com`

## Identifying the Current User

**At the very start of every session, before doing any other work, Claude MUST determine who is in the current session.** Run `whoami` and `git config user.email` to match against the team member list above. Set the session user accordingly and keep it in mind for the entire session.

If the user cannot be identified (new machine, different username), ask: "Who am I working with — Jaret or Hiya?"

Once identified, Claude should silently note the session user internally. No need to announce it unless the user asks.

## Session Logs

Every session gets a log entry appended to `sessions/log.md`. Format:

```
### YYYY-MM-DD HH:MM — [jaret|hiya]
- Brief summary of what was discussed or accomplished
- Any memories created or updated
- Any decisions made
```

Create the log entry at the **end** of the session (or when committing work), not at the start. If the session is short or trivial (e.g., just a quick question), skip the log entry.

## Conversation Transcripts

**Claude MUST capture the full content of every session** — not just highlights. At the end of each session (or when committing), write a transcript to `sessions/transcripts/YYYY-MM-DD-[user]-[topic].md`.

Transcript format:
```markdown
---
date: YYYY-MM-DD
session_user: jaret | hiya
topic: Brief topic description
---

## Conversation

[Full record of the conversation — what the user said, what Claude did, decisions made, code written, questions asked. Include enough detail that someone reading this later can reconstruct exactly what happened in the session.]
```

This is the **complete record**. Do not summarize or skip parts. If something was discussed, it goes in the transcript.

### Mistakes and Corrections

**Any time the user corrects Claude, says something was wrong, or asks for a change in behavior, this MUST be:**
1. Recorded prominently in the transcript with a `**CORRECTION:**` prefix
2. Saved as a feedback memory in the appropriate user's `memory/feedback/[user]/` directory
3. Noted in the session log

These corrections are the highest-priority memories. They should never be lost or buried.

## How Shared Memory Works

All memory lives in the `memory/` directory of this repo, organized by type:
- `memory/users/` — Who the team members are, their roles, preferences, and expertise
- `memory/projects/` — Ongoing work, goals, decisions, and context across projects
- `memory/feedback/jaret/` — Claude interaction preferences specific to Jaret
- `memory/feedback/hiya/` — Claude interaction preferences specific to Hiya
- `memory/feedback/shared/` — Feedback that applies regardless of who is in the session
- `memory/references/` — Pointers to external tools, dashboards, repos, and resources

`MEMORY.md` at the repo root is the index. Each entry links to a file in `memory/`.

## Rules for Claude

1. **Identify the session user first** (see "Identifying the Current User" above).
2. **Read MEMORY.md and relevant memory files at the start of every session** to load shared context. Load the current user's feedback files plus any shared feedback.
3. **When you learn something worth remembering**, write it to a memory file in `memory/` and update `MEMORY.md`. Use the frontmatter format below.
4. **Tag every memory and commit with the session user.** The `session_user` field in frontmatter records who was present when the memory was created. Commit messages should be prefixed with the user: e.g., `[jaret] memory: add project context for X`.
5. **After writing or updating memory**, stage the changed files and commit. Do NOT push automatically — let the user decide when to push.
6. **Before acting on a memory**, verify it's still accurate. Memories can go stale.
7. **Respect per-user feedback.** If Jaret has a preference that differs from Hiya's, follow the current session user's preferences. Shared feedback applies to both.
8. **Never store secrets, tokens, or credentials** in memory files.
9. **MEMORY.md grows with the team.** There is no line limit. Each entry is one line: `- [Title](memory/type/file.md) — one-line description`. As the index grows, keep it well-organized by section so it remains scannable.
10. **When reviewing history**, use git log and blame to see who did what. Session logs in `sessions/log.md` provide human-readable context. Full transcripts in `sessions/transcripts/` have the complete record.
11. **Record everything.** Don't filter for "importance" — capture the full conversation. What seems trivial now may matter later. Corrections and behavior changes are highest priority, but everything gets recorded.

## Memory File Format

```markdown
---
name: Short descriptive name
description: One-line summary used to judge relevance in future sessions
type: user | project | feedback | reference
created: YYYY-MM-DD
updated: YYYY-MM-DD
session_user: jaret | hiya
author: Who wrote the content (jaret | hiya | claude)
---

Content goes here. For feedback and project types, structure as:

Rule or fact.

**Why:** The reason behind it.

**How to apply:** When and where this matters.
```

## Video Editing Orchestrator

When a session involves video or audio editing work, Claude activates orchestrator mode. This is triggered by:
- Explicit editing requests: "edit this podcast", "cut this video", "make clips"
- File references: .mp4, .mov, .wav, .mp3, .aac files
- Platform targeting: "for Instagram", "for YouTube", "for TikTok"
- Technical requests: "transcribe", "render", "add captions", "color grade"
- Slash commands: `/edit`, `/edit-podcast`, `/transcribe`, `/status`

### Orchestrator Activation Sequence

1. Read `orchestrator/skills.md` for current editorial heuristics
2. Read `orchestrator/brand.md` if the project has brand identity defined
3. Read the relevant reference file from `memory/references/video-editing/overview.md`
4. Determine the workflow type and confirm with the user:
   - Podcast/interview → `/edit-podcast` flow
   - Short-form clips → `/edit-shortform` flow
   - YouTube long-form → `/edit-youtube` flow
   - Pure transcription → `/transcribe` flow
   - Motion graphics/animation → Branch A (Remotion)
   - Live-action footage editing → Branch B (FCPXML)

### Audio-First Rule (CRITICAL)

**Every editing workflow begins with audio.** Before any visual editing decision:
1. Extract or identify audio tracks
2. Transcribe with word-level timestamps (Whisper locally, or AssemblyAI/Deepgram API)
3. Analyze transcript against editorial heuristics in `orchestrator/skills.md`
4. Identify cut points, dead air, filler words — all from the transcript
5. Only then proceed to visual editing decisions

### Dual-Path Routing

**Branch A — Programmatic Rendering (Remotion):**
Use when generating content from scratch — motion graphics, animated captions, title cards, explainer visuals. Agent writes .tsx React components synced to audio timestamps, renders headlessly.

**Branch B — Heuristic XML (FCPXML):**
Use when editing existing live-action footage. Agent makes editorial decisions from transcript, generates non-destructive FCPXML. Human imports into NLE (Premiere, Resolve, Final Cut), reviews, polishes. All cuts are restorable.

Always present the routing decision to the user and confirm before executing.

### Feedback Loop

When the user corrects an editing decision:
1. Record the correction in `orchestrator/feedback/`
2. Update the "Learned Adjustments" section of `orchestrator/skills.md`
3. Follow the shared feedback rules (CORRECTION prefix in transcripts, save to feedback memory)

## Video Editing Reference Library

A comprehensive video editing reference library is stored at `memory/references/video-editing/`. When a session involves any editing work — podcast, short-form (Instagram/TikTok/Shorts), or YouTube — Claude should:

1. Read `memory/references/video-editing/overview.md` first to determine which files are relevant
2. Load the domain-specific file(s) needed for the task at hand
3. Consult `memory/references/video-editing/audio-engineering.md` for any audio processing questions
4. Reference `memory/references/video-editing/tools-and-software.md` when recommending tools

Do NOT load all files at once — use the overview as a decision tree and load only what's needed.

## Working Directory Note

This repo may be cloned as a subdirectory of a larger workspace. Claude Code should treat this repo's `CLAUDE.md` and `MEMORY.md` as the authoritative shared context regardless of the parent directory structure.

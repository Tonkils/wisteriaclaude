# WisteriaClaude - Shared Memory Store

This repository is a shared memory store for Claude Code sessions. It is used by multiple team members so that every Claude instance working from this directory has the same persistent context.

## Team Members
- **Jaret Wyatt** (jaretwyatt) - Co-owner
- **Hiya** (hiya@strainscoutmd.com) - Co-owner

## How Shared Memory Works

All memory lives in the `memory/` directory of this repo, organized by type:
- `memory/users/` - Who the team members are, their roles, preferences, and expertise
- `memory/projects/` - Ongoing work, goals, decisions, and context across projects
- `memory/feedback/` - How Claude should behave, lessons learned, interaction preferences
- `memory/references/` - Pointers to external tools, dashboards, repos, and resources

`MEMORY.md` at the repo root is the index. Each entry links to a file in `memory/`.

## Rules for Claude

1. **Read MEMORY.md and relevant memory files at the start of every session** to load shared context.
2. **When you learn something worth remembering**, write it to a memory file in `memory/` and update `MEMORY.md`. Use the frontmatter format below.
3. **After writing or updating memory**, stage the changed files and commit with a clear message (e.g., "memory: add project context for X"). Do NOT push automatically — let the user decide when to push.
4. **Before acting on a memory**, verify it's still accurate. Memories can go stale.
5. **Identify yourself in commits.** When Jaret is working, commits come from his git config. When Hiya is working, commits come from hers. Claude should always include the Co-Authored-By trailer.
6. **Never store secrets, tokens, or credentials** in memory files.
7. **Keep MEMORY.md under 200 lines.** Each entry is one line: `- [Title](memory/type/file.md) - one-line description`

## Memory File Format

```markdown
---
name: Short descriptive name
description: One-line summary used to judge relevance in future sessions
type: user | project | feedback | reference
created: YYYY-MM-DD
updated: YYYY-MM-DD
author: Who added this (jaret | hiya | claude)
---

Content goes here. For feedback and project types, structure as:

Rule or fact.

**Why:** The reason behind it.

**How to apply:** When and where this matters.
```

## Working Directory Note

This repo may be cloned as a subdirectory of a larger workspace. Claude Code should treat this repo's `CLAUDE.md` and `MEMORY.md` as the authoritative shared context regardless of the parent directory structure.

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
9. **Keep MEMORY.md under 200 lines.** Each entry is one line: `- [Title](memory/type/file.md) — one-line description`
10. **When reviewing history**, use git log and blame to see who did what. Session logs in `sessions/log.md` provide human-readable context.

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

## Working Directory Note

This repo may be cloned as a subdirectory of a larger workspace. Claude Code should treat this repo's `CLAUDE.md` and `MEMORY.md` as the authoritative shared context regardless of the parent directory structure.

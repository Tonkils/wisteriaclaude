---
name: Save plans to shared memory before executing
description: Always commit and push implementation plans to shared memory before starting execution, so interrupted sessions can resume
type: feedback
created: 2026-04-18
updated: 2026-04-18
session_user: jaret
author: jaret
---

Before executing a multi-step implementation plan, save the full plan to the shared memory repo and push it. This way if a session crashes, gets cancelled, or runs out of context, the next session can read the plan and pick up exactly where it left off.

**Why:** Jaret's session got cancelled mid-execution during the orchestrator build. Without the plan saved to shared memory, the next session would have to re-derive everything.

**How to apply:** For any non-trivial implementation (more than ~5 steps), save a project file to `memory/projects/` with the full plan including a checklist of steps with [x] / [ ] status. Commit and push before starting execution. Update the checklist as steps complete.

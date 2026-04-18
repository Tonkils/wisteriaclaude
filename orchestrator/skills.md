---
name: Editorial Heuristics
description: Learned editing rules that improve over time from human feedback — the orchestrator's editorial judgment
created: 2026-04-18
updated: 2026-04-18
session_user: jaret
author: claude
---

## Cutting Rules

### Dead Air
- Podcast: cut pauses > 2 seconds (unless comedic timing or dramatic beat)
- Short-form: cut pauses > 0.5 seconds (every millisecond of silence is a scroll risk)
- YouTube: cut pauses > 1.5 seconds (tighter than podcast, looser than short-form)

### Filler Words
- **Always remove:** um, uh, er, ah (standalone filler sounds)
- **Contextual — remove when filler, keep when meaningful:**
  - "you know" — remove when verbal tic, keep when genuinely asking
  - "like" — remove when filler, keep when comparison or quoting
  - "so" — remove at sentence start when filler, keep when causal
  - "right" — remove when seeking validation tic, keep when confirming
- **Never remove from:** direct quotes, deliberate speech patterns, character voice

### False Starts and Restarts
- Cut the false start, keep the clean restart
- If the speaker corrects themselves mid-sentence, keep only the correction
- Exception: if the false start adds humor or authenticity, flag for user review

### Tangents
- Flag tangents > 60 seconds that don't relate to the episode topic
- Don't auto-cut — present to user with recommendation
- Some tangents are gold (audience loves the detour) — let the human decide

### Pacing Targets
- Podcast: 1 edit per 15-30 seconds feels natural. More aggressive = robotic.
- Short-form: cut every 2-3 seconds. No dead space. Maximum engagement density.
- YouTube: pattern interrupt every 30-60 seconds (new angle, B-roll, graphic, zoom)

## Hook Selection

### What Makes a Strong Hook
- A question that creates a curiosity gap
- A bold, controversial, or surprising claim
- An emotional reaction (laughter, shock, anger, vulnerability)
- A concrete, specific number or fact
- A direct challenge to the audience

### What Makes a Weak Hook (Cut or Reposition)
- Greetings: "hey guys", "welcome back", "what's up"
- Throat clearing, hesitation, "so today we're going to..."
- Abstract setup without payoff
- Inside references the audience won't understand

### Hook Placement
- Place the payoff before the setup when possible
- The strongest moment in the episode should be teased in the first 5-15 seconds
- For clips: the hook IS the first moment. No preamble.

## Clip Selection Criteria

When identifying clip-worthy moments from long-form content:
1. **Emotional peaks** — laughter, surprise, anger, tears
2. **Surprising insights** — "I never thought of it that way"
3. **Actionable advice** — concrete steps the audience can use
4. **Controversial takes** — opinions that provoke discussion
5. **Story climaxes** — the payoff moment of a narrative
6. **Quotable one-liners** — shareable, standalone statements

Target: 3-10 clips per hour of content. Each clip: 30-90 seconds, self-contained.

## Learned Adjustments

<!-- 
This section grows as the feedback loop operates.
Format: YYYY-MM-DD | user | adjustment | reason
When this section gets long, consolidate specific adjustments into general rules above.
-->

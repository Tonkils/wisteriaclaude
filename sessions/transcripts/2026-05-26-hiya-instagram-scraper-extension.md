---
date: 2026-05-26
session_user: hiya
topic: Build Instagram cannabis account scraper Chrome extension
---

## Conversation

### User request

Hiya requested a Chrome extension to autonomously scrape Instagram cannabis accounts for Wisteria Farms influencer outreach. The plan had been defined in a prior planning session. User approved the plan and said "Continue from where you left off."

### Implementation

Claude built the full extension from scratch on branch `claude/vibrant-lovelace-kK2m4`.

**Blocker encountered:** CDN requests (cdnjs, jsdelivr) were blocked by the remote environment's network policy ("Host not in allowlist"). D3.js v7 was fetched via `npm install d3@7` in /tmp instead and the dist file copied into the extension.

**Files created:**

- `instagram-scraper-extension/manifest.json` — MV3 manifest with `sidePanel`, `identity`, `storage`, `scripting`, `tabs` permissions; `host_permissions` for instagram.com and Sheets API; `oauth2` block with placeholder client ID; `web_accessible_resources` for inject.js and D3
- `instagram-scraper-extension/inject.js` — MAIN world script patching `window.fetch` and `XMLHttpRequest` to intercept `web_profile_info`, `graphql/query`, `/api/v1/tags/` responses; posts intercepted data to content script via `window.postMessage`
- `instagram-scraper-extension/content.js` — Isolated world bridge; injects inject.js at document_start, relays postMessage to background via `chrome.runtime.sendMessage`
- `instagram-scraper-extension/background.js` — Service worker (624 lines); evaluation loop with session cap (200), daily cap (400), randomized per-account delay (10-20s), jitter pause every 10 accounts (30-60s); extracts followers, engagement rate, avg likes/comments/video views, bio, email, verified, last post date, city/state/country (with bio-inference fallback for 17 US states); syncs each account to Google Sheets via Sheets API v4 (upsert by username); pre-loaded queue of ~350 cannabis accounts; message router for START/STOP/GET_STATE/ADD_ACCOUNTS/RESET/CONNECT_SHEETS/UPDATE_SETTINGS
- `instagram-scraper-extension/popup/popup.html` + `popup.js` — Dark purple dashboard; shows running status, evaluated count, queue remaining, session/daily rate, progress bar; start/stop buttons; Connect Google Sheets button; manual account add input; min/max delay and session cap settings
- `instagram-scraper-extension/sidepanel/sidepanel.html` + `sidepanel.js` — Tab-switched view: (1) sortable/filterable data table with engagement coloring (green ≥3%, amber 1-3%, red <1%), location, email, verified; (2) D3 v7 force-directed network graph with account circles sized by followers, colored by engagement, geographic location diamond nodes for locations with 2+ accounts, hover tooltips; CSV export
- `instagram-scraper-extension/lib/d3.v7.min.js` — D3 v7 minified (~280KB, fetched via npm)
- `instagram-scraper-extension/icons/icon128.png` — Purple circle icon generated via Python struct/zlib (no PIL needed)
- `tools/instagram_graph.py` — Standalone PyVis visualizer; reads from same Google Sheet; builds NetworkX directed graph with account + location nodes; runs Louvain community detection (python-louvain); renders interactive HTML via PyVis with Barnes-Hut physics; opens in browser
- `tools/requirements.txt` — networkx, pyvis, gspread, google-auth, google-auth-oauthlib, python-louvain

**Commit:** `[hiya] feat: add Instagram cannabis account scraper extension`

**PR #1** opened as draft, then merged by Hiya.

### OAuth question

Hiya asked which OAuth client type to use.

Claude explained: `chrome.identity.getAuthToken()` requires a **Chrome App** OAuth 2.0 client (not Web App or Desktop). Steps: Cloud Console → APIs & Services → Credentials → Create → Chrome App → paste extension ID. Also explained the OpenSSL key trick to pin the extension ID across installs so the OAuth client stays valid.

### Load unpacked error

Hiya shared a screenshot showing "Manifest file is missing or unreadable. Could not load manifest." with path `~\Downloads\Unpacked`.

Claude diagnosed: user selected the parent/wrapper folder instead of the `instagram-scraper-extension/` subfolder. Explained they need to navigate into `instagram-scraper-extension/` so that `manifest.json` is at the root of the selected folder.

### Session end

PR #1 merged. Session auto-unsubscribed from PR activity.

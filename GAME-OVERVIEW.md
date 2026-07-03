# Police De-escalation Training Game

## What It Is

An interactive, browser-based training simulation for police officers to practice de-escalation techniques. Players navigate branching dialogue scenarios, making choices that affect outcomes. Each scenario ends with a performance review.

## Languages

4 languages supported: **English (en)**, **Czech (cs)**, **Lithuanian (lt)**, **Romanian (ro)**

Language is selectable at runtime. Flag icons are bundled locally in assets/flags/ (no external requests).

## Architecture

Pure client-side HTML/JS application. No build step, no framework, no backend. All data is loaded via `fetch()` from JSON files, so it **must be served over HTTP** (not `file://` protocol due to CORS).

### File Structure (134 files, ~7.7 MB)

```
index.html                  # Entry point (164KB) - contains all HTML, CSS, and inline JS
                            # including ReviewManager and game completion detection
config.js                   # Configuration: supported languages, file paths, BASE_URL
core.js                     # I18nManager (translations), state machine, utilities
ui-managers.js              # UI rendering: screens, modals, animations
game-controller.js          # Game logic: scenario loading, choices, scoring, reviews

translations/
  ui-{lang}.json            # UI text strings per language (4 files)

scenarios/
  index-{lang}.json         # Scenario list/menu per language (4 files)
  {lang}/
    scenario-{id}-{lang}.json   # Individual scenario data (14 per language, 56 total)
  reviews/
    review-{id}-{lang}.json     # Post-scenario review data (61 files)

sounds/
  click.mp3                 # Button click
  error.mp3                 # Wrong choice
  good.mp3                  # Good choice
  success.mp3               # Scenario success
  victory.mp3               # Victory
  fanfare.mp3               # Completion fanfare
```

### Script Load Order (matters)

1. `config.js` - CONFIG object with paths and settings
2. `core.js` - I18nManager, state machine
3. `ui-managers.js` - UI rendering
4. `game-controller.js` - GameController (main orchestrator)

### Key Design Patterns

- **State machine**: INIT -> LOADING -> MENU -> PLAYING -> REVIEW -> COMPLETE (+ ERROR)
- **Dynamic fetch**: All content loaded at runtime from JSON, not bundled
- **BASE_URL resolution**: `config.js` auto-detects the serving path (supports `?base=` query param override for embedding)
- **ReviewManager**: Defined inline in `index.html`, handles post-game scenario reviews
- **Game completion detection**: Monitors gameplay and triggers review flow

## Scenarios (14 per language)

| ID | Name |
|----|------|
| 1-7 | Core numbered scenarios |
| domestic-crisis | Domestic crisis intervention |
| custody-exchange | Custody exchange dispute |
| hospital-disturbance | Hospital disturbance |
| road-rage | Road rage incident |
| street-vendor | Street vendor confrontation |
| traffic-stop | Traffic stop escalation |
| youth-park | Youth park interaction |

## Integration Notes for Website Embedding

- **No build step needed** - copy files as-is to any static hosting
- **All paths are relative** - works from any subdirectory
- **BASE_URL override** - pass `?base=/path/to/game/` query param if served from a non-root path
- **No external dependencies** — flags are bundled in `assets/flags/`
- **Minimum server requirement** - any HTTP server (static files only, no server-side logic)
- **iframe embedding** - can be embedded in an iframe; the `?base=` param helps resolve asset paths correctly

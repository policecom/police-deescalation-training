# Adding and editing scenarios

You do **not** need to know JavaScript to add a scenario. The easiest path is the
in-app editor; this document describes the file format so you can also hand-write
or review scenarios, and add them permanently to your copy of the site.

## The two files

A scenario is up to two JSON files that share an `<id>` and a `<lang>`:

| File | Required | Purpose |
|------|----------|---------|
| `scenarios/<lang>/scenario-<id>-<lang>.json` | yes | the scenario itself |
| `scenarios/reviews/review-<id>-<lang>.json`  | no  | the detailed training report; without it the report shows only the score |

`<lang>` is one of `en`, `cs`, `lt`, `ro`. `<id>` is any short slug or number,
e.g. `traffic-stop` or `12`.

To make the scenario appear in the menu, add an entry to
`scenarios/index-<lang>.json` (the `scenarios` array):

```json
{
  "id": "my-scenario",
  "title": "My scenario",
  "description": "One-line summary shown on the card",
  "icon": "🚓",
  "difficulty": 3,
  "duration": "10-15"
}
```

The game finds the scenario file by the naming convention above — **no code
change is needed.**

## Scenario file structure

```jsonc
{
  "id": "my-scenario",
  "title": "My scenario",
  "description": "…",
  "icon": "🚓",
  "lang": "en",
  "difficulty": 3,
  "duration": "10-15",
  "instructor": { "name": "Sgt. Doe", "avatar": "👮", "introduction": "…" },
  "timedChoices": true,
  "completionBadges": ["scenario-my-scenario-complete"],
  "perfectBadge": "perfect-scenario-my-scenario",
  "lawContext": { "11": "2008-273" },          // optional: bare "§ 11" → act slug
  "stages": [ /* 7 interactive stages + 1 final, see below */ ],
  "characters": {
    "officer":  { "name": "You (Officer)", "avatar": "👮" },
    "trainer":  { "name": "Instructor",    "avatar": "👨‍🏫" }
    // + any NPCs your dialogue references
  },
  "finalMessage": { "revelation": "…", "keyLessons": ["…","…","…","…","…"] },
  "performanceReviews": { "perfect": {…}, "good": {…}, "average": {…}, "poor": {…} },
  "metrics": { "rapport": {…}, "procedure": {…}, "emotional": {…}, "safety": {…} }
}
```

### Interactive stage

```jsonc
{
  "id": 1,
  "title": "Approach",
  "sceneUpdate": { "emoji": "🚗", "title": "Roadside", "desc": "What the player sees." },
  "npcDialogue": [ { "character": "driver", "text": "…" } ],
  "prompt": "How do you open the contact?",
  "options": [ /* exactly 4, one of each type */ ]
}
```

Each stage has **exactly four options, one of each `type`**:

| type                  | points | meaning              |
|-----------------------|--------|----------------------|
| `positive`            | 10 (or 12 on a key stage) | the good choice |
| `partially_positive`  | 5      | advances, but flawed |
| `neutral`             | 2      | not wrong, not helpful |
| `negative`            | -8 (or -10) | the escalating choice |

An option is:

```jsonc
{
  "text": "What the officer does and says (body language + exact speech).",
  "feedback": "Why: … | CONSEQUENCES: … | Reflection: …",
  "type": "positive",
  "points": 10
}
```

**Feedback format:** three parts separated by `|`, each starting with a label and
a colon. The game splits on `|` and shows them as three blocks (💡 Why /
➡️ Consequences / 🤔 Reflection). The labels can be in any language
(`Proč: … | DŮSLEDKY: … | Reflexe: …` in Czech). A single block with no `|` also
works.

**Clickable statutes:** a citation like `§ 358 of the Criminal Code` or
`zák. č. 273/2008 Sb.` becomes a link. For a bare `§ 11` with no act named, map it
in `lawContext` (`"11": "2008-273"`), where the value is the
`zakonyprolidi.cz/cs/<slug>` id.

### Final stage (debrief)

```jsonc
{
  "id": 8,
  "title": "Debrief",
  "sceneUpdate": { "emoji": "📋", "title": "Debrief", "desc": "…" },
  "autoDialogue": true,
  "finalScene": true,
  "dialogueSequence": [
    { "character": "trainer", "text": "…" },
    { "character": "officer", "text": "…" }
  ]
}
```

`characters` must contain `officer` and the trainer key used here.

## Review file (optional)

Mirror the scenario: `stageAnalysis` keyed `"1"…"N"` (one per interactive stage),
each with `choiceAnalysis.{positive,neutral,negative,partially_positive}` carrying
a short `choiceText` paraphrase plus notes; optional `legalConsiderations` per
stage feed the report's *Legal framework* box. The in-app editor's
**Generate review skeleton** produces a valid review from your scenario — the
easiest way to start.

## Validating

- The in-app editor shows live validation (blocking errors vs. warnings).
- The **Upload** flow validates a scenario (and optional review) before saving.
- Rules enforced: 7-ish interactive stages + one `finalScene`; exactly 4 options
  of the 4 distinct types per stage; each option has text + feedback; `characters`
  includes `officer` and the trainer. Warnings (missing prompt, feedback not in the
  three-part format, points off-convention, …) don't block — the game still runs.

## Test locally

```bash
python3 -m http.server 8000
# open http://127.0.0.1:8000/ and play your scenario
```

By contributing content you agree to license it under **CC BY 4.0** (see
[`CONTENT-LICENSE.md`](CONTENT-LICENSE.md)) and code under **MIT**
([`LICENSE`](LICENSE)).

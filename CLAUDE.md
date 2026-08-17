# CLAUDE.md — working notes for agents on FallFence

FallFence is a single-file, dependency-free, offline HTML tool. Keep it that way.

## Layout

- `fallfence.html` — the app. Contains the engine (pure JS) plus the browser shell
  (DOM wiring, IndexedDB exchange log, optional key-based cascade).
- `index.html` — the published landing/app entry.
- `test.mjs` — Node test suite. Lifts the engine's pure section out of
  `fallfence.html` and asserts on real outputs.
- `SPEC.md` — what the engine is supposed to do. Read it before changing engine behaviour.
- `package.json` — `npm test` runs the suite. No runtime dependencies; do not add any.

## Ground rules

- **No build step, no framework, no dependencies.** Vanilla JS only. The value of the
  tool is that it runs offline from one file. Adding a bundler or an npm dependency
  breaks that and will not be accepted.
- **The engine is pure.** `killShotCheck`, `detectArchetype`, `isWorkedExample`,
  `draftResponses`, and `calibrateTone` must stay free of `window`, `document`, and
  `indexedDB` so the suite can evaluate them in Node. Keep DOM and storage code below
  the IndexedDB marker, out of the tested section.
- **Change behaviour, change the spec and the tests.** If you edit a cue list, the
  confidence formula, the technique matrix, or a template, update `SPEC.md` and add or
  adjust an assertion in `test.mjs` in the same change. Never weaken an assertion just
  to make the suite green.
- **Extraction markers matter.** `test.mjs` finds the engine using two literal strings
  (`const FALLFENCE = {` and `const DB_NAME = 'fallfence';`). If you rename or move
  them, fix the extraction, or the suite will throw on load.

## Verifying

```
npm test        # runs node test.mjs — must exit 0
```

CI (`.github/workflows/ci.yml`) runs the same command on every push. A red suite blocks
the change; fix the code or the test, do not skip or delete assertions.

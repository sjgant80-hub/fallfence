# FallFence — engine specification

A design note for the deterministic engine inside `fallfence.html`. It records what
the engine is supposed to do so that a reviewer can decide whether a given output is
correct, and so the test suite has a fixed target. Scope is the offline (T0) engine
only; the browser shell, IndexedDB log, and optional bring-your-own-key cascade are
out of scope here.

## 1. Shape

FallFence is a single HTML file. The engine is a block of pure, DOM-free JavaScript
in its `<script>` element: a set of `const` data tables and pure functions with no
I/O and no dependence on `window`, `document`, or `indexedDB`. Given the same input
string it returns the same output every time. That property is what makes it
testable without a browser — see [`test.mjs`](test.mjs), which slices the block out
of the committed HTML and evaluates it in Node.

The engine has five units, each independently exercised by the suite:

| Unit | Function(s) | Input | Output |
|------|-------------|-------|--------|
| Kill-shot detector | `killShotCheck` | opponent text | a walk-away message, or `null` |
| Archetype reader | `detectArchetype` | opponent text | `{ key, confidence, def, scores }`, or `null` |
| Technique matrix | `MATRIX`, `TECHNIQUES` | archetype × technique | a fit code |
| Response drafter | `draftResponses`, `isWorkedExample` | text, archetype, technique, context | options `A`/`B`/`C` |
| Tone calibrator | `calibrateTone` | draft body | a softened body |

## 2. Kill-shot detector

`killShotCheck(text)` trims the input and tests it against a fixed, ordered list of
disengagement patterns (`KILL_SHOTS`). The first pattern that matches returns its
paired message; empty or ordinary text returns `null`. This is the "four words beats
four hundred" rule: when the opponent has already left the frame ("whatever", a
bare "k", "don't care", a lone "lol", "blocked"), the correct move is to stop, so the
detector surfaces a walk-away prompt instead of a response.

## 3. Archetype reader

`detectArchetype(text)` scores the text against six archetypes. Each archetype owns a
list of case-insensitive cue regexes; its score is the count of cues that match. The
highest score wins; on a tie the first-declared archetype wins, which makes the result
order-stable. Confidence is derived, not stored:

```
confidence = min(0.95, 0.4 + (bestScore / (total + 1)) * 0.6)
```

where `total` is the sum of all six scores. When no cue fires at all, the reader
falls back deterministically: to `GENUINE_INQUIRER` if the text ends in a question
mark, otherwise to `INTELLECTUAL_GATEKEEPER`, both at a floor confidence of `0.25`.
Empty input returns `null`. The six archetypes are fixed: intellectual gatekeeper,
technical challenger, authority quoter, emotional provocateur, genuine inquirer, and
competitive builder.

## 4. Technique matrix

`MATRIX` maps each archetype to a fit code — `prime`, `good`, `meh`, or `no` — for each
of the five core techniques (frame refusal, pivot, blade catch, yield, tempo control).
The engine reads the matrix to recommend the `prime` technique for a detected
archetype; the table is data, so a reviewer can audit and adjust a single cell without
touching control flow.

## 5. Response drafter

`draftResponses(text, archetype, technique, context)` returns exactly three options:
`A` (short), `B` (medium), `C` (a yield or an alternative). Two paths:

- **Worked-example path.** `isWorkedExample(text)` matches the input against three
  anchored exemplars. On a hit, the drafter returns the exemplar's hand-written
  options verbatim — highest fidelity, used for the canonical demonstrations.
- **Template path.** Otherwise the drafter fills a per-technique template. It extracts
  a quoted fragment (for blade catch) and the first clause (for pivot/yield/teach) from
  the input and substitutes them in. Option `C`'s `kind` is `yield` when the technique
  is a yield and `alt` otherwise. Each option carries a word count and a predicted
  opponent reaction.

## 6. Tone calibrator

`calibrateTone(body)` is a string-to-string pass that strips combative openers
(`actually`, `well`, `listen`, `look`), rewrites "you're wrong" to a softer form,
removes "obviously", and collapses runs of whitespace. It is idempotent on already-clean
text and returns `''` for empty input.

## 7. Testability boundary

Because the engine is embedded in HTML, the suite locates it by two string markers —
the start of the `FALLFENCE` constant and the start of the IndexedDB layer — and
evaluates only the code between them. If either marker moves, extraction throws and the
suite fails loudly rather than silently testing nothing. This keeps the tests bound to
the real, shipped source in `fallfence.html` rather than a copy. Continuous integration
is defined in [`ci.yml`](.github/workflows/ci.yml) and runs `npm test` on every push.

## 8. Non-goals

The engine does not call a network, does not persist anything by itself (the log layer
does, in the browser), and carries no runtime dependencies. Sophisticated inputs will
defeat keyword matching; the reader is a first-pass classifier, and the UI lets a user
override the read. These bounds are deliberate and are asserted, where observable, by
the suite.

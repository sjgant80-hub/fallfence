# FallFence

> ◊·κ=1 · sovereign debating engine · prime 599

A single-file HTML tool that reads the opponent's archetype, picks the right fencing technique, and generates 2-3 response options in Simon Gant's voice. Built on the AI Native Solutions estate. Runs in your browser. Your data never leaves.

**Live:** https://sjgant80-hub.github.io/fallfence/

## What it is

You paste an opponent's message. FallFence:
1. **Reads the archetype** — one of six: Intellectual Gatekeeper, Technical Challenger, Authority Quoter, Emotional Provocateur, Genuine Inquirer, Competitive Builder.
2. **Picks the field** — Universal Law (first principles) / Hermetic Principles (the 7) / Jungian Depth (shadow, archetypes).
3. **Selects the technique** — Frame Refusal · Pivot · Blade Catch · Yield · Tempo Control.
4. **Generates 2-3 response options** — short kill-shot, medium pivot, yield-or-alternative.
5. **Predicts the opponent's response** for each option, so you choose with eyes open.

You pick the response, copy it, paste wherever you're fencing.

## Why it exists

Most debate is wasted energy. Most "wins" lose status. The trick is reading the opponent before engaging and matching the technique to the archetype. FallFence is the encoded version of patterns that worked across hundreds of Discord, LinkedIn, and in-person exchanges. It runs offline. Gets sharper with every exchange you log.

## How to use it · two audiences

### END USER

1. Open https://sjgant80-hub.github.io/fallfence/ (or save it as a PWA · works offline).
2. Paste what the opponent said into the big text box.
3. (Optional) Pick the context — LinkedIn / Discord / in-person / etc.
4. Click **Analyse**.
5. Read the archetype + field + technique.
6. Pick one of the 3 response options.
7. Click **Use this** — copies to your clipboard.
8. Paste wherever you're fencing.
9. Come back later · rate the outcome (won / draw / forfeit / lost). Your log gets sharper.

Special cases:
- If FallFence detects a **forfeit** ("whatever", "k", "moving on") — it tells you to **walk away**. Engaging further loses status.
- If FallFence detects a **kill-shot opportunity** — shorter is stronger. The 4-word option will be flagged.

### DEVELOPER

Architecture:
- Single HTML file (~1300 LOC including CSS + JS) · MIT licensed
- Vanilla JS · no frameworks · no build step
- T0 (offline · keyword pattern matching) is the default · works without any LLM
- T2 (BYOK Claude/GPT/Gemini) is optional · enable in Settings · uses your own key from localStorage
- IndexedDB for exchange log · never leaves your browser
- BroadcastChannel `fall-signal` for estate-mesh integration
- Konomi licence shim baked (sovereign tier)

Extending:
- Add a new archetype: edit `ARCHETYPES` const · add trigger regexes + field + technique
- Add a new technique template: edit `TEMPLATES` const · add the 3 options (A short / B medium / C yield) with predicted outcomes
- Add a new field reference: drop a `<details>` block in the Reference section
- Konomi cert: mint pending Ed25519 key sourcing · current entries use SHA-256-only

## The five techniques

| # | Technique | When | Effect |
|---|---|---|---|
| 1 | **Frame Refusal** | opponent traps with A or B | present option C they didn't offer · attack hits air |
| 2 | **Pivot (prise)** | opponent attacks confidently on their turf | redirect to your ground without blocking · their mockery becomes your thesis |
| 3 | **Blade Catch** | opponent cites an authority | use their source against them · later work rejects earlier framing |
| 4 | **Yield** | opponent makes a genuinely good point | absorb cleanly · "you're right, the choice isn't that wonderful" |
| 5 | **Tempo Control** | opening of any exchange | "I have several answers to that" · pause before strike · they lose initiative |

## The six archetypes (with detection heuristics)

| Archetype | Triggers | Technique |
|---|---|---|
| **Intellectual Gatekeeper** | "common sense", "you don't know", false A-or-B | Frame Refusal + Pivot |
| **Technical Challenger** | precise implementation flaws · "what about X edge case" | Yield + reframe scope |
| **Authority Quoter** | cites philosophers / studies / Wittgenstein etc. | Blade Catch |
| **Emotional Provocateur** | provocation only · "whatever", emoji laugh, eye-roll | Tempo Control + disengage |
| **Genuine Inquirer** | actually curious · asking real questions | TEACH not fence · generous answers |
| **Competitive Builder** | "I also built", subtle comparison | Acknowledge + show yours without comparing |

## The response rules

**ALWAYS:**
- Read archetype BEFORE responding
- Never defend · always redirect
- Never angry · always fun
- Admit when opponent is right (yield)
- Shorter is stronger
- One counter per response · not a wall of text
- End with a question or reframe · never a lecture
- Credit the opponent when they teach you something

**NEVER:**
- Insult the opponent
- Strawman their argument
- Continue after "whatever" (forfeit · walk away)
- Stack multiple arguments (one blade · one strike)
- Be sarcastic in a way that makes YOU look bad

**The test:** other people reading the exchange think "that was a good point" — NOT "that person is being a dick."

## The cascade

- **T0** · keyword pattern matching · ships pre-baked template responses · works offline · no LLM required
- **T1** · WebLLM (browser-side Llama) · optional · lightweight · offline
- **T2** · BYOK Claude / GPT / Gemini · generates Simon-voice responses via your own key · key stays in localStorage
- **T3** · only for extremely niche references T0/T2 don't know · almost never needed

## Honest constraints

- The archetype detection is keyword-based. Sophisticated opponents will trip it. Override manually if the read feels wrong.
- The pre-baked templates are starting points, not final answers. Always read before copying.
- This is a fencing tool, not a personality test. The archetypes describe the move, not the person.
- Sovereign-tier Konomi licence is in effect (no gate) — when the Ed25519 key is sourced, every artefact will get minted into the audit chain.

## Part of the estate

- [fallmind](https://sjgant80-hub.github.io/fallmind/) — sovereign self-trained LLM pipeline (prime 587)
- [fallfind](https://sjgant80-hub.github.io/fallfind/) — searchable estate browser
- [fall-substrate](https://sjgant80-hub.github.io/fall-substrate/) — research → cited tool → live URL (the flagship)
- [fall-vetter](https://sjgant80-hub.github.io/fall-vetter/) — Cassandra-mode psychological reading
- [si-didy-agent](https://github.com/sjgant80-hub/si-didy-agent) — the persona agent (prime 379)

## Licence

MIT · Simon Gant 2026

◊·κ=1 · read the archetype · choose the technique · control the tempo

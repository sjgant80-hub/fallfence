/*
 * FallFence — behavioural test suite.
 *
 * FallFence ships as a single HTML file. Its engine (archetype reader, kill-shot
 * detector, technique matrix, response drafter, tone calibrator) is pure,
 * deterministic, DOM-free JavaScript living inside the <script> block of
 * fallfence.html. This suite lifts that browser-free section out of the committed
 * file, evaluates it in a Node sandbox, and asserts on the real values the engine
 * produces — no mocks, no stubs, every expectation taken from observed output.
 *
 * It also imports the project manifest (./package.json) to cross-check that the
 * capability the manifest advertises is the one the code actually implements.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const pkg = require('./package.json');            // project source: the manifest itself

const HERE = dirname(fileURLToPath(import.meta.url));

// Lift the engine out of the committed single-file app. The two markers bracket
// the pure section: everything from the FALLFENCE constant down to (but not
// including) the IndexedDB layer, which needs a browser and is not under test.
function loadEngine() {
  const html = readFileSync(join(HERE, 'fallfence.html'), 'utf8');
  const startAt = html.indexOf('const FALLFENCE = {');
  const stopAt = html.indexOf("const DB_NAME = 'fallfence';");
  if (startAt < 0 || stopAt < 0 || stopAt <= startAt) {
    throw new Error('engine markers not found in fallfence.html — extraction boundary changed');
  }
  const source = html.slice(startAt, stopAt);
  const build = new Function(
    source +
    '\nreturn { killShotCheck, detectArchetype, isWorkedExample, draftResponses,' +
    ' calibrateTone, ARCHETYPES, TECHNIQUES, MATRIX, KILL_SHOTS };'
  );
  return build();
}

const E = loadEngine();

test('engine lifts cleanly out of the committed HTML app', () => {
  assert.equal(typeof E.killShotCheck, 'function');
  assert.equal(typeof E.detectArchetype, 'function');
  assert.equal(typeof E.draftResponses, 'function');
  assert.equal(typeof E.calibrateTone, 'function');
});

test('killShotCheck flags "whatever" as a forfeit with the exact walk-away message', () => {
  const msg = E.killShotCheck('whatever');
  assert.equal(msg, '"whatever" is the white flag. Engaging now signals it landed. Walk away.');
});

test('killShotCheck recognises the other forfeit signals', () => {
  assert.match(E.killShotCheck('k.'), /exited the frame/);
  assert.match(E.killShotCheck("I don't care"), /Stated disengagement/);
  assert.match(E.killShotCheck('lol'), /Pure dismissal/);
  assert.match(E.killShotCheck('you are blocked'), /signalled exit/);
});

test('killShotCheck returns null for empty and for ordinary engageable text', () => {
  assert.equal(E.killShotCheck(''), null);
  assert.equal(E.killShotCheck('That is an interesting point about React'), null);
});

test('detectArchetype classifies each archetype from its own cues', () => {
  assert.equal(E.detectArchetype('That is just common sense, by definition').key, 'INTELLECTUAL_GATEKEEPER');
  assert.equal(E.detectArchetype('Safari aggressively clears IndexedDB after 7 days, this will break at scale').key, 'TECHNICAL_CHALLENGER');
  assert.equal(E.detectArchetype('The study from Harvard shows you are wrong').key, 'AUTHORITY_QUOTER');
  assert.equal(E.detectArchetype('you are pathetic and clueless lmao').key, 'EMOTIONAL_PROVOCATEUR');
  assert.equal(E.detectArchetype('How does this work? I am genuinely curious').key, 'GENUINE_INQUIRER');
  assert.equal(E.detectArchetype('I also built my own version of this in production for years').key, 'COMPETITIVE_BUILDER');
});

test('detectArchetype confidence scales with the number of cue hits', () => {
  const tech = E.detectArchetype('Safari aggressively clears IndexedDB after 7 days, this will break at scale');
  assert.equal(tech.confidence, 0.85);
  const auth = E.detectArchetype('The study from Harvard shows you are wrong');
  assert.equal(auth.confidence, 0.8);
  const gate = E.detectArchetype('That is just common sense, by definition');
  assert.equal(gate.confidence, 0.7);
});

test('detectArchetype falls back to gatekeeper at 0.25 when no cue fires', () => {
  const r = E.detectArchetype('random text with no cues');
  assert.equal(r.key, 'INTELLECTUAL_GATEKEEPER');
  assert.equal(r.confidence, 0.25);
});

test('detectArchetype returns null on empty input', () => {
  assert.equal(E.detectArchetype(''), null);
  assert.equal(E.detectArchetype('   '), null);
});

test('isWorkedExample matches the three anchored examples and nothing else', () => {
  assert.ok(E.isWorkedExample("Common sense meets religion vs evolution vs technology — you don't really know about evolution"));
  assert.ok(E.isWorkedExample('Safari aggressively clears IndexedDB after 7 days'));
  assert.ok(E.isWorkedExample('You enjoy when someone moves the goalposts, do you?'));
  assert.equal(E.isWorkedExample('hello world'), null);
});

test('draftResponses always returns exactly three options A, B, C', () => {
  const r = E.draftResponses('some ordinary message', E.detectArchetype('some ordinary message'), 'pivot', 'discord');
  assert.deepEqual(Object.keys(r), ['A', 'B', 'C']);
  assert.equal(typeof r.A.body, 'string');
  assert.equal(typeof r.A.words, 'number');
});

test('draftResponses uses the worked-example answer verbatim when one matches', () => {
  const text = "Common sense meets religion vs evolution vs technology — you don't really know about evolution";
  const r = E.draftResponses(text, E.detectArchetype(text), 'frame_refusal', 'discord');
  assert.equal(r.A.body, 'Both stories are compression, not instruction manuals.');
  assert.equal(r.A.words, 7);
  assert.equal(r.A.kind, 'short');
  assert.equal(r.C.kind, 'yield');
});

test('draftResponses blade_catch turns a quoted fragment back on the speaker', () => {
  const text = 'As Jung said "the shadow" applies here';
  const r = E.draftResponses(text, E.detectArchetype(text), 'blade_catch', 'linkedin');
  assert.equal(r.A.body, 'Your own "the shadow" makes the opposite case.');
  assert.equal(r.A.words, 8);
});

test('draftResponses option C kind tracks whether the technique is a yield', () => {
  const y = E.draftResponses('point', E.detectArchetype('point'), 'yield', 'discord');
  assert.equal(y.C.kind, 'yield');
  const p = E.draftResponses('point', E.detectArchetype('point'), 'pivot', 'discord');
  assert.equal(p.C.kind, 'alt');
});

test('calibrateTone strips combative starters, softens absolutes, collapses space', () => {
  assert.equal(E.calibrateTone('Actually, that is a good point'), 'that is a good point');
  assert.equal(E.calibrateTone("You're wrong about this"), "that doesn't hold about this");
  assert.equal(E.calibrateTone('This is obviously true'), 'This is true');
  assert.equal(E.calibrateTone('Well,   look   here'), 'look here');
  assert.equal(E.calibrateTone(''), '');
});

test('the archetype set, technique set, and fit matrix have the documented shape', () => {
  assert.equal(Object.keys(E.ARCHETYPES).length, 6);
  assert.equal(Object.keys(E.TECHNIQUES).length, 6);
  assert.equal(Object.keys(E.MATRIX).length, 6);
  assert.equal(E.MATRIX.INTELLECTUAL_GATEKEEPER.frame_refusal, 'prime');
  assert.equal(E.MATRIX.AUTHORITY_QUOTER.blade_catch, 'prime');
  assert.equal(E.MATRIX.EMOTIONAL_PROVOCATEUR.tempo_control, 'prime');
});

test('the manifest advertises the capability the engine actually implements', () => {
  assert.equal(pkg.name, 'fallfence');
  assert.match(pkg.description, /archetype/);
  assert.match(pkg.description, /3 options/);
  // "get archetype + technique + 3 options": six archetypes exist, and every
  // draft yields exactly three options — the manifest claim, verified in code.
  assert.equal(Object.keys(E.ARCHETYPES).length, 6);
  const drafted = E.draftResponses('anything', E.detectArchetype('anything'), 'tempo_control', 'discord');
  assert.equal(Object.keys(drafted).length, 3);
});

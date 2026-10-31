'use strict';
// G0 observations of the immutable JS oracle, NOT C# parity or ordinary-play QA.
// All cases use explicitly staged small boards/visibility/levels/transient state.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const reference = path.resolve(process.argv[2] || '');
const output = process.argv[3];
if (!output || !process.argv[2]) throw new Error('Usage: node g0-tactical-probes.cjs <canonical reference root> <new results.json>');
if (fs.existsSync(output)) throw new Error('Preserve prior probe output; choose a new output path.');
const source = path.join(reference, 'prototype', 'engine.js');
const sourceHash = crypto.createHash('sha256').update(fs.readFileSync(source)).digest('hex');
assert.equal(sourceHash, '7e0253b99b339611c5e149ccf3a7e527f62d31df008bb3e7fe0145d541b89776');
const E = require(source);
const results = [];
function check(id, name, run, classification = 'BASELINE_OBSERVATION') {
  try { results.push({id, name, classification, result: 'PASS', observed: run()}); }
  catch (error) { results.push({id, name, classification, result: 'FAIL', error: error.message}); }
}
const sq = (g, r, c) => E.idx(g, r, c);
function world(options = {}) {
  const g = E.create({size: 30, seed: 43971, ...options});
  for (const u of g.units) u.alive = false;
  for (const side of ['w', 'b']) {
    const k = g.units.find(u => u.side === side && u.type === 'K');
    k.alive = true; k.pos = sq(g, side === 'w' ? 29 : 0, 29);
    g.players[side].seen.fill(1);
    g.players[side].sight.fill(0);
    g.players[side].terrainMemory.fill(E.T.PLAIN);
    g.players[side].firstSeenUnits = {};
  }
  g.terrain.fill(E.T.PLAIN); g.shrines = []; g.camps = []; g.towers = [];
  g.beacons = []; g.decoys = []; g.battleEcho = []; g.log = [];
  g.side = 'w'; g.serial = 19; g.round = 10; g.ap = 3; g.lastEvent = null;
  return g;
}
function unit(g, side, type, r, c) {
  const u = g.units.find(x => x.side === side && x.type === type && (!x.alive || type === 'K'));
  assert(u, `No staged ${side} ${type} available`);
  u.alive = true; u.pos = sq(g, r, c); u.acted = -1; u.bonus = 0; u.project = null;
  return u;
}
function visible(g, side = 'w') { g.players[side].sight.fill(1); }
function state(g, u) {
  return {side: g.side, ap: g.ap, serial: g.serial, round: g.round, winner: g.winner,
    rng: g.rng, actor: u && {id: u.id, pos: u.pos, acted: u.acted, bonus: u.bonus,
      ninjaRolled: u.ninjaRolled, alive: u.alive}, lastEvent: g.lastEvent};
}
check('T01', 'orders ignores an unseen enemy; moves reads true occupancy', () => {
  const g = world(), r = unit(g, 'w', 'R', 15, 4), p = unit(g, 'b', 'P', 15, 7), to = sq(g, 15, 10);
  const ordersWithEnemy = E.orders(g, r), movesWithEnemy = E.moves(g, r);
  assert(ordersWithEnemy.includes(to)); assert(!movesWithEnemy.includes(to));
  p.alive = false; assert.deepEqual(E.orders(g, r), ordersWithEnemy); assert(E.moves(g, r).includes(to));
  return {to, ordersWithEnemy, movesWithEnemy, previewUnchangedWhenHiddenEnemyRemoved: true};
});
check('T02', 'adjacent unseen enemy consumes activation without moving or capturing', () => {
  const g = world(), r = unit(g, 'w', 'R', 15, 4), p = unit(g, 'b', 'P', 15, 5), before = r.pos;
  const outcome = E.action(g, {type: 'move', unitId: r.id, to: sq(g, 15, 9)});
  assert(outcome.ok); assert.equal(r.pos, before); assert(p.alive); assert.equal(g.ap, 1);
  assert.equal(r.acted, g.serial); assert.equal(r.history.length, 0); assert.equal(g.lastEvent.type, 'interrupted');
  return {outcome, ...state(g, r)};
});
check('T03', 'distant unseen enemy stops a slider on the last safe square', () => {
  const g = world(), r = unit(g, 'w', 'R', 15, 4), p = unit(g, 'b', 'P', 15, 7);
  const outcome = E.action(g, {type: 'move', unitId: r.id, to: sq(g, 15, 10)});
  assert(outcome.ok); assert.equal(r.pos, sq(g, 15, 6)); assert(p.alive);
  assert.equal(g.ap, 1); assert.equal(r.history[0].interrupted, true);
  return {outcome, history: r.history, ...state(g, r)};
});
check('T04', 'remembered plain/live water is accepted then interrupted before water', () => {
  const g = world(), r = unit(g, 'w', 'R', 15, 4), to = sq(g, 15, 10);
  g.terrain[sq(g, 15, 6)] = E.T.WATER; assert(E.orders(g, r).includes(to));
  const outcome = E.action(g, {type: 'move', unitId: r.id, to});
  assert(outcome.ok); assert.equal(r.pos, sq(g, 15, 5)); assert.equal(g.ap, 1);
  return {outcome, ...state(g, r)};
});
check('T05', 'a newly grown forest is entered and soft-stops a slider', () => {
  const g = world(), r = unit(g, 'w', 'R', 15, 4), forest = sq(g, 15, 6), to = sq(g, 15, 10);
  g.terrain[forest] = E.T.FOREST; assert(E.orders(g, r).includes(to));
  const outcome = E.action(g, {type: 'move', unitId: r.id, to});
  assert(outcome.ok); assert.equal(r.pos, forest); assert.equal(g.lastEvent.type, 'forest-stop');
  return {outcome, ...state(g, r)};
});
check('T06', 'an unseen soldier in forest takes precedence over entering forest', () => {
  const g = world(), r = unit(g, 'w', 'R', 15, 4), p = unit(g, 'b', 'P', 15, 6);
  g.terrain[p.pos] = E.T.FOREST;
  const outcome = E.action(g, {type: 'move', unitId: r.id, to: sq(g, 15, 10)});
  assert(outcome.ok); assert.equal(r.pos, sq(g, 15, 5)); assert.equal(g.lastEvent.type, 'interrupted'); assert(p.alive);
  return {outcome, ...state(g, r)};
});
check('T07', 'a malformed request preserves lastEvent but an invalid living-unit request clears it', () => {
  const g = world(); g.lastEvent = {type: 'previous'};
  const malformed = E.action(g, {}); assert.equal(malformed.ok, false); assert.equal(g.lastEvent.type, 'previous');
  const invalidUnit = E.action(g, {type: 'move', unitId: -1, to: 0});
  assert.equal(invalidUnit.ok, false); assert.equal(g.lastEvent, null); assert.equal(g.ap, 3);
  return {malformed, invalidUnit, ...state(g)};
});
check('T08', 'finished-game actions and direct endTurn leave the whole state unchanged', () => {
  const g = world(); g.winner = 'w'; g.lastEvent = {type: 'previous'};
  const before = E.dump(g), outcome = E.action(g, {type: 'end'});
  assert.equal(outcome.ok, false); assert.equal(E.dump(g), before);
  assert.equal(E.endTurn(g), null); assert.equal(E.dump(g), before);
  return {outcome, unchanged: true};
});
check('T09', 'maester mutates job/CP/activation yet returns Unknown action type', () => {
  const g = world(), b = unit(g, 'w', 'B', 15, 4); b.level = 15;
  const outcome = E.action(g, {type: 'maester', unitId: b.id});
  assert.deepEqual(outcome, {ok: false, error: 'Unknown action type.'});
  assert.equal(b.job, 'maester'); assert.equal(b.acted, g.serial); assert.equal(g.ap, 2);
  return {outcome, job: b.job, commandPowerAfter: E.commandPower(g, 'w'), ...state(g, b)};
}, 'BASELINE_ANOMALY_REPRODUCED_NOT_FIXED');
check('T10', 'canAct/orders do not establish affordability or terminal legality', () => {
  const g = world(), k = unit(g, 'w', 'K', 15, 4); g.ap = 0;
  assert(E.canAct(g, k)); const to = E.orders(g, k)[0]; assert(Number.isInteger(to));
  const outcome = E.action(g, {type: 'move', unitId: k.id, to}); assert.equal(outcome.ok, false);
  g.winner = 'w'; assert(E.canAct(g, k));
  return {outcome, canActAtZeroCP: true, canActAfterWinner: true, ordersAtZeroCP: E.orders(g, k).length};
});
check('T11', 'only movement can consume a saved bonus activation at zero CP', () => {
  const g = world(), p = unit(g, 'w', 'P', 15, 4); p.job = 'ninja'; p.acted = g.serial; p.bonus = 1; p.ninjaRolled = g.serial; g.ap = 0;
  const saved = E.load(E.dump(g)), loaded = E.byId(saved, p.id);
  assert.equal(loaded.bonus, 1); assert.equal(loaded.acted, saved.serial); assert.equal(loaded.ninjaRolled, saved.serial);
  assert.equal(E.effectiveCost(saved, loaded), 0);
  const denied = E.action(saved, {type: 'rest', unitId: loaded.id}); assert.equal(denied.ok, false);
  const beforeRng = saved.rng, outcome = E.action(saved, {type: 'move', unitId: loaded.id, to: sq(saved, 14, 3)});
  assert(outcome.ok); assert.equal(saved.ap, 0); assert.equal(loaded.bonus, 0); assert.equal(saved.rng, beforeRng);
  return {denied, outcome, ...state(saved, loaded)};
});
check('T12', 'an interrupted Ninja first move rolls once; its bonus never rerolls', () => {
  const g = world(), p = unit(g, 'w', 'P', 15, 4); p.job = 'ninja'; g.rng = 0; g.ap = 1;
  g.terrain[sq(g, 14, 4)] = E.T.WATER;
  const first = E.action(g, {type: 'move', unitId: p.id, to: sq(g, 14, 4)});
  assert(first.ok); assert.equal(p.pos, sq(g, 15, 4)); assert.equal(p.bonus, 1);
  assert.equal(g.ap, 0); assert.equal(p.ninjaRolled, g.serial); const rngAfterFirst = g.rng;
  const second = E.action(g, {type: 'move', unitId: p.id, to: sq(g, 14, 3)});
  assert(second.ok); assert.equal(p.bonus, 0); assert.equal(g.rng, rngAfterFirst);
  return {first, second, rngAfterFirst, ...state(g, p)};
});
check('T13', 'pawn skill protection precedes mercy ward; neither unit moves', () => {
  const g = world(), r = unit(g, 'w', 'R', 15, 4), p = unit(g, 'b', 'P', 15, 6), before = r.pos;
  visible(g); p.skillWard = {source: p.id, until: g.serial}; p.ward = g.serial;
  const outcome = E.action(g, {type: 'move', unitId: r.id, to: p.pos});
  assert(outcome.ok); assert.equal(p.skillWard, null); assert.equal(p.ward, g.serial);
  assert(p.alive); assert.equal(r.pos, before); assert.equal(g.ap, 1); assert.equal(g.lastEvent, null);
  return {outcome, mercyWardStillPresent: p.ward, battleEcho: g.battleEcho, ...state(g, r)};
});
check('T14', 'mercy ward spends the move and writes battleEcho without refreshing sight', () => {
  const g = world(), r = unit(g, 'w', 'R', 15, 4), p = unit(g, 'b', 'P', 15, 6); visible(g); p.ward = g.serial;
  const sightBefore = [...g.players.w.sight], outcome = E.action(g, {type: 'move', unitId: r.id, to: p.pos});
  assert(outcome.ok); assert.equal(p.ward, 0); assert.equal(r.pos, sq(g, 15, 4)); assert(p.alive);
  assert.deepEqual(g.players.w.sight, sightBefore); assert.equal(g.battleEcho[0].pos, r.pos);
  return {outcome, unchangedSight: true, battleEcho: g.battleEcho, ...state(g, r)};
});
check('T15', 'classic King capture completes movement/history before rejecting later turns', () => {
  const g = world(), r = unit(g, 'w', 'R', 15, 4), k = unit(g, 'b', 'K', 15, 6); visible(g);
  const outcome = E.action(g, {type: 'move', unitId: r.id, to: k.pos});
  assert(outcome.ok); assert.equal(k.alive, false); assert.equal(g.winner, 'w');
  assert.equal(r.pos, k.pos); assert.equal(r.history[0].to, k.pos); assert.equal(g.ap, 1);
  const later = E.action(g, {type: 'end'}); assert.equal(later.ok, false); assert.equal(g.side, 'w');
  return {outcome, later, history: r.history, ...state(g, r)};
});
check('T16', 'capturing a Queen is not a royal victory', () => {
  const g = world(), r = unit(g, 'w', 'R', 15, 4), q = unit(g, 'b', 'Q', 15, 6); visible(g);
  const outcome = E.action(g, {type: 'move', unitId: r.id, to: q.pos});
  assert(outcome.ok); assert.equal(q.alive, false); assert.equal(g.winner, null); assert.equal(r.pos, q.pos);
  return {outcome, ...state(g, r)};
});
check('T17', 'nonlethal shield-pip contact spends CP while both pieces remain', () => {
  const g = world({combatMode: 'pips'}), r = unit(g, 'w', 'R', 15, 4), p = unit(g, 'b', 'P', 15, 6); visible(g);
  p.hitsMax = p.hitsRemaining = 2;
  const outcome = E.action(g, {type: 'move', unitId: r.id, to: p.pos});
  assert(outcome.ok); assert.equal(p.hitsRemaining, 1); assert(p.alive); assert.equal(r.pos, sq(g, 15, 4));
  assert.equal(g.ap, 1); assert.equal(g.lastEvent.type, 'shield-hit');
  return {outcome, ...state(g, r)};
});
check('T18', 'pass advances serial/side/round, expires bonuses and uses incoming CP', () => {
  const g = world(), p = unit(g, 'b', 'P', 15, 4); g.side = 'b'; g.serial = 20; g.ap = 0; p.bonus = 1;
  E.king(g, 'w').level = 5; g.beacons = [{side: 'b', pos: p.pos, range: 1, until: 20}];
  const xpBefore = E.king(g, 'w').totalXp, outcome = E.action(g, {type: 'end'});
  assert(outcome.ok); assert.equal(g.side, 'w'); assert.equal(g.serial, 21); assert.equal(g.round, 11);
  assert.equal(g.ap, 4); assert.equal(p.bonus, 0); assert.equal(g.beacons.length, 0);
  assert.equal(g.winner, null); assert.equal(E.king(g, 'w').totalXp, xpBefore);
  return {outcome, ...state(g, p)};
});
check('T19', 'AI choice consumes RNG before execution and repeats from the identical full state', () => {
  const g = world(); unit(g, 'b', 'N', 15, 4); g.side = 'b'; g.serial = 20; g.rng = 112233;
  const twin = JSON.parse(E.dump(g)), beforeRng = g.rng, positionsBefore = g.units.map(u => u.pos);
  const choice = E.aiChoice(g), repeated = E.aiChoice(twin);
  assert.deepEqual(choice, repeated); assert.equal(g.rng, twin.rng); assert.notEqual(g.rng, beforeRng);
  assert.deepEqual(g.units.map(u => u.pos), positionsBefore); const outcome = E.action(g, choice); assert(outcome.ok);
  return {choice, outcome, beforeRng, rngAfterChoice: twin.rng, ...state(g)};
});
check('T20', 'AI returns end at zero CP, null outside Black or after game end', () => {
  const g = world(); assert.equal(E.aiChoice(g), null);
  g.side = 'b'; g.serial = 20; g.ap = 0; assert.deepEqual(E.aiChoice(g), {type: 'end'});
  g.winner = 'w'; const before = g.rng; assert.equal(E.aiChoice(g), null); assert.equal(g.rng, before);
  return {zeroCPChoice: {type: 'end'}, inactiveAndTerminalChoice: null};
});
check('T21', 'a Pawn draft bypasses CP/busy/activation gates without resetting those fields', () => {
  const g = world(), p = unit(g, 'w', 'P', 15, 4); p.level = 3; p.acted = g.serial; g.ap = 0;
  p.project = {kind: 'bridge', pos: sq(g, 14, 4), workerPos: p.pos, remaining: 2, total: 2};
  const projectBefore = JSON.stringify(p.project), skill = E.skillOffers(p)[0];
  const outcome = E.action(g, {type: 'chooseSkill', unitId: p.id, skill});
  assert(outcome.ok); assert.equal(g.ap, 0); assert.equal(p.acted, g.serial);
  assert.equal(JSON.stringify(p.project), projectBefore); assert(p.learnedSkills.includes(skill));
  return {outcome, skill, project: p.project, ...state(g, p)};
});
check('T22', 'Fission charges pre-reset CP and persists one lineage use for both level-1 results', () => {
  const g = world({fissionEnabled: true}), p = unit(g, 'w', 'P', 15, 4); p.level = 60;
  E.prepareSkills(p); p.equippedSkills = ['fission']; visible(g);
  const lineage = p.lineage, costBefore = E.activationCost(g, p), to = sq(g, 14, 4);
  assert.equal(costBefore, 3); const outcome = E.action(g, {type: 'fission', unitId: p.id, to});
  assert(outcome.ok); const child = E.at(g, to);
  assert.equal(p.level, 1); assert.equal(child.level, 1); assert.equal(g.ap, 0);
  assert.equal(child.lineage, lineage); assert.equal(g.usedFissionLineages[lineage], true);
  assert.equal(p.acted, g.serial); assert.equal(child.acted, g.serial);
  const loaded = E.load(E.dump(g)); assert.equal(loaded.usedFissionLineages[lineage], true);
  return {outcome, costBefore, parent: p.id, child: child.id, lineage, ...state(g, p)};
});
const failed = results.filter(x => x.result === 'FAIL').length;
const receipt = {intake_sha: '83a0baa8a4486562c5c67144324cede402f29cf7', source_sha256: sourceHash,
  scope: 'G0 staged source observations; not independent C02 acceptance, C# parity, browser verification, normal-play BUG-001 reproduction or defect repairs',
  cases: results.length, passed: results.length - failed, failed, results};
fs.writeFileSync(output, JSON.stringify(receipt, null, 2) + '\n', 'utf8');
console.log(JSON.stringify({cases: receipt.cases, passed: receipt.passed, failed, output}));
process.exitCode = failed ? 1 : 0;

'use strict';
// C03 source probes for a proposed G0 contract; not independent C02 acceptance.
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const Module = require('node:module');
const vm = require('node:vm');
const ROOT = path.resolve(__dirname, '../..');
const INTAKE = '83a0baa8a4486562c5c67144324cede402f29cf7';
const PREFIX = 'reference/js-v0.5.10/';
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
const blob = name => cp.execFileSync('git', ['show', `${INTAKE}:${PREFIX}${name}`], {cwd: ROOT});
const engineBytes = blob('prototype/engine.js');
assert.equal(hash(engineBytes), '7e0253b99b339611c5e149ccf3a7e527f62d31df008bb3e7fe0145d541b89776');
function loadModule(bytes, name) {
  const filename = path.join(ROOT, PREFIX, name);
  const loaded = new Module(filename, module);
  loaded.filename = filename;
  loaded.paths = Module._nodeModulePaths(path.dirname(filename));
  loaded._compile(bytes.toString('utf8'), filename);
  return loaded.exports;
}
const E = loadModule(engineBytes, 'prototype/engine.js');
const copy = value => JSON.parse(JSON.stringify(value));
const canonical = value => {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object') return Object.fromEntries(
    Object.keys(value).sort().map(key => [key, canonical(value[key])]));
  return value;
};
const digestState = g => hash(JSON.stringify(canonical(g)));
const results = {intake_sha: INTAKE, source_sha256: hash(engineBytes),
  scope: 'C03 source-derived G0 probes; no C# parity, no frozen C02 replay schema, no BUG-001 reproduction',
  assertions: [], fixtures: {}};
function check(name, run) {
  run(); results.assertions.push(name);
}
function newGame(extra = {}) { return E.create({size: 30, seed: 43971, ...extra}); }

check('JSON wire distinctions and key enumeration', () => {
  const wire = E.dump({missing: undefined, nil: null, zero: -0, nan: NaN,
    infinite: Infinity, list: [undefined, null, -0]});
  assert.equal(wire, '{"nil":null,"zero":0,"nan":null,"infinite":null,"list":[null,null,0]}');
  const keys = Object.keys(JSON.parse('{"10":"ten","2":"two","01":"one","x":"x"}'));
  assert.deepEqual(keys, ['2', '10', '01', 'x']);
  results.fixtures.json = {wire, property_enumeration: keys};
});

check('create seed coercion is Number -> ToUint32 -> zero fallback', () => {
  const cases = [ ['missing', undefined, 43971], ['null', null, 43971],
    ['empty-string', '', 43971], ['string-zero', '0', 43971], ['negative', -1, 4294967295],
    ['fraction', 1.9, 1], ['negative-fraction', -1.9, 4294967295],
    ['wrap', 4294967303, 7], ['nan', NaN, 43971], ['infinity', Infinity, 43971] ];
  results.fixtures.seed_coercion = cases.map(([label, input, expected]) => {
    const g = newGame({seed: input}); assert.equal(g.seed, expected);
    return {label, effective_seed: g.seed, rng_after_creation: g.rng, state_hash: digestState(g)};
  });
});

check('source-extracted uint32 RNG vectors and state increment', () => {
  const match = engineBytes.toString('utf8').match(/^const rnum=(g=>\{[^\n]*\});$/m);
  assert(match, 'Locate the exact one-line source RNG without editing the engine');
  const sourceRng = vm.runInNewContext('(' + match[1] + ')');
  results.fixtures.rng = [0, 1, 0x80000000, 0xffffffff, 43971].map(initial => {
    const g = {rng: initial}, draws = [];
    for (let step = 1; step <= 5; step++) {
      const value = sourceRng(g);
      assert.equal(g.rng, (initial + step * 0x6D2B79F5) >>> 0);
      assert(value >= 0 && value < 1);
      draws.push({state: g.rng, numerator_uint32: value * 4294967296, value});
    }
    return {initial, draws};
  });
  results.fixtures.rng_expression_sha256 = hash(match[1]);
});

check('JS midpoint rounding must not use banker rounding', () => {
  results.fixtures.rounding = [-2.5, -1.5, -0.5, 0.5, 1.5, 2.5].map(value =>
    ({value, rounded: Math.round(value), negative_zero: Object.is(Math.round(value), -0)}));
  assert.equal(Math.round(-1.5), -1); assert.equal(Math.round(2.5), 3);
  assert(Object.is(Math.round(-0.5), -0));
});

check('rejections can mutate lastEvent and maester can mutate while returning false', () => {
  const g = newGame(); g.lastEvent = {kind: 'probe'};
  assert.equal(E.action(g, null).ok, false); assert.deepEqual(g.lastEvent, {kind: 'probe'});
  const invalidUnit = E.action(g, {type: 'move', unitId: -1, to: 0});
  assert.equal(invalidUnit.ok, false); assert.equal(g.lastEvent, null);
  const b = g.units.find(u => u.side === 'w' && u.type === 'B'); b.level = 15; g.ap = 9;
  const before = {ap: g.ap, acted: b.acted, job: b.job};
  const outcome = E.action(g, {type: 'maester', unitId: b.id});
  assert.equal(outcome.ok, false); assert.equal(outcome.error, 'Unknown action type.');
  assert.equal(b.job, 'maester'); assert.equal(b.acted, g.serial); assert(g.ap < before.ap);
  results.fixtures.rejection = {invalid_unit: invalidUnit, maester: {before, outcome,
    after: {ap: g.ap, acted: b.acted, job: b.job}}, policy: 'Preserve oracle; report separately, do not repair during port'};
});

check('raw clone and fixed-action replay retain full state, including turn counters', () => {
  const a = newGame(), b = copy(a), trace = [];
  for (let step = 0; step < 8; step++) {
    const u = a.units.find(x => E.canAct(a, x) && E.orders(a, x).length);
    const action = u && a.ap >= E.effectiveCost(a, u)
      ? {type: 'move', unitId: u.id, to: E.orders(a, u)[0]} : {type: 'end'};
    const ao = E.action(a, action), bo = E.action(b, copy(action));
    assert.deepEqual(ao, bo); assert.deepEqual(a, b);
    trace.push({action, outcome: ao, state_hash: digestState(a), side: a.side,
      ap: a.ap, serial: a.serial, round: a.round, rng: a.rng});
  }
  const h = E.load(E.dump(a));
  assert.equal(h.ap, a.ap); assert.equal(h.serial, a.serial); assert.equal(h.round, a.round);
  assert.deepEqual(h.units.map(x => [x.id, x.acted, x.bonus, x.project]),
    a.units.map(x => [x.id, x.acted, x.bonus, x.project]));
  results.fixtures.replay = trace;
});

check('synthetic supported-version matrix preserves armies, camps, queues and used actions', () => {
  const matrix = [];
  for (let version = 5; version <= 15; version++) {
    const g = newGame({startingCamp: 'ready'}); g.version = version; g.ap = 1;
    const pawn = g.units.find(u => u.type === 'P'); pawn.acted = g.serial; pawn.bonus = 1;
    pawn.xp = 2.25; pawn.skillCooldowns.guard = 9;
    const camp = g.camps.find(c => c.side === 'w');
    camp.queue = {kind: 'legacy', mode: 'xp', type: 'P', count: 1,
      remaining: 0, total: 2, started: g.serial - 1, workerId: null, kingId: E.king(g, 'w').id};
    g.g0Unknown = {retained: [null, 2.5]}; pawn.g0Unknown = 'keep';
    const before = copy(g), h = E.load(E.dump(g));
    assert.equal(h.version, 15); assert.equal(h.ap, 1); assert.equal(h.nextId, before.nextId);
    assert.equal(h.serial, before.serial); assert.equal(h.round, before.round); assert.equal(h.side, before.side);
    assert.deepEqual(h.units.map(u => [u.id, u.type, u.side, u.pos, u.alive]),
      before.units.map(u => [u.id, u.type, u.side, u.pos, u.alive]));
    assert.deepEqual(h.camps, before.camps);
    assert.equal(h.units.find(u => u.id === pawn.id).acted, g.serial);
    assert.equal(h.units.find(u => u.id === pawn.id).bonus, 1);
    assert.equal(h.units.find(u => u.id === pawn.id).skillCooldowns.guard, 9);
    assert.deepEqual(h.g0Unknown, before.g0Unknown); assert.equal(h.units.find(u => u.id === pawn.id).g0Unknown, 'keep');
    matrix.push({input_version: version, provenance: 'Synthetic version/normalization gate; not a historical v5-v14 archive',
      output_version: h.version, remaining_queue_ticks: camp.queue.remaining,
      unit_count: h.units.length, camp_count: h.camps.length, ap: h.ap,
      serial: h.serial, log_entries_added: h.log.length - before.log.length});
  }
  results.fixtures.version_matrix = matrix;
});

check('archived real engines preserve old rosters/camps and paid queue state', () => {
  const archiveCases = [];
  for (const name of ['engine_v056.cjs', 'engine_v058.cjs', 'engine_v059.cjs']) {
    const bytes = blob('tests/fixtures/' + name), old = loadModule(bytes, 'tests/fixtures/' + name);
    for (const army of name === 'engine_v056.cjs' ? ['balanced'] : ['traditional', 'middle', 'flat']) {
      const g = old.create({size: 30, seed: 43971, armyW: army, armyB: army});
      const oldVersion = g.version, camp = g.camps.find(c => c.side === 'w');
      let trainingOutcome = null;
      if (camp) {
        const engineer = g.units.find(u => u.alive && u.side === 'w' && u.type === 'V');
        const actor = engineer || old.king(g, 'w');
        if (engineer) engineer.pos = camp.pos; // Staged migration setup, not ordinary-play BUG-001 reproduction.
        trainingOutcome = old.action(g, {type: engineer ? 'trainCamp' : 'summon',
          unitId: actor.id, piece: 'P', to: camp.pos});
        assert.equal(trainingOutcome.ok, true, name + ' paid training setup');
      }
      const before = copy(g), h = E.load(old.dump(g));
      if (name !== 'engine_v056.cjs') {
        assert.equal(before.units.filter(u => u.alive && u.side === 'w').length,
          {traditional: 8, middle: 7, flat: 6}[army]);
      }
      assert.equal(h.ap, before.ap); assert.equal(h.serial, before.serial); assert.equal(h.nextId, before.nextId);
      assert.equal(h.camps.length, before.camps.length);
      assert.deepEqual(h.units.filter(u => u.type !== 'V').map(u => [u.id, u.type, u.side, u.pos, u.alive]),
        before.units.filter(u => u.type !== 'V').map(u => [u.id, u.type, u.side, u.pos, u.alive]));
      assert(h.units.filter(u => u.type === 'V').every(u => !u.alive));
      const beforeQueue = before.camps.find(c => c.side === 'w')?.queue;
      const afterQueue = h.camps.find(c => c.side === 'w')?.queue;
      if (beforeQueue) {
        assert.equal(afterQueue.remaining, beforeQueue.remaining);
        assert.equal(afterQueue.total, beforeQueue.total); assert.equal(afterQueue.started, beforeQueue.started);
        if (beforeQueue.workerId && before.units.some(u => u.id === beforeQueue.workerId && u.type === 'V')) {
          assert.equal(afterQueue.workerId, null); assert.equal(afterQueue.migratedEngineerToRoyal, true);
        }
      }
      archiveCases.push({engine: name, fixture_sha256: hash(bytes), original_schema: oldVersion,
        army, units_per_side: before.units.filter(u => u.alive && u.side === 'w' && u.type !== 'V').length,
        camps_before: before.camps.length, camps_after: h.camps.length,
        training_outcome: trainingOutcome, queue_before: beforeQueue || null, queue_after: afterQueue || null});
    }
  }
  results.fixtures.archived_migrations = archiveCases;
});

check('missing fog memory uses remembered floor, never unseen true terrain', () => {
  const g = newGame(); g.version = 5; g.players.w.seen[0] = 1;
  g.players.w.sight[0] = 0; g.terrain[0] = E.T.MOUNTAIN; delete g.players.w.terrainMemory;
  const h = E.load(E.dump(g)); assert.equal(h.players.w.sight[0], 0);
  assert.equal(h.players.w.terrainMemory[0], E.T.PLAIN); assert.equal(E.rememberedTerrain(h, 'w', 0), E.T.PLAIN);
  results.fixtures.fog_migration = {hidden_true_terrain: h.terrain[0], remembered: h.players.w.terrainMemory[0],
    sight: h.players.w.sight[0], migrated: h.migratedFogMemory};
});

check('load mutates object inputs and refreshes derived sight; raw clone is a separate operation', () => {
  const g = newGame(); g.version = 14; const loaded = E.load(g);
  assert.equal(loaded, g); assert.equal(g.version, 15);
  results.fixtures.load_identity = {mutates_object_argument: true, refreshes_sight: true};
});

check('unsupported admission cases are rejected, not silently upgraded', () => {
  const invalid = [ ['version-4', g => {g.version = 4;}], ['version-16', g => {g.version = 16;}],
    ['wrong-ruleset', g => {g.ruleset = 'other';}], ['string-board-size', g => {g.n = '30';}],
    ['wrong-terrain-length', g => {g.terrain.pop();}], ['missing-seen', g => {delete g.players.w.seen;}] ];
  results.fixtures.rejected_saves = invalid.map(([label, change]) => {
    const g = newGame(); change(g); let error = null;
    try { E.load(E.dump(g)); } catch (e) { error = e.message; }
    assert(error, label); return {label, error};
  });
});

results.result = 'PASS FOR SOURCE PROBES';
results.probe_count = results.assertions.length;
const output = path.join(__dirname, 'g0-contract/source-probes.json');
fs.mkdirSync(path.dirname(output), {recursive: true});
fs.writeFileSync(output, JSON.stringify(results, null, 2) + '\n');
console.log(JSON.stringify({result: results.result, probes: results.probe_count,
  intake_sha: INTAKE, source_sha256: results.source_sha256, output}, null, 2));

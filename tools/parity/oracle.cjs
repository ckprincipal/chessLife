'use strict';
// C02's JS witness adapter. This is a G0 proposal, not a production API or C# engine.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const ROOT = path.resolve(__dirname, '../..');
const INTAKE = '83a0baa8a4486562c5c67144324cede402f29cf7';
const ENGINE_SHA = '7e0253b99b339611c5e149ccf3a7e527f62d31df008bb3e7fe0145d541b89776';
const APP_SHA = 'e5743a2d72455f9ade7d3786ce99c2c7f3864ddfb91810a18747a26a44e3bf53';
const REFERENCE = path.join(ROOT, 'reference/js-v0.5.10');
const sha = value => crypto.createHash('sha256').update(value).digest('hex');

// Tagged trees avoid collisions with user objects and preserve missing/undefined,
// array holes, negative zero and all finite IEEE-754 binary64 values. Object keys
// use JS UTF-16 ordinal order; arrays retain their original, significant order.
function canonical(value, ancestors = new Set()) {
  if (value === null) return ['null'];
  switch (typeof value) {
    case 'undefined': return ['undefined'];
    case 'boolean': return ['boolean', value];
    case 'string': return ['string', value];
    case 'number': {
      if (!Number.isFinite(value)) throw new TypeError('Non-finite numbers are unsupported');
      const bytes = Buffer.alloc(8);
      bytes.writeDoubleBE(value);
      return ['number', bytes.toString('hex')];
    }
    case 'object': break;
    default: throw new TypeError(`Unsupported value: ${typeof value}`);
  }
  if (ancestors.has(value)) throw new TypeError('Cyclic values are unsupported');
  if (Object.getOwnPropertySymbols(value).length) throw new TypeError('Symbol keys are unsupported');
  ancestors.add(value);
  let result;
  if (Array.isArray(value)) {
    assert(Object.keys(value).every(k => /^(0|[1-9][0-9]*)$/.test(k) && Number(k) < value.length),
      'Arrays with extra properties are unsupported');
    result = ['array', Array.from({length: value.length}, (_, i) =>
      Object.hasOwn(value, i) ? canonical(value[i], ancestors) : ['hole'])];
  } else {
    if (![Object.prototype, null].includes(Object.getPrototypeOf(value))) {
      throw new TypeError('Only plain objects are supported');
    }
    if (Object.getOwnPropertyNames(value).length !== Object.keys(value).length) {
      throw new TypeError('Non-enumerable object fields are unsupported');
    }
    result = ['object', Object.keys(value).sort().map(k => {
      const descriptor = Object.getOwnPropertyDescriptor(value, k);
      if (!Object.hasOwn(descriptor, 'value')) throw new TypeError('Accessors are unsupported');
      return [k, canonical(descriptor.value, ancestors)];
    })];
  }
  ancestors.delete(value);
  return result;
}
const digest = value => sha(JSON.stringify(canonical(value)));

function verifySources() {
  const provenance = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/PROVENANCE.json'), 'utf8'));
  for (const entry of provenance.reference_included) {
    const file = path.join(REFERENCE, entry.path);
    assert.equal(sha(fs.readFileSync(file)), entry.sha256, `Immutable reference mismatch: ${entry.path}`);
  }
  assert.equal(sha(fs.readFileSync(path.join(REFERENCE, 'prototype/engine.js'))), ENGINE_SHA);
  assert.equal(sha(fs.readFileSync(path.join(REFERENCE, 'prototype/app.js'))), APP_SHA);
}

function sources() {
  return {
    intake: INTAKE, engineSha256: ENGINE_SHA, appSha256: APP_SHA,
    archived: Object.fromEntries(['056', '058', '059'].map(v => {
      const p = `tests/fixtures/engine_v${v}.cjs`;
      return [p, sha(fs.readFileSync(path.join(REFERENCE, p)))];
    })),
  };
}
function engine() { verifySources(); return require(path.join(REFERENCE, 'prototype/engine.js')); }

// Explicit source-backed observation witness. It is intentionally narrower than
// the eventual C03 DTO: no omniscient enemy fields or current hidden structures.
// orders() geometry is recorded separately from canAct/CP; it is not an action list.
function observation(E, g, side) {
  const bank = g.players[side];
  return {
    side, activeSide: g.side, round: g.round, serial: g.serial, cp: g.ap, winner: g.winner,
    seen: bank.seen, sight: bank.sight,
    terrain: bank.seen.map((_, i) => E.rememberedTerrain(g, side, i)),
    units: g.units.filter(u => E.canObserveUnit(g, side, u)).map(u =>
      ({id: u.id, side: u.side, type: u.type, pos: u.pos})),
    ghosts: E.liveGhosts(g, side),
    friendlyOrders: E.withSide(g, side).map(u => ({
      id: u.id, canAct: E.canAct(g, u), cost: E.activationCost(g, u), orders: E.orders(g, u),
    })),
  };
}
function snapshot(E, g) {
  const before = digest(g);
  const observers = Object.fromEntries(['w', 'b'].map(s => [s, digest(observation(E, g, s))]));
  assert.equal(digest(g), before, 'Observation witness unexpectedly mutated authoritative state');
  return {
    state: before, save: digest(JSON.parse(E.dump(g))), observers,
    side: g.side, round: g.round, serial: g.serial, cp: g.ap, rng: g.rng,
    living: Object.fromEntries(['w', 'b'].map(s => [s, E.withSide(g, s).length])),
  };
}
function initial(E, setup) {
  if (setup.archive) {
    assert(['056', '058', '059'].includes(setup.archive));
    const old = require(path.join(REFERENCE, `tests/fixtures/engine_v${setup.archive}.cjs`));
    return E.load(old.dump(old.create(setup.config)));
  }
  return E.create(setup.config);
}
function recorder(E, setup) {
  let g = initial(E, setup);
  const start = snapshot(E, g), steps = [];
  function run(input) {
    const before = snapshot(E, g);
    let result;
    switch (input.op) {
      case 'action': result = E.action(g, input.action); break;
      case 'aiChoice': result = E.aiChoice(g); break;
      case 'saveRoundtrip': g = E.load(E.dump(g)); result = {version: g.version}; break;
      default: throw new Error(`Unsupported replay operation: ${input.op}`);
    }
    // Clone immediate results so later actions cannot retroactively change them.
    result = result === undefined ? null : JSON.parse(JSON.stringify(result));
    const step = {input, before, result, event: JSON.parse(JSON.stringify(g.lastEvent)), after: snapshot(E, g)};
    steps.push(step);
    return result;
  }
  return {start, steps, run, get state() { return g; }};
}
function replay(E, fixture) {
  const r = recorder(E, fixture.setup);
  assert.deepEqual(r.start, fixture.initial, `${fixture.name}: initial witness differs`);
  for (let i = 0; i < fixture.steps.length; i++) {
    r.run(fixture.steps[i].input);
    assert.deepEqual(r.steps[i], fixture.steps[i], `${fixture.name}: step ${i} differs`);
  }
  return r;
}
module.exports = {ROOT, REFERENCE, INTAKE, ENGINE_SHA, canonical, digest, sha, sources,
  verifySources, engine, observation, snapshot, initial, recorder, replay};

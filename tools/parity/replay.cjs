#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const O = require('./oracle.cjs');
const FILE = path.join(O.ROOT, 'tests/parity/baseline-v0510.json');

function makeCase(E, name, config, archive) {
  const setup = archive ? {config, archive} : {config};
  const r = O.recorder(E, setup);
  const act = action => r.run({op:'action', action});
  act(null); act({}); act({type:'move', unitId:-1, to:-1});
  const wrongSide = E.withSide(r.state, 'b')[0];
  act({type:'move', unitId:wrongSide.id, to:-1});
  const first = E.withSide(r.state,'w').find(u => E.canAct(r.state,u) &&
    E.activationCost(r.state,u)<=r.state.ap && E.orders(r.state,u).length);
  assert(first, `${name}: no legal opening move`);
  const move = {type:'move', unitId:first.id, to:E.orders(r.state,first)[0]};
  assert(act(move).ok);
  // A rejected action clears lastEvent in this reference. Preserve that delta.
  assert(!act({type:'move',unitId:-1,to:-1}).ok);
  assert(!act(move).ok);
  act({type:'end'});
  const chosen = r.run({op:'aiChoice'}); // RNG mutation is a distinct operation.
  assert(chosen);
  assert(act(chosen).ok);
  r.run({op:'saveRoundtrip'});
  return {name, setup, initial:r.start, steps:r.steps};
}
function generate(E) {
  const cases = [];
  for (const army of ['traditional','middle','flat']) {
    for (const size of [30,50,70]) cases.push(makeCase(E, `${army}-${size}-standard`,
      {size,seed:43971,armyW:army,armyB:army,startingCamp:'none'}));
    cases.push(makeCase(E, `${army}-50-quick`,
      {size:50,seed:112233,armyW:army,armyB:army,startingCamp:'ready'}));
  }
  for (const seed of [0,-1,4294967296,43971.75]) cases.push(makeCase(E,`seed-coercion-${seed}`,
    {size:30,seed,armyW:'traditional',armyB:'middle'}));
  cases.push(makeCase(E,'original-command-option',{size:30,seed:88001,commandMode:'original'}));
  for (const archive of ['056','058','059']) cases.push(makeCase(E,`real-archive-${archive}`,
    {size:50,seed:43971,startingCamp:'ready'},archive));
  return {schema:'SM-C02-replay-v1',ruleset:'baseline-v0510',contract:'NOT FROZEN',
    sources:O.sources(),canonicalization:'tagged-binary64-utf16-v1',cases};
}
function check(E, document) {
  assert.equal(document.schema,'SM-C02-replay-v1');
  assert.equal(document.ruleset,'baseline-v0510');
  assert.deepEqual(document.sources,O.sources(),'Source pin changed; do not regenerate goldens to match a candidate');
  let steps=0;
  for (const fixture of document.cases) { O.replay(E,fixture); steps+=fixture.steps.length; }
  return {cases:document.cases.length,steps,engineSha256:O.ENGINE_SHA,contract:'NOT FROZEN'};
}
if (require.main===module) {
  const E=O.engine();
  if (process.argv[2]==='generate') {
    assert(process.argv.includes(`--source=${O.ENGINE_SHA}`),'Explicit --source=<frozen engine SHA256> required');
    assert(!fs.existsSync(FILE),'Golden file exists; review a new version instead of overwriting it');
    fs.mkdirSync(path.dirname(FILE),{recursive:true});
    fs.writeFileSync(FILE,JSON.stringify(generate(E),null,2)+'\n');
    console.log(JSON.stringify({generated:path.relative(O.ROOT,FILE),...check(E,JSON.parse(fs.readFileSync(FILE)))}));
  } else {
    assert(!process.argv[2] || process.argv[2]==='check','Use check or explicit-source generate');
    console.log(JSON.stringify({result:'PASS JS replay only',...check(E,JSON.parse(fs.readFileSync(FILE)))}));
  }
}
module.exports={generate,check};

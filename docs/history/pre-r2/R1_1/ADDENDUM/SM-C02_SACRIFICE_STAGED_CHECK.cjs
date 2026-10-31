/* Positive-control test for Stale-Mate v0.5.10 only. Not a real-world UI bug reproduction.
   Run from extracted JS source root:
       node /path/to/ADDENDUM/SM-C02_SACRIFICE_STAGED_CHECK.cjs prototype/engine.js
   Simulates real 3-tick camp construction, then 2-tick pawn sacrifice production,
   but expedites leveling to L4 because an ordinary long game would take much longer.
*/
'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const E = require(path.resolve(process.argv[2] || 'prototype/engine.js'));
let passed=0;
for (const army of ['traditional','middle','flat']) for (const seed of [43971,112233,88001]) {
  const g=E.create({size:50, seed, armyW:army, armyB:army, startingCamp:'none'});
  const pawn=E.withSide(g,'w').find(u=>u.type==='P');
  assert(pawn,`missing pawn in ${army}`);
  assert.equal(g.camps.length,0,'Standard must have no prebuilt camp');
  pawn.level=4; E.prepareSkills(pawn); g.terrain[pawn.pos]=E.T.PLAIN; E.refreshBoth(g);
  const work=E.action(g,{type:'build',unitId:pawn.id,project:'camp',to:pawn.pos});
  assert(work.ok,`could not begin construction: ${work.error}`);
  for(let i=0;i<3;i++){E.endTurn(g);E.endTurn(g);}
  const camp=g.camps.find(c=>c.pos===pawn.pos&&c.side==='w');
  assert(camp,'camp did not finish construction');
  const pre=E.withSide(g,'w').filter(u=>u.type==='P').length;
  const result=E.action(g,{type:'trainCamp',unitId:pawn.id,piece:'P',mode:'sacrifice'});
  assert(result.ok,`sacrifice rejected: ${result.error}`);
  assert.equal(pawn.alive,false,'sacrificed Pawn should disappear now');
  assert.equal(camp.queue?.count,2,'must queue exactly 2 pawns');
  assert.equal(camp.queue?.remaining,2,'must initially require two own ticks');
  for(let i=0;i<2;i++){E.endTurn(g);E.endTurn(g);}
  assert.equal(camp.queue,null,`camp batch still queued (perhaps exits blocked): ${army}/${seed}`);
  assert.equal(E.withSide(g,'w').filter(u=>u.type==='P').length,pre+1,'lost one operator, gained two trainees');
  passed++;
  console.log(`PASS staged positive control ${passed} (${army}, seed=${seed})`);
}
console.log(`${passed}/${passed} PASS. User's live UI symptom is UNREPRODUCED; investigate independent browser/save path.`);

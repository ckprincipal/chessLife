'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const O=require('../../tools/parity/oracle.cjs');
const E=O.engine();
test('canonicalization preserves numeric bits, nullability, array order and holes',()=>{
  assert.equal(O.digest({b:2,a:1}),O.digest({a:1,b:2}));
  for(const [a,b] of [[-0,0],[null,undefined],[{}, {x:undefined}],[[1,2],[2,1]],[[,],[undefined]],[0.1+0.2,0.3]]) {
    assert.notEqual(O.digest(a),O.digest(b));
  }
  assert.throws(()=>O.digest(NaN)); assert.throws(()=>O.digest(Infinity));
  assert.throws(()=>O.digest(new Set([1]))); assert.throws(()=>O.digest(1n));
  const cycle={};cycle.self=cycle;assert.throws(()=>O.digest(cycle));
});
test('observer witness cannot reveal a current change to unseen terrain',()=>{
  const g=E.create({size:50,seed:43971});
  const pos=g.players.w.sight.findIndex((s,i)=>!s&&g.terrain[i]!==E.T.SHRINE);
  assert(pos>=0);
  const twin=JSON.parse(E.dump(g));
  twin.terrain[pos]=g.terrain[pos]===E.T.WATER?E.T.PLAIN:E.T.WATER;
  assert.notEqual(O.digest(g),O.digest(twin));
  assert.equal(O.digest(O.observation(E,g,'w')),O.digest(O.observation(E,twin,'w')));
});
test('rejected action clears a prior event in an explicitly staged witness state',()=>{
  const g=E.create({size:30,seed:43971});
  const u=E.withSide(g,'w').find(u=>E.orders(g,u).length&&E.activationCost(g,u)<=g.ap);
  assert(E.action(g,{type:'move',unitId:u.id,to:E.orders(g,u)[0]}).ok);
  g.lastEvent={type:'prior-observed-event',unitId:u.id};
  const before=O.digest(g),ap=g.ap;
  assert(!E.action(g,{type:'move',unitId:-1,to:-1}).ok);
  assert.equal(g.lastEvent,null);assert.equal(g.ap,ap);assert.notEqual(O.digest(g),before);
});
test('golden replay detects an altered outcome rather than accepting it',()=>{
  const document=JSON.parse(fs.readFileSync(path.join(__dirname,'baseline-v0510.json')));
  const fixture=structuredClone(document.cases[0]);
  fixture.steps[0].result.ok=true;
  assert.throws(()=>O.replay(E,fixture),/step 0 differs/);
});

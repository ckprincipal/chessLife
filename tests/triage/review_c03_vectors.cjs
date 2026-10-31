#!/usr/bin/env node
'use strict';
// Independent bounded review of the named C03 revision, never an acceptance of
// its unimplemented runtime. Fetch origin sm/c03-r2-state before running.
const fs=require('node:fs');
const path=require('node:path');
const cp=require('node:child_process');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const O=require('../../tools/parity/oracle.cjs');
const E=O.engine();
const proposal='c2806a2bdf3a888567a694cdd3d05a5e62f7bb35';
const data=JSON.parse(cp.execFileSync('git',['show',`${proposal}:evidence/SM-C03/g0-contract/source-probes.json`],{cwd:O.ROOT,encoding:'utf8'}));
assert.equal(data.source_sha256,O.ENGINE_SHA);
const source=fs.readFileSync(path.join(O.REFERENCE,'prototype/engine.js'),'utf8');
const expression=source.match(/^const rnum=g=>(\{.*\});$/m);
assert(expression,'Cannot locate exact frozen rnum expression');
const draw=vm.runInNewContext(`(g=>${expression[1]})`);
let vectors=0;
for(const vector of data.fixtures.rng){
  const g={rng:vector.initial};
  for(const expected of vector.draws){
    const value=draw(g);
    assert.equal(g.rng,expected.state);
    assert.equal(value*4294967296,expected.numerator_uint32);
    assert.equal(value,expected.value);
    vectors++;
  }
}
for(const vector of data.fixtures.rounding){
  const value=Math.round(vector.value);
  // C03's JSON number stores -0 as 0 and retains its sign in this explicit tag.
  assert.equal(value,vector.negative_zero?-0:vector.rounded);
  assert.equal(Object.is(value,-0),vector.negative_zero);
}
const migrations=[];
for(const row of data.fixtures.archived_migrations){
  assert.equal(O.sha(fs.readFileSync(path.join(O.REFERENCE,'tests/fixtures',row.engine))),row.fixture_sha256);
  const old=require(path.join(O.REFERENCE,'tests/fixtures',row.engine));
  const raw=old.create({size:50,seed:43971,armyW:row.army,armyB:row.army});
  assert.equal(raw.version,row.original_schema);
  const loaded=E.load(old.dump(raw));
  const oldCounts=['w','b'].map(s=>raw.units.filter(u=>u.alive&&u.type!=='V'&&u.side===s).length);
  const newCounts=['w','b'].map(s=>E.combatUnits(loaded,s).length);
  assert.deepEqual(newCounts,oldCounts);
  assert.equal(loaded.camps.length,raw.camps.length);
  migrations.push({engine:row.engine,army:row.army,inputVersion:raw.version,oldCounts,newCounts,camps:loaded.camps.length});
}
const g=E.create({size:50,seed:43971});
const bishop=E.withSide(g,'w').find(u=>u.type==='B');
bishop.level=15; // Explicit staged precondition; not an ordinary BUG-001 trace.
const before={cp:g.ap,job:bishop.job,acted:bishop.acted,serial:g.serial,log:g.log.length};
const result=E.action(g,{type:'maester',unitId:bishop.id});
const after={cp:g.ap,job:bishop.job,acted:bishop.acted,serial:g.serial,log:g.log.length};
assert.deepEqual(result,{ok:false,error:'Unknown action type.'});
assert.equal(after.cp,before.cp-1);
assert.equal(after.acted,before.serial);
assert.equal(after.job,'maester');
assert(after.log>before.log);
const report={reviewedC03Revision:proposal,sourceSha256:O.ENGINE_SHA,
  result:'PASS for 25 RNG draws, six rounding cases, seven archived roster/camp preservation samples, and independent Maester observation only',
  rngDraws:vectors,roundingCases:data.fixtures.rounding.length,migrations,
  maester:{staging:'Only Bishop.level=15; original valid 3-CP budget retained',before,result,after,
    status:'Independently corroborated frozen-source behavior; no repair or C00 defect acceptance claimed'},
  limits:['C03 schema admission/codec implementation not certified','No C# RNG implementation tested',
    'Historical versions 5-10 and 12 remain synthetic/unsupported archive provenance','BUG-001 stays separate and unresolved']};
const out=path.join(O.ROOT,'evidence/SM-C02/g0-candidate-20261031/c03-review-results.json');
fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({result:report.result,reviewedC03Revision:proposal,rngDraws:vectors,maester:report.maester}));

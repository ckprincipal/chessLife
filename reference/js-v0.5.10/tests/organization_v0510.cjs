'use strict';
// Current v0.5.10 organizational roster, no-camp default, optional ready-camp and save compatibility.
const assert=require('node:assert/strict');
const E=require('../prototype/engine.js');
const Old=require('./fixtures/engine_v058.cjs');
const Old09=require('./fixtures/engine_v059.cjs');
let passed=0;
function check(name,fn){try{fn();console.log(`PASS org ${++passed}: ${name}`);}catch(e){console.error('FAIL org: '+name);throw e;}}
const expected={
 traditional:{K:1,Q:1,R:2,N:2,B:2,P:2},
 middle:{K:1,Q:0,R:0,N:2,B:0,P:6},
 flat:{K:1,Q:0,R:0,N:0,B:0,P:9}
};
function count(g,side){return E.withSide(g,side).reduce((o,u)=>(o[u.type]=(o[u.type]||0)+1,o),{});}
function verify(g,side,id,startingCamp='none'){
 const units=E.withSide(g,side),got=count(g,side),need=expected[id];
 for(const [piece,n] of Object.entries(need))assert.equal(got[piece]||0,n,`${id}/${side}/${piece}`);
 assert.equal(units.length,Object.values(need).reduce((a,b)=>a+b,0));
 assert.equal(E.king(g,side).xp,3);assert.equal(E.civilians(g,side).length,0);
 assert.equal(E.combatUnits(g,side).length,units.length);
 const camps=g.camps.filter(c=>c.side===side);assert.equal(camps.length,startingCamp==='ready'?1:0,`${id}/${side}/camps`);
 if(camps.length){const camp=camps[0];assert.equal(g.terrain[camp.pos],E.T.CAMP);assert(!E.at(g,camp.pos));assert(E.withSide(g,side).some(p=>p.type==='P'&&E.orders(g,p).includes(camp.pos)),`camp not one-turn accessible: ${id}/${side}`);}
 assert.equal(E.commandPower(g,side),3);assert.equal(E.activationCost(g,E.king(g,side)),1);
 assert.equal(E.trainingCapacity(g,side),20-units.length);
}
check('three organizational modes and exact original user-selected piece counts',()=>{
 assert.deepEqual(E.ORG_MODES,['traditional','middle','flat']);
 for(const id of E.ORG_MODES){assert.equal(E.PRESETS[id].pawns,expected[id].P);assert.equal(E.PRESETS[id].structure,id);}
 assert.equal(E.PRESETS.traditional.back,'RNBQKBNR');
});
check('new default is Traditional + 2 Rooks, no engineer, no camp',()=>{
 const g=E.create();assert.equal(g.version,15);assert.equal(g.armyW,'traditional');assert.equal(g.armyB,'traditional');assert.equal(g.startingCamp,'none');
 verify(g,'w','traditional');verify(g,'b','traditional');assert.equal(g.camps.length,0);
});
for(const n of [30,50,70])for(const a of E.ORG_MODES)for(const b of E.ORG_MODES){
 check(`${n}x${n} ${a} vs ${b}: exact units, fog, no camp and save roundtrip`,()=>{
  const g=E.create({size:n,seed:459701+n,armyW:a,armyB:b});verify(g,'w',a);verify(g,'b',b);
  assert.equal(g.winner,null);assert.equal(g.ap,3);assert.equal(g.players.w.seen.length,n*n);
  const h=E.load(E.dump(g));assert.equal(h.armyW,a);assert.equal(h.armyB,b);assert.equal(h.startingCamp,'none');assert.equal(h.camps.length,0);
 });
}
check('standard opening cannot use King XP for recruitment before camp construction',()=>{
 for(const id of E.ORG_MODES){const g=E.create({armyW:id,armyB:id}),k=E.king(g,'w');
  assert.equal(E.eligibleTrainingCamps(g,'w').length,0);assert.equal(E.eligibleSummons(g,k,'P').length,0);
  assert.equal(E.action(g,{type:'summon',unitId:k.id,piece:'P',to:k.pos}).ok,false);
  assert.equal(k.xp,3);assert.equal(g.ap,3);
 }
});
check('a level-4 Pawn can construct the first camp; King can then recruit',()=>{
 for(const id of E.ORG_MODES){const g=E.create({armyW:id,armyB:id});const p=E.withSide(g,'w').find(u=>u.type==='P');p.level=4;
  g.terrain[p.pos]=E.T.PLAIN;E.refreshBoth(g);
  assert(E.eligibleBuilderTargets(g,p,'camp').includes(p.pos),id);
  const result=E.action(g,{type:'build',unitId:p.id,project:'camp',to:p.pos});assert(result.ok,result.error);
  for(let i=0;i<3;i++){assert(E.action(g,{type:'end'}).ok);assert(E.action(g,{type:'end'}).ok);}
  const c=g.camps.find(q=>q.side==='w');assert(c,id+' no finished camp');assert.equal(c.pos,p.pos);
  const k=E.king(g,'w'),before=k.xp;const s=E.action(g,{type:'summon',unitId:k.id,piece:'P',to:c.pos});assert(s.ok,s.error);
  assert(Math.abs(k.xp-(before-3))<1e-8);assert(c.queue);
 }
});
check('Quick Start optional camp remains reachable on all board sizes and modes',()=>{
 for(const n of [30,50,70])for(const id of E.ORG_MODES){const g=E.create({size:n,seed:8444+n,armyW:id,armyB:id,startingCamp:'ready'});
  assert.equal(g.startingCamp,'ready');verify(g,'w',id,'ready');verify(g,'b',id,'ready');
 }
});
check('Quick Start King XP recruiting still works, including Flatten',()=>{
 const g=E.create({armyW:'flat',armyB:'flat',startingCamp:'ready'}),k=E.king(g,'w'),c=g.camps.find(x=>x.side==='w');
 assert.equal(E.queen(g,'w'),undefined);const res=E.action(g,{type:'summon',unitId:k.id,piece:'P',to:c.pos});assert(res.ok,res.error);
 assert.equal(g.ap,2);assert.equal(k.xp,0);assert.equal(c.queue.remaining,2);
});
check('rook2, bishop1, queen3, knight1 and pawn1 have no organizational discount',()=>{
 for(const id of E.ORG_MODES){const g=E.create({armyW:id,armyB:id});for(const u of E.withSide(g,'w')){
  const wanted={R:2,B:1,Q:3,N:1,P:1,K:1}[u.type];assert.equal(E.activationCost(g,u),wanted,`${id}/${u.type}`);
 }assert.equal(g.ap,3);}
});
check('a pawn can make a legal initial move from each organizational structure',()=>{
 for(const id of E.ORG_MODES){const g=E.create({armyW:id,armyB:id});const pawn=E.withSide(g,'w').find(u=>u.type==='P'&&E.orders(g,u).length);
  assert(pawn,id);const target=E.orders(g,pawn).find(pos=>!E.at(g,pos));assert(Number.isInteger(target));
  const ret=E.action(g,{type:'move',unitId:pawn.id,to:target});assert(ret.ok,ret.error);assert.equal(g.ap,2);}
});
check('historical Balanced/Explorers/Fortress remain supported without a camp by default',()=>{
 for(const id of ['balanced','expedition','bastion']){const g=E.create({armyW:id,armyB:id});for(const side of ['w','b']){
  assert.equal(E.withSide(g,side).filter(u=>u.type==='P').length,3);assert(E.queen(g,side));}
  assert.equal(g.camps.length,0);}
});
check('real saved v0.5.8 games retain old rosters, starting camp, levels and skill selections',()=>{
 for(const id of ['traditional','middle','flat']){const old=Old.create({armyW:id,armyB:id,seed:7888}),p=Old.withSide(old,'w').find(u=>u.type==='P');
  p.level=3;Old.prepareSkills(p);assert(Old.action(old,{type:'chooseSkill',unitId:p.id,skill:Old.skillOffers(p)[0]}).ok);
  old.ap=1;const oldTotals=Object.fromEntries(['w','b'].map(side=>[side,Old.withSide(old,side).reduce((o,u)=>(o[u.type]=(o[u.type]||0)+1,o),{})]));
  const got=E.load(Old.dump(old));assert.equal(got.version,15);assert.equal(got.startingCamp,'ready');assert.equal(got.camps.length,2);
  assert.deepEqual(count(got,'w'),oldTotals.w);assert.deepEqual(count(got,'b'),oldTotals.b);
  assert.deepEqual(E.byId(got,p.id).skillChoices,p.skillChoices);assert.equal(got.ap,1);}
});
check('real v0.5.9 saves retain the old 8/7/6 rosters and any optional camp',()=>{
 for(const id of ['traditional','middle','flat'])for(const startingCamp of ['none','ready']){
  const old=Old09.create({armyW:id,armyB:id,startingCamp,seed:7234}),p=Old09.withSide(old,'w').find(u=>u.type==='P');
  p.level=3;Old09.prepareSkills(p);assert(Old09.action(old,{type:'chooseSkill',unitId:p.id,skill:Old09.skillOffers(p)[0]}).ok);
  const before=Object.fromEntries(['w','b'].map(side=>[side,Old09.withSide(old,side).reduce((o,u)=>(o[u.type]=(o[u.type]||0)+1,o),{})]));
  const h=E.load(Old09.dump(old));assert.equal(h.version,15);assert.equal(h.armyW,id);assert.equal(h.armyB,id);
  assert.equal(h.startingCamp,startingCamp);assert.equal(h.camps.length,startingCamp==='ready'?2:0);
  assert.deepEqual(count(h,'w'),before.w);assert.deepEqual(count(h,'b'),before.b);
  assert.deepEqual(E.byId(h,p.id).skillChoices,p.skillChoices);
 }
});
check('new save from no-camp game roundtrips without inventing structures',()=>{
 const g=E.create({armyW:'flat',armyB:'traditional',seed:90731});g.ap=1;
 const h=E.load(E.dump(g));assert.equal(h.version,15);assert.equal(h.startingCamp,'none');assert.equal(h.camps.length,0);
 assert.deepEqual(count(h,'w'),count(g,'w'));assert.deepEqual(count(h,'b'),count(g,'b'));assert.equal(h.ap,1);
});
check('random seed determinism, all 30/50/70 opening variants, no overlap or invisible camp',()=>{
 for(const id of E.ORG_MODES)for(const n of [30,50,70])for(const seed of [1,2,3,4,5,6,7,8])for(const opt of ['none','ready']){
  const a=E.create({size:n,seed,armyW:id,armyB:id,startingCamp:opt}),b=E.create({size:n,seed,armyW:id,armyB:id,startingCamp:opt});
  assert.equal(E.dump(a),E.dump(b));for(const side of ['w','b']){
   const s=new Set(E.withSide(a,side).map(u=>u.pos));assert.equal(s.size,E.withSide(a,side).length);
  }for(const camp of a.camps){assert.equal(a.terrain[camp.pos],E.T.CAMP);assert.equal(E.at(a,camp.pos),undefined);}
 }
});
check('the AI makes valid commands without a starting camp in every organization',()=>{
 for(const id of E.ORG_MODES){const g=E.create({armyW:id,armyB:id,seed:8123});for(let i=0;i<8&&!g.winner;i++){
  if(g.side==='w')assert(E.action(g,{type:'end'}).ok);
  for(let j=0;j<5&&g.side==='b'&&!g.winner;j++){const a=E.aiChoice(g);if(!a||a.type==='end')break;
   const out=E.action(g,a);assert(out.ok,JSON.stringify({id,a,error:out.error}));}
  if(g.side==='b')assert(E.action(g,{type:'end'}).ok);
 }}
});
console.log(`ORGANIZATION v0.5.10: ${passed}/${passed} checks passed`);

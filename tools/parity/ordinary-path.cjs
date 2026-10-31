#!/usr/bin/env node
'use strict';
// Reach a camp with a naturally progressed pawn. Only E.create, E.action and
// E.aiChoice may advance the game; no XP/level/terrain/unit/queue mutation.
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const O=require('./oracle.cjs');
const E=O.engine();

function attempt(config,maxRounds=75) {
  const g=E.create(config), steps=[];
  const pawn=E.withSide(g,'w').filter(u=>u.type==='P').sort((a,b)=>
    E.manhattan(g,a.pos,E.idx(g,g.n/2,g.n/2))-E.manhattan(g,b.pos,E.idx(g,g.n/2,g.n/2)))[0];
  const milestone=[];
  function action(a) {
    const result=E.action(g,a);
    steps.push({op:'action',action:a,result:structuredClone(result)});
    assert(result.ok,JSON.stringify({a,result}));
    if(milestone.at(-1)?.level!==pawn.level)milestone.push({step:steps.length,round:g.round,level:pawn.level,totalXp:pawn.totalXp});
  }
  function moveCandidates(u) {
    return E.orders(g,u).filter(to=>E.apparentEnemy(g,'w',to)?.type!=='K').map(to=>({type:'move',unitId:u.id,to}));
  }
  while(!g.winner&&pawn.alive&&g.round<=maxRounds) {
    if(g.side==='b') {
      const chosen=E.aiChoice(g);
      steps.push({op:'aiChoice',result:structuredClone(chosen)});
      action(chosen||{type:'end'});
      continue;
    }
    const camp=(g.camps||[]).find(c=>c.side==='w'&&c.pos===pawn.pos&&!c.queue);
    if(camp&&E.canOperateCamp(pawn)&&E.canAct(g,pawn)&&g.ap>=E.activationCost(g,pawn)) {
      return {config,operatorId:pawn.id,steps,milestones:milestone,preSacrifice:JSON.parse(E.dump(g)),
        progression:'Unmodified standard new game; all advancement through accepted actions and actual reference black AI'};
    }
    const offers=E.skillOffers(pawn);
    if(offers.length){action({type:'chooseSkill',unitId:pawn.id,skill:offers[0]});continue;}
    if(E.canAct(g,pawn)&&g.ap>=E.activationCost(g,pawn)) {
      const camps=E.eligibleBuilderTargets(g,pawn,'camp');
      if(camps.length){action({type:'build',unitId:pawn.id,project:'camp',to:camps[0]});continue;}
      const forest=E.eligibleBuilderTargets(g,pawn,'clear_forest');
      if(forest.length&&pawn.level<4){action({type:'build',unitId:pawn.id,project:'clear_forest',to:forest[0]});continue;}
      const candidates=moveCandidates(pawn).map(a=>{
        const twin=JSON.parse(E.dump(g)),u=E.byId(twin,pawn.id);
        const result=E.action(twin,a);
        if(!result.ok)return {a,score:-Infinity};
        const fresh=(u.totalXp-pawn.totalXp),knownShrines=g.shrines.filter(j=>g.players.w.seen[j]&&
          (g.players.w.shrineClaim[j]===undefined||g.round-g.players.w.shrineClaim[j]>=7));
        const shrineDistance=knownShrines.length?Math.min(...knownShrines.map(j=>E.manhattan(g,a.to,j))):0;
        const visibleEnemies=E.withSide(g,'b').filter(e=>E.canObserveUnit(g,'w',e));
        const danger=visibleEnemies.filter(e=>E.distance(g,a.to,e.pos)<=2).length;
        return {a,score:fresh*100+(u.level-pawn.level)*1000-shrineDistance*2-danger*40};
      }).sort((a,b)=>b.score-a.score||a.a.to-b.a.to);
      if(candidates.length){action(candidates[0].a);continue;}
      for(const project of ['bridge','excavate']){
        const targets=E.eligibleBuilderTargets(g,pawn,project);
        if(targets.length){action({type:'build',unitId:pawn.id,project,to:targets[0]});break;}
      }
      if(pawn.project)continue;
    }
    // Other white pieces may protect the worker with ordinary visible captures.
    const defense=[];
    for(const u of E.withSide(g,'w')) {
      if(u===pawn||!E.canAct(g,u)||E.activationCost(g,u)>g.ap)continue;
      for(const a of moveCandidates(u)){
        const victim=E.apparentEnemy(g,'w',a.to);
        if(victim)defense.push({a,score:E.V[victim.type]*10-E.distance(g,a.to,pawn.pos)});
      }
    }
    defense.sort((a,b)=>b.score-a.score||a.a.unitId-b.a.unitId||a.a.to-b.a.to);
    if(defense.length){action(defense[0].a);continue;}
    action({type:'end'});
  }
  return {failed:true,config,round:g.round,operatorId:pawn.id,level:pawn.level,totalXp:pawn.totalXp,
    alive:pawn.alive,winner:g.winner,steps:steps.length};
}
function replayOrdinary(trace) {
  if(trace.sources)assert.deepEqual(trace.sources,O.sources(),'Ordinary trace source pin changed');
  const g=E.create(trace.config);
  for(const [index,step] of trace.steps.entries()) {
    const result=step.op==='aiChoice'?E.aiChoice(g):E.action(g,step.action);
    assert.deepEqual(result,step.result,`Ordinary trace diverged at ${index}`);
    if(step.op==='action')assert(result.ok);
  }
  assert.equal(O.digest(g),O.digest(trace.preSacrifice),'Ordinary final save differs');
  const u=E.byId(g,trace.operatorId);
  assert(u&&u.level>=4&&u.type==='P'&&E.canAct(g,u));
  assert(g.camps.some(c=>c.side==='w'&&c.pos===u.pos&&!c.queue));
  return g;
}
if(require.main===module){
  const out=path.join(O.ROOT,'tests/triage/ordinary-v0510.json');
  if(process.argv[2]==='check'){
    const trace=JSON.parse(fs.readFileSync(out));
    replayOrdinary(trace);console.log(JSON.stringify({result:'PASS ordinary legal trace',seed:trace.config.seed,steps:trace.steps.length}));
  }else{
    assert(!fs.existsSync(out),'Existing ordinary trace must not be overwritten');
    const failures=[];
    for(const seed of [43971,112233,88001,...Array.from({length:24},(_,i)=>i+1)]){
      const trace=attempt({size:50,seed,armyW:'traditional',armyB:'traditional',startingCamp:'none'});
      if(trace.failed){failures.push(trace);continue;}
      replayOrdinary(trace);
      fs.mkdirSync(path.dirname(out),{recursive:true});
      fs.writeFileSync(out,JSON.stringify({schema:'SM-C02-ordinary-v1',sources:O.sources(),searchFailures:failures,...trace},null,2)+'\n');
      console.log(JSON.stringify({result:'Reached camp by ordinary actions with actual black AI; BUG-001 not yet diagnosed',seed,steps:trace.steps.length,round:trace.preSacrifice.round,level:trace.preSacrifice.units.find(u=>u.id===trace.operatorId).level,priorFailedAttempts:failures}));
      process.exit(0);
    }
    console.log(JSON.stringify({result:'UNRESOLVED: bounded search did not reach ordinary camp',failures}));process.exitCode=2;
  }
}
module.exports={attempt,replayOrdinary};

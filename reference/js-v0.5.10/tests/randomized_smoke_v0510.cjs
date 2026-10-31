'use strict';
const assert=require('node:assert/strict');
const E=require('../prototype/engine.js');
let matches=0,actions=0,validations=0,projects=0,queues=0,promotedMaps=0;
const randSeed=v=>{let x=v>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return (x>>>0)/4294967296;};};
function validate(g){
 const places=new Set();
 for(const u of g.units){
  if(!u.alive)continue;
  assert(u.pos>=0&&u.pos<g.n*g.n);
  if(u.project){assert(['V','P'].includes(u.type));assert.equal(u.pos,u.project.workerPos??u.project.pos);assert(E.distance(g,u.pos,u.project.pos)<=1);assert(u.project.remaining>=0);assert.deepEqual(E.orders(g,u),[]);}
  if(u.type!=='V'){assert(!places.has(u.pos),`overlap ${g.n}/${g.seed}/${u.pos}`);places.add(u.pos);assert(E.canEnter(g,u,u.pos),`illegal terrain ${g.n}/${g.seed}/${u.type}/${u.pos}`);}
 }
 for(const side of ['w','b']){assert(E.combatUnits(g,side).length<=20);assert(E.trainingCapacity(g,side)>=0);}
 assert(g.ap>=0&&g.ap<=9);
 for(const c of g.camps)if(c.queue){assert(c.queue.count>=1&&c.queue.count<=2);assert(c.queue.remaining>=0);assert(['P','N','B'].includes(c.queue.type));
  if(c.queue.workerId){const u=E.byId(g,c.queue.workerId);assert(u&&u.side===c.side&&u.pos===c.pos&&u.project?.kind==='training');}
 }
 assert.equal(new Set(g.camps.map(c=>c.pos)).size,g.camps.length);
 assert.equal(new Set(g.towers.map(t=>t.pos)).size,g.towers.length);
 validations++;
}
for(const size of [30,50,70])for(let seed=1;seed<=12;seed++){
 const rng=randSeed(seed*137+size),g=E.create({size,seed,armyW:E.ORG_MODES[(seed-1)%3],armyB:E.ORG_MODES[seed%3],routeW:['war','phantom','choice'][seed%3]});
 // Twelve of the 36 maps start with staged pawn levels to stress every work unlock.
 if(seed%3===0){for(const side of ['w','b'])E.withSide(g,side).filter(u=>u.type==='P').forEach((u,i)=>{u.level=1+i%4;E.prepareSkills(u);});promotedMaps++;}
 E.refreshBoth(g);validate(g);
 for(let phase=0;phase<80&&!g.winner;phase++){
  let did=0;
  while(did++<8){
   const opts=[];
   for(const u of E.withSide(g,g.side)){
    if(!E.canAct(g,u)||E.effectiveCost(g,u)>g.ap)continue;
    for(const target of E.orders(g,u))opts.push({type:'move',unitId:u.id,to:target});
    if(E.isWorker(u)){
     for(const kind of Object.keys(E.WORK_PROJECTS))for(const target of E.eligibleBuilderTargets(g,u,kind))opts.push({type:'build',unitId:u.id,project:kind,to:target});
     const c=E.eligibleTrainingCamps(g,u.side).find(c=>c.pos===u.pos),k=E.king(g,u.side);
     if(c&&E.canOperateCamp(u))for(const piece of ['P','N','B']){
      if(u.type==='P')for(const mode of ['stay','sacrifice']){
       if(E.trainingCapacity(g,u.side)+(mode==='sacrifice'?1:0)>=E.pawnBatchSize(piece))opts.push({type:'trainCamp',unitId:u.id,piece,mode});
      }
      else if(k&&k.xp>=E.TRAIN_XP[piece]&&E.trainingCapacity(g,u.side)>=1)opts.push({type:'trainCamp',unitId:u.id,piece});
     }
    }
   }
   if(!opts.length||rng()<0.15)break;
   const a=opts[Math.floor(rng()*opts.length)],r=E.action(g,a);
   assert(r.ok,JSON.stringify({size,seed,action:a,error:r.error}));actions++;if(a.type==='build')projects++;if(a.type==='trainCamp')queues++;
   validate(g);if(g.winner)break;
  }
  if(g.winner)break;
  assert(E.action(g,{type:'end'}).ok);validate(g);
 }
 // Live state must still serialize and restore after the mixed-action trace.
 validate(E.load(E.dump(g)));matches++;
}
console.log(`RANDOMIZED v0.5.10: ${matches} seeded maps (${promotedMaps} with staged pawn levels), ${actions} actions, ${projects} projects, ${queues} queues, ${validations} state invariant checks PASSED.`);

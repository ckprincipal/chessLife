'use strict';
const assert=require('node:assert/strict'),E=require('../prototype/engine.js');
let matches=0,actions=0,drafts=0,skillActions=0,builds=0,checks=0;
const random=v=>{let x=v>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296;};};
function validate(g){const occupied=new Set();for(const u of g.units){if(!u.alive)continue;
 assert(u.pos>=0&&u.pos<g.n*g.n);assert(u.equippedSkills.length<=E.skillCapacity(u));assert.equal(new Set(u.equippedSkills).size,u.equippedSkills.length);
 assert(u.equippedSkills.every(id=>u.learnedSkills.includes(id)));assert.equal(new Set(u.skillChoices.map(x=>x.level)).size,u.skillChoices.length);
 if(u.type!=='V'){assert(!occupied.has(u.pos),'collision');occupied.add(u.pos);assert(E.canEnter(g,u,u.pos),'stranded unit');}
 if(u.project){assert.equal(u.pos,u.project.workerPos??u.project.pos);assert(E.distance(g,u.pos,u.project.pos)<=1);assert(u.project.remaining>=0);assert.deepEqual(E.orders(g,u),[]);}
 if(u.type==='P'&&E.pendingSkillLevels(u).length)assert.equal(E.skillOffers(u).length,3);
 }
 for(const side of ['w','b']){assert(E.trainingCapacity(g,side)>=0);assert(E.combatUnits(g,side).length<=20);}
 for(const c of g.camps)if(c.queue){assert(c.queue.remaining>=0);if(c.queue.workerId){const w=E.byId(g,c.queue.workerId);assert(w&&w.project?.kind==='training'&&w.pos===c.pos);}}
 assert(g.ap>=0&&g.ap<=9);checks++;
}
for(const size of [30,50,70])for(let seed=1;seed<=8;seed++){
 const rng=random(seed*471+size),g=E.create({size,seed:seed+500,armyW:E.ORG_MODES[(seed-1)%3],armyB:E.ORG_MODES[seed%3],routeW:['war','phantom','choice'][seed%3],combatMode:seed%4===0?'pips':'classic'});
 // Staged levels are coverage fixtures, NOT earned/human progression.
 for(const side of ['w','b'])for(const [i,p] of E.withSide(g,side).filter(u=>u.type==='P').entries()){p.level=[3,9,18,36,60][i%5];E.prepareSkills(p);}
 E.refreshBoth(g);validate(g);
 for(let phase=0;phase<65&&!g.winner;phase++){
  for(const p of E.withSide(g,g.side).filter(u=>u.type==='P'))while(E.pendingSkillLevels(p).length){const offers=E.skillOffers(p);assert.equal(offers.length,3);const desired=['scout','pioneer','guardian'][(p.id+seed)%3],pick=offers.find(id=>E.PAWN_SKILLS[id].family===desired)||offers[Math.floor(rng()*3)];assert(E.action(g,{type:'chooseSkill',unitId:p.id,skill:pick}).ok);drafts++;validate(g);}
  for(let turn=0;turn<8&&!g.winner;turn++){
   const opts=[];
   for(const u of E.withSide(g,g.side)){
    if(!E.canAct(g,u)||E.effectiveCost(g,u)>g.ap)continue;
    for(const to of E.orders(g,u))opts.push({type:'move',unitId:u.id,to});
    for(const id of u.equippedSkills||[])if(E.PAWN_SKILLS[id]?.active&&u.acted!==g.serial)for(const to of E.skillTargets(g,u,id)){
     const total=E.activationCost(g,u)+(E.PAWN_SKILLS[id].active==='relief'?E.activationCost(g,E.at(g,to)):0);
     if(total<=g.ap)opts.push({type:'useSkill',unitId:u.id,skill:id,to});
    }
    if(E.isWorker(u)){
     for(const project of Object.keys(E.WORK_PROJECTS))for(const to of E.eligibleBuilderTargets(g,u,project))opts.push({type:'build',unitId:u.id,project,to});
     const c=E.eligibleTrainingCamps(g,u.side).find(c=>c.pos===u.pos),k=E.king(g,u.side);
     if(c&&E.canOperateCamp(u))for(const piece of ['P','N','B']){
      if(u.type==='P')for(const mode of ['stay','sacrifice']){if(E.trainingCapacity(g,u.side)+(mode==='sacrifice'?1:0)>=E.pawnBatchSize(piece))opts.push({type:'trainCamp',unitId:u.id,piece,mode});}
      else if(k?.xp>=E.TRAIN_XP[piece]&&E.trainingCapacity(g,u.side)>=1)opts.push({type:'trainCamp',unitId:u.id,piece});
     }
    }
   }
   if(!opts.length||rng()<.08)break;
   const active=opts.filter(a=>a.type==='useSkill'),a=active.length&&rng()<.45?active[Math.floor(rng()*active.length)]:opts[Math.floor(rng()*opts.length)];
   const r=E.action(g,a);assert(r.ok,JSON.stringify({size,seed,phase,a,error:r.error}));actions++;if(a.type==='useSkill')skillActions++;if(a.type==='build')builds++;validate(g);
  }
  if(!g.winner){assert(E.action(g,{type:'end'}).ok);validate(g);}
 }
 const h=E.load(E.dump(g));for(const u of g.units){const v=h.units.find(x=>x.id===u.id);assert.deepEqual(v.skillChoices,u.skillChoices);assert.deepEqual(v.skillCooldowns,u.skillCooldowns);assert.deepEqual(v.equippedSkills,u.equippedSkills);}
 validate(h);matches++;
}
console.log(`RANDOMIZED SKILLS v0.5.10: ${matches} staged-level maps, ${drafts} skill picks, ${actions} actions (${skillActions} active skills; ${builds} builds), ${checks} invariant checks PASSED.`);

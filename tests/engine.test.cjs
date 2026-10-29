'use strict';
const assert=require('node:assert/strict');
const E=require('../prototype/engine.js');
let tests=0;function test(label,fn){fn();tests++;console.log('✓',label)}
const pick=(g,s,t)=>E.withSide(g,s).find(u=>u.type===t);
const clear=(g)=>{for(const s of ['w','b']){g.players[s].seen=Array(g.n*g.n).fill(0);g.players[s].sight=Array(g.n*g.n).fill(0);g.players[s].lastSeen={};g.players[s].firstSeenUnits={};}}
const clean=(g)=>{g.terrain=Array(g.n*g.n).fill(E.T.PLAIN);g.shrines=[];g.units=g.units.filter(u=>u.type==='K');clear(g);};
test('50×50 default, selectable 30 and 70, 99 rank cap',()=>{for(const n of [30,50,70]){const g=E.create({size:n});assert.equal(g.n,n);assert.equal(g.terrain.length,n*n);assert.equal(g.players.w.seen.length,n*n);assert.equal(g.ap,3);assert.equal(g.winner,null);}let g=E.create();assert.equal(g.n,50);let k=pick(g,'w','K');k.level=99;E.addXp(g,k,1000);assert.equal(k.level,99);});
test('same seed and army give reproducible map and initial pieces',()=>{let a=E.create({seed:1311}),b=E.create({seed:1311});assert.deepEqual(a.terrain,b.terrain);assert.deepEqual(a.units,b.units);});
test('queen, bishop and rook line moves capped at seven squares',()=>{let g=E.create();clean(g);let rook={id:999,type:'R',side:'w',pos:E.idx(g,20,20),alive:true,acted:-1,level:1};g.units.push(rook);let to=E.moves(g,rook);assert(to.includes(E.idx(g,20,27)));assert(!to.includes(E.idx(g,20,28)));assert(to.includes(E.idx(g,13,20)));assert(!to.includes(E.idx(g,12,20)));});
test('fog distinguishes unexplored, remembered mist, and currently visible',()=>{let g=E.create();clean(g);let k=pick(g,'w','K');k.pos=E.idx(g,4,4);E.refreshBoth(g);let former=k.pos;assert.equal(g.players.w.sight[former],1);assert.equal(g.players.w.seen[former],1);let never=E.idx(g,28,28);assert.equal(g.players.w.seen[never],0);k.pos=E.idx(g,15,15);E.refreshBoth(g);assert.equal(g.players.w.sight[former],0);assert.equal(g.players.w.seen[former],1);assert.equal(g.players.w.sight[k.pos],1);});
test('vision XP is paid once for new squares (king multiplier)',()=>{let g=E.create();clean(g);let k=pick(g,'w','K');k.pos=E.idx(g,8,8);E.refreshSight(g,'w',null,true);k.pos=E.idx(g,12,12);let before=k.totalXp;E.refreshSight(g,'w',k.id);let delta=k.totalXp-before;assert(delta>0);let after=k.totalXp;E.refreshSight(g,'w',k.id);assert.equal(k.totalXp,after);});
test('king receives 1.5× base XP, queen .75× and 1.5× experience requirement',()=>{let g=E.create();let k=pick(g,'w','K'),q=pick(g,'w','Q'),p=pick(g,'w','P');E.addXp(g,k,4);E.addXp(g,q,4);E.addXp(g,p,4);assert.equal(k.xp,6);assert.equal(q.xp,3);assert.equal(p.xp,4);assert.equal(E.expNext(q),E.expNext(p)*1.5);});
test('no stalemate: player may pass with no legal piece moves',()=>{let g=E.create();clean(g);for(const u of E.withSide(g,'w')){let [r,c]=[E.row(g,u.pos),E.col(g,u.pos)];for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){if(!dr&&!dc)continue;if(E.inside(g,r+dr,c+dc))g.terrain[E.idx(g,r+dr,c+dc)]=E.T.WATER;}}E.refreshBoth(g);let k=pick(g,'w','K');assert.equal(E.moves(g,k).length,0);let out=E.action(g,{type:'end'});assert(out.ok);assert.equal(g.side,'b');assert.equal(g.winner,null);});
test('pawn at level 2 may train Scout, boosting vision',()=>{let g=E.create();let p=pick(g,'w','P');p.level=2;let base=E.visionRadius(g,p);let out=E.action(g,{type:'train',unitId:p.id,job:'scout'});assert(out.ok);assert.equal(p.job,'scout');assert.equal(g.ap,2);assert(E.visionRadius(g,p)>=base+2);});
test('king can summon a pawn with command costs and supply rules',()=>{let g=E.create(),k=pick(g,'w','K');let loc=E.eligibleSummons(g,k,'P');assert(loc.length>0);let before=E.withSide(g,'w').length,bank=g.players.w.gold;let out=E.action(g,{type:'summon',unitId:k.id,piece:'P',to:loc[0]});assert(out.ok);assert.equal(g.players.w.gold,bank-6);assert.equal(g.ap,1);assert.equal(E.withSide(g,'w').length,before+1);assert(E.at(g,loc[0]).summonedAt);});
test('classic one-hit mode still wins immediately on king capture',()=>{let g=E.create({hpMode:false});clean(g);const wk=pick(g,'w','K'),bk=pick(g,'b','K');wk.pos=E.idx(g,20,20);bk.pos=E.idx(g,20,21);E.refreshBoth(g);const out=E.action(g,{type:'move',unitId:wk.id,to:bk.pos});assert(out.ok);assert.equal(g.winner,'w');});
test('Choice Queen sacrifice destroys ally, grants essence, but rejects fresh summons',()=>{let g=E.create({routeW:'choice'}),q=pick(g,'w','Q'),p=pick(g,'w','P');p.pos=E.idx(g,E.row(g,q.pos)-1,E.col(g,q.pos));let result=E.action(g,{type:'queen',unitId:q.id,ability:'sacrifice',targetId:p.id});assert(result.ok);assert.equal(p.alive,false);assert(g.players.w.essence>0);let g2=E.create({routeW:'choice'}),q2=pick(g2,'w','Q'),p2=pick(g2,'w','P');p2.pos=E.idx(g2,E.row(g2,q2.pos)-1,E.col(g2,q2.pos));p2.summonedAt=g2.round;let reject=E.action(g2,{type:'queen',unitId:q2.id,ability:'sacrifice',targetId:p2.id});assert.equal(reject.ok,false);assert.equal(p2.alive,true);});
test('War Queen global/local stances trade team-wide vision for local power',()=>{let g=E.create({routeW:'war',armyB:'balanced'}),q=pick(g,'w','Q');assert.equal(q.stance,'global');let z=E.action(g,{type:'queen',unitId:q.id,ability:'stance'});assert(z.ok);assert.equal(q.stance,'local');});
test('Phantom Queen hides from a distant observer, detectors defeat cloak',()=>{let g=E.create({routeW:'phantom'});clean(g);let q={id:777,type:'Q',side:'w',pos:E.idx(g,20,20),alive:true,queenPath:'phantom',cloakUntil:100,level:1,xp:0,acted:-1};let enemy=pick(g,'b','K');enemy.pos=E.idx(g,20,23);g.units.push(q);E.refreshBoth(g);assert.equal(g.players.b.sight[q.pos],1);assert.equal(E.canObserveUnit(g,'b',q),false);enemy.pos=E.idx(g,20,22);E.refreshBoth(g);assert.equal(E.canObserveUnit(g,'b',q),true);});
test('save and load roundtrip keeps piece IDs, XP, fog and state',()=>{let g=E.create(),p=pick(g,'w','P');p.level=5;E.addXp(g,p,3);let saved=E.dump(g),restored=E.load(saved);assert.equal(E.byId(restored,p.id).level,5);assert.equal(restored.units.length,g.units.length);assert.deepEqual(restored.players.w.seen,g.players.w.seen);});
test('AI generates legal actions against visible targets and turns progress',()=>{let g=E.create({seed:9234,size:30});E.endTurn(g);assert.equal(g.side,'b');let actions=0;for(let i=0;i<35;i++){if(g.side!=='b')E.endTurn(g);let next=E.aiChoice(g);assert(next);let result=E.action(g,next);assert.equal(result.ok,true,'AI proposed '+JSON.stringify(next)+' yielded '+result.error);actions++;if(g.winner)break;}assert(actions>0);});
test('War Queen protects once locally; a coordinated second attacker can finish the job in one-hit mode',()=>{
 let g=E.create({routeW:'war',armyB:'balanced',hpMode:false}),q=pick(g,'w','Q'),p=pick(g,'w','P'),rook=pick(g,'b','R'),knight=pick(g,'b','N');clean(g);
 g.units.push(q,p,rook,knight);q.pos=E.idx(g,20,20);q.stance='local';p.pos=E.idx(g,20,21);rook.pos=E.idx(g,20,23);knight.pos=E.idx(g,19,23);E.refreshBoth(g);
 E.endTurn(g);let a=E.action(g,{type:'move',unitId:rook.id,to:p.pos});assert(a.ok);assert(p.alive);assert.equal(rook.pos,E.idx(g,20,23));
 let b=E.action(g,{type:'move',unitId:knight.id,to:p.pos});assert(b.ok);assert.equal(p.alive,false);
});
test('Choice Queen mercy prevents a real capture and spares the ally',()=>{
 let g=E.create({routeW:'choice',armyB:'balanced'}),q=pick(g,'w','Q'),p=pick(g,'w','P'),rook=pick(g,'b','R');clean(g);g.units.push(q,p,rook);
 q.pos=E.idx(g,20,20);p.pos=E.idx(g,20,21);rook.pos=E.idx(g,20,23);E.refreshBoth(g);
 let a=E.action(g,{type:'queen',unitId:q.id,ability:'mercy',targetId:p.id});assert(a.ok);assert(p.ward>=1);E.endTurn(g);
 let b=E.action(g,{type:'move',unitId:rook.id,to:p.pos});assert(b.ok);assert(p.alive);
});
test('Phantom decoy consumes enemy move without creating a genuine queen',()=>{
 let g=E.create({routeW:'phantom',armyB:'balanced'}),q=pick(g,'w','Q'),rook=pick(g,'b','R');clean(g);g.units.push(q,rook);
 q.pos=E.idx(g,20,20);rook.pos=E.idx(g,20,24);E.refreshBoth(g);
 const square=E.idx(g,20,22);let a=E.action(g,{type:'queen',unitId:q.id,ability:'decoy',to:square});assert(a.ok);assert.equal(g.decoys.length,1);
 E.endTurn(g);let b=E.action(g,{type:'move',unitId:rook.id,to:square});assert(b.ok);assert.equal(g.decoys.length,0);assert(q.alive);
});
test('Ninja bonus move never chains, and does not spend a second action point',()=>{
 let found=false;for(let seed=1;seed<100&&!found;seed++){
  let g=E.create({seed});clean(g);const p={id:999,type:'P',side:'w',pos:E.idx(g,20,20),alive:true,level:4,xp:0,totalXp:0,job:'ninja',acted:-1,bonus:0,ninjaRolled:-1,summonedAt:0,history:[]};g.units.push(p);E.refreshBoth(g);
  const first=E.action(g,{type:'move',unitId:p.id,to:E.idx(g,19,20)});assert(first.ok);
  if(p.bonus){found=true;assert.equal(g.ap,2);const second=E.action(g,{type:'move',unitId:p.id,to:E.idx(g,18,20)});assert(second.ok);assert.equal(g.ap,2);assert.equal(p.bonus,0);assert.equal(p.ninjaRolled,g.serial);}
 }assert(found,'The deterministic test should encounter a 30% roll.');
});

test('initial armies are approximately half of the original forces, with room to summon',()=>{
 for(const [name,count] of [['balanced',11],['expedition',12],['bastion',11]]){
  const g=E.create({armyW:name,armyB:name});assert.equal(E.combatUnits(g,'w').length,count);assert.equal(E.combatUnits(g,'b').length,count);assert.equal(E.civilians(g,'w').length,3);assert.equal(E.civilians(g,'b').length,3);
  assert.equal(E.withSide(g,'w').filter(u=>u.type==='K').length,1);
  assert.equal(E.withSide(g,'w').filter(u=>u.type==='Q').length,1);
 }
});
test('HP defaults ON but a match can opt into traditional one-hit captures',()=>{
 const hp=E.create(),classic=E.create({hpMode:false});assert.equal(hp.hpMode,true);assert.equal(classic.hpMode,false);
 for(const u of hp.units)assert.equal(E.hpOf(u),E.maxHp(u));
 assert.equal(E.maxHp({type:'Q',level:1}),14);assert.equal(E.damageFor({type:'P',level:1}),2);
 assert(E.maxHp({type:'Q',level:99})>E.damageFor({type:'P',level:1}));
});
test('pawn damages level-99 queen, does not teleport onto a living unit, and cannot act again',()=>{
 let g=E.create({hpMode:true});clean(g);
 const pawn={id:600,type:'P',side:'w',alive:true,pos:E.idx(g,20,20),level:1,acted:-1,bonus:0,job:null,hp:4,xp:0,totalXp:0,history:[],summonedAt:0};
 const q={id:601,type:'Q',side:'b',alive:true,pos:E.idx(g,19,21),level:99,acted:-1,queenPath:'war',stance:'global',hp:E.maxHp({type:'Q',level:99}),xp:0,totalXp:0,history:[],summonedAt:0};
 g.units.push(pawn,q);E.refreshBoth(g);const hp=q.hp;
 assert(E.orders(g,pawn).includes(q.pos));const a=E.action(g,{type:'move',unitId:600,to:q.pos});assert(a.ok);
 assert(q.alive);assert.equal(q.hp,hp-2);assert.equal(pawn.pos,E.idx(g,20,20));assert.equal(g.ap,2);
 assert.equal(E.action(g,{type:'move',unitId:600,to:q.pos}).ok,false);
});
test('lethal strike defeats unit and advances attacker, with king victory only at 0 HP',()=>{
 let g=E.create({hpMode:true});clean(g);let wk=pick(g,'w','K'),bk=pick(g,'b','K');wk.pos=E.idx(g,20,20);bk.pos=E.idx(g,20,21);bk.hp=4;
 E.refreshBoth(g);let a=E.action(g,{type:'move',unitId:wk.id,to:bk.pos});assert(a.ok);assert.equal(bk.hp,1);assert.equal(bk.alive,true);assert.equal(g.winner,null);assert.equal(wk.pos,E.idx(g,20,20));
 E.endTurn(g);E.endTurn(g);let b=E.action(g,{type:'move',unitId:wk.id,to:bk.pos});assert(b.ok);
 assert.equal(bk.alive,false);assert.equal(g.winner,'w');assert.equal(wk.pos,E.idx(g,20,21));
});
test('rest heals without exceeding max HP, consumes action and awards no XP',()=>{
 let g=E.create(),p=pick(g,'w','P');p.hp=1;const prevXp=p.totalXp;let r=E.action(g,{type:'rest',unitId:p.id});assert(r.ok);assert.equal(p.hp,3);assert.equal(p.totalXp,prevXp);assert.equal(g.ap,2);assert.equal(E.action(g,{type:'rest',unitId:p.id}).ok,false);
});
test('misted long move stops before first hidden blocker, consumes an action, no blind attack',()=>{
 let g=E.create({hpMode:true});clean(g);
 const rook={id:603,type:'R',side:'w',alive:true,pos:E.idx(g,20,20),level:1,acted:-1,bonus:0,hp:9,xp:0,totalXp:0,history:[],summonedAt:0};
 const blocker={id:604,type:'P',side:'b',alive:true,pos:E.idx(g,20,24),level:1,acted:-1,bonus:0,hp:4,xp:0,totalXp:0,history:[],summonedAt:0};
 g.units.push(rook,blocker);E.refreshBoth(g);
 const dest=E.idx(g,20,27),player=g.players.w;
 for(let c=20;c<=27;c++)player.seen[E.idx(g,20,c)]=1;
 assert.equal(player.sight[blocker.pos],0);assert(E.orders(g,rook).includes(dest));
 const action=E.action(g,{type:'move',unitId:rook.id,to:dest});assert(action.ok);
 assert.equal(rook.pos,E.idx(g,20,23));assert.equal(blocker.hp,4);assert(blocker.alive);
 assert.equal(g.lastEvent.type,'interrupted');assert.equal(g.ap,2);
 assert.equal(E.action(g,{type:'move',unitId:rook.id,to:E.idx(g,20,24)}).ok,false);
});
test('black unexplored square cannot be targeted or crossed even if farther mist is explored',()=>{
 let g=E.create();clean(g);
 const rook={id:605,type:'R',side:'w',alive:true,pos:E.idx(g,20,20),level:1,acted:-1,bonus:0,hp:9};g.units.push(rook);E.refreshBoth(g);
 const p=g.players.w;for(let c=20;c<=27;c++)p.seen[E.idx(g,20,c)]=1;
 p.seen[E.idx(g,20,24)]=0;
 assert(E.orders(g,rook).includes(E.idx(g,20,23)));
 assert(!E.orders(g,rook).includes(E.idx(g,20,24)));
 assert(!E.orders(g,rook).includes(E.idx(g,20,27)));
});
test('new/legacy saves retain appropriate HP mode; new ones roundtrip wounded units',()=>{
 let g=E.create(),p=pick(g,'w','P');p.hp=1;let loaded=E.load(E.dump(g));assert(loaded.hpMode);assert.equal(E.byId(loaded,p.id).hp,1);
 let legacy=JSON.parse(E.dump(g));legacy.version=2;delete legacy.hpMode;for(let u of legacy.units)delete u.hp;
 let old=E.load(legacy);assert.equal(old.hpMode,false);assert.equal(old.version,4);assert.equal(E.hpOf(E.byId(old,p.id)),E.maxHp(E.byId(old,p.id)));
});
test('each side starts with three protected civilian producers outside combat supply',()=>{
 for(const preset of ['balanced','expedition','bastion']){
  let g=E.create({armyW:preset,armyB:preset});assert.equal(E.civilians(g,'w').length,3);
  assert.deepEqual(E.civilians(g,'w').map(x=>x.job),['wood','gold','food']);
  assert.equal(E.combatUnits(g,'w').length,{balanced:11,expedition:12,bastion:11}[preset]);
  assert.equal(g.wildlife.length,4);
  for(const u of E.civilians(g,'w'))assert.equal(E.damageFor(u),0);
 }
});
test('villagers gather wood, gold and food automatically without spending command AP',()=>{
 let g=E.create({seed:18}),bank=g.players.w,before={gold:bank.gold,food:bank.food,wood:bank.wood};
 let food=E.civilians(g,'w').find(u=>u.job==='food');const xp=food.totalXp;
 E.endTurn(g);E.endTurn(g);
 assert.equal(g.side,'w');assert.equal(g.ap,3);
 assert(bank.wood>before.wood,'lumber production');assert(bank.food>before.food,'dinosaur hunting');
 assert(bank.gold>=before.gold+5,'passive 3 gold plus mining 2');
 assert(food.totalXp>xp,'civilian earned modest real production XP');
 assert(g.wildlife.some(site=>site.kind==='dinosaur'&&site.stock===5));
});
test('work assignments are free once per turn, and switch to gator hunting next turn',()=>{
 let g=E.create(),worker=E.civilians(g,'w').find(u=>u.job==='food'),ap=g.ap;
 assert(E.jobSite(g,worker)?.kind==='dinosaur');
 let a=E.action(g,{type:'work',unitId:worker.id,job:'food',prey:'gator'});
 assert(a.ok);assert.equal(g.ap,ap);assert.equal(E.jobSite(g,worker)?.kind,'gator');
 assert(!E.action(g,{type:'work',unitId:worker.id,job:'food',prey:'dinosaur'}).ok);
 E.endTurn(g);E.endTurn(g);assert(g.wildlife.some(site=>site.kind==='gator'&&site.stock===4));
});
test('a low-level soldier cannot kill civilians; raiding nonlethally injures and routs them',()=>{
 const g=E.create({hpMode:false,armyB:'balanced'});const wk=pick(g,'w','K'),bk=pick(g,'b','K'),worker=E.civilians(g,'w')[0],ro=pick(g,'b','R');
 g.terrain=Array(g.n*g.n).fill(E.T.PLAIN);g.shrines=[];g.wildlife=[];g.units=[wk,bk,worker,ro];
 wk.pos=E.idx(g,22,20);bk.pos=E.idx(g,22,30);
 worker.pos=E.idx(g,20,22);worker.homePos=E.idx(g,21,21);worker.job='wood';worker.xp=5;ro.pos=E.idx(g,20,24);
 E.refreshBoth(g);let before=g.players.w.wood;E.endTurn(g);
 assert(E.orders(g,ro).includes(worker.pos));const res=E.action(g,{type:'move',unitId:ro.id,to:worker.pos});
 assert(res.ok);assert(worker.alive);assert(worker.hp>=1);assert.equal(worker.hp,1);
 assert.equal(worker.injuredUntil,g.round+2);assert(worker.xp<5);
 assert(g.players.w.wood<before);assert.equal(g.lastEvent.type,'civilian_raid');
 assert.equal(ro.pos,E.idx(g,20,24),'raider stays in place');
 assert(E.withSide(g,'w').some(u=>u.id===worker.id));
});
test('queen cannot sacrifice or siphon civilians; no free ritual fuel',()=>{
 const g=E.create({routeW:'choice'}),q=pick(g,'w','Q'),v=E.civilians(g,'w')[0];
 v.pos=E.idx(g,E.row(g,q.pos)-1,E.col(g,q.pos));
 let ap=g.ap;for(const ability of ['sacrifice','siphon']){
  const res=E.action(g,{type:'queen',unitId:q.id,ability,targetId:v.id});assert(!res.ok);
 }assert(v.alive);assert.equal(g.ap,ap);assert.equal(g.players.w.essence,0);
});
test('skill capacities: king/queen 3, major 2, pawn none then learns slots',()=>{
 let g=E.create({routeW:'choice'});
 for(const [type,slots] of [['K',3],['Q',3],['R',2],['B',2],['N',2],['P',0],['V',0]]){
  let u=pick(g,'w',type);assert.equal(E.skillCapacity(u),slots);
 }
 const q=pick(g,'w','Q');assert.equal(q.learnedSkills.length,4);
 assert.equal(q.equippedSkills.length,3);assert(!E.equipped(q,'surge'));
 const pawn=pick(g,'w','P');pawn.level=4;pawn.job='scout';E.prepareSkills(pawn);
 assert.equal(E.skillCapacity(pawn),1);assert(E.equipped(pawn,'watch'));
 pawn.level=15;assert.equal(E.skillCapacity(pawn),2);
});
test('queen must deliberately swap one equipped choice skill for surge',()=>{
 let g=E.create({routeW:'choice'}),q=pick(g,'w','Q');
 assert(!E.action(g,{type:'queen',unitId:q.id,ability:'surge'}).ok);
 assert(E.action(g,{type:'equip',unitId:q.id,skill:'surge',replace:'sacrifice'}).ok);
 assert.equal(E.equipped(q,'surge'),true);assert.equal(E.equipped(q,'sacrifice'),false);
 let r=E.action(g,{type:'queen',unitId:q.id,ability:'sacrifice',targetId:pick(g,'w','P').id});assert(!r.ok);
 E.endTurn(g);E.endTurn(g);g.players.w.essence=8;
 assert(E.action(g,{type:'queen',unitId:q.id,ability:'surge'}).ok);
});
test('king summons consume all three resources, preventing limitless free troops',()=>{
 const g=E.create(),k=pick(g,'w','K'),spot=E.eligibleSummons(g,k,'P')[0];
 const ap=g.ap;g.players.w.food=2;
 assert(!E.action(g,{type:'summon',unitId:k.id,piece:'P',to:spot}).ok);
 assert.equal(g.ap,ap);
 g.players.w.food=3;assert(E.action(g,{type:'summon',unitId:k.id,piece:'P',to:spot}).ok);
 assert.equal(g.players.w.food,0);
});

console.log(`\n${tests} ChessLife engine checks passed.`);

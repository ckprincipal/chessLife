'use strict';
const assert=require('node:assert/strict');
const E=require('../prototype/engine.js');
let passed=0;
function check(name,fn){try{fn();console.log(`PASS ${++passed}: ${name}`);}catch(e){console.error(`FAIL: ${name}`);throw e;}}
function game(o={}){return E.create({seed:43971,size:50,armyW:'balanced',armyB:'expedition',startingCamp:'ready',...o});}
function pick(g,s,type){return E.withSide(g,s).find(x=>x.type===type);}
function sq(g,r,c){return E.idx(g,r,c);}
function step(g){E.action(g,{type:'end'});E.action(g,{type:'end'});}
function clearExcept(g,keep){const keepers=new Set(keep.map(x=>x.id));for(const u of g.units)if(!keepers.has(u.id))u.alive=false;g.terrain.fill(E.T.PLAIN);}
check('v0.5.10 Quick Start comparison: all three presets start with three worker pawns and no engineer, on 30/50/70 maps',()=>{
 for(const size of [30,50,70])for(const army of ['balanced','expedition','bastion']){
  const g=game({size,armyW:army,armyB:army});assert.equal(g.version,15);assert.equal(g.ap,3);assert.equal(g.combatMode,'classic');assert.equal(g.fissionEnabled,false);
  assert.equal(g.units.filter(u=>u.type==='V'&&u.alive).length,0);
  for(const side of ['w','b']){
   assert.equal(E.civilians(g,side).length,0);assert.equal(E.combatUnits(g,side).length,9);
   const pawns=E.withSide(g,side).filter(u=>u.type==='P');assert.equal(pawns.length,3);
   assert.equal(E.laborers(g,side).length,3);assert.equal(E.king(g,side).xp,3);
   const camps=g.camps.filter(c=>c.side===side);assert.equal(camps.length,1);
   const camp=camps[0];assert.equal(g.terrain[camp.pos],E.T.CAMP);assert.equal(E.at(g,camp.pos),undefined);
   assert.equal(Math.min(...pawns.map(u=>E.distance(g,u.pos,camp.pos))),1);
   assert(pawns.some(u=>E.orders(g,u).includes(camp.pos)),'camp must be reachable by forward-only pawns');
  }
 }
});
check('original CP option preserves two-command budget and original rook/queen costs',()=>{
 const g=game({commandMode:'original'});assert.equal(g.ap,2);assert.equal(E.activationCost(g,pick(g,'w','R')),2);assert.equal(E.activationCost(g,pick(g,'w','Q')),2);
});
check('roomier opening: rook 2 CP, bishop 1, queen 3 and king 1',()=>{
 const g=game();for(const [type,cost] of [['R',2],['B',1],['Q',3],['K',1],['P',1],['N',1]])assert.equal(E.activationCost(g,pick(g,'w',type)),cost);
});
check('bishop+pawn+knight use three distinct one-CP military commands',()=>{
 const g=game(),u=pick(g,'w','B'),v=pick(g,'w','P'),w=pick(g,'w','N');g.terrain.fill(E.T.PLAIN);E.refreshBoth(g);
 const opts=[u,v,w].map(x=>E.orders(g,x)).map(a=>a[0]);for(const [index,p] of opts.entries()){assert(Number.isInteger(p),`${index}: no move`);}for(const [i,x] of [u,v,w].entries())assert(E.action(g,{type:'move',unitId:x.id,to:opts[i]}).ok);assert.equal(g.ap,0);assert(!E.action(g,{type:'move',unitId:u.id,to:opts[0]}).ok);
});
check('queen exhausts opening three-command budget, no additional normal activation',()=>{
 const g=game(),q=E.queen(g,'w');g.terrain.fill(E.T.PLAIN);E.refreshBoth(g);const target=E.orders(g,q)[0];assert(Number.isInteger(target));assert(E.action(g,{type:'move',unitId:q.id,to:target}).ok);assert.equal(g.ap,0);assert(!E.action(g,{type:'move',unitId:q.id,to:target}).ok);
});
check('bishop gets a REAL extra diagonal sight layer at level 2',()=>{
 const g=game(),b=pick(g,'w','B');g.terrain.fill(E.T.PLAIN);let a=E.personalSight(g,b).length;b.level=2;let next=E.personalSight(g,b).length;assert.equal(a,5);assert.equal(next,9);
});
check('rook/queen initially see two directional tiles, pawn sees all three forward squares',()=>{
 const g=game();g.terrain.fill(E.T.PLAIN);for(const type of ['R','Q'])assert.equal(E.personalSight(g,pick(g,'w',type)).length,1+({R:4,Q:8})[type]*2);assert.equal(E.personalSight(g,pick(g,'w','P')).length,4);
});
check('the King can immediately train one pawn at the ready camp for 1 CP and 3 XP',()=>{
 const g=game(),k=E.king(g,'w'),camp=g.camps.find(c=>c.side==='w');
 const result=E.action(g,{type:'summon',unitId:k.id,piece:'P',to:camp.pos});
 assert(result.ok,result.error);assert.equal(g.ap,2);assert.equal(k.xp,0);
 assert.equal(camp.queue.kind,'legacy');assert.equal(camp.queue.workerId,null);assert.equal(camp.queue.remaining,2);
 step(g);assert.equal(camp.queue.remaining,1);step(g);assert.equal(camp.queue,null);
 assert.equal(E.combatUnits(g,'w').length,10);assert.equal(E.civilians(g,'w').length,0);
});
check('starting camp keeps its vision and a pawn immediately adds the outer ring',()=>{
 const g=game(),camp=g.camps.find(c=>c.side==='w');g.terrain.fill(E.T.PLAIN);g.terrain[camp.pos]=E.T.CAMP;E.refreshBoth(g);
 assert.equal(E.campSight(g,camp).length,9);
 const p=E.withSide(g,'w').find(u=>u.type==='P'&&E.orders(g,u).includes(camp.pos));
 assert(p,'no pawn can enter camp');assert(E.action(g,{type:'move',unitId:p.id,to:camp.pos}).ok);
 assert.equal(E.campSight(g,camp).length,25);
});
check('level-1 pawns cannot create camps and level-3 pawns can excavate mountains',()=>{
 const g=game(),p=pick(g,'w','P');assert.equal(E.eligibleBuilderTargets(g,p,'camp').length,0);
 p.level=3;const front=sq(g,E.row(g,p.pos)-1,E.col(g,p.pos));g.terrain[front]=E.T.MOUNTAIN;E.refreshBoth(g);
 assert(E.eligibleBuilderTargets(g,p,'excavate').includes(front));
 const a=E.action(g,{type:'build',unitId:p.id,project:'excavate',to:front});assert(a.ok,a.error);assert.equal(g.ap,2);
 assert(!E.action(g,{type:'move',unitId:p.id,to:front}).ok);
 step(g);step(g);step(g);assert.equal(g.terrain[front],E.T.PLAIN);assert.equal(p.project,null);
});
check('pawn-workers remain capturable military units, not invulnerable engineers',()=>{
 const g=game();assert(!g.units.some(u=>u.alive&&u.type==='V'));
 for(const side of ['w','b'])for(const pawn of E.withSide(g,side).filter(u=>u.type==='P'))assert.equal(E.at(g,pawn.pos),pawn);
});
check('king earns a fraction of nonroyal XP without needing to move',()=>{
 const g=game(),k=E.king(g,'w'),p=pick(g,'w','P');const pos=k.pos,old=k.totalXp;
 E.addXp(g,p,5,'test-meaningful-objective');assert.equal(k.pos,pos);assert.equal(k.totalXp-old,1.5);assert.equal(p.totalXp,5);
});
check('XP shared to king is not recursive and passing turns awards no XP',()=>{
 const g=game(),k=E.king(g,'w'),old=k.xp;
 step(g);assert.equal(k.xp,old);
 E.addXp(g,k,1,'royal');assert.equal(k.xp,old+1.5);
});
check('pawn confronted with water uses a forward-diagonal move, never a sideways detour',()=>{
 const g=game(),p=pick(g,'w','P'),k=E.king(g,'w');clearExcept(g,[p,k,E.king(g,'b')]);p.pos=sq(g,24,24);g.terrain[p.pos-g.n]=E.T.WATER;E.refreshBoth(g);
 const j=sq(g,23,25);assert(E.orders(g,p).includes(j),'pawn can skirt water on a forward diagonal');assert(!E.orders(g,p).includes(sq(g,24,25)));const ap=g.ap;assert(E.action(g,{type:'move',unitId:p.id,to:j}).ok);assert.equal(p.pos,j);assert.equal(g.ap,ap-1);
});
check('pawn cannot detour sideways with no water or mountain in front',()=>{
 const g=game(),p=pick(g,'w','P'),k=E.king(g,'w');clearExcept(g,[p,k,E.king(g,'b')]);p.pos=sq(g,24,24);E.refreshBoth(g);assert(!E.orders(g,p).includes(sq(g,24,25)));
});
check('knight taking a pawn exposes attacker long enough for the other pawn to recapture',()=>{
 const g=game(),front=pick(g,'w','P'),guard=E.withSide(g,'w').find(x=>x.type==='P'&&x.id!==front.id),knight=pick(g,'b','N'),wk=E.king(g,'w'),bk=E.king(g,'b');clearExcept(g,[front,guard,knight,wk,bk]);front.pos=sq(g,23,23);guard.pos=sq(g,24,24);knight.pos=sq(g,21,22);g.side='b';g.ap=3;g.serial=1;E.refreshBoth(g);
 assert(E.orders(g,knight).includes(front.pos),'knight attack has to be visible and reachable');let out=E.action(g,{type:'move',unitId:knight.id,to:front.pos});assert(out.ok,out.error);assert(!front.alive);assert.equal(knight.pos,sq(g,23,23));E.endTurn(g);
 assert.equal(g.side,'w');assert.equal(g.players.w.sight[knight.pos],1,'battle echo should reveal opponent after scout pawn dies');assert(E.orders(g,guard).includes(knight.pos),'recapture should be legal despite normal vision loss');out=E.action(g,{type:'move',unitId:guard.id,to:knight.pos});assert(out.ok,out.error);assert(!knight.alive);
});
check('attacks against shield-pip defenders also reveal attack origin for retaliation',()=>{
 const g=game({combatMode:'pips'}),p=pick(g,'w','P'),n=pick(g,'b','N'),wk=E.king(g,'w'),bk=E.king(g,'b');clearExcept(g,[p,n,wk,bk]);p.pos=sq(g,23,23);n.pos=sq(g,21,22);p.hitsMax=p.hitsRemaining=2;g.side='b';g.ap=3;E.refreshBoth(g);
 let a=E.action(g,{type:'move',unitId:n.id,to:p.pos});assert(a.ok,a.error);assert.equal(p.hitsRemaining,1);assert.equal(n.pos,sq(g,21,22));E.endTurn(g);assert.equal(g.players.w.sight[n.pos],1);
});
check('battle contact does not permanently reveal enemy after it moves or the response turn expires',()=>{
 const g=game(),n=pick(g,'b','N');g.battleEcho=[{side:'w',unitId:n.id,pos:sq(g,1,1),until:g.serial+1}];E.refreshBoth(g);assert.equal(g.players.w.sight[sq(g,1,1)],0);g.battleEcho[0].pos=n.pos;E.refreshBoth(g);assert(g.players.w.sight[n.pos]===1);g.serial+=2;E.refreshBoth(g);assert.equal(g.players.w.sight[n.pos],0);
});
check('the AI can recruit using its King without an engineer, spending real CP',()=>{
 const g=game();E.endTurn(g);assert.equal(g.side,'b');
 let choice;for(let i=0;i<70;i++){choice=E.aiChoice(g);if(choice?.type==='summon')break;}
 assert(choice&&choice.type==='summon','AI did not consider King XP recruitment');
 assert.equal(choice.piece,'P');const ap=g.ap;const result=E.action(g,choice);assert(result.ok,result.error);
 assert.equal(g.ap,ap-1);assert.equal(E.king(g,'b').xp,0);
 assert(g.camps.find(c=>c.side==='b').queue);
});
check('optional camp capture costs exactly 1 CP after surviving a turn, not an immediate win',()=>{
 const g=game({campCaptureMode:'on'}),r=pick(g,'w','R'),enemy=g.camps.find(c=>c.side==='b');r.pos=enemy.pos;r.history=[{round:1}];g.round=2;g.ap=3;r.acted=-1;const a=E.action(g,{type:'claimCamp',unitId:r.id});assert(a.ok,a.error);assert.equal(g.ap,2);assert.equal(enemy.side,'w');assert(!g.winner);
});
check('optional camp capture cannot happen on arrival turn or in off mode',()=>{
 const g=game({campCaptureMode:'on'}),r=pick(g,'w','R'),enemy=g.camps.find(c=>c.side==='b');r.pos=enemy.pos;r.history=[{round:1}];g.round=1;assert(!E.action(g,{type:'claimCamp',unitId:r.id}).ok);g.campCaptureMode='off';g.round=2;assert(!E.action(g,{type:'claimCamp',unitId:r.id}).ok);
});
check('version12 roundtrip and original v7 migration',()=>{
 const g=game({commandMode:'roomy',campCaptureMode:'on'}),h=E.load(E.dump(g));assert.equal(h.version,15);assert.equal(h.commandMode,'roomy');assert.equal(h.campCaptureMode,'on');assert.equal(h.camps.length,2);
 const old=JSON.parse(E.dump(g));old.version=7;delete old.commandMode;delete old.campCaptureMode;delete old.battleEcho;const migr=E.load(old);assert.equal(migr.version,15);assert.equal(migr.commandMode,'original');assert.equal(migr.campCaptureMode,'off');
});
check('no-stalemate remains king capture/turn pass even if no legal military action',()=>{
 const g=game();g.ap=0;const side=g.side;assert(E.action(g,{type:'end'}).ok);assert.equal(g.side,E.other(side));assert.equal(g.winner,null);
});
console.log(`Stale-Mate v0.5.10 tests: ${passed}/${passed} passed.`);

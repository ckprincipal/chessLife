'use strict';
const assert=require('node:assert/strict');
const E=require('../prototype/engine.js');
let passed=0;
function test(name,fn){try{fn();console.log(`PASS worker ${++passed}: ${name}`);}catch(e){console.error('FAIL worker: '+name);throw e;}}
const sq=(g,r,c)=>E.idx(g,r,c);
function fixture(side='w',level=1){
 const g=E.create({size:50,seed:43971}),p=E.withSide(g,side).find(u=>u.type==='P'),wk=E.king(g,'w'),bk=E.king(g,'b');
 for(const u of g.units)if(![p,wk,bk].includes(u))u.alive=false;
 g.terrain.fill(E.T.PLAIN);g.camps=[];g.towers=[];g.shrines=[];g.beacons=[];g.battleEcho=[];g.decoys=[];g.workAwards={w:{},b:{}};
 wk.pos=sq(g,1,1);bk.pos=sq(g,48,48);p.pos=sq(g,25,25);p.level=level;p.job=null;p.xp=0;p.totalXp=0;p.project=null;
 for(const x of Object.values(g.players)){x.seen.fill(0);x.sight.fill(0);x.terrainMemory.fill(-1);x.lastSeen={};x.firstSeenUnits={};}
 g.side=side;g.ap=3;E.refreshBoth(g);return {g,p};
}
function put(g,type,side,r,c,level=1){
 const u=JSON.parse(JSON.stringify(g.units.find(x=>x.type==='P')));
 Object.assign(u,{id:g.nextId++,type,side,pos:sq(g,r,c),alive:true,level,xp:0,totalXp:0,job:null,bond:null,bondTarget:null,project:null,acted:-1,bonus:0,hitsMax:1,hitsRemaining:1,lineage:g.nextId,learnedSkills:[],equippedSkills:[],pendingChoices:[],choiceHistory:[],history:[]});
 u.hp=E.maxHp(u);E.prepareSkills(u);g.units.push(u);return u;
}
function cycle(g,n=1){for(let i=0;i<n;i++){assert(E.action(g,{type:'end'}).ok);assert(E.action(g,{type:'end'}).ok);}}
function camp(g,p){g.terrain[p.pos]=E.T.CAMP;const c={side:p.side,pos:p.pos,queue:null,trained:{P:0,N:0,B:0}};g.camps.push(c);E.refreshBoth(g);return c;}
function build(g,p,project,to=p.pos){const a=E.action(g,{type:'build',unitId:p.id,project,to});assert(a.ok,a.error);}
function reveal(g,side){const t=g.players[side];t.seen.fill(1);t.sight.fill(1);t.terrainMemory=[...g.terrain];}
for(const side of ['w','b']){
 test(`${side}: three empty forward moves and matching three-square sight`,()=>{
  const {g,p}=fixture(side),fr=side==='w'?-1:1,expected=[-1,0,1].map(dc=>sq(g,25+fr,25+dc));
  assert.deepEqual(E.orders(g,p).sort((a,b)=>a-b),expected.sort((a,b)=>a-b));
  assert.deepEqual(E.moves(g,p).sort((a,b)=>a-b),expected.sort((a,b)=>a-b));
  assert.equal(E.personalSight(g,p).length,4);
  for(const j of expected)assert.equal(g.players[side].sight[j],1);
 });
 test(`${side}: empty diagonal move costs one CP and one activation`,()=>{
  const {g,p}=fixture(side),to=sq(g,side==='w'?24:26,24);assert(E.action(g,{type:'move',unitId:p.id,to}).ok);assert.equal(p.pos,to);assert.equal(g.ap,2);assert.equal(p.acted,g.serial);
  assert(!E.action(g,{type:'move',unitId:p.id,to:sq(g,side==='w'?23:27,23)}).ok);
 });
 test(`${side}: straight-ahead enemy cannot be captured`,()=>{
  const {g,p}=fixture(side),enemy=put(g,'N',E.other(side),side==='w'?24:26,25);E.refreshBoth(g);
  assert(!E.orders(g,p).includes(enemy.pos));assert(!E.moves(g,p).includes(enemy.pos));
  assert(!E.action(g,{type:'move',unitId:p.id,to:enemy.pos}).ok);assert(enemy.alive);assert.equal(g.ap,3);
 });
 test(`${side}: both forward-diagonal captures work`,()=>{
  for(const dc of [-1,1]){const {g,p}=fixture(side),enemy=put(g,'N',E.other(side),side==='w'?24:26,25+dc);E.refreshBoth(g);
   assert(E.orders(g,p).includes(enemy.pos));assert(E.action(g,{type:'move',unitId:p.id,to:enemy.pos}).ok);assert(!enemy.alive);assert.equal(g.ap,2);
  }
 });
 test(`${side}: friendly blockers, backwards, sideways and double steps forbidden`,()=>{
  const {g,p}=fixture(side),fr=side==='w'?-1:1;const ally=put(g,'P',side,25+fr,24);E.refreshBoth(g);
  assert(!E.orders(g,p).includes(ally.pos));
  for(const [r,c] of [[25,24],[25,26],[25-fr,25],[25+2*fr,25]])assert(!E.action(g,{type:'move',unitId:p.id,to:sq(g,r,c)}).ok);
  assert.equal(g.ap,3);
 });
}
test('old lateral detour removed even when forward square is water',()=>{
 const {g,p}=fixture();g.terrain[p.pos-g.n]=E.T.WATER;E.refreshBoth(g);
 assert(!E.orders(g,p).includes(p.pos-1));assert(!E.orders(g,p).includes(p.pos+1));assert(E.orders(g,p).includes(p.pos-g.n-1));
});
test('water and mountains still block diagonal pawn movement',()=>{
 const {g,p}=fixture();g.terrain[p.pos-g.n-1]=E.T.WATER;g.terrain[p.pos-g.n+1]=E.T.MOUNTAIN;E.refreshBoth(g);assert.deepEqual(E.orders(g,p),[p.pos-g.n]);
});
test('pawn orders do not expose a hidden diagonal blocker; execution cannot blind-capture',()=>{
 const {g,p}=fixture(),j=p.pos-g.n-1;
 // Use a remembered square outside current sight to isolate the collision contract.
 const enemy=put(g,'N','b',24,24);g.players.w.seen[j]=1;g.players.w.sight[j]=0;g.players.w.terrainMemory[j]=E.T.PLAIN;
 const before=[...E.orders(g,p)];enemy.pos=sq(g,20,20);assert.deepEqual(E.orders(g,p),before);enemy.pos=j;
 const old=p.pos;assert(E.action(g,{type:'move',unitId:p.id,to:j}).ok);assert.equal(p.pos,old);assert(enemy.alive);assert.equal(g.ap,2);
});
test('pawn cannot be ordered onto an unexplored forward square',()=>{
 const {g,p}=fixture(),j=p.pos-g.n;g.players.w.seen[j]=0;g.players.w.sight[j]=0;g.players.w.terrainMemory[j]=-1;assert(!E.orders(g,p).includes(j));
});
test('rook 2 / bishop 1 costs are actually deducted in both budgets',()=>{
 for(const mode of ['roomy','original'])for(const [type,cost] of [['R',2],['B',1]]){
  const {g,p}=fixture();g.commandMode=mode;g.ap=E.commandPower(g,'w');p.type=type;E.refreshBoth(g);const old=g.ap;
  assert(E.action(g,{type:'move',unitId:p.id,to:E.orders(g,p)[0]}).ok);assert.equal(g.ap,old-cost);
 }
});
test('one camp alone reveals its center plus exactly eight neighbors',()=>{
 const {g,p}=fixture(),c=camp(g,p);p.alive=false;E.refreshBoth(g);assert.equal(E.campSight(g,c).length,9);assert.equal(g.players.w.sight[c.pos-2*g.n],0);
});
test('friendly pawn garrison adds exactly one outer ring and loses it on leaving',()=>{
 const {g,p}=fixture(),c=camp(g,p),behind=c.pos+2*g.n;assert.equal(E.campSight(g,c).length,25);assert.equal(g.players.w.sight[behind],1);
 assert(E.action(g,{type:'move',unitId:p.id,to:c.pos-g.n}).ok);assert.equal(E.campSight(g,c).length,9);assert.equal(g.players.w.sight[behind],0);assert.equal(g.players.w.seen[behind],1);
});
test('only pawns garrison camps in new games; enemy pawns never extend our vision',()=>{
 const {g,p}=fixture(),c=camp(g,p);assert.equal(E.campSight(g,c).length,25);
 p.side='b';assert.equal(E.campSight(g,c).length,9);
 assert.equal(g.units.filter(u=>u.alive&&u.type==='V').length,0);
});
test('forest/mountain block camp outer sight but not the adjacent obstacle tile',()=>{
 for(const terrain of [E.T.FOREST,E.T.MOUNTAIN]){const {g,p}=fixture(),c=camp(g,p),near=p.pos-g.n,far=p.pos-2*g.n;g.terrain[near]=terrain;
  const sight=E.campSight(g,c);assert(sight.includes(near));assert(!sight.includes(far));
 }
});
test('camp sight at map edge remains inside board bounds',()=>{
 const {g,p}=fixture();p.pos=0;const c=camp(g,p);assert.equal(E.campSight(g,c).length,9);p.alive=false;assert.equal(E.campSight(g,c).length,4);
});
test('terrain outside remaining camp sight stays remembered, not live',()=>{
 const {g,p}=fixture(),c=camp(g,p),j=c.pos+2*g.n;g.terrain[j]=E.T.FOREST;E.refreshBoth(g);assert.equal(g.players.w.terrainMemory[j],E.T.FOREST);
 p.pos-=g.n;E.refreshBoth(g);assert.equal(g.players.w.sight[j],0);g.terrain[j]=E.T.MOUNTAIN;E.refreshBoth(g);
 assert.equal(E.rememberedTerrain(g,'w',j),E.T.FOREST);
});
test('L1 forest clearing: normal CP, work lock, two own ticks, meaningful XP',()=>{
 const {g,p}=fixture();g.terrain[p.pos]=E.T.FOREST;E.refreshBoth(g);const xp=p.totalXp;
 build(g,p,'clear_forest');assert.equal(g.ap,2);assert.equal(p.project.remaining,2);assert.deepEqual(E.orders(g,p),[]);assert(!E.action(g,{type:'move',unitId:p.id,to:p.pos-g.n}).ok);
 cycle(g);assert.equal(g.terrain[p.pos],E.T.FOREST);cycle(g);assert.equal(g.terrain[p.pos],E.T.PLAIN);assert.equal(p.project,null);assert.equal(p.totalXp-xp,E.WORK_XP.clear_forest);
});
test('L1 cannot bridge, build tower, excavate or build camps',()=>{
 const {g,p}=fixture();g.terrain[p.pos-g.n]=E.T.WATER;E.refreshBoth(g);
 for(const project of ['bridge','tower','excavate','camp']){assert.equal(E.eligibleBuilderTargets(g,p,project).length,0);assert(!E.action(g,{type:'build',unitId:p.id,project,to:p.pos}).ok);}
 assert.equal(g.ap,3);
});
test('L2 bridge works from shore and does not grant free water travel',()=>{
 const {g,p}=fixture('w',2),to=p.pos-g.n,old=p.pos;g.terrain[to]=E.T.WATER;E.refreshBoth(g);
 assert(!E.canEnter(g,p,to));assert(E.eligibleBuilderTargets(g,p,'bridge').includes(to));build(g,p,'bridge',to);assert.equal(p.pos,old);
 cycle(g);assert.equal(g.terrain[to],E.T.WATER);cycle(g);assert.equal(g.terrain[to],E.T.BRIDGE);assert.equal(p.pos,old);assert(E.action(g,{type:'move',unitId:p.id,to}).ok);
});
test('shore worker cannot bridge remote or unseen water',()=>{
 const {g,p}=fixture('w',2),near=p.pos-g.n,far=p.pos-2*g.n;g.terrain[near]=g.terrain[far]=E.T.WATER;E.refreshBoth(g);
 assert(!E.eligibleBuilderTargets(g,p,'bridge').includes(far));g.players.w.sight[near]=0;assert(!E.eligibleBuilderTargets(g,p,'bridge').includes(near));
});
test('L2 builds permanent watchtower in two work ticks with eight-neighbor sight',()=>{
 const {g,p}=fixture('w',2);build(g,p,'tower');cycle(g);assert.equal(g.towers.length,0);cycle(g);assert.equal(g.towers.length,1);assert.equal(g.terrain[p.pos],E.T.TOWER);
 const tower=g.towers[0];p.alive=false;E.refreshBoth(g);assert.equal(E.towerSight(g,tower).length,9);assert.equal(g.players.w.sight[tower.pos+g.n+1],1);assert.equal(g.players.w.sight[tower.pos+2*g.n],0);
});
test('L2 mountain work locked; L3 clears mountain from adjacent safe square',()=>{
 const {g,p}=fixture('w',2),to=p.pos-g.n,old=p.pos;g.terrain[to]=E.T.MOUNTAIN;E.refreshBoth(g);assert.equal(E.eligibleBuilderTargets(g,p,'excavate').length,0);
 p.level=3;assert(E.eligibleBuilderTargets(g,p,'excavate').includes(to));build(g,p,'excavate',to);cycle(g,2);assert.equal(g.terrain[to],E.T.MOUNTAIN);cycle(g);assert.equal(g.terrain[to],E.T.PLAIN);assert.equal(p.pos,old);
});
test('camp unlock is L4 (not L3 or old provisional L5); construction remains three ticks',()=>{
 const {g,p}=fixture('w',3);assert.equal(E.eligibleBuilderTargets(g,p,'camp').length,0);p.level=4;build(g,p,'camp');cycle(g,2);assert.equal(g.camps.length,0);cycle(g);assert.equal(g.camps.length,1);assert.equal(g.camps[0].queue,null);assert.equal(E.campSight(g,g.camps[0]).length,25);
});
test('pawn workers cannot perform engineer-only fill/tunnel tasks',()=>{
 const {g,p}=fixture('w',99);for(const project of ['fill','tunnel'])assert.equal(E.eligibleBuilderTargets(g,p,project).length,0);
});
test('insufficient CP rejects construction without mutating terrain, project or activation',()=>{
 const {g,p}=fixture('w',4);g.ap=0;const old=E.dump(g);assert(!E.action(g,{type:'build',unitId:p.id,project:'camp',to:p.pos}).ok);assert.equal(p.project,null);assert.equal(p.acted,-1);assert.equal(g.terrain[p.pos],E.T.PLAIN);
});
test('two friendly workers cannot reserve the same bridge site',()=>{
 const {g,p}=fixture('w',2),v=put(g,'P','w',25,24,2),to=p.pos-g.n;g.terrain[to]=E.T.WATER;E.refreshBoth(g);
 assert(E.eligibleBuilderTargets(g,v,'bridge').includes(to));build(g,p,'bridge',to);assert(!E.eligibleBuilderTargets(g,v,'bridge').includes(to));assert(!E.action(g,{type:'build',unitId:v.id,project:'bridge',to}).ok);
});
test('capture of working pawn cancels construction, without making it invulnerable/nonblocking',()=>{
 const {g,p}=fixture(),r=put(g,'R','b',24,25);g.terrain[p.pos]=E.T.FOREST;E.refreshBoth(g);const site=p.pos;build(g,p,'clear_forest');E.endTurn(g);
 assert.equal(E.at(g,site).id,p.id);assert(E.action(g,{type:'move',unitId:r.id,to:site}).ok);assert(!p.alive);assert.equal(p.project,null);E.endTurn(g);cycle(g);assert.equal(g.terrain[site],E.T.FOREST);
});
test('changed worksite cancels project rather than overwriting unrelated terrain',()=>{
 const {g,p}=fixture('w',4);build(g,p,'camp');g.terrain[p.pos]=E.T.SHRINE;cycle(g);assert.equal(g.terrain[p.pos],E.T.SHRINE);assert.equal(p.project,null);assert.equal(g.camps.length,0);
});
test('work XP is once per project/site/side, not repeatable by resetting a tile',()=>{
 const {g,p}=fixture();g.terrain[p.pos]=E.T.FOREST;E.refreshBoth(g);build(g,p,'clear_forest');cycle(g,2);const xp=p.totalXp;
 g.terrain[p.pos]=E.T.FOREST;E.refreshBoth(g);build(g,p,'clear_forest');cycle(g,2);assert.equal(p.totalXp,xp);
});
for(const mode of ['sacrifice','stay'])for(const type of ['P','N','B'])test(`${mode}: exact ${type==='P'?2:1} level-1 ${E.P[type]} batch in ${mode==='sacrifice'?2:5} own ticks`,()=>{
 const {g,p}=fixture('w',4),c=camp(g,p),king=E.king(g,'w'),xp=king.xp,ids=new Set(g.units.map(u=>u.id)),turns=mode==='sacrifice'?2:5;
 p.job='scout';p.xp=3;p.bond='devoted';p.cpDiscount=1;E.prepareSkills(p);
 const result=E.action(g,{type:'trainCamp',unitId:p.id,piece:type,mode});assert(result.ok,result.error);assert.equal(g.ap,2);assert.equal(king.xp,xp);assert.equal(c.queue.total,turns);
 assert.equal(p.alive,mode==='stay');if(mode==='stay'){assert(p.project);assert.deepEqual(E.orders(g,p),[]);}else assert.equal(E.campSight(g,c).length,9);
 cycle(g,turns-1);assert.equal(g.units.filter(u=>!ids.has(u.id)).length,0);assert.equal(c.queue.remaining,1);
 cycle(g);assert.equal(c.queue,null);const born=g.units.filter(u=>!ids.has(u.id));assert.equal(born.length,type==='P'?2:1);
 for(const u of born){assert.equal(u.type,type);assert.equal(u.level,1);assert.equal(u.xp,0);assert.equal(u.totalXp,0);assert.equal(u.job,null);assert.equal(u.bond,null);assert.equal(u.cpDiscount,0);assert.equal(u.project,null);assert(!u.equippedSkills.includes('watch'));}
 assert.equal(new Set(born.map(u=>u.pos)).size,born.length);if(mode==='stay'){assert(p.alive);assert.equal(p.project,null);assert.equal(E.campSight(g,c).length,25);}
});
test('enemy turns do not tick pawn production; 2 and 5 are friendly-turn counts',()=>{
 const {g,p}=fixture('b',4),c=camp(g,p);assert(E.action(g,{type:'trainCamp',unitId:p.id,piece:'N',mode:'stay'}).ok);
 E.endTurn(g);assert.equal(c.queue.remaining,4);E.endTurn(g);assert.equal(c.queue.remaining,4);assert.equal(g.side,'b');
});
test('level-3 pawn cannot operate an existing camp, and omitted mode is rejected',()=>{
 const {g,p}=fixture('w',3),c=camp(g,p);assert(!E.action(g,{type:'trainCamp',unitId:p.id,piece:'P',mode:'stay'}).ok);p.level=4;
 assert(!E.action(g,{type:'trainCamp',unitId:p.id,piece:'P'}).ok);assert.equal(c.queue,null);assert(p.alive);assert.equal(g.ap,3);
});
test('camp output rejects queen/rook; the King cannot sacrifice himself',()=>{
 const {g,p}=fixture('w',4),c=camp(g,p);
 for(const type of ['Q','R','K','V'])assert(!E.action(g,{type:'trainCamp',unitId:p.id,piece:type,mode:'sacrifice'}).ok);
 assert(p.alive);assert.equal(c.queue,null);
 const k=E.king(g,'w');assert(!E.action(g,{type:'trainCamp',unitId:k.id,piece:'P',mode:'sacrifice'}).ok);
});
test('capture of stationed pawn cancels its five-turn queue immediately',()=>{
 const {g,p}=fixture('w',4),c=camp(g,p),r=put(g,'R','b',24,25),before=g.units.length;E.refreshBoth(g);
 assert(E.action(g,{type:'trainCamp',unitId:p.id,piece:'N',mode:'stay'}).ok);E.endTurn(g);assert(E.action(g,{type:'move',unitId:r.id,to:p.pos}).ok);assert.equal(c.queue,null);assert(!p.alive);assert.equal(p.project,null);E.endTurn(g);cycle(g,6);assert.equal(g.units.length,before);
});
test('completed batch waits atomically for enough exits, never loses/duplicates its second pawn',()=>{
 const {g,p}=fixture('w',4),c=camp(g,p),ids=new Set(g.units.map(u=>u.id));
 for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++)if(dr||dc)g.terrain[sq(g,25+dr,25+dc)]=E.T.MOUNTAIN;
 E.refreshBoth(g);assert(E.action(g,{type:'trainCamp',unitId:p.id,piece:'P',mode:'sacrifice'}).ok);cycle(g,2);assert(c.queue);assert.equal(c.queue.remaining,0);assert.equal(g.units.filter(u=>!ids.has(u.id)).length,0);
 g.terrain[c.pos-g.n]=E.T.PLAIN;cycle(g);assert.equal(c.queue,null);assert.equal(g.units.filter(u=>!ids.has(u.id)).length,2);cycle(g,2);assert.equal(g.units.filter(u=>!ids.has(u.id)).length,2);
});
test('army capacity reserves whole batches and accounts for sacrificed operator',()=>{
 const {g,p}=fixture('w',4),c=camp(g,p);for(let i=0;E.combatUnits(g,'w').length<19;i++)put(g,'P','w',10,2+i);
 assert(!E.action(g,{type:'trainCamp',unitId:p.id,piece:'P',mode:'stay'}).ok);assert.equal(c.queue,null);
 assert(E.action(g,{type:'trainCamp',unitId:p.id,piece:'P',mode:'sacrifice'}).ok);assert.equal(E.reservedRecruits(g,'w'),2);assert.equal(E.trainingCapacity(g,'w'),0);cycle(g,2);assert.equal(E.combatUnits(g,'w').length,20);
});
test('parallel queues cannot overbook the army cap; fresh replacements cannot immediately operate camps',()=>{
 const {g,p}=fixture('w',4),c=camp(g,p),p2=put(g,'P','w',30,30,4);camp(g,p2);for(let i=0;E.combatUnits(g,'w').length<18;i++)put(g,'P','w',10,2+i);
 assert(E.action(g,{type:'trainCamp',unitId:p.id,piece:'P',mode:'stay'}).ok);
 assert(!E.action(g,{type:'trainCamp',unitId:p2.id,piece:'N',mode:'stay'}).ok);assert.equal(E.reservedRecruits(g,'w'),2);
 cycle(g,5);const recruits=E.withSide(g,'w').filter(u=>u.summonedAt);assert.equal(recruits.length,2);assert(recruits.every(u=>!E.canOperateCamp(u)));
});
test('pawn-mode durations remain 2/5 even in a heavily used camp',()=>{
 for(const mode of ['stay','sacrifice']){const {g,p}=fixture('w',4),c=camp(g,p);c.trained.P=99;assert(E.action(g,{type:'trainCamp',unitId:p.id,piece:'P',mode}).ok);assert.equal(c.queue.total,mode==='stay'?5:2);}
});
test('save/load preserves towers, shore projects, pawn queues, work XP ledger and exact remaining CP',()=>{
 const {g,p}=fixture('w',4),c=camp(g,p);assert(E.action(g,{type:'trainCamp',unitId:p.id,piece:'B',mode:'stay'}).ok);
 const p2=put(g,'P','w',30,30,2);g.terrain[sq(g,29,30)]=E.T.WATER;E.refreshBoth(g);build(g,p2,'bridge',sq(g,29,30));
 const tower={side:'w',pos:sq(g,35,35)};g.towers.push(tower);g.terrain[tower.pos]=E.T.TOWER;g.workAwards.w['tower:'+tower.pos]=true;
 const h=E.load(E.dump(g));assert.equal(h.ap,1);assert.equal(h.version,15);assert.deepEqual(h.towers,g.towers);assert.deepEqual(h.workAwards,g.workAwards);assert.equal(E.byId(h,p2.id).pos,p2.pos);assert.notEqual(p2.pos,p2.project.pos);assert.deepEqual(h.camps[0].queue,c.queue);cycle(h,5);assert.equal(h.camps[0].queue,null);assert.equal(h.terrain[sq(h,29,30)],E.T.BRIDGE);
});
test('old v0.5.6 engineer training migrates to royal order without recharging XP',()=>{
 const Old=require('./fixtures/engine_v056.cjs');const old=Old.create({size:50,seed:43971});
 const v=Old.civilians(old,'w')[0];assert(Old.action(old,{type:'trainCamp',unitId:v.id,piece:'P'}).ok);
 old.version=8;delete old.towers;delete old.workAwards;
 const q=old.camps.find(c=>c.side==='w').queue;delete q.kind;delete q.mode;delete q.count;old.ap=1;
 const h=E.load(Old.dump(old));const queue=h.camps.find(c=>c.side==='w').queue;
 assert.equal(h.version,15);assert.equal(h.ap,1);assert.equal(E.king(h,'w').xp,0);
 assert.equal(h.units.filter(x=>x.alive&&x.type==='V').length,0);
 assert.equal(queue.count,1);assert.equal(queue.workerId,null);assert.equal(queue.remaining,2);
 const before=E.combatUnits(h,'w').length;cycle(h,2);
 assert.equal(E.combatUnits(h,'w').length,before+1);
});
test('no separate camp-count cap: a level-4 pawn can build a third camp',()=>{
 const g=E.create({size:50,seed:43971,startingCamp:'ready'}),p=E.withSide(g,'w').find(u=>u.type==='P');
 const extra=sq(g,45,45);g.terrain[extra]=E.T.CAMP;
 g.camps.push({side:'w',pos:extra,queue:null,trained:{P:0,N:0,B:0}});
 assert.equal(g.camps.filter(c=>c.side==='w').length,2);
 p.level=4;E.prepareSkills(p);g.terrain[p.pos]=E.T.PLAIN;E.refreshBoth(g);
 assert(E.eligibleBuilderTargets(g,p,'camp').includes(p.pos));
 assert(E.action(g,{type:'build',unitId:p.id,project:'camp',to:p.pos}).ok);
 cycle(g,3);assert.equal(g.camps.filter(c=>c.side==='w').length,3);
 assert.equal(g.terrain[p.pos],E.T.CAMP);
});
test('older engineer terrain projects are canceled without deleting the starting camp',()=>{
 const Old=require('./fixtures/engine_v056.cjs');const old=Old.create({size:50,seed:43971});
 const v=Old.civilians(old,'w')[0],oldcamp=old.camps.find(c=>c.side==='w');
 const site=v.pos;old.terrain[site]=Old.T.FOREST;v.project={kind:'clear_forest',pos:site,workerPos:site,remaining:2,total:2};
 const h=E.load(Old.dump(old));
 assert.equal(h.units.filter(x=>x.type==='V'&&x.alive).length,0);
 assert.equal(h.camps.filter(c=>c.side==='w').length,1);
 assert.equal(h.camps.find(c=>c.side==='w').pos,oldcamp.pos);
 assert.equal(h.terrain[site],E.T.FOREST,'unfinished engineering should not complete for free');
 assert(h.log.some(x=>x.includes('in-progress terrain projects canceled')));
});
test('captured camp changes vision ownership and cancels the old production queue',()=>{
 const {g,p}=fixture('w',4),c=camp(g,p);g.campCaptureMode='on';assert(E.action(g,{type:'trainCamp',unitId:p.id,piece:'N',mode:'sacrifice'}).ok);
 const r=put(g,'R','b',25,25);g.side='b';g.round=2;g.ap=3;r.history=[{round:1}];assert(E.action(g,{type:'claimCamp',unitId:r.id}).ok);assert.equal(c.side,'b');assert.equal(c.queue,null);assert.equal(g.players.w.sight[c.pos+1],0);assert.equal(g.players.b.sight[c.pos],1);assert.equal(g.players.w.sight[c.pos],1,'temporary capture contact is retained');cycle(g);assert.equal(g.players.w.sight[c.pos],0);
});
test('king capture still ends the game; pending recruitment cannot continue after victory',()=>{
 const {g,p}=fixture('w',4);camp(g,p);assert(E.action(g,{type:'trainCamp',unitId:p.id,piece:'P',mode:'sacrifice'}).ok);
 const r=put(g,'R','w',47,48);E.refreshBoth(g);const bk=E.king(g,'b');assert(E.action(g,{type:'move',unitId:r.id,to:bk.pos}).ok);assert.equal(g.winner,'w');assert(!E.action(g,{type:'end'}).ok);
});
console.log(`WORKERS v0.5.10: ${passed}/${passed} passed`);

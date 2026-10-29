/* ChessLife v0.4 — deterministic-ish lightweight tactical engine. MIT-style permission: prototype for user development.
   Core game is plain JS; no dependencies. RNG, map generation, turns, XP, fog and rules run in Node tests and browsers. */
(function (root) {
'use strict';
const E={};
const T={PLAIN:0,FOREST:1,WATER:2,MOUNTAIN:3,SHRINE:4};
const P={K:'King',Q:'Queen',R:'Rook',B:'Bishop',N:'Knight',P:'Pawn',V:'Villager'};
const V={K:14,Q:11,R:7,B:5,N:5,P:2,V:0};
const COST={P:6,N:15,B:15,R:24,Q:60};
const COST_FOOD={P:3,N:4,B:4,R:5,Q:9};
const COST_WOOD={P:0,N:1,B:1,R:4,Q:6};
const CIVILIAN_JOBS={wood:'Lumberjack',gold:'Miner',food:'Hunter',idle:'Resting'};
const SKILL_SLOTS={K:3,Q:3,R:2,B:2,N:2,P:0,V:0};
function skillCapacity(u){
 let base=SKILL_SLOTS[u.type]||0,lv=u.level||1;
 if(u.type==='P')return (lv>=4?1:0)+(lv>=15?1:0)+(lv>=35?1:0);
 if(u.type==='V')return lv>=20?1:0;
 return base+(lv>=50?1:0);
}
function initialSkills(u){
 if(u.type==='K')return ['summon'];
 if(u.type==='Q')return {war:['stance'],phantom:['cloak','decoy'],choice:['sacrifice','siphon','mercy','surge']}[u.queenPath]||[];
 if(u.type==='P'&&u.job==='scout'&&u.level>=4)return ['watch'];
 return [];
}
function prepareSkills(u){
 u.learnedSkills=Array.isArray(u.learnedSkills)?u.learnedSkills:[];
 u.equippedSkills=Array.isArray(u.equippedSkills)?u.equippedSkills:[];
 for(const skill of initialSkills(u))if(!u.learnedSkills.includes(skill))u.learnedSkills.push(skill);
 const valid=new Set(u.learnedSkills);
 u.equippedSkills=u.equippedSkills.filter((x,i,a)=>valid.has(x)&&a.indexOf(x)===i).slice(0,skillCapacity(u));
 for(const skill of u.learnedSkills){if(u.equippedSkills.length>=skillCapacity(u))break;
  if(!u.equippedSkills.includes(skill))u.equippedSkills.push(skill);
 }
}
function equipped(u,skill){return u.equippedSkills?.includes(skill)===true;}
function combatUnits(g,side){return withSide(g,side).filter(u=>u.type!=='V');}
function civilians(g,side){return withSide(g,side).filter(u=>u.type==='V');}
// Experimental, intentionally small tactical HP system. A level-1 pawn cannot
// one-shot a level-99 queen; skill choices still outweigh raw health inflation.
const BASE_HP={P:4,N:7,B:7,R:9,Q:14,K:12,V:6};
const BASE_DAMAGE={P:2,N:4,B:4,R:5,Q:7,K:3,V:0};
const HP_GROWTH={P:.55,N:.70,B:.70,R:.8,Q:.9,K:.8,V:.18};
function maxHp(u){return BASE_HP[u.type]+Math.floor(Math.sqrt(Math.max(0,Math.min(99,u.level||1)-1))*HP_GROWTH[u.type]);}
function hpOf(u){return Number.isFinite(u.hp)?u.hp:maxHp(u);}
function damageFor(u){return BASE_DAMAGE[u.type]+Math.floor(Math.sqrt(Math.max(0,Math.min(99,u.level||1)-1))/4);}
const PRESETS={
 // Roughly HALF the old opening force: Balanced 22→11, Explorers 24→12,
 // Fortress 21→11. Sparse openings give individual pieces room to grow.
 balanced:{name:'Balanced Court',back:'RNQKBR',pawns:5,extra:''},
 expedition:{name:'Explorers',back:'NNQKBN',pawns:6,extra:''},
 bastion:{name:'Fortress',back:'RBQKRR',pawns:5,extra:''}
};
const QPATH={war:'War Queen',phantom:'Phantom Queen',choice:'Choice Queen'};
const JOBS={swimmer:'Swimmer',climber:'Mountaineer',scout:'Scout',ninja:'Ninja'};
const GLYPHS={K:'♔',Q:'♕',R:'♖',B:'♗',N:'♘',P:'♙',V:'⚒',k:'♚',q:'♛',r:'♜',b:'♝',n:'♞',p:'♟︎',v:'⚒'};
const KNIGHT=[[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
const KING=[[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
const BISHOP=[[-1,-1],[-1,1],[1,-1],[1,1]];
const ROOK=[[-1,0],[1,0],[0,-1],[0,1]];
const DIR={K:KING,N:KNIGHT,B:BISHOP,R:ROOK,Q:BISHOP.concat(ROOK),V:KING};
const idx=(g,r,c)=>r*g.n+c;
const row=(g,i)=>Math.floor(i/g.n);
const col=(g,i)=>i%g.n;
const inside=(g,r,c)=>r>=0&&c>=0&&r<g.n&&c<g.n;
const posName=(g,i)=>String.fromCharCode(65+col(g,i)%26)+(col(g,i)>=26?String.fromCharCode(65+Math.floor(col(g,i)/26)-1):'')+'-'+(g.n-row(g,i));
const other=s=>s==='w'?'b':'w';
const rnum=g=>{let t=g.rng>>>0;t=(t+0x6D2B79F5)>>>0;g.rng=t;let z=Math.imul(t^(t>>>15),t|1);z^=z+Math.imul(z^(z>>>7),z|61);return((z^(z>>>14))>>>0)/4294967296;};
const rint=(g,n)=>Math.floor(rnum(g)*n);
const distance=(g,a,b)=>Math.max(Math.abs(row(g,a)-row(g,b)),Math.abs(col(g,a)-col(g,b)));
const manhattan=(g,a,b)=>Math.abs(row(g,a)-row(g,b))+Math.abs(col(g,a)-col(g,b));
function log(g,s){g.log.unshift(`[${g.round}${g.side==='w'?' W':' B'}] ${s}`);g.log.length=Math.min(g.log.length,90);}
function byId(g,id){return g.units.find(u=>u.id===id&&u.alive);}
function at(g,pos){return g.units.find(u=>u.alive&&u.pos===pos);}
function withSide(g,s){return g.units.filter(u=>u.alive&&u.side===s);}
function queen(g,s){return g.units.find(u=>u.alive&&u.side===s&&u.type==='Q');}
function king(g,s){return g.units.find(u=>u.alive&&u.side===s&&u.type==='K');}
function expNext(u){let k=u.level;return (5+0.9*k+0.12*k*k)*(u.type==='Q'?1.5:1);}
function expProgress(u){return Math.min(1,u.xp/expNext(u));}
function addXp(g,u,amount,reason){if(!u||!u.alive||amount<=0||u.level>=99)return 0;
 const k=u.type==='K'?1.5:u.type==='Q'?.75:1;
 const loyalty=u.bond==='devoted'?.75:1;
 const gain=Math.round(amount*k*loyalty*100)/100;
 u.xp=Math.round((u.xp+gain)*100)/100;u.totalXp=Math.round((u.totalXp+gain)*100)/100;
 const was=u.level,oldMax=maxHp(u);
 while(u.level<99&&u.xp+1e-7>=expNext(u)){u.xp=Math.round((u.xp-expNext(u))*100)/100;u.level++;}
 if(u.level>=99)u.xp=0;
 if(u.level>was&&Number.isFinite(u.hp))u.hp=Math.min(maxHp(u),u.hp+maxHp(u)-oldMax);
 if(u.level>was)prepareSkills(u);
 if(u.level>was)log(g,`${P[u.type]} #${u.id} reached level ${u.level}! ${u.type==='P'&&!u.job?'Choose a pawn profession.':''}`);
 if(reason&&gain>=1)log(g,`${P[u.type]} #${u.id} +${gain.toFixed(2)} XP (${reason})`);
 return gain;
}
function addUnit(g,side,type,pos,opts={}){let u={id:g.nextId++,side,type,pos,alive:true,level:opts.level||1,xp:0,totalXp:0,job:opts.job||null,bond:null,bondTarget:null,bondTrust:0,acted:-1,bonus:0,ninjaRolled:-1,summonedAt:opts.summoned?g.round:0,ward:0,protectUsed:-1,fatigueUntil:0,cloakUntil:0,decoyCooldown:0,ritualCooldown:0,sacrificeUsed:-1,stance:opts.stance||'global',history:[],queenPath:type==='Q'?(opts.queenPath||'war'):null,homePos:opts.homePos??pos,prey:opts.prey||'dinosaur',injuredUntil:0,assignedSerial:-1,workSite:null};u.hp=maxHp(u);prepareSkills(u);g.units.push(u);return u;}
function shrineLocations(g){const m=Math.floor(g.n/2),offset=Math.min(15,Math.max(7,Math.floor(g.n/4))),small=Math.max(4,Math.floor(g.n/8));const out=[
 [m,m],[m-1,m-1],[m+1,m+1],[m,m-offset],[m,m+offset],
 [m-small,m-small],[m+small,m+small],[m-small,m+small],[m+small,m-small]
 ];return Array.from(new Set(out.filter(([r,c])=>inside(g,r,c)).map(([r,c])=>idx(g,r,c))));}
function generateTerrain(g){let n=g.n;g.terrain=Array(n*n).fill(T.PLAIN);
 // Rotational symmetry; initially block sources are limited to avoid arbitrary impassable walls.
 for(let r=0;r<n;r++)for(let c=0;c<n;c++){
  const j=idx(g,r,c),k=idx(g,n-1-r,n-1-c);if(j>k)continue;
  const z=rnum(g);let t=z<.027?T.WATER:z<.050?T.MOUNTAIN:z<.125?T.FOREST:T.PLAIN;
  g.terrain[j]=g.terrain[k]=t;
 }
 g.shrines=shrineLocations(g);for(const j of g.shrines){g.terrain[j]=T.SHRINE;}
}
function formation(g,s,preset,route){const def=PRESETS[preset]||PRESETS.balanced,m=Math.floor(g.n/2),offset=Math.max(7,Math.min(12,Math.floor(g.n*.18))),kingRow=m+(s==='w'?offset:-offset-1),backRow=kingRow,dir=s==='w'?-1:1;
 const back=def.back.split('').map(x=>x==='K'?'K':x);let cols=[];for(let i=0;i<back.length;i++)cols.push(m-Math.floor(back.length/2)+i);
 for(let i=0;i<back.length;i++){let r=backRow,c=cols[i];if(inside(g,r,c)){let j=idx(g,r,c);g.terrain[j]=T.PLAIN;addUnit(g,s,back[i],j,{queenPath:route});}}
 const pawnCount=def.pawns;for(let k=0;k<pawnCount;k++){let c=m-Math.floor(pawnCount/2)+k,r=kingRow+2*dir;
 if(inside(g,r,c)){const j=idx(g,r,c);g.terrain[j]=T.PLAIN;addUnit(g,s,'P',j);}}
 const extras=def.extra.split('');extras.forEach((type,k)=>{const r=kingRow+dir,c=m-5+k*5;if(inside(g,r,c)){let j=idx(g,r,c);if(!at(g,j)){g.terrain[j]=T.PLAIN;addUnit(g,s,type,j,{queenPath:route});}}});
}
// Civilian production is independent of the combat supply budget. Worker orders
// run automatically once on each player's new turn; they never attack soldiers.
function createCrew(g,side){
 const k=king(g,side),r=row(g,k.pos)+(side==='w'?3:-3),c=col(g,k.pos),sr=side==='w'?1:-1;
 const roles=[['wood',-5],['gold',0],['food',5]];
 for(const [role,offset] of roles){
  const cc=c+offset;if(!inside(g,r,cc))continue;
  const j=idx(g,r,cc);if(at(g,j))continue;
  g.terrain[j]=T.PLAIN;
  const u=addUnit(g,side,'V',j,{job:role});u.homePos=j;
  let resource=idx(g,r+sr,cc);
  if(role==='wood')g.terrain[resource]=T.FOREST;
  if(role==='gold')g.terrain[resource]=T.MOUNTAIN;
  if(role==='food'){
   g.terrain[resource]=T.PLAIN;
   g.wildlife.push({kind:'dinosaur',pos:resource,stock:6,maxStock:6,restockRound:0});
   const gator=idx(g,r-sr,cc);if(!at(g,gator)){
    g.terrain[gator]=T.WATER;
    g.wildlife.push({kind:'gator',pos:gator,stock:5,maxStock:5,restockRound:0});
   }
  }
 }
}
function jobSite(g,u){
 if(u.type!=='V')return null;
 if(u.job==='wood'||u.job==='gold'){
  const target=u.job==='wood'?T.FOREST:T.MOUNTAIN;
  let out=[];for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){
   const r=row(g,u.pos)+dr,c=col(g,u.pos)+dc;
   if(inside(g,r,c)&&g.terrain[idx(g,r,c)]===target)out.push(idx(g,r,c));
  }return out.length?out[0]:null;
 }
 if(u.job==='food'){
  const site=g.wildlife.find(x=>x.kind===u.prey&&x.stock>0&&distance(g,u.pos,x.pos)<=1);
  return site||null;
 }
 return null;
}
function runWork(g,side){
 const bank=g.players[side];let tally={food:0,wood:0,gold:0};
 for(const u of civilians(g,side)){
  if(hpOf(u)<maxHp(u))u.hp=Math.min(maxHp(u),hpOf(u)+1);
  if(u.injuredUntil>=g.round)continue;
  const site=jobSite(g,u);if(site===null)continue;
  if(u.job==='food'){
   const take=u.prey==='dinosaur'?3:2;
   const risk=u.prey==='dinosaur'?.2:.3;
   site.stock--;bank.food=Math.min(99,bank.food+take);tally.food+=take;
   if(rnum(g)<risk){u.hp=Math.max(1,hpOf(u)-(u.prey==='dinosaur'?2:1));
    if(u.hp===1){u.injuredUntil=g.round+1;log(g,`Villager #${u.id} was injured by a ${u.prey} and needs to recover.`);}
   }
  }else if(u.job==='wood'){bank.wood=Math.min(99,bank.wood+3);tally.wood+=3;}
  else if(u.job==='gold'){bank.gold=Math.min(99,bank.gold+2);tally.gold+=2;}
  if(!u.workHistory)u.workHistory={};
  let key=u.job+':'+(typeof site==='number'?site:site.pos),count=u.workHistory[key]||0;
  // Skillful labor still earns XP; repeatedly farming one source has diminishing returns.
  addXp(g,u,count<4?0.6:0.15,'production');u.workHistory[key]=count+1;
 }
 if(tally.food||tally.wood||tally.gold)log(g,`${side==='w'?'White':'Black'} villagers produced ${tally.food} food, ${tally.wood} wood, ${tally.gold} gold.`);
}
function recoverWildlife(g){if(g.side!=='w')return;
 for(const site of g.wildlife)if(site.stock<site.maxStock&&g.round>site.restockRound+5){site.stock++;site.restockRound=g.round;}
}
function assignWork(g,u,job,prey){
 if(u.type!=='V'||!CIVILIAN_JOBS[job])return 'Choose a civilian worker and an allowed job.';
 if(u.assignedSerial===g.serial)return 'This villager has already received new orders this turn.';
 if(job==='food'&&!['dinosaur','gator'].includes(prey))return 'Choose dinosaur or gator hunting.';
 u.job=job;u.prey=job==='food'?prey:u.prey;u.assignedSerial=g.serial;
 log(g,`Villager #${u.id} assigned to ${job==='food'?'hunt '+prey:CIVILIAN_JOBS[job]}. Automatic work starts next friendly turn if a site is adjacent.`);
 return null;
}
function raidVillager(g,victim,attacker){
 // Raiders disrupt an economy but cannot kill or permanently XP-farm civilians.
 const fresh=victim.injuredUntil<g.round;
 const bank=g.players[victim.side];
 let loss={food:0,gold:0,wood:0};
 if(fresh){
  const res=victim.job==='food'?'food':victim.job==='wood'?'wood':'gold';
  loss[res]=Math.min(3,bank[res]||0);bank[res]-=loss[res];
  victim.xp=Math.max(0,Math.round((victim.xp*.90)*100)/100);
  victim.hp=1;victim.injuredUntil=g.round+2;
 }
 let home=victim.homePos??victim.pos;
 const candidates=[];for(let rr=-3;rr<=3;rr++)for(let cc=-3;cc<=3;cc++){
  const r=row(g,home)+rr,c=col(g,home)+cc;if(!inside(g,r,c))continue;
  const j=idx(g,r,c);if(j===attacker.pos||at(g,j)&&j!==victim.pos||g.terrain[j]===T.MOUNTAIN||g.terrain[j]===T.WATER)continue;
  candidates.push(j);
 }
 candidates.sort((a,b)=>distance(g,a,home)-distance(g,b,home));
 if(candidates.length)victim.pos=candidates[0];
 g.lastEvent={type:'civilian_raid',side:attacker.side,victimId:victim.id,from:attacker.pos,to:victim.pos};
 log(g,`${P[attacker.type]} #${attacker.id} raided Villager #${victim.id}: nonlethal rout${fresh?' (injury, lost supplies and unspent XP)':''}. No combat XP awarded.`);
}
function equipAction(g,u,skill,replace){
 prepareSkills(u);
 if(!u.learnedSkills.includes(skill))return 'This skill is not learned.';
 if(equipped(u,skill))return 'Already equipped.';
 if(u.acted===g.serial)return 'This piece has already acted.';
 if(!king(g,u.side)||distance(g,u.pos,king(g,u.side).pos)>4&&g.terrain[u.pos]!==T.SHRINE)return 'Change skill loadouts near your king or at a shrine.';
 if(u.equippedSkills.length>=skillCapacity(u)){
  if(!u.equippedSkills.includes(replace))return 'Choose an equipped skill to replace.';
  u.equippedSkills.splice(u.equippedSkills.indexOf(replace),1);
 }
 if(u.equippedSkills.length>=skillCapacity(u))return 'No free skill slot.';
 u.equippedSkills.push(skill);u.acted=g.serial;g.ap--;
 log(g,`${P[u.type]} #${u.id} equipped ${skill}${replace?' instead of '+replace:''}.`);
 return null;
}
function create(options={}){const n=[30,50,70].includes(Number(options.size))?Number(options.size):50;const seed=(Number(options.seed)>>>0)||43971;
 const g={version:4,n,seed,rng:seed,hpMode:options.hpMode!==false,terrain:[],shrines:[],wildlife:[],units:[],nextId:1,players:{w:{gold:18,food:12,wood:8,essence:0,seen:Array(n*n).fill(0),sight:Array(n*n).fill(0),lastSeen:{},firstSeenUnits:{},shrineClaim:{},ai:false},b:{gold:18,food:12,wood:8,essence:0,seen:Array(n*n).fill(0),sight:Array(n*n).fill(0),lastSeen:{},firstSeenUnits:{},shrineClaim:{},ai:true}},beacons:[],decoys:[],side:'w',ap:3,round:1,serial:1,winner:null,log:[],armyW:options.armyW||'balanced',armyB:options.armyB||'expedition',routeW:options.routeW||'war',routeB:options.routeB||'phantom',lastEvent:null};
 generateTerrain(g);formation(g,'w',g.armyW,g.routeW);formation(g,'b',g.armyB,g.routeB);createCrew(g,'w');createCrew(g,'b');
 for(const s of ['w','b'])refreshSight(g,s,null,true);
 log(g,`ChessLife ${n}×${n}. ${g.hpMode?'Tactical HP enabled':'Classic one-hit captures'}. Three actions per turn. Defeat the opposing king; no stalemate.`);
 return g;
}
function canEnter(g,u,i){if(i<0||i>=g.n*g.n)return false;const t=g.terrain[i];if(t===T.WATER&&!(u.type==='P'&&u.job==='swimmer'))return false;if(t===T.MOUNTAIN&&!(u.type==='P'&&u.job==='climber'))return false;return true;}
function moves(g,u){if(!u||!u.alive)return[];const r=row(g,u.pos),c=col(g,u.pos),res=[],fr=u.side==='w'?-1:1;
 if(u.type==='V'){for(const [dr,dc] of KING){let rr=r+dr,cc=c+dc;if(inside(g,rr,cc)){const j=idx(g,rr,cc);if(canEnter(g,u,j)&&!at(g,j))res.push(j);}}return res;}
 if(u.type==='P'){
  const rr=r+fr;if(inside(g,rr,c)){let j=idx(g,rr,c);if(canEnter(g,u,j)&&!at(g,j))res.push(j);}
  for(let dc of [-1,1])if(inside(g,rr,c+dc)){let j=idx(g,rr,c+dc),o=at(g,j);if(canEnter(g,u,j)&&o&&o.side!==u.side)res.push(j);}
  return res;
 }
 for(const [dr,dc] of DIR[u.type]){
  const max=(u.type==='B'||u.type==='R'||u.type==='Q')?7:1;
  for(let step=1;step<=max;step++){
   let rr=r+dr*step,cc=c+dc*step;if(!inside(g,rr,cc))break;
   let j=idx(g,rr,cc);if(!canEnter(g,u,j))break;
   let o=at(g,j);if(o&&o.side===u.side)break;
   res.push(j);if(o)break;
  }
 }
 return res;
}
/* Fog-safe planned destinations: a player knows the geometry, remembered terrain and
   currently OBSERVED pieces, but not enemy units hidden in mist or under a cloak.
   Unexplored squares block a ray instead of being speculative destinations. */
function knownOccupant(g,side,pos){const u=at(g,pos);return u&&(u.side===side||canObserveUnit(g,side,u))?u:null;}
function orders(g,u){
 if(!u||!u.alive)return [];
 const side=u.side,seen=g.players[side].seen,res=[],r=row(g,u.pos),c=col(g,u.pos),fr=side==='w'?-1:1;
 const known=i=>!!seen[i]&&canEnter(g,u,i);
 if(u.type==='V'){for(const [dr,dc] of KING){let rr=r+dr,cc=c+dc;if(inside(g,rr,cc)){const j=idx(g,rr,cc);if(known(j)&&!knownOccupant(g,side,j))res.push(j);}}return res;}
 if(u.type==='P'){
  const rr=r+fr;
  if(inside(g,rr,c)){
   const j=idx(g,rr,c);
   if(known(j)&&!knownOccupant(g,side,j)&&!apparentEnemy(g,side,j))res.push(j);
  }
  for(const dc of [-1,1])if(inside(g,rr,c+dc)){
   const j=idx(g,rr,c+dc),enemy=apparentEnemy(g,side,j);
   if(known(j)&&enemy)res.push(j);
  }
  return res;
 }
 for(const [dr,dc] of DIR[u.type]){
  const max=['B','R','Q'].includes(u.type)?7:1;
  for(let step=1;step<=max;step++){
   const rr=r+dr*step,cc=c+dc*step;
   if(!inside(g,rr,cc))break;
   const j=idx(g,rr,cc);
   if(!known(j))break; // Never traverse a tile the army has not explored.
   const occupier=knownOccupant(g,side,j);
   if(occupier&&occupier.side===side)break;
   res.push(j);
   // Enemy units that are currently visible block rays as usual.
   // Hidden pieces do not shorten the order preview; execution resolves collisions.
   if(occupier||apparentEnemy(g,side,j)?.decoy)break;
   if(max===1)break;
  }
 }
 return res;
}
function baseVision(u){return {K:3,Q:4,R:3,B:3,N:4,P:2,V:2}[u.type]||2;}
function visionRadius(g,u){let x=baseVision(u);if(u.type==='N'&&u.level>=2)x+=1;if(u.type==='N'&&u.level>=15)x+=1;
 if(u.type==='P'&&u.job==='scout')x+=u.level>=10?3:2;
 if(u.type==='P'&&u.job==='climber'&&g.terrain[u.pos]===T.MOUNTAIN)x++;
 let q=queen(g,u.side);
 if(q&&q.queenPath==='war'){if(q.stance==='global')x+=1;else if(distance(g,q.pos,u.pos)<=4)x+=2;}
 if(u.type==='Q'&&withSide(g,u.side).some(b=>b.type==='B'&&b.bond==='lover'&&b.bondTarget===u.id&&distance(g,b.pos,u.pos)<=3))x++;
 if(u.fatigueUntil>=g.serial)x=Math.max(1,x-1);
 return Math.min(9,x);
}
function los(g,fr,fc,tr,tc){let dy=Math.abs(tr-fr),dx=Math.abs(tc-fc),sy=fr<tr?1:-1,sx=fc<tc?1:-1,err=dx-dy,x=fc,y=fr;
 while(x!==tc||y!==tr){let e2=2*err;if(e2>-dy){err-=dy;x+=sx;}if(e2<dx){err+=dx;y+=sy;}
  if(x===tc&&y===tr)return true;
  if(!inside(g,y,x))return false;
  const t=g.terrain[idx(g,y,x)];if(t===T.MOUNTAIN||t===T.FOREST)return false;
 }return true;
}
function personalSight(g,u){let out=[],r=row(g,u.pos),c=col(g,u.pos),rad=visionRadius(g,u);
 for(let dr=-rad;dr<=rad;dr++)for(let dc=-rad;dc<=rad;dc++){
  if(Math.max(Math.abs(dr),Math.abs(dc))>rad)continue;
  let rr=r+dr,cc=c+dc;if(inside(g,rr,cc)&&los(g,r,c,rr,cc))out.push(idx(g,rr,cc));
 }return out;
}
function hiddenPhantom(g,u,watcher){if(!u||u.type!=='Q'||u.queenPath!=='phantom'||u.cloakUntil<g.serial||u.side===watcher)return false;
 for(const scout of withSide(g,watcher)){if(distance(g,scout.pos,u.pos)<=2&&(scout.type==='N'||scout.type==='K'||(scout.type==='P'&&scout.job==='scout')))return false;}
 return true;
}
function canObserveUnit(g,watcher,u){return !!u&&u.alive&&(u.side===watcher||!!g.players[watcher].sight[u.pos]&&!hiddenPhantom(g,u,watcher));}
function refreshSight(g,side,actorId,initial=false){const p=g.players[side],now=Array(g.n*g.n).fill(0);let personal=[];
 for(const u of withSide(g,side)){const cells=personalSight(g,u);for(const j of cells)now[j]=1;if(u.id===actorId)personal=cells;}
 for(const beacon of g.beacons)if(beacon.side===side&&beacon.until>=g.serial){const r=row(g,beacon.pos),c=col(g,beacon.pos);
  for(let dr=-beacon.range;dr<=beacon.range;dr++)for(let dc=-beacon.range;dc<=beacon.range;dc++)if(inside(g,r+dr,c+dc)&&Math.max(Math.abs(dr),Math.abs(dc))<=beacon.range&&los(g,r,c,r+dr,c+dc))now[idx(g,r+dr,c+dc)]=1;
 }
 p.sight=now;let discovered=0;const personalSet=new Set(personal);
 for(let j=0;j<now.length;j++)if(now[j]&&!p.seen[j]){p.seen[j]=1;if(personalSet.has(j))discovered++;}
 const actor=actorId?byId(g,actorId):null;
 if(actor&&!initial&&discovered>0)addXp(g,actor,discovered*.30,`explored ${discovered} new tiles`);
 for(const enemy of withSide(g,other(side))){if(canObserveUnit(g,side,enemy)){
  p.lastSeen[enemy.id]={id:enemy.id,type:enemy.type,pos:enemy.pos,round:g.round};
  if(!p.firstSeenUnits[enemy.id]){p.firstSeenUnits[enemy.id]=1;if(actor&&!initial)addXp(g,actor,1.5,'first contact');}
 }}
}
function refreshBoth(g,actorSide=null,actorId=null){for(const s of ['w','b'])refreshSight(g,s,s===actorSide?actorId:null);}
function claimedObjective(g,u){if(g.terrain[u.pos]!==T.SHRINE)return;const p=g.players[u.side],last=p.shrineClaim[u.pos];if(last!==undefined&&g.round-last<7)return;p.shrineClaim[u.pos]=g.round;addXp(g,u,5,'secured an ancient shrine');p.gold+=2;log(g,`${P[u.type]} #${u.id} secured an objective (+2 command).`);}
function wardFromWar(g,victim){let q=queen(g,victim.side);if(!q||q.queenPath!=='war'||q.stance!=='local'||distance(g,q.pos,victim.pos)>4)return false;
 if(victim.guardUsed===g.serial)return false;victim.guardUsed=g.serial;return true;}
function interceptByKnight(g,target,attacker){if(target.type!=='Q')return false;
 if(g.hpMode&&damageFor(attacker)<hpOf(target))return false; // Life-saving sacrifice, not automatic waste.
 let knight=withSide(g,target.side).find(u=>u.type==='N'&&u.bond==='protector'&&u.bondTarget===target.id&&distance(g,u.pos,target.pos)<=2&&u.protectUsed!==g.serial);
 if(!knight)return false;knight.alive=false;knight.protectUsed=g.serial;log(g,`Knight #${knight.id} sacrificed himself to intercept a strike on his queen.`);return true;
}
function onUnitKilled(g,unit){if(unit.bond==='lover'){
 let q=byId(g,unit.bondTarget);if(q){q.griefUntil=g.serial+3;log(g,`The queen mourns Bishop #${unit.id}; her sight is weakened temporarily.`);}
 }}
function chargeMove(g,unit){
 const usingBonus=unit.acted===g.serial&&unit.bonus>0;
 if(usingBonus)unit.bonus--;else{g.ap--;unit.acted=g.serial;}
 // A Ninja's 30% additional move is available after an interrupted first move,
 // too. Bonus moves are never rolled for twice or recursively.
 if(unit.type==='P'&&unit.job==='ninja'&&!usingBonus&&unit.ninjaRolled!==g.serial){
  unit.ninjaRolled=g.serial;
  if(rnum(g)<.30){unit.bonus=1;log(g,`Ninja pawn #${unit.id} earned one bonus move (30% chance).`);}
 }
 return usingBonus;
}
function rayPath(g,u,to){
 const dr=row(g,to)-row(g,u.pos),dc=col(g,to)-col(g,u.pos);
 if(!['B','R','Q'].includes(u.type)||(!dr&&!dc))return [to];
 const len=Math.max(Math.abs(dr),Math.abs(dc)),rstep=Math.sign(dr),cstep=Math.sign(dc),out=[];
 for(let step=1;step<=len;step++)out.push(idx(g,row(g,u.pos)+step*rstep,col(g,u.pos)+step*cstep));
 return out;
}
function moveAction(g,unit,to){
 if(unit.acted===g.serial&&unit.bonus<=0)return 'That unit has already acted this turn.';
 if(unit.type==='V'&&unit.injuredUntil>=g.round)return 'This villager is recovering and cannot move.';
 if(!orders(g,unit).includes(to))return 'Destination or route is not known to be legal. Explore black territory first.';
 const previous=unit.pos;
 // A speculative route may pass an unseen enemy. Resolve against real occupancy,
 // without leaking the unit through previews or allowing a blind capture.
 let stop=to,obstruction=null;
 let lastSafe=unit.pos;
 for(const j of rayPath(g,unit,to)){
  const o=at(g,j);
  if(o&&o.side!==unit.side&&!canObserveUnit(g,unit.side,o)){
   stop=lastSafe;obstruction=o;break;
  }
  // Defensive fall-back for an inconsistent memory snapshot: known occupied paths
  // would not have been offered by orders(), but an execution still cannot phase through.
  if(o&&j!==to){stop=lastSafe;obstruction=o;break;}
  lastSafe=j;
 }
 if(obstruction){
  chargeMove(g,unit);
  if(stop!==previous){unit.pos=stop;unit.history.unshift({from:previous,to:stop,round:g.round,interrupted:true});unit.history.length=Math.min(10,unit.history.length);claimedObjective(g,unit);}
  g.lastEvent={type:'interrupted',side:unit.side,unitId:unit.id,from:previous,to:stop,attempted:to};
  log(g,`${P[unit.type]} #${unit.id} ordered toward ${posName(g,to)}, but stopped at ${posName(g,stop)} before an unseen obstruction. Action consumed.`);
  refreshBoth(g,unit.side,unit.id);return null;
 }
 const dst=at(g,to);
 if(dst&&dst.side===unit.side)return 'Allied unit blocks this square.';
 const fake=g.decoys.find(d=>d.pos===to&&d.side!==unit.side&&d.until>=g.serial);
 if(fake){g.decoys=g.decoys.filter(d=>d!==fake);log(g,`A Phantom Queen decoy at ${posName(g,to)} dissolved under the attack.`);}
 // A guard or protector can block an otherwise lethal capture. The action is spent.
 if(dst&&dst.ward>=g.serial){dst.ward=0;log(g,`${P[dst.type]} #${dst.id} survived because a mercy ward absorbed the attack.`);chargeMove(g,unit);return null;}
 if(dst&&wardFromWar(g,dst)){log(g,`${P[dst.type]} #${dst.id} survived: War Queen guard intercepted the attack.`);chargeMove(g,unit);return null;}
 if(dst&&interceptByKnight(g,dst,unit)){chargeMove(g,unit);return null;}
 if(dst&&dst.type==='V'){chargeMove(g,unit);raidVillager(g,dst,unit);refreshBoth(g,unit.side,unit.id);return null;}
 chargeMove(g,unit);
 if(dst){
  if(g.hpMode){
   const before=hpOf(dst),dealt=Math.min(before,damageFor(unit));dst.hp=Math.max(0,before-dealt);
   // Modest encounter XP, once per attacker/target pair, not endlessly farmable by healing.
   if(!unit.hitXp)unit.hitXp={};
   if(!unit.hitXp[dst.id]){unit.hitXp[dst.id]=true;addXp(g,unit,Math.min(2,dealt*.30),'first meaningful strike');}
   if(dst.hp>0){
    g.lastEvent={type:'damage',side:unit.side,unitId:unit.id,targetId:dst.id,amount:dealt,remaining:dst.hp};
    log(g,`${P[unit.type]} #${unit.id} dealt ${dealt} damage to ${P[dst.type]} #${dst.id} (${dst.hp}/${maxHp(dst)} HP). Neither piece changed square.`);
    refreshBoth(g,unit.side,unit.id);return null;
   }
  }
  dst.alive=false;onUnitKilled(g,dst);const val=V[dst.type];const lowSummon=dst.summonedAt&&g.round-dst.summonedAt<5;
  addXp(g,unit,(4+val+Math.min(7,dst.level/5))*(lowSummon?.3:1),'defeated enemy');
  if(dst.type==='K'){g.winner=unit.side;log(g,`${unit.side==='w'?'White':'Black'} defeated the king and won.`);}
 }
 unit.pos=to;unit.history.unshift({from:previous,to,round:g.round});unit.history.length=Math.min(10,unit.history.length);
 claimedObjective(g,unit);
 log(g,`${unit.side==='w'?'White':'Black'} ${P[unit.type]} #${unit.id} ${posName(g,previous)} → ${posName(g,to)}${dst?' (captured '+P[dst.type]+')':''}.`);
 refreshBoth(g,unit.side,unit.id);
 return null;
}
function eligibleSummons(g,k,type){const rad=type==='P'?2:1,out=[];let r=row(g,k.pos),c=col(g,k.pos);
 for(let dr=-rad;dr<=rad;dr++)for(let dc=-rad;dc<=rad;dc++){if(!dr&&!dc)continue;let rr=r+dr,cc=c+dc;if(!inside(g,rr,cc))continue;let j=idx(g,rr,cc);if(!at(g,j)&&canEnter(g,{type:'K'},j)&&g.players[k.side].sight[j])out.push(j);}
 return out;
}
function summonAction(g,k,type,to){const lv={P:1,N:5,B:5,R:11,Q:55}[type];if(!lv)return 'Unknown summon.';
 if(k.level<lv)return `${P[type]} summoning unlocks at king level ${lv}.`;
 if(!equipped(k,'summon'))return 'Equip the king’s Summon skill first.';
 if(g.players[g.side].gold<COST[type]||g.players[g.side].food<COST_FOOD[type]||g.players[g.side].wood<COST_WOOD[type])return 'Not enough gold, food or wood.';
 if(!eligibleSummons(g,k,type).includes(to))return 'Summon near the king to a free, reachable tile.';
 if(k.acted===g.serial)return 'King has already acted this turn.';
 if(g.ap<(type==='Q'?3:2))return 'Not enough actions.';
 const all=combatUnits(g,k.side);if(all.length>=Math.min(24,15+Math.floor(k.level/8)))return 'Supply limit reached.';
 if(type==='Q'&&queen(g,k.side))return 'Only one queen may serve the army.';
 if(k.summonReady&&k.summonReady>g.serial)return 'The summoning circle is cooling down.';
 g.players[g.side].gold-=COST[type];g.players[g.side].food-=COST_FOOD[type];g.players[g.side].wood-=COST_WOOD[type];g.ap-=(type==='Q'?3:2);k.acted=g.serial;k.summonReady=g.serial+({P:2,N:3,B:3,R:4,Q:9}[type])*2;
 let u=addUnit(g,k.side,type,to,{summoned:true,level:Math.min(15,1+Math.floor(k.level/6)),queenPath:k.side==='w'?g.routeW:g.routeB});u.acted=g.serial;
 log(g,`King #${k.id} summoned level-${u.level} ${P[type]} #${u.id}.`);refreshBoth(g,k.side,k.id);return null;
}
function trainAction(g,u,job){if(u.type!=='P'||u.level<2||u.job)return 'Pawn must be level 2 or higher and have no profession.';
 if(!JOBS[job])return 'Unknown pawn profession.';
 if(u.acted===g.serial)return 'This pawn has acted already.';
 u.job=job;prepareSkills(u);u.acted=g.serial;g.ap--;log(g,`Pawn #${u.id} became a ${JOBS[job]}.`);refreshBoth(g,u.side,u.id);return null;
}
function bondAction(g,u,q){if(u.type==='K'||u.type==='Q'||u.level<2||u.bond)return 'Need an unbonded level-2+ pawn, knight, or bishop.';
 if(!q||q.side!==u.side||q.type!=='Q'||distance(g,u.pos,q.pos)>4)return 'The queen must be nearby (within 4 tiles).';
 if(u.acted===g.serial)return 'This piece already acted.';
 if(g.players[g.side].gold<5)return 'Bonding costs 5 command.';
 const bond=u.type==='P'?'devoted':u.type==='B'?'lover':u.type==='N'?'protector':null;
 if(!bond)return 'This piece has no relationship archetype yet.';
 g.players[g.side].gold-=5;g.ap--;u.acted=g.serial;u.bond=bond;u.bondTarget=q.id;u.bondTrust=10;
 if(bond==='lover')q.bond='lover';
 log(g,`${P[u.type]} #${u.id} formed a ${bond} bond with Queen #${q.id}.`);refreshBoth(g,u.side,u.id);return null;
}
function queenAction(g,q,ability,targetId,to){if(q.type!=='Q'||!q.alive)return 'Select a living queen.';
 if(q.acted===g.serial)return 'Queen has already acted this turn.';
 const bank=g.players[g.side];
 if(!equipped(q,ability))return 'That queen ability is learned but not equipped. Change the skill loadout near your king or a shrine.';
 if(q.queenPath==='war'){
  if(ability!=='stance')return 'This war skill is not available.';
  q.stance=q.stance==='global'?'local':'global';q.acted=g.serial;g.ap--;log(g,`War Queen switched to ${q.stance==='global'?'global passive (+1 vision for the army)':'local guard (+2 vision and protection within 4)'} stance.`);refreshBoth(g,q.side,q.id);return null;
 }
 if(q.queenPath==='phantom'){
  if(ability==='cloak'){
   if(bank.gold<7)return 'Cloak costs 7 command.';
   bank.gold-=7;q.cloakUntil=g.serial+6;q.acted=g.serial;g.ap--;log(g,`Phantom Queen vanished for three rounds (unless detected nearby).`);refreshBoth(g,q.side,q.id);return null;
  }
  if(ability==='decoy'){
   if(bank.gold<5)return 'A decoy costs 5 command.';
   if(typeof to!=='number'||distance(g,q.pos,to)>6||at(g,to)||g.terrain[to]===T.MOUNTAIN)return 'Place a decoy within 6 free tiles of the queen.';
   bank.gold-=5;q.acted=g.serial;g.ap--;g.decoys.push({side:q.side,pos:to,until:g.serial+6,source:q.id});log(g,`Phantom Queen planted a false queen sighting.`);refreshBoth(g,q.side,q.id);return null;
  }
  return 'Unknown Phantom spell.';
 }
 if(q.queenPath==='choice'){
  if(ability==='surge'){
   if(bank.essence<8)return 'A surge consumes 8 essence.';
   if(bank.surgeUsed===g.round)return 'Only one blood surge per round.';
   bank.essence-=8;bank.surgeUsed=g.round;q.acted=g.serial;g.ap--;g.ap+=2;log(g,`Choice Queen spent 8 essence to grant 2 extra actions (net +1).`);return null;
  }
  const ally=byId(g,targetId);
  if(!ally||ally.side!==q.side||ally.id===q.id||ally.type==='K'||distance(g,ally.pos,q.pos)>4)return 'Choose an allied non-king piece within four tiles.';
  if(ally.type==='V')return 'Civilians cannot be sacrificed or siphoned: their labor and protection are separate from the military economy.';
  if(ability==='sacrifice'){
   if(q.ritualCooldown>g.serial)return 'The ritual is on cooldown.';
   if(ally.summonedAt&&g.round-ally.summonedAt<5)return 'Freshly summoned units have no ritual value. Let them develop first.';
   let factor=ally.bond==='devoted'?1:ally.type==='P'&&ally.level>=6?.40:{P:.70,N:.60,B:.55,R:.35,Q:.20}[ally.type];
   let amount=Math.round((V[ally.type]+1.5*Math.sqrt(ally.level))*factor*10)/10;
   ally.alive=false;onUnitKilled(g,ally);bank.essence=Math.round((bank.essence+amount)*10)/10;q.ritualCooldown=g.serial+4;
   addXp(g,q,Math.min(8,amount*.6),'sacrificial bargain');q.acted=g.serial;g.ap--;
   log(g,`Choice Queen sacrificed ${P[ally.type]} #${ally.id} for ${amount.toFixed(1)} essence (${Math.round(factor*100)}% conversion).`);refreshBoth(g,q.side,q.id);return null;
  }
  if(ability==='siphon'){
   let taken=Math.min(ally.xp,Math.max(4,Math.floor(expNext(ally)*.35)));
   if(taken<1)return 'That ally has no unspent experience to siphon.';
   ally.xp=Math.max(0,Math.round((ally.xp-taken)*100)/100);ally.fatigueUntil=g.serial+4;ally.bondTrust=Math.max(0,ally.bondTrust-3);
   addXp(g,q,taken*.5,'nonlethal siphon');bank.gold+=2;q.acted=g.serial;g.ap--;
   log(g,`Choice Queen siphoned ${taken.toFixed(1)} XP from ${P[ally.type]} #${ally.id}, leaving it fatigued.`);refreshBoth(g,q.side,q.id);return null;
  }
  if(ability==='mercy'){
   if(bank.gold<5)return 'Protection costs 5 command.';
   bank.gold-=5;ally.ward=g.serial+2;ally.bondTrust+=4;q.acted=g.serial;g.ap--;
   log(g,`Choice Queen spared and protected ${P[ally.type]} #${ally.id}, strengthening loyalty.`);return null;
  }
  return 'Unknown choice ability.';
 }
 return 'Queen has no chosen path.';
}
function restAction(g,u){
 if(!g.hpMode)return 'Resting requires the experimental HP rules.';
 if(u.acted===g.serial)return 'This piece has already acted this turn.';
 const missing=maxHp(u)-hpOf(u);if(missing<=0)return 'Already at full HP.';
 const amount=Math.min(missing,g.terrain[u.pos]===T.SHRINE?4:2);
 u.hp=hpOf(u)+amount;u.acted=g.serial;g.ap--;
 log(g,`${P[u.type]} #${u.id} rested and recovered ${amount} HP (${u.hp}/${maxHp(u)}).`);refreshBoth(g,u.side,u.id);return null;
}
function scoutAction(g,u){if(u.type!=='P'||u.job!=='scout'||u.level<4||!equipped(u,'watch'))return 'Only a level-4+ Scout Pawn can establish a watch post.';
 const bank=g.players[g.side];if(bank.gold<6)return 'Watch post costs 6 command.';
 if(u.acted===g.serial)return 'Pawn has acted.';
 if(g.beacons.filter(b=>b.side===g.side&&b.until>=g.serial).length>=2)return 'Maximum two active watch posts.';
 bank.gold-=6;g.ap--;u.acted=g.serial;g.beacons.push({side:g.side,pos:u.pos,range:5,until:g.serial+8,source:u.id});
 log(g,`Scout Pawn #${u.id} set a temporary watch post (4 rounds).`);refreshBoth(g,u.side,u.id);return null;
}
function endTurn(g){if(g.winner)return null;
 for(const u of withSide(g,g.side))u.bonus=0; // bonus actions cannot be banked into a later turn
 g.side=other(g.side);g.serial++;if(g.side==='w')g.round++;
 g.ap=3;
 let bank=g.players[g.side];bank.gold=Math.min(99,bank.gold+3);recoverWildlife(g);
 for(const loc of g.shrines){let o=at(g,loc);if(o&&o.side===g.side)bank.gold=Math.min(90,bank.gold+2);}
 g.beacons=g.beacons.filter(b=>b.until>=g.serial);g.decoys=g.decoys.filter(d=>d.until>=g.serial);
 let q=queen(g,g.side);if(q&&q.griefUntil>=g.serial)q.fatigueUntil=q.griefUntil;
 // Local War stance drains command, and automatically switches to global if funds run out.
 if(q&&q.queenPath==='war'&&q.stance==='local'){
  if(bank.gold>=2)bank.gold-=2;
  else {q.stance='global';log(g,'War Queen could not sustain her local aura; switched to global stance.');}
 }
 runWork(g,g.side);
 refreshBoth(g);log(g,`${g.side==='w'?'White':'Black'} command phase begins (3 actions).`);return null;
}
function action(g,a){if(!g||g.winner)return {ok:false,error:'The game is finished.'};if(!a||!a.type)return {ok:false,error:'Unknown action.'};
 g.lastEvent=null;
 if(a.type==='end'){endTurn(g);return {ok:true};}
 const u=byId(g,a.unitId);
 if(a.type==='work'){if(!u||u.side!==g.side)return {ok:false,error:'Select one of your villagers.'};const err=assignWork(g,u,a.job,a.prey);return err?{ok:false,error:err}:{ok:true};}
 if(g.ap<=0&&!(a.type==='move'&&u&&u.bonus>0&&u.acted===g.serial))return {ok:false,error:'No actions left this turn (unless you have a Ninja bonus move).'};
 if(!u||u.side!==g.side)return {ok:false,error:'Select a living unit from the active army.'};
 let error='Unknown action type.';
 switch(a.type){
  case 'move':error=moveAction(g,u,a.to);break;
  case 'rest':error=restAction(g,u);break;
  case 'summon':error=u.type==='K'?summonAction(g,u,a.piece,a.to):'Only the king summons.';break;
  case 'train':error=trainAction(g,u,a.job);break;
  case 'bond':error=bondAction(g,u,queen(g,g.side));break;
  case 'queen':error=queenAction(g,u,a.ability,a.targetId,a.to);break;
  case 'watch':error=scoutAction(g,u);break;
  case 'equip':error=equipAction(g,u,a.skill,a.replace);break;
 }
 if(error)return {ok:false,error};
 if(!g.winner&&g.ap<=0&&!withSide(g,g.side).some(p=>p.bonus>0&&p.acted===g.serial))endTurn(g);
 return {ok:true};
}
function canAct(g,u){return u.side===g.side&&u.alive&&(u.type!=='V'||u.injuredUntil<g.round)&&(u.acted!==g.serial||u.bonus>0);}
function apparentEnemy(g,side,pos){const x=at(g,pos);if(x&&x.side!==side&&canObserveUnit(g,side,x))return x;
 const dec=g.decoys.find(d=>d.side!==side&&d.pos===pos&&d.until>=g.serial&&g.players[side].sight[pos]);if(dec)return {type:'Q',side:other(side),decoy:true};return null;
}
function aiChoice(g){if(g.winner||g.side!=='b')return null;
 let options=[];const me='b',sight=g.players[me].sight,opp=other(me);
 // King only summons when army is small or supplies are abundant; avoid spending every turn on pawns.
 let k=king(g,me);if(k&&canAct(g,k)&&equipped(k,'summon')&&(!k.summonReady||k.summonReady<=g.serial)&&g.ap>=2&&g.players.b.gold>=6&&g.players.b.food>=3&&combatUnits(g,me).length<Math.min(24,15+Math.floor(k.level/8))&&rnum(g)<.15){let spots=eligibleSummons(g,k,'P');if(spots.length)return {type:'summon',unitId:k.id,piece:'P',to:spots[rint(g,spots.length)]};}
 const visibleEnemy=withSide(g,opp).filter(u=>canObserveUnit(g,me,u));
 const objective=g.shrines.filter(j=>g.players[me].seen[j]&&knownOccupant(g,me,j)?.side!==me);
 for(const u of combatUnits(g,me)){
  if(!canAct(g,u))continue;
  for(const j of orders(g,u)){
   const tar=apparentEnemy(g,me,j),before=objective.length?Math.min(...objective.map(o=>manhattan(g,u.pos,o))):manhattan(g,u.pos,idx(g,Math.floor(g.n/2),Math.floor(g.n/2))),after=objective.length?Math.min(...objective.map(o=>manhattan(g,j,o))):manhattan(g,j,idx(g,Math.floor(g.n/2),Math.floor(g.n/2)));
   let score=0;
   if(tar){
    if(!g.hpMode)score+=tar.type==='K'?10000:(V[tar.type]*9+10);
    else{const lethal=damageFor(u)>=hpOf(tar);score+=lethal?(tar.type==='K'?10000:V[tar.type]*9+15):Math.min(damageFor(u),hpOf(tar))*3.5+V[tar.type]*.8;
     if(u.type==='K'&&!lethal)score-=12;}
   }
   if(g.terrain[j]===T.SHRINE)score+=knownOccupant(g,me,j)?.side==='b'?0:13;
   score+=Math.max(-5,Math.min(7,(before-after)*1.2));
   if(visibleEnemy.length){const dist0=Math.min(...visibleEnemy.map(x=>manhattan(g,u.pos,x.pos)));const dist1=Math.min(...visibleEnemy.map(x=>manhattan(g,j,x.pos)));score+=(dist0-dist1)*.35;}
   if(u.type==='K')score-=6;if(u.type==='Q'&&visibleEnemy.length)score+=1;
   if(u.history.some(h=>h.from===j&&g.round-h.round<3))score-=8;
   if(u.type==='P'&&u.job==='scout')score+=1;
   score+=rnum(g)*2.8;
   options.push({action:{type:'move',unitId:u.id,to:j},score});
  }
  if(u.type==='P'&&u.level>=2&&!u.job){options.push({action:{type:'train',unitId:u.id,job:'scout'},score:12+rnum(g)});}
  if(g.hpMode&&hpOf(u)<maxHp(u)*.65)options.push({action:{type:'rest',unitId:u.id},score:4+(1-hpOf(u)/maxHp(u))*10+rnum(g)});
 }
 if(!options.length)return {type:'end'};
 options.sort((a,b)=>b.score-a.score);
 // Avoid a completely deterministic opponent that always sends the same queen forward.
 let best=options[0];if(rnum(g)<.10)best=options[Math.min(rint(g,Math.min(options.length,6)),options.length-1)];return best.action;
}
function liveGhosts(g,side){let p=g.players[side],output=[];
 for(const key of Object.keys(p.lastSeen)){
  const ghost=p.lastSeen[key];if(p.sight[ghost.pos])continue; // last-known, not currently visible
  if(g.round-ghost.round<=10)output.push({...ghost,stale:true});
 }return output;
}
function objectiveInfo(g){return g.shrines.map(j=>({pos:j,occupant:at(g,j)?.side||null}));}
function dump(g){return JSON.stringify(g);}
function load(json){let obj=typeof json==='string'?JSON.parse(json):json;
 if(!obj||![2,3,4].includes(obj.version)||!Array.isArray(obj.units)||![30,50,70].includes(obj.n)||obj.terrain.length!==obj.n*obj.n)throw new Error('Not a compatible ChessLife v0.2–v0.4 saved match.');
 if(obj.version===2)obj.hpMode=false; // Preserve the legacy one-hit rule.
 if(obj.hpMode===undefined)obj.hpMode=false;
 obj.version=4;obj.wildlife=obj.wildlife||[];
 for(const side of ['w','b']){
  const bank=obj.players[side];bank.food??=12;bank.wood??=8;bank.gold??=18;
 }
 for(const u of obj.units){if(!Number.isFinite(u.hp))u.hp=maxHp(u);u.injuredUntil??=0;u.homePos??=u.pos;u.assignedSerial??=-1;u.prey??='dinosaur';prepareSkills(u);}
 refreshBoth(obj);return obj;}

Object.assign(E,{T,P,V,COST,COST_FOOD,COST_WOOD,CIVILIAN_JOBS,SKILL_SLOTS,skillCapacity,prepareSkills,equipped,combatUnits,civilians,jobSite,BASE_HP,BASE_DAMAGE,maxHp,hpOf,damageFor,PRESETS,QPATH,JOBS,GLYPHS,create,byId,at,withSide,queen,king,idx,row,col,posName,other,inside,distance,manhattan,moves,orders,knownOccupant,canEnter,visionRadius,personalSight,refreshSight,refreshBoth,addXp,expNext,expProgress,canObserveUnit,apparentEnemy,action,endTurn,aiChoice,eligibleSummons,liveGhosts,objectiveInfo,canAct,dump,load});
if(typeof module!=='undefined'&&module.exports)module.exports=E;
if(root)root.ChessLifeEngine=E;
})(typeof window!=='undefined'?window:undefined);
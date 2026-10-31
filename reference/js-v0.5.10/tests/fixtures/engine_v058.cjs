/* Stale-Mate v0.5.8 — deterministic-ish lightweight tactical engine. Experimental design snapshot; preserve older source separately.
   Core game is plain JS; no dependencies. RNG, map generation, turns, XP, fog and rules run in Node tests and browsers. */
(function (root) {
'use strict';
const E={};
const T={PLAIN:0,FOREST:1,WATER:2,MOUNTAIN:3,SHRINE:4,BRIDGE:5,CAMP:6,TUNNEL:7,TOWER:8};
const P={K:'King',Q:'Queen',R:'Rook',B:'Bishop',N:'Knight',P:'Pawn',V:'Villager'};
const V={K:14,Q:11,R:7,B:5,N:5,P:2,V:0};
const COST={P:6,N:15,B:15,R:24,Q:60};
const COST_FOOD={P:3,N:4,B:4,R:5,Q:9};
const COST_WOOD={P:0,N:1,B:1,R:4,Q:6};
const CIVILIAN_JOBS={idle:'Engineer'};
const WORK_PROJECTS={fill:1,clear_forest:2,bridge:2,excavate:3,tunnel:3,camp:3,tower:2};
const TRAIN_XP={P:3,N:8,B:10};
const TRAIN_TURNS={P:2,N:3,B:4};
// User-selected weak-worker ladder. Pawns are still capturable military units.
const PAWN_WORK_LEVELS={clear_forest:1,bridge:2,tower:2,excavate:3,camp:4,train:4};
const WORK_XP={clear_forest:2,bridge:2,tower:2,excavate:3,camp:3};
const MILITARY_CAP=20;
function isWorker(u){return !!u&&u.alive&&(u.type==='V'||u.type==='P');}
function laborers(g,side){return withSide(g,side).filter(isWorker);}
function canOperateCamp(u){return isWorker(u)&&(u.type==='V'||u.level>=PAWN_WORK_LEVELS.train);}
function campGarrison(g,camp){return laborers(g,camp.side).find(u=>u.pos===camp.pos);}
function structureSight(g,pos,reach){
 const r=row(g,pos),c=col(g,pos),out=[];
 for(let dr=-reach;dr<=reach;dr++)for(let dc=-reach;dc<=reach;dc++){
  const rr=r+dr,cc=c+dc;
  if(inside(g,rr,cc)&&los(g,r,c,rr,cc,false))out.push(idx(g,rr,cc));
 }
 return out;
}
function campSight(g,camp){return !camp||g.terrain[camp.pos]!==T.CAMP?[]:structureSight(g,camp.pos,campGarrison(g,camp)?2:1);}
function towerSight(g,tower){if(!tower||g.terrain[tower.pos]!==T.TOWER)return [];const watcher=at(g,tower.pos);return structureSight(g,tower.pos,watcher?.side===tower.side&&watcher.type==='P'&&equipped(watcher,'sentry_platform')?2:1);}
function pawnBatchSize(type){return type==='P'?2:1;}
function reservedRecruits(g,side){return (g.camps||[]).filter(c=>c.side===side&&c.queue).reduce((n,c)=>n+(c.queue.count||1),0);}
function trainingCapacity(g,side){return MILITARY_CAP-combatUnits(g,side).length-reservedRecruits(g,side);}
const CP_MILESTONES=[[1,2],[5,3],[15,4],[30,5],[50,6],[75,7],[95,8]];
// Balance trial: generous CP3 versus original CP2, explicitly saved per match.
const COMMAND_MODES={original:0,roomy:1};
const CHOICE_LEVELS=[10,25,45,70,90];
const EXPERIMENTAL_FISSION_LEVEL=60;
const MAX_CAPTURE_HITS=3;
// Slot counts are capacity, not free stat bonuses. Non-pawn Lv50 bonus is retained.
const SKILL_SLOTS={P:0,N:1,B:1,R:2,Q:3,K:2,V:0};
const PAWN_ROUTES={scout:'Pathfinder',pioneer:'Pioneer',guardian:'Companion'};
// Provisional authored catalogue. Effects are public; route affinity is a separate
// presentation setting. Routes confer NO extra hidden bonuses or type conversion.
const PAWN_SKILLS={};
function definePawnSkill(id,name,family,description,active=null){PAWN_SKILLS[id]={id,name,family,description,active};}
definePawnSkill('trailcraft','Trailcraft','scout','Passive: +1 sight layer along the three forward rays; terrain still blocks sight.');
definePawnSkill('flank_watch','Flank Watch','scout','Passive: see the two immediately sideways squares. This does not change movement or attacks.');
definePawnSkill('rear_watch','Rear Watch','scout','Passive: see the three immediately rearward squares. This does not change movement or attacks.');
definePawnSkill('forest_lore','Forest Lore','scout','Passive: your sight rays penetrate forests, but never mountains.');
definePawnSkill('swimming','River Walker','scout','Passive: your normal pawn moves may enter water. Attacks remain forward-diagonal only.');
definePawnSkill('climbing','Mountaineer','scout','Passive: your normal pawn moves may enter mountains. Mountains still block sight beyond them.');
definePawnSkill('signal_post','Signal Post','scout','Action: place a temporary radius-2 sight beacon at your square for four opposing response turns. Costs normal CP; 3-friendly-turn cooldown.','signal');
definePawnSkill('summit_watch','Summit Watch','scout','Passive: +1 forward sight layer while standing on a mountain; the normal sight cap remains six.');
definePawnSkill('long_sight','Long Sight','scout','Passive: +1 forward sight layer, stacking with Trailcraft up to the normal cap of six.');
definePawnSkill('sentry_platform','Sentry Platform','scout','Passive: a friendly watchtower gains one outer sight ring only while you are standing on it. Terrain blocks extended sight.');
definePawnSkill('far_signal','Far Signal','scout','Action: place a radius-3 sight beacon for four opposing response turns. Shares the Signal Post cooldown.','signal');
definePawnSkill('lasting_signal','Lasting Signal','scout','Action: place a radius-2 sight beacon for six opposing response turns. Shares the Signal Post cooldown.','signal');
definePawnSkill('woodsman','Woodsman','pioneer','Passive: forest clearing takes one friendly work turn instead of two.');
definePawnSkill('bridgewright','Bridgewright','pioneer','Passive: bridge construction takes one friendly work turn instead of two. Level-2 work gate remains.');
definePawnSkill('masonry','Masonry','pioneer','Passive: mountain excavation takes two friendly work turns instead of three. Level-3 gate remains.');
definePawnSkill('campwright','Campwright','pioneer','Passive: camp construction takes two friendly work turns instead of three. Level-4 gate remains; recruitment clocks are separate.');
definePawnSkill('towerwright','Towerwright','pioneer','Passive: watchtower construction takes one friendly work turn instead of two. Level-2 gate remains.');
definePawnSkill('land_reclamation','Land Reclamation','pioneer','Passive: at level 2+, unlock the engineer-style water-fill project (one work turn), from an adjacent visible shore.');
definePawnSkill('tunnelcraft','Tunnelcraft','pioneer','Passive: at level 3+, unlock tunnel construction through an adjacent visible mountain (three work turns).');
definePawnSkill('quarry_master','Quarry Master','pioneer','Passive: mountain excavation takes one friendly work turn. Replaces, rather than stacks below, the Masonry reduction.');
definePawnSkill('roadcrew','Road Crew','pioneer','Passive: forest clearing may target an adjacent visible square instead of only the square underfoot.');
definePawnSkill('field_survey','Field Survey','pioneer','Passive: build watchtowers on an adjacent visible, vacant plain square. You remain at the work position.');
definePawnSkill('site_planner','Site Planner','pioneer','Passive: build camps on an adjacent visible, vacant plain square. Level-4 gate remains; you must enter the completed camp to operate it.');
definePawnSkill('instructor','Instructor','pioneer','Passive: keeping this pawn stationed for a training batch takes four friendly turns instead of five. Sacrifice stays two; recruits stay level 1.');
definePawnSkill('cover','Cover','guardian','Action: protect one adjacent friendly pawn, knight, bishop or rook from one attack through the next enemy turn. No king/queen targets, no stacking. Normal CP; 3-friendly-turn shared guard cooldown.','guard');
definePawnSkill('sidestep','Sidestep','guardian','Action: move one square sideways without capturing, only through explored passable terrain. Normal CP; 2-friendly-turn shared maneuver cooldown.','maneuver');
definePawnSkill('withdraw','Withdraw','guardian','Action: move one square straight backward without capturing. Known passable route required. Normal CP; shared maneuver cooldown.','maneuver');
definePawnSkill('forced_march','Forced March','guardian','Action: move two squares straight forward without capturing or jumping blockers. Both squares must be explored. Normal CP; shared maneuver cooldown.','maneuver');
definePawnSkill('diagonal_march','Diagonal March','guardian','Action: move two squares along one forward diagonal without capturing or jumping blockers. Known passable route required. Normal CP; shared maneuver cooldown.','maneuver');
definePawnSkill('entrench','Entrench','guardian','Action: protect yourself from one attack through the next enemy turn. Normal CP; shared guard cooldown. No stacking.','self_guard');
definePawnSkill('relief','Relief','guardian','Action: swap with an adjacent, unacted friendly pawn/knight/bishop/rook. Both must be idle and able to enter the other square. Pays BOTH activation costs and uses BOTH activations. Shared maneuver cooldown.','relief');
definePawnSkill('distant_cover','Distant Cover','guardian','Action: Cover a friendly pawn/knight/bishop/rook up to two squares away along clear line of sight. Same one-hit protection, CP and shared guard cooldown.','guard');
definePawnSkill('ready_guard','Ready Guard','guardian','Passive: guard actions recover after two friendly turns instead of three. Requires an equipped Cover, Distant Cover or Entrench action.');
definePawnSkill('lasting_guard','Lasting Guard','guardian','Passive: protection you grant lasts through two opposing response turns instead of one, but still absorbs only ONE attack.');
definePawnSkill('march_drill','March Drill','guardian','Passive: equipped maneuver skills may be used on consecutive friendly turns. Never grants a second activation in the same turn.');
definePawnSkill('support_training','Support Training','guardian','Passive: when your granted protection actually absorbs an attack, earn 1 base XP once per protected ally per match. No XP for merely casting protection.');
const PAWN_SKILL_IDS=Object.keys(PAWN_SKILLS);
function skillCapacity(u){
 const lv=Math.max(1,Math.min(99,Math.floor(u.level||1)));
 if(u.type==='P')return Math.floor(lv/3);
 if(u.type==='V')return lv>=20?1:0;
 return (SKILL_SLOTS[u.type]||0)+(lv>=50?1:0);
}
function initialSkills(u){
 if(u.type==='K')return ['summon'];
 if(u.type==='Q')return {war:['stance'],phantom:['cloak','decoy'],choice:['sacrifice','siphon','mercy','surge']}[u.queenPath]||[];
 if(u.type==='P'&&u.job==='scout'&&u.level>=4)return u.level>=EXPERIMENTAL_FISSION_LEVEL?['watch','fission']:['watch'];
 if(['P','N'].includes(u.type)&&u.level>=EXPERIMENTAL_FISSION_LEVEL)return ['fission'];
 return [];
}
function prepareSkills(u){
 u.learnedSkills=Array.isArray(u.learnedSkills)?[...new Set(u.learnedSkills)]:[];
 const hadEquipment=Array.isArray(u.equippedSkills);
 u.equippedSkills=hadEquipment?u.equippedSkills:[];
 const added=[];
 for(const skill of initialSkills(u))if(!u.learnedSkills.includes(skill)){u.learnedSkills.push(skill);added.push(skill);}
 const valid=new Set(u.learnedSkills);
 u.equippedSkills=u.equippedSkills.filter((x,i,a)=>valid.has(x)&&a.indexOf(x)===i).slice(0,skillCapacity(u));
 // Never silently replace a chosen loadout on refresh/reload. Only new defaults fill holes.
 for(const skill of (hadEquipment?added:u.learnedSkills))if(skill!=='fission'&&u.equippedSkills.length<skillCapacity(u)&&!u.equippedSkills.includes(skill))u.equippedSkills.push(skill);
 u.skillChoices=Array.isArray(u.skillChoices)?u.skillChoices:[];
 u.skillCooldowns??={};u.supportAwards??={};
}
function pendingSkillLevels(u){if(u.type!=='P'||!u.alive)return [];
 const claimed=new Set((u.skillChoices||[]).map(x=>x.level));
 return Array.from({length:skillCapacity(u)},(_,i)=>(i+1)*3).filter(lv=>!claimed.has(lv));
}
function skillOffers(u){if(!pendingSkillLevels(u).length)return [];
 const chosen=new Set(u.learnedSkills||[]),available=PAWN_SKILL_IDS.filter(id=>!chosen.has(id));
 const out=[];
 for(const family of Object.keys(PAWN_ROUTES)){const next=available.find(id=>PAWN_SKILLS[id].family===family);if(next)out.push(next);}
 for(const id of available){if(out.length>=3)break;if(!out.includes(id))out.push(id);}
 return out.slice(0,3);
}
function pawnRoute(u){const scores={scout:0,pioneer:0,guardian:0};
 for(const ch of u.skillChoices||[]){const sk=PAWN_SKILLS[ch.skill];if(sk)scores[sk.family]++;}
 const ranked=Object.entries(scores).sort((a,b)=>b[1]-a[1]),total=Object.values(scores).reduce((a,b)=>a+b,0);
 const id=total<3?'developing':ranked[0][1]===ranked[1][1]?'mixed':ranked[0][0];
 return {id,name:PAWN_ROUTES[id]||{developing:'Developing',mixed:'Mixed'}[id],scores,total};
}
function skillName(id){return PAWN_SKILLS[id]?.name||id.replaceAll('_',' ');}
function canRemoveSkill(g,u,id){
 if(u.type!=='P')return true;
 if(id==='swimming'&&g.terrain[u.pos]===T.WATER&&u.job!=='swimmer')return false;
 if(id==='climbing'&&g.terrain[u.pos]===T.MOUNTAIN&&u.job!=='climber')return false;
 return true;
}
function chooseSkillAction(g,u,id,replace){
 if(u.type!=='P')return 'Only pawns have the three-level skill draft.';
 prepareSkills(u);
 const level=pendingSkillLevels(u)[0];if(!level)return 'No pawn skill choice is pending.';
 if(!skillOffers(u).includes(id))return 'Choose one of the three offered skills; offers cannot be rerolled.';
 if(u.equippedSkills.length>=skillCapacity(u)&&replace&&!u.equippedSkills.includes(replace))return 'Invalid replacement skill.';
 if(replace&&!canRemoveSkill(g,u,replace))return 'Move to safe land before replacing your terrain-traversal skill.';
 // A legacy loadout can fill all slots: learn now without replacing, or explicitly replace.
 u.learnedSkills.push(id);
 if(replace&&u.equippedSkills.length>=skillCapacity(u))u.equippedSkills.splice(u.equippedSkills.indexOf(replace),1);
 if(u.equippedSkills.length<skillCapacity(u))u.equippedSkills.push(id);
 u.skillChoices.push({level,skill:id});
 log(g,`Pawn #${u.id} learned ${skillName(id)} at level ${level}${equipped(u,id)?' (equipped)':' (learned; equip near the King or a shrine)'}.`);
 // Choosing progression is free, but cannot reset actions/cooldowns or farm discovery XP.
 refreshBoth(g);return null;
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
// Organizational Flatness is a STARTING ORGANIZATION, not a hidden bonus or
// additional class restriction. Historical armies are retained for old saves.
// K=King, Q=Queen, N=Knight, B=Bishop, P=Pawn. No rooks in new starts.
const PRESETS={
 traditional:{name:'Traditional · Deputy & Middle Managers',back:'NBQKBN',pawns:2,extra:'',structure:'traditional',roles:'King → Queen (deputy) → Knights/Bishops (middle management) → 2 Pawn-workers'},
 middle:{name:'Middle · Team Leads',back:'NKN',pawns:4,extra:'',structure:'middle',roles:'King → 2 Knights (team leads) → 4 Pawn-workers'},
 flat:{name:'Flatten · Direct Reports',back:'K',pawns:5,extra:'',structure:'flat',roles:'King ↔ 5 Pawn-workers (direct reports)'},
 balanced:{name:'Balanced Court (v0.5.7 legacy)',back:'RNQKBR',pawns:3,extra:'',structure:'legacy'},
 expedition:{name:'Explorers (v0.5.7 legacy)',back:'NNQKBN',pawns:3,extra:'',structure:'legacy'},
 bastion:{name:'Fortress (v0.5.7 legacy)',back:'RBQKRR',pawns:3,extra:'',structure:'legacy'}
};
const ORG_MODES=['traditional','middle','flat'];
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
// Only the independent engineer is nonblocking/invulnerable. Pawn workers remain soldiers.
function at(g,pos){return g.units.find(u=>u.alive&&u.type!=='V'&&u.pos===pos);}
function workerAt(g,pos,side=null){return g.units.find(u=>u.alive&&u.type==='V'&&u.pos===pos&&(side===null||u.side===side));}
function withSide(g,s){return g.units.filter(u=>u.alive&&u.side===s);}
function queen(g,s){return g.units.find(u=>u.alive&&u.side===s&&u.type==='Q');}
function king(g,s){return g.units.find(u=>u.alive&&u.side===s&&u.type==='K');}
function expNext(u){let k=u.level;return (5+0.9*k+0.12*k*k)*(u.type==='Q'?1.5:1);}
function expProgress(u){return Math.min(1,u.xp/expNext(u));}
function commandPower(g,side){const k=king(g,side),lv=k?.level||1;
 let cp=CP_MILESTONES.filter(([min])=>lv>=min).at(-1)[1]+(COMMAND_MODES[g.commandMode]||0);
 const q=queen(g,side);if(q&&q.queenPath==='war'&&q.stance==='local'&&q.level>=20)cp++;
 if(withSide(g,side).some(u=>u.type==='B'&&u.job==='maester'&&u.level>=15))cp++;
 return Math.min(9,cp);}
function activationCost(g,u){if(!u||u.type==='V')return 0;
 // User-directed v0.5.6 base costs: Rook 2 CP, Bishop 1 CP in both modes.
 // Queen and the existing rank/efficiency modifiers are unchanged.
 let base=({K:1,Q:g.commandMode==='roomy'?3:2,R:2,B:1,N:1,P:1})[u.type]||1;
 if(u.level>=20)base++;if(u.level>=50)base++;if(u.level>=80)base++;
 return Math.max(1,Math.min(commandPower(g,u.side),5,base-(u.cpDiscount||0)));}
function effectiveCost(g,u){return u?.acted===g.serial&&u.bonus>0?0:activationCost(g,u);}
function addXp(g,u,amount,reason,royalShare=true){if(!u||!u.alive||amount<=0||u.level>=99)return 0;
 const k=u.type==='K'?1.5:u.type==='Q'?.75:1;
 const loyalty=u.bond==='devoted'?.75:1;
 const gain=Math.round(amount*k*loyalty*100)/100;
 u.xp=Math.round((u.xp+gain)*100)/100;u.totalXp=Math.round((u.totalXp+gain)*100)/100;
 const was=u.level,oldMax=maxHp(u);
 while(u.level<99&&u.xp+1e-7>=expNext(u)){u.xp=Math.round((u.xp-expNext(u))*100)/100;u.level++;}
 if(u.level>=99)u.xp=0;
 if(u.level>was&&Number.isFinite(u.hp))u.hp=Math.min(maxHp(u),u.hp+maxHp(u)-oldMax);
 if(u.level>was){prepareSkills(u);u.pendingChoices??=[];u.choiceHistory??=[];for(const milestone of CHOICE_LEVELS)if(was<milestone&&u.level>=milestone&&u.type!=='V')u.pendingChoices.push(milestone);}
 if(u.level>was)log(g,`${P[u.type]} #${u.id} reached level ${u.level}! ${u.type==='P'&&pendingSkillLevels(u).length?'A skill choice is ready.':''}`);
 if(reason&&gain>=1)log(g,`${P[u.type]} #${u.id} +${gain.toFixed(2)} XP (${reason})`);
 // The king should grow as a COMMANDER when the army explores/defends,
 // without requiring players to repeatedly expose the only royal. No recursion.
 if(royalShare&&u.type!=='K'&&u.type!=='V'){const k=king(g,u.side);if(k)addXp(g,k,amount*.20,'army leadership',false);}
 return gain;
}
function addUnit(g,side,type,pos,opts={}){let u={id:g.nextId++,side,type,pos,alive:true,level:opts.level||1,xp:0,totalXp:0,job:opts.job||null,bond:null,bondTarget:null,bondTrust:0,acted:-1,bonus:0,ninjaRolled:-1,summonedAt:opts.summoned?g.round:0,ward:0,protectUsed:-1,fatigueUntil:0,cloakUntil:0,decoyCooldown:0,ritualCooldown:0,sacrificeUsed:-1,stance:opts.stance||'global',history:[],queenPath:type==='Q'?(opts.queenPath||'war'):null,homePos:opts.homePos??pos,prey:opts.prey||'dinosaur',injuredUntil:0,assignedSerial:-1,workSite:null,project:null,cpDiscount:0,visionGrowth:0,pendingChoices:[],choiceHistory:[]};u.hp=maxHp(u);u.hitsMax=1;u.hitsRemaining=1;u.lineage=opts.lineage||u.id;u.fissionOrigin=opts.fissionOrigin||null;prepareSkills(u);g.units.push(u);return u;}
function shrineLocations(g){const m=Math.floor(g.n/2),offset=Math.min(15,Math.max(7,Math.floor(g.n/4))),small=Math.max(4,Math.floor(g.n/8));const out=[
 [m,m],[m-1,m-1],[m+1,m+1],[m,m-offset],[m,m+offset],
 [m-small,m-small],[m+small,m+small],[m-small,m+small],[m+small,m-small]
 ];return Array.from(new Set(out.filter(([r,c])=>inside(g,r,c)).map(([r,c])=>idx(g,r,c))));}
// Lakes/rivers are small connected barriers, not isolated random wet squares.
// Each proto-lake is a 4-connected cluster of >=3 tiles, with an identical
// rotational counterpart. Subsequent army/worker placement may remove cells,
// so ensureWaterClusters() repairs any remnants in the final map.
function generateTerrain(g){let n=g.n;g.terrain=Array(n*n).fill(T.PLAIN);
 for(let r=0;r<n;r++)for(let c=0;c<n;c++){
  const j=idx(g,r,c),k=idx(g,n-1-r,n-1-c);if(j>k)continue;
  const z=rnum(g);g.terrain[j]=g.terrain[k]=z<.023?T.MOUNTAIN:z<.098?T.FOREST:T.PLAIN;
 }
 const count=Math.max(2,Math.round(n*n*.027/8));
 for(let patch=0;patch<count;patch++){
  const r=2+rint(g,n-4),c=2+rint(g,n-4),cells=[[r,c]],used=new Set([idx(g,r,c)]);
  const size=3+rint(g,3);
  for(let a=1;a<size;a++){
   let added=false;
   for(let attempt=0;attempt<25;attempt++){
    const from=cells[rint(g,cells.length)],d=ROOK[rint(g,ROOK.length)],rr=from[0]+d[0],cc=from[1]+d[1];
    if(!inside(g,rr,cc)||used.has(idx(g,rr,cc)))continue;
    used.add(idx(g,rr,cc));cells.push([rr,cc]);added=true;break;
   }
   if(!added)break;
  }
  if(cells.length<3)continue;
  for(const [rr,cc] of cells){g.terrain[idx(g,rr,cc)]=T.WATER;g.terrain[idx(g,n-1-rr,n-1-cc)]=T.WATER;}
 }
 g.shrines=shrineLocations(g);for(const j of g.shrines)g.terrain[j]=T.SHRINE;
}
// Repair lakes after deployments and the civilian gator site have overwritten
// terrain. The seed and neighbor traversal order keep the result deterministic.
function ensureWaterClusters(g){
 const n=g.n,visited=new Uint8Array(n*n);
 for(let i=0;i<n*n;i++){
  if(g.terrain[i]!==T.WATER||visited[i])continue;
  const group=[i];visited[i]=1;
  for(let k=0;k<group.length;k++)for(const [dr,dc] of ROOK){
   const rr=row(g,group[k])+dr,cc=col(g,group[k])+dc;
   if(!inside(g,rr,cc))continue;
   const j=idx(g,rr,cc);if(g.terrain[j]===T.WATER&&!visited[j]){visited[j]=1;group.push(j);}
  }
  if(group.length>=3)continue;
  for(let k=0;k<group.length&&group.length<3;k++)for(const [dr,dc] of ROOK){
   const rr=row(g,group[k])+dr,cc=col(g,group[k])+dc;
   if(!inside(g,rr,cc))continue;
   const j=idx(g,rr,cc);
   if(visited[j]||at(g,j)||[T.SHRINE,T.CAMP,T.TOWER,T.BRIDGE,T.TUNNEL].includes(g.terrain[j])||g.wildlife.some(w=>w.pos===j))continue;
   // Do not isolate fish/gators, and never erase occupied deployment tiles.
   g.terrain[j]=T.WATER;visited[j]=1;group.push(j);
   if(group.length>=3)break;
  }
  if(group.length<3){for(const j of group)g.terrain[j]=T.PLAIN;}
 }
}

function formation(g,s,preset,route){const def=PRESETS[preset]||PRESETS.traditional,m=Math.floor(g.n/2),offset=g.deployment==='spread'?Math.max(7,Math.min(12,Math.floor(g.n*.18))):Math.max(5,Math.min(9,Math.floor(g.n*.11))),kingRow=m+(s==='w'?offset:-offset-1),backRow=kingRow,dir=s==='w'?-1:1;
 const back=def.back.split('').map(x=>x==='K'?'K':x);let cols=[];for(let i=0;i<back.length;i++)cols.push(m-Math.floor(back.length/2)+i);
 for(let i=0;i<back.length;i++){let r=backRow,c=cols[i];if(inside(g,r,c)){let j=idx(g,r,c);g.terrain[j]=T.PLAIN;addUnit(g,s,back[i],j,{queenPath:route});}}
 const pawnCount=def.pawns;for(let k=0;k<pawnCount;k++){let c=m-Math.floor(pawnCount/2)+k,r=kingRow+2*dir;
 if(inside(g,r,c)){const j=idx(g,r,c);g.terrain[j]=T.PLAIN;addUnit(g,s,'P',j);}}
 const extras=def.extra.split('');extras.forEach((type,k)=>{const r=kingRow+dir,c=m-5+k*5;if(inside(g,r,c)){let j=idx(g,r,c);if(!at(g,j)){g.terrain[j]=T.PLAIN;addUnit(g,s,type,j,{queenPath:route});}}});
}
// A ready camp remains, but new matches have NO independent engineers.
// Put it ONE square diagonally ahead of an initial pawn, so forward-only
// pawn-workers can actually occupy it (and extend camp vision) on turn one.
// Its production can initially be ordered remotely by the King (1 CP + XP).
// There is deliberately no per-side camp limit; balance is deferred.
function createStarterCamp(g,side){
 const k=king(g,side),fr=side==='w'?-1:1;
 if(!k)return;
 // Place the ready camp exactly one forward-diagonal from a starting pawn,
 // even for the two-Pawn Traditional or five-Pawn Flatten formations.
 const pawns=withSide(g,side).filter(u=>u.type==='P').sort((a,b)=>col(g,a.pos)-col(g,b.pos));
 const anchor=side==='w'?pawns[pawns.length-1]:pawns[0];
 if(!anchor)return;
 const r=row(g,anchor.pos)+fr,c=col(g,anchor.pos)+(side==='w'?1:-1);
 if(!inside(g,r,c))return;
 const j=idx(g,r,c);if(at(g,j))throw new Error('Starter camp overlaps military unit');
 g.terrain[j]=T.CAMP;
 g.camps.push({side,pos:j,queue:null,trained:{P:0,N:0,B:0},starter:true});
 // Nearby obstacles demonstrate the pawn-work ladder. Do not overwrite
 // occupied military tiles, camps, shrines or other constructed sites.
 const samples=[[0,1,T.FOREST],[-1,0,T.MOUNTAIN],[1,1,T.WATER],[2,1,T.WATER],[2,2,T.WATER]];
 for(const [dr,dc,t] of samples){const rr=r+(side==='w'?dr:-dr),cc=c+(side==='w'?dc:-dc);
  if(!inside(g,rr,cc))continue;
  const q=idx(g,rr,cc);
  if(!at(g,q)&&!g.shrines.includes(q)&&!(g.camps||[]).some(c=>c.pos===q))g.terrain[q]=t;
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
function runWork(g,side){if(g.ruleset==='command-camp')return;
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
// Civilian actions are independent of the military command budget.
// Engineers traverse water/mountains and work ONLY on their occupied tile.
// Multi-turn projects lock movement and all orders until the final friendly
// end-turn tick. Military still neither blocks nor attacks engineers.
function pawnWorkLevel(u,project){
 if(project==='fill'&&equipped(u,'land_reclamation'))return 2;
 if(project==='tunnel'&&equipped(u,'tunnelcraft'))return 3;
 return PAWN_WORK_LEVELS[project]||Infinity;
}
function workDuration(u,project){let n=WORK_PROJECTS[project];if(u.type!=='P')return n;
 if(project==='clear_forest'&&equipped(u,'woodsman'))n=1;
 if(project==='bridge'&&equipped(u,'bridgewright'))n=1;
 if(project==='tower'&&equipped(u,'towerwright'))n=1;
 if(project==='camp'&&equipped(u,'campwright'))n=2;
 if(project==='excavate'){if(equipped(u,'masonry'))n=2;if(equipped(u,'quarry_master'))n=1;}
 return n;
}
function remoteWork(u,project){return ['bridge','excavate','fill','tunnel'].includes(project)||project==='clear_forest'&&equipped(u,'roadcrew')||project==='tower'&&equipped(u,'field_survey')||project==='camp'&&equipped(u,'site_planner');}
function eligibleBuilderTargets(g,u,project){
 if(!isWorker(u)||u.project||!WORK_PROJECTS[project])return [];
 if(u.type==='P'&&u.level<pawnWorkLevel(u,project))return [];
 const expected={fill:T.WATER,bridge:T.WATER,clear_forest:T.FOREST,excavate:T.MOUNTAIN,tunnel:T.MOUNTAIN,camp:T.PLAIN,tower:T.PLAIN}[project];
 let sites=[u.pos];
 // Pawns bridge/excavate FROM the shore/neighbor. No free water/mountain walking.
 if(u.type==='P'&&remoteWork(u,project)){
  const r=row(g,u.pos),c=col(g,u.pos);
  sites.push(...KING.map(([dr,dc])=>[r+dr,c+dc]).filter(([rr,cc])=>inside(g,rr,cc)).map(([rr,cc])=>idx(g,rr,cc)));
 }
 return sites.filter(j=>{
  if(!g.players[u.side].sight[j]||rememberedTerrain(g,u.side,j)!==expected)return false;
  const occupant=knownOccupant(g,u.side,j);
  if(occupant&&occupant!==u&&(occupant.side!==u.side||['camp','tower'].includes(project)))return false;
  if(['camp','tower'].includes(project)&&((g.camps||[]).some(c=>c.pos===j)||(g.towers||[]).some(t=>t.pos===j)))return false;
  // Multiple workers may not reserve the same friendly worksite.
  return !laborers(g,u.side).some(x=>x!==u&&x.project&&x.project.kind!=='training'&&x.project.pos===j);
 });
}
function startBuilding(g,u,project,to){
 if(!isWorker(u))return 'Only an engineer or a qualified pawn can work.';
 if(u.project)return 'Worker is committed to its current project until completion or disruption.';
 if(u.acted===g.serial)return 'This worker has already acted this turn.';
 if(u.type==='P'&&u.level<pawnWorkLevel(u,project))return 'Pawn ladder: L1 forest; L2 bridge/watchtower; L3 mountain; L4 camp.';
 if(!eligibleBuilderTargets(g,u,project).includes(to))return 'No eligible visible worksite: work underfoot, or bridge/excavate an adjacent tile as a qualified pawn.';
 const cp=activationCost(g,u);
 if(g.ap<cp)return `This pawn needs ${cp} CP to start work.`;
 u.project={kind:project,pos:to,workerPos:u.pos,remaining:workDuration(u,project),total:workDuration(u,project)};
 u.acted=g.serial;g.ap-=cp;
 log(g,`${u.type==='V'?'Engineer':'Pawn'} #${u.id} began ${project.replace('_',' ')} on ${posName(g,to)} (${u.project.total} friendly work turns; ${cp} CP to start; locked until complete).`);
 return null;
}
function tickBuilders(g,side){for(const u of laborers(g,side)){
 if(!u.project)continue;
 const pr=u.project;
 if(pr.kind==='training')continue;
 if(u.pos!==(pr.workerPos??pr.pos)||distance(g,u.pos,pr.pos)>1){log(g,`Worker #${u.id} lost its construction site.`);u.project=null;continue;}
 const prerequisite={fill:T.WATER,bridge:T.WATER,clear_forest:T.FOREST,excavate:T.MOUNTAIN,tunnel:T.MOUNTAIN,camp:T.PLAIN,tower:T.PLAIN}[pr.kind];
 const occupant=at(g,pr.pos);
 if(g.terrain[pr.pos]!==prerequisite||(occupant&&occupant!==u&&(occupant.side!==side||['camp','tower'].includes(pr.kind)))){
  log(g,`Worker #${u.id} lost its ${pr.kind.replace('_',' ')} project: terrain changed or a military unit contested the worksite.`);
  u.project=null;continue;
 }
 pr.remaining--;
 if(pr.remaining>0)continue;
 const changes={fill:T.PLAIN,bridge:T.BRIDGE,clear_forest:T.PLAIN,excavate:T.PLAIN,tunnel:T.TUNNEL,camp:T.CAMP,tower:T.TOWER};
 g.terrain[pr.pos]=changes[pr.kind];
 if(pr.kind==='camp')g.camps.push({side,pos:pr.pos,queue:null,trained:{P:0,N:0,B:0},builtBy:u.id});
 if(pr.kind==='tower'){g.towers??=[];g.towers.push({side,pos:pr.pos,builtBy:u.id});}
 log(g,`Worker #${u.id} completed ${pr.kind.replace('_',' ')} on ${posName(g,pr.pos)}.`);
 u.project=null;
 // Small support XP only once per work type/site/side, not recurring idle XP.
 if(u.type==='P'&&WORK_XP[pr.kind]){
  g.workAwards??={w:{},b:{}};g.workAwards[side]??={};const key=pr.kind+':'+pr.pos;
  if(!g.workAwards[side][key]){g.workAwards[side][key]=true;addXp(g,u,WORK_XP[pr.kind],'completed useful construction');}
 }
 refreshBoth(g,side,u.id);
}}
function eligibleTrainingCamps(g,side){return (g.camps||[]).filter(c=>c.side===side&&!c.queue&&g.terrain[c.pos]===T.CAMP&&
   !(knownOccupant(g,side,c.pos)?.side===other(side)));}
function trainingDuration(c,type){return TRAIN_TURNS[type]+Math.floor((c.trained[type]||0)/3);}
function startCampTraining(g,k,type,to,worker=null){
 // Legacy engineer/royal XP recruitment stays available; pawns use the new batch rules.
 if(!['P','N','B'].includes(type))return 'Training camps only produce pawns, knights, and bishops.';
 if(worker&&worker.type!=='V')return 'Pawn camp production requires the stay or sacrifice choice.';
 if(worker&&(!canOperateCamp(worker)||worker.side!==k.side||worker.project||worker.pos!==to||worker.acted===g.serial))return 'An available engineer must stand on this friendly training camp.';
 if(!worker&&k.acted===g.serial)return 'King has already issued an order this turn.';
 if(!worker&&!equipped(k,'summon'))return 'King must equip command/summon skill.';
 const camp=eligibleTrainingCamps(g,k.side).find(c=>c.pos===to);
 if(!camp)return 'Select an available friendly training camp, not an ordinary tile.';
 if(trainingCapacity(g,k.side)<1)return 'Military cap of 20, including reserved recruits, reached.';
 const price=TRAIN_XP[type];if(k.xp+1e-7<price)return `King needs ${price} unspent XP to train a ${P[type]}.`;
 const cp=activationCost(g,worker||k);
 if(g.ap<cp)return `Training order needs ${cp} CP.`;
 const turns=trainingDuration(camp,type);
 k.xp=Math.round((k.xp-price)*100)/100;
 if(worker){worker.acted=g.serial;worker.project={kind:'training',pos:to,workerPos:to,remaining:turns,total:turns};}
 else{k.acted=g.serial;}
 g.ap-=cp;
 camp.queue={kind:'legacy',mode:'xp',type,count:1,remaining:turns,total:turns,started:g.serial,kingId:k.id,workerId:worker?.id||null};
 log(g,`${worker?'Engineer '+worker.id+' started':'King '+k.id+' ordered'} training: ${price} King XP for a level-1 ${P[type]} at ${posName(g,to)} (${turns} friendly work turns).`);
 return null;
}
function startPawnCampTraining(g,u,type,mode){
 if(!u||u.type!=='P'||!canOperateCamp(u))return 'Pawn camp production unlocks at level 4.';
 if(!['P','N','B'].includes(type))return 'Choose two pawns, one knight or one bishop.';
 if(!['stay','sacrifice'].includes(mode))return 'Choose stay (5 turns) or sacrifice this pawn (2 turns).';
 if(u.project||u.acted===g.serial)return 'This pawn is busy or has already acted.';
 const camp=eligibleTrainingCamps(g,u.side).find(c=>c.pos===u.pos);
 if(!camp)return 'Stand on an idle friendly training camp.';
 const count=pawnBatchSize(type),sacrifice=mode==='sacrifice',turns=sacrifice?2:equipped(u,'instructor')?4:5,cp=activationCost(g,u);
 if(trainingCapacity(g,u.side)+(sacrifice?1:0)<count)return 'The entire batch needs room under the 20-unit cap, including queued recruits.';
 if(g.ap<cp)return `This pawn needs ${cp} CP to start training.`;
 g.ap-=cp;u.acted=g.serial;
 if(sacrifice){u.alive=false;onUnitKilled(g,u);u.campSacrifice=true;}
 else u.project={kind:'training',pos:camp.pos,workerPos:u.pos,remaining:turns,total:turns};
 camp.queue={kind:'pawn',mode,type,count,remaining:turns,total:turns,started:g.serial,workerId:sacrifice?null:u.id,founderId:u.id};
 log(g,`Pawn #${u.id} ${sacrifice?'was sacrificed':'stays stationed'}: ${count} level-1 ${P[type]}${count>1?'s':''} in ${turns} friendly work turns. No King XP charge.`);
 refreshBoth(g);return null;
}
function cancelCampTraining(g,camp,reason){
 const q=camp.queue;if(!q)return;
 const teacher=q.workerId?byId(g,q.workerId):null;
 if(teacher?.project?.kind==='training')teacher.project=null;
 camp.queue=null;log(g,`Training canceled: ${reason}${q.kind==='legacy'?'; spent King XP is not refunded':''}.`);
}
function spawnAtCamp(g,c,count=1){
 const p=c.pos,r=row(g,p),col0=col(g,p),places=[p,...KING.map(([dr,dc])=>[r+dr,col0+dc]).filter(([rr,cc])=>inside(g,rr,cc)).map(([rr,cc])=>idx(g,rr,cc))];
 return places.filter(j=>!at(g,j)&&canEnter(g,{type:c.queue.type},j)).slice(0,count);
}
function tickTraining(g,side){for(const camp of (g.camps||[])){
 if(camp.side!==side||!camp.queue)continue;
 const q=camp.queue;
 if(g.terrain[camp.pos]!==T.CAMP){cancelCampTraining(g,camp,'the camp no longer exists');continue;}
 if(q.workerId){const teacher=byId(g,q.workerId);
  if(!teacher||teacher.side!==side||teacher.pos!==camp.pos||teacher.project?.kind!=='training'||teacher.project.pos!==camp.pos){
   cancelCampTraining(g,camp,'the assigned worker was captured, displaced or interrupted');continue;
  }
 }
 const blocker=at(g,camp.pos);
 if(blocker&&blocker.side!==side){log(g,`Training paused: an enemy occupies ${posName(g,camp.pos)}.`);continue;}
 if(q.remaining>0)q.remaining--;
 if(q.workerId){const teacher=byId(g,q.workerId);if(teacher?.project?.kind==='training')teacher.project.remaining=q.remaining;}
 if(q.remaining>0)continue;
 const count=q.count||1;
 if(combatUnits(g,side).length+count>MILITARY_CAP)continue;
 const spots=spawnAtCamp(g,camp,count);
 if(spots.length<count){log(g,`Training ready; the batch awaits ${count} free camp exit square(s).`);continue;}
 const graduates=spots.map(spot=>{const x=addUnit(g,side,q.type,spot,{summoned:true,level:1});x.acted=g.serial;return x;});
 camp.trained??={};camp.trained[q.type]=(camp.trained[q.type]||0)+count;
 if(q.workerId){const teacher=byId(g,q.workerId);if(teacher?.project?.kind==='training')teacher.project=null;}
 camp.queue=null;
 log(g,`Training complete: ${count} level-1 ${P[q.type]}${count>1?'s':''} graduated at ${posName(g,camp.pos)}.`);
 // Recruits start at zero XP, without inherited levels, skills, bonds or free discovery credit.
 refreshBoth(g);
 }}
function claimCampAction(g,u){
 if(g.campCaptureMode!=='on')return 'Camp capture is disabled in this match.';
 if(!u||u.type==='V')return 'Only a military unit can claim an enemy camp.';
 const camp=(g.camps||[]).find(c=>c.pos===u.pos&&c.side!==u.side);
 if(!camp)return 'Stand on an enemy camp to claim it.';
 // One move to occupy and a second-turn claim: the owner gets a response.
 if(u.history?.[0]?.round===g.round)return 'Hold the enemy camp until your next friendly turn before claiming it.';
 if(u.acted===g.serial)return 'This unit has acted already.';
 if(g.ap<1)return 'Claiming a camp requires 1 CP.';
 g.ap-=1;u.acted=g.serial;
 if(camp.queue?.workerId){const teacher=byId(g,camp.queue.workerId);if(teacher?.project?.kind==='training')teacher.project=null;}
 camp.side=u.side;camp.queue=null;camp.trained={P:0,N:0,B:0};camp.capturedRound=g.round;
 // A camp is never a royal: claiming it does not confer an instant win.
 g.battleEcho??=[];g.battleEcho.push({side:other(u.side),unitId:u.id,pos:u.pos,until:g.serial+1});
 log(g,`${P[u.type]} #${u.id} captured the enemy camp at ${posName(g,u.pos)} (1 CP and a full hold).`);
 refreshBoth(g,u.side,u.id);return null;
}
function milestoneAction(g,u,choice){if(!u.pendingChoices?.length)return 'No level milestone awaits a choice.';
 const lv=u.pendingChoices[0];
 const canFortify=g.combatMode==='pips'&&lv>=25&&['K','Q','R','B','N'].includes(u.type)&&(u.hitsMax||1)<MAX_CAPTURE_HITS;
 if(!['efficient','growth'].includes(choice)&&!(choice==='fortify'&&canFortify))return 'Choose command efficiency, character growth or an available defensive specialization.';
 u.pendingChoices.shift();u.choiceHistory??=[];u.choiceHistory.push({level:lv,choice});
 if(choice==='efficient')u.cpDiscount=(u.cpDiscount||0)+1;
 else if(choice==='growth')u.visionGrowth=(u.visionGrowth||0)+1;
 else {u.hitsMax=Math.min(MAX_CAPTURE_HITS,(u.hitsMax||1)+1);u.hitsRemaining=Math.min(MAX_CAPTURE_HITS,(u.hitsRemaining||1)+1);}
 log(g,`${P[u.type]} #${u.id} chose ${choice==='efficient'?'−1 CP activation cost':choice==='growth'?'expanded directional vision':'one additional protection pip'} at level ${lv}; the other milestone rewards were forgone.`);
 if(choice==='growth')refreshBoth(g,u.side,u.id);
 return null;
}
function equipAction(g,u,skill,replace){
 prepareSkills(u);
 if(!u.learnedSkills.includes(skill))return 'This skill is not learned.';
 if(equipped(u,skill))return 'Already equipped.';
 if(u.acted===g.serial)return 'This piece has already acted.';
 if(!king(g,u.side)||distance(g,u.pos,king(g,u.side).pos)>4&&g.terrain[u.pos]!==T.SHRINE)return 'Change skill loadouts near your king or at a shrine.';
 if(u.equippedSkills.length>=skillCapacity(u)){
  if(!u.equippedSkills.includes(replace))return 'Choose an equipped skill to replace.';
  if(!canRemoveSkill(g,u,replace))return 'Move to safe land before replacing your terrain-traversal skill.';
  u.equippedSkills.splice(u.equippedSkills.indexOf(replace),1);
 }
 if(u.equippedSkills.length>=skillCapacity(u))return 'No free skill slot.';
 u.equippedSkills.push(skill);u.acted=g.serial;g.ap-=activationCost(g,u);
 log(g,`${P[u.type]} #${u.id} equipped ${skillName(skill)}${replace?' instead of '+skillName(replace):''}.`);
 refreshBoth(g);return null;
}
function create(options={}){const n=[30,50,70].includes(Number(options.size))?Number(options.size):50;const seed=(Number(options.seed)>>>0)||43971;
 const mode=['classic','hp','pips'].includes(options.combatMode)?options.combatMode:options.hpMode===true?'hp':'classic';
 const g={version:13,routeDisclosure:['effects','hints','full'].includes(options.routeDisclosure)?options.routeDisclosure:'effects',skillSystemVersion:1,build:'Stale-Mate v0.5.8',commandMode:options.commandMode==='original'?'original':'roomy',campCaptureMode:options.campCaptureMode==='on'?'on':'off',deployment:options.deployment==='spread'?'spread':'quick',battleEcho:[],ruleset:'command-camp',combatMode:mode,fissionEnabled:options.fissionEnabled===true,usedFissionLineages:{},n,seed,rng:seed,hpMode:mode==='hp',terrain:[],shrines:[],wildlife:[],units:[],nextId:1,players:{w:{gold:18,food:12,wood:8,essence:0,seen:Array(n*n).fill(0),sight:Array(n*n).fill(0),lastSeen:{},firstSeenUnits:{},shrineClaim:{},terrainMemory:Array(n*n).fill(-1),ai:false},b:{gold:18,food:12,wood:8,essence:0,seen:Array(n*n).fill(0),sight:Array(n*n).fill(0),lastSeen:{},firstSeenUnits:{},shrineClaim:{},terrainMemory:Array(n*n).fill(-1),ai:true}},beacons:[],decoys:[],camps:[],towers:[],workAwards:{w:{},b:{}},side:'w',ap:0,round:1,serial:1,winner:null,log:[],armyW:PRESETS[options.armyW]?options.armyW:'traditional',armyB:PRESETS[options.armyB]?options.armyB:'traditional',routeW:options.routeW||'war',routeB:options.routeB||'phantom',lastEvent:null};
 generateTerrain(g);formation(g,'w',g.armyW,g.routeW);formation(g,'b',g.armyB,g.routeB);createStarterCamp(g,'w');createStarterCamp(g,'b');ensureWaterClusters(g);
 for(const side of ['w','b']){const royal=king(g,side);if(royal){royal.xp=3;royal.totalXp=3;}}
 g.ap=commandPower(g,'w');
 for(const s of ['w','b'])refreshSight(g,s,null,true);
 log(g,`Stale-Mate ${n}×${n}. ${g.combatMode==='hp'?'Legacy HP':g.combatMode==='pips'?'Experimental shield-pip captures':'One-hit captures'}. Initial ${g.ap} military CP; ${PRESETS[g.armyW].name} vs ${PRESETS[g.armyB].name}, with ready training camps, capturable Pawn-workers and no engineer. The King can order recruits using XP and 1 CP.`);
 return g;
}
function passableTerrain(u,t){if(u.type==='V')return true;if(t===T.WATER&&!(u.type==='P'&&(u.job==='swimmer'||equipped(u,'swimming'))))return false;if(t===T.MOUNTAIN&&!(u.type==='P'&&(u.job==='climber'||equipped(u,'climbing'))))return false;return true;}
function canEnter(g,u,i){return i>=0&&i<g.n*g.n&&passableTerrain(u,g.terrain[i]);}
// This is the ONLY terrain value that planning and a fog-side UI may read.
// -1 means not explored; under mist the last observed tile stays stale.
function rememberedTerrain(g,side,i){const p=g.players[side];if(i<0||i>=g.n*g.n||!p.seen[i])return -1;return p.sight[i]?g.terrain[i]:(p.terrainMemory?.[i]??-1);}
function knownPassable(g,side,u,i){const t=rememberedTerrain(g,side,i);return t>=0&&passableTerrain(u,t);}
function moves(g,u){if(!u||!u.alive||u.project)return[];const r=row(g,u.pos),c=col(g,u.pos),res=[],fr=u.side==='w'?-1:1;
 if(u.type==='V'){for(const [dr,dc] of KING){let rr=r+dr,cc=c+dc;if(inside(g,rr,cc)){const j=idx(g,rr,cc);if(canEnter(g,u,j))res.push(j);}}return res;}
 if(u.type==='P'){
  const rr=r+fr;
  for(const dc of [-1,0,1])if(inside(g,rr,c+dc)){
   const j=idx(g,rr,c+dc),o=at(g,j);
   if(canEnter(g,u,j)&&(!o||(dc!==0&&o.side!==u.side)))res.push(j);
  }
  return res;
 }
 for(const [dr,dc] of DIR[u.type]){
  const max=(u.type==='B'||u.type==='R'||u.type==='Q')?g.n-1:1;
  for(let step=1;step<=max;step++){
   let rr=r+dr*step,cc=c+dc*step;if(!inside(g,rr,cc))break;
   let j=idx(g,rr,cc);if(!canEnter(g,u,j))break;
   let o=at(g,j);if(o&&o.side===u.side)break;
   res.push(j);if(o||(g.terrain[j]===T.FOREST&&!u.forestStride))break;
  }
 }
 return res;
}
/* Fog-safe planned destinations: a player knows the geometry, remembered terrain and
   currently OBSERVED pieces, but not enemy units hidden in mist or under a cloak.
   Unexplored squares block a ray instead of being speculative destinations. */
function knownOccupant(g,side,pos){const u=at(g,pos);return u&&(u.side===side||canObserveUnit(g,side,u))?u:null;}
function orders(g,u){
 if(!u||!u.alive||u.project)return [];
 const side=u.side,seen=g.players[side].seen,res=[],r=row(g,u.pos),c=col(g,u.pos),fr=side==='w'?-1:1;
 const known=i=>!!seen[i]&&knownPassable(g,side,u,i);
 if(u.type==='V'){for(const [dr,dc] of KING){let rr=r+dr,cc=c+dc;if(inside(g,rr,cc)){const j=idx(g,rr,cc);if(known(j))res.push(j);}}return res;}
 if(u.type==='P'){
  const rr=r+fr;
  for(const dc of [-1,0,1])if(inside(g,rr,c+dc)){
   const j=idx(g,rr,c+dc),occupant=knownOccupant(g,side,j),enemy=apparentEnemy(g,side,j);
   if(!known(j)||occupant?.side===side)continue;
   // Empty forward/diagonal squares are moves. Captures ONLY on forward diagonals.
   if(dc!==0||(!occupant&&!enemy))res.push(j);
  }
  return res;
 }
 for(const [dr,dc] of DIR[u.type]){
  const max=['B','R','Q'].includes(u.type)?g.n-1:1;
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
   if(occupier||apparentEnemy(g,side,j)?.decoy||rememberedTerrain(g,side,j)===T.FOREST&&!u.forestStride)break;
   if(max===1)break;
  }
 }
 return res;
}
// A level-1 unit sees only its natural movement DIRECTIONS, not a square
// radius. For knights, one sight step means one L-shaped landing square.
function baseVision(u){return (u.type==='Q'||u.type==='R')?2:1;}
function forestScout(u){return (u.type==='P'&&(equipped(u,'forest_lore')||u.job==='scout'&&u.level>=4))||(u.type==='N'&&u.level>=15);}
function visionRadius(g,u){let x=baseVision(u)+(u.visionGrowth||0);
 if(u.type==='P'){if(equipped(u,'trailcraft'))x++;if(equipped(u,'long_sight'))x++;if(equipped(u,'summit_watch')&&g.terrain[u.pos]===T.MOUNTAIN)x++;}
 if(u.type==='B'&&u.level>=2)x+=1; // Real early bishop growth, not just a changed badge.
 if(u.type==='N'&&u.level>=2)x+=1;
 if(u.type==='N'&&u.level>=15)x+=1;
 if(u.type==='P'&&u.job==='scout')x+=u.level>=10?3:2;
 if(u.type==='P'&&u.job==='climber'&&g.terrain[u.pos]===T.MOUNTAIN)x++; // historical profession bonus, not automatic for the new skill
 let q=queen(g,u.side);
 // Level-1 units must really start with one directional layer. The War
 // Queen's extra sight is a developed commander benefit, not free at spawn.
 if(q&&q.queenPath==='war'&&q.level>=6){if(q.stance==='global')x+=1;else if(distance(g,q.pos,u.pos)<=4)x+=2;}
 if(u.type==='Q'&&withSide(g,u.side).some(b=>b.type==='B'&&b.bond==='lover'&&b.bondTarget===u.id&&distance(g,b.pos,u.pos)<=3))x++;
 if(u.fatigueUntil>=g.serial)x=Math.max(1,x-1);
 return Math.min(6,x);
}
// Bresenham line of sight: mountains and non-scout forests are visible but
// opaque BEYOND themselves. Water is always optically transparent. Thus a
// mountain adjacent to an upgraded unit completely cuts the corresponding
// direction, while an adjacent forest permits just the first square.
function los(g,fr,fc,tr,tc,ignoreForest=false){let dy=Math.abs(tr-fr),dx=Math.abs(tc-fc),sy=fr<tr?1:-1,sx=fc<tc?1:-1,err=dx-dy,x=fc,y=fr;
 while(x!==tc||y!==tr){let e2=2*err;if(e2>-dy){err-=dy;x+=sx;}if(e2<dx){err+=dx;y+=sy;}
  if(x===tc&&y===tr)return true;
  if(!inside(g,y,x))return false;
  const t=g.terrain[idx(g,y,x)];if(t===T.MOUNTAIN||(t===T.FOREST&&!ignoreForest))return false;
 }return true;
}
function visionDirections(u){return u.type==='P'?[-1,0,1].map(dc=>[u.side==='w'?-1:1,dc]):DIR[u.type]||KING;}
function personalSight(g,u){
 const r=row(g,u.pos),c=col(g,u.pos),out=[u.pos],reach=visionRadius(g,u),ignoreForest=forestScout(u);
 for(const [dr,dc] of visionDirections(u))for(let step=1;step<=reach;step++){
  const rr=r+dr*step,cc=c+dc*step;
  if(!inside(g,rr,cc))break;
  if(!los(g,r,c,rr,cc,ignoreForest))break;
  out.push(idx(g,rr,cc));
 }
 if(u.type==='P'){const extra=[];if(equipped(u,'flank_watch'))extra.push([0,-1],[0,1]);if(equipped(u,'rear_watch'))for(const dc of [-1,0,1])extra.push([u.side==='w'?1:-1,dc]);for(const [dr,dc] of extra)if(inside(g,r+dr,c+dc))out.push(idx(g,r+dr,c+dc));}
 return [...new Set(out)];
}

function hiddenPhantom(g,u,watcher){if(!u||u.type!=='Q'||u.queenPath!=='phantom'||u.cloakUntil<g.serial||u.side===watcher)return false;
 if((g.battleEcho||[]).some(x=>x.side===watcher&&x.unitId===u.id&&x.until>=g.serial&&x.pos===u.pos))return false;
 for(const scout of withSide(g,watcher)){if(distance(g,scout.pos,u.pos)<=2&&(scout.type==='N'||scout.type==='K'||(scout.type==='P'&&scout.job==='scout')))return false;}
 return true;
}
function canObserveUnit(g,watcher,u){return !!u&&u.alive&&(u.side===watcher||!!g.players[watcher].sight[u.pos]&&!hiddenPhantom(g,u,watcher));}
function refreshSight(g,side,actorId,initial=false){const p=g.players[side],now=Array(g.n*g.n).fill(0);let personal=[];
 for(const u of withSide(g,side)){const cells=personalSight(g,u);for(const j of cells)now[j]=1;if(u.id===actorId)personal=cells;}
 // Camps have their own observation; only active sight updates fog memory.
 for(const camp of (g.camps||[]))if(camp.side===side)for(const j of campSight(g,camp))now[j]=1;
 for(const tower of (g.towers||[]))if(tower.side===side)for(const j of towerSight(g,tower))now[j]=1;
 for(const beacon of g.beacons)if(beacon.side===side&&beacon.until>=g.serial){const r=row(g,beacon.pos),c=col(g,beacon.pos);
  for(let dr=-Math.min(3,beacon.range);dr<=Math.min(3,beacon.range);dr++)for(let dc=-Math.min(3,beacon.range);dc<=Math.min(3,beacon.range);dc++)if(inside(g,r+dr,c+dc)&&Math.max(Math.abs(dr),Math.abs(dc))<=Math.min(3,beacon.range)&&los(g,r,c,r+dr,c+dc,!!beacon.forestPierce))now[idx(g,r+dr,c+dc)]=1;
 }
 // Attacking a soldier exposes the ATTACKER's square until the defender
 // finishes its next turn; otherwise recaptures vanish when a scout dies.
 for(const echo of (g.battleEcho||[])){if(echo.side!==side||echo.until<g.serial)continue;
  const foe=byId(g,echo.unitId);if(foe&&foe.pos===echo.pos)now[echo.pos]=1;
 }
 p.sight=now;let discovered=0;const personalSet=new Set(personal);
 for(let j=0;j<now.length;j++)if(now[j]){if(!p.seen[j]&&personalSet.has(j))discovered++;p.seen[j]=1;p.terrainMemory[j]=g.terrain[j];}
 const actor=actorId?byId(g,actorId):null;
 if(actor&&!initial&&discovered>0)addXp(g,actor,discovered*.30,`explored ${discovered} new tiles`);
 for(const enemy of withSide(g,other(side))){if(canObserveUnit(g,side,enemy)){
  p.lastSeen[enemy.id]={id:enemy.id,type:enemy.type,pos:enemy.pos,round:g.round};
  if(!p.firstSeenUnits[enemy.id]){p.firstSeenUnits[enemy.id]=1;if(actor&&!initial)addXp(g,actor,1.5,'first contact');}
 }}
}
function refreshBoth(g,actorSide=null,actorId=null){for(const s of ['w','b'])refreshSight(g,s,s===actorSide?actorId:null);}
function claimedObjective(g,u){if(g.terrain[u.pos]!==T.SHRINE)return;const p=g.players[u.side],last=p.shrineClaim[u.pos];if(last!==undefined&&g.round-last<7)return;p.shrineClaim[u.pos]=g.round;addXp(g,u,5,'secured an ancient shrine');log(g,`${P[u.type]} #${u.id} secured an objective (+5 XP).`);}
function wardFromWar(g,victim){let q=queen(g,victim.side);if(!q||q.queenPath!=='war'||q.stance!=='local'||distance(g,q.pos,victim.pos)>4)return false;
 if(victim.guardUsed===g.serial)return false;victim.guardUsed=g.serial;return true;}
function interceptByKnight(g,target,attacker){if(target.type!=='Q')return false;
 if(g.hpMode&&damageFor(attacker)<hpOf(target))return false; // Life-saving sacrifice, not automatic waste.
 if(g.combatMode==='pips'&&(target.hitsRemaining||1)>1)return false;
 let knight=withSide(g,target.side).find(u=>u.type==='N'&&u.bond==='protector'&&u.bondTarget===target.id&&distance(g,u.pos,target.pos)<=2&&u.protectUsed!==g.serial);
 if(!knight)return false;knight.alive=false;knight.protectUsed=g.serial;log(g,`Knight #${knight.id} sacrificed himself to intercept a strike on his queen.`);return true;
}
function onUnitKilled(g,unit){
 // Capturable pawn workers cannot finish projects or train from beyond the grave.
 for(const c of (g.camps||[]))if(c.queue?.workerId===unit.id)cancelCampTraining(g,c,'its pawn worker was captured or sacrificed');
 unit.project=null;
 if(unit.bond==='lover'){
 let q=byId(g,unit.bondTarget);if(q){q.griefUntil=g.serial+3;log(g,`The queen mourns Bishop #${unit.id}; her sight is weakened temporarily.`);}
 }}
function chargeMove(g,unit){
 const usingBonus=unit.acted===g.serial&&unit.bonus>0;
 if(usingBonus)unit.bonus--;else{g.ap-=activationCost(g,unit);unit.acted=g.serial;}
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
 if(unit.project)return 'Worker must finish its project before moving.';
 if(unit.type==='V'&&unit.injuredUntil>=g.round)return 'This villager is recovering and cannot move.';
 if(!orders(g,unit).includes(to))return 'Destination or route is not known to be legal. Explore black territory first.';
 const previous=unit.pos;
 if(unit.type==='V'){unit.pos=to;unit.acted=g.serial;refreshBoth(g,unit.side,unit.id);log(g,`Engineer #${unit.id} moved independently to ${posName(g,to)} (0 CP).`);return null;}
 // A speculative route may pass an unseen enemy. Resolve against real occupancy,
 // without leaking the unit through previews or allowing a blind capture.
 let stop=to,obstruction=null;
 let lastSafe=unit.pos;
 for(const j of rayPath(g,unit,to)){
  if(!canEnter(g,unit,j)){stop=lastSafe;obstruction={type:'terrain'};break;}
  const o=at(g,j);
  if(o&&o.side!==unit.side&&!canObserveUnit(g,unit.side,o)){
   stop=lastSafe;obstruction=o;break;
  }
  // Defensive fall-back for an inconsistent memory snapshot: known occupied paths
  // would not have been offered by orders(), but an execution still cannot phase through.
  if(o&&j!==to){stop=lastSafe;obstruction=o;break;}
  lastSafe=j;
  // Forest is a soft obstruction: enter its square, then stop for this
  // activation. A hidden soldier on the forest tile takes precedence above,
  // causing a stop BEFORE the occupant instead.
  if(['R','B','Q'].includes(unit.type)&&g.terrain[j]===T.FOREST&&!unit.forestStride&&j!==to){
   stop=j;obstruction={type:'forest'};break;
  }
 }
 if(obstruction){
  chargeMove(g,unit);
  if(stop!==previous){unit.pos=stop;unit.history.unshift({from:previous,to:stop,round:g.round,interrupted:true});unit.history.length=Math.min(10,unit.history.length);claimedObjective(g,unit);}
  g.lastEvent={type:obstruction.type==='forest'?'forest-stop':'interrupted',side:unit.side,unitId:unit.id,from:previous,to:stop,attempted:to};
  log(g,obstruction.type==='forest'?`${P[unit.type]} #${unit.id} entered forest at ${posName(g,stop)} and stopped. Activation consumed.`:`${P[unit.type]} #${unit.id} ordered toward ${posName(g,to)}, but stopped at ${posName(g,stop)} before an unseen obstruction. Action consumed.`);
  refreshBoth(g,unit.side,unit.id);return null;
 }
 const dst=at(g,to);
 if(dst&&dst.side===unit.side)return 'Allied unit blocks this square.';
 const fake=g.decoys.find(d=>d.pos===to&&d.side!==unit.side&&d.until>=g.serial);
 if(fake){g.decoys=g.decoys.filter(d=>d!==fake);log(g,`A Phantom Queen decoy at ${posName(g,to)} dissolved under the attack.`);}
 // A guard or protector can block an otherwise lethal capture. The action is spent.
 if(dst&&dst.type!=='V'){g.battleEcho??=[];g.battleEcho.push({side:dst.side,unitId:unit.id,pos:unit.pos,until:g.serial+1});}
 if(dst&&dst.skillWard&&dst.skillWard.until>=g.serial){const ward=dst.skillWard;dst.skillWard=null;const source=byId(g,ward.source);if(source&&source.alive&&source.id!==dst.id&&equipped(source,'support_training')&&!source.supportAwards[dst.id]){source.supportAwards[dst.id]=true;addXp(g,source,1,'effective protection');}log(g,`${P[dst.type]} #${dst.id} was protected by a pawn skill; one attack absorbed.`);chargeMove(g,unit);refreshBoth(g,unit.side,unit.id);return null;}
 if(dst&&dst.ward>=g.serial){dst.ward=0;log(g,`${P[dst.type]} #${dst.id} survived because a mercy ward absorbed the attack.`);chargeMove(g,unit);return null;}
 if(dst&&wardFromWar(g,dst)){log(g,`${P[dst.type]} #${dst.id} survived: War Queen guard intercepted the attack.`);chargeMove(g,unit);return null;}
 if(dst&&interceptByKnight(g,dst,unit)){chargeMove(g,unit);return null;}
 if(dst&&dst.type==='V'){chargeMove(g,unit);raidVillager(g,dst,unit);refreshBoth(g,unit.side,unit.id);return null;}
 chargeMove(g,unit);
 if(dst){
  if(g.combatMode==='pips'){
   dst.hitsRemaining=Math.max(0,Math.min(MAX_CAPTURE_HITS,dst.hitsRemaining||1)-1);
   if(dst.hitsRemaining>0){
    g.lastEvent={type:'shield-hit',side:unit.side,unitId:unit.id,targetId:dst.id,remaining:dst.hitsRemaining};
    log(g,`${P[unit.type]} #${unit.id} struck ${P[dst.type]} #${dst.id}; ${dst.hitsRemaining} protection pip(s) remain. Neither piece moved.`);
    refreshBoth(g,unit.side,unit.id);return null;
   }
  }
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
  dst.alive=false;onUnitKilled(g,dst);
  if(dst.type!=='V'){g.battleEcho??=[];g.battleEcho=g.battleEcho.filter(x=>!(x.side===dst.side&&x.unitId===unit.id&&x.until>=g.serial));g.battleEcho.push({side:dst.side,unitId:unit.id,pos:to,until:g.serial+1});}const val=V[dst.type];const lowSummon=dst.summonedAt&&g.round-dst.summonedAt<5;
  addXp(g,unit,(4+val+Math.min(7,dst.level/5))*(lowSummon?.3:1),'defeated enemy');
  if(dst.type==='K'){g.winner=unit.side;log(g,`${unit.side==='w'?'White':'Black'} defeated the king and won.`);}
 }
 unit.pos=to;unit.history.unshift({from:previous,to,round:g.round});unit.history.length=Math.min(10,unit.history.length);
 claimedObjective(g,unit);
 log(g,`${unit.side==='w'?'White':'Black'} ${P[unit.type]} #${unit.id} ${posName(g,previous)} → ${posName(g,to)}${dst?' (captured '+P[dst.type]+')':''}.`);
 refreshBoth(g,unit.side,unit.id);
 return null;
}
function eligibleFissionSquares(g,u){if(!u||!u.alive||!g.fissionEnabled||!['P','N'].includes(u.type)||u.level<EXPERIMENTAL_FISSION_LEVEL||!equipped(u,'fission')||g.usedFissionLineages?.[u.lineage])return [];
 if(trainingCapacity(g,u.side)<1||!canEnter(g,{type:u.type},u.pos))return []; // Both reset to Lv1: never strand them on veteran-only terrain.
 const r=row(g,u.pos),c=col(g,u.pos),p=g.players[u.side];return KING.map(([dr,dc])=>[r+dr,c+dc]).filter(([rr,cc])=>inside(g,rr,cc)).map(([rr,cc])=>idx(g,rr,cc)).filter(j=>p.sight[j]&&canEnter(g,{type:u.type},j)&&!at(g,j));}
function fissionAction(g,u,to,cost){if(!g.fissionEnabled)return 'Fission experiment is disabled for this match.';
 if(!['P','N'].includes(u.type)||u.level<EXPERIMENTAL_FISSION_LEVEL)return 'Fission requires a level-60+ pawn or knight.';
 if(!equipped(u,'fission'))return 'Fission must be an equipped learned skill.';
 if(g.usedFissionLineages[u.lineage])return 'This lineage has already divided once.';
 if(!eligibleFissionSquares(g,u).includes(to))return 'Choose an empty, visible, traversable neighboring square; the army cap still applies.';
 const oldLevel=u.level,oldId=u.id,lineage=u.lineage;const type=u.type,side=u.side;
 const fresh=addUnit(g,side,type,to,{level:1,lineage,fissionOrigin:oldId});
 // Both results retain a narrative lineage ID but NONE of the veteran's level power.
 u.level=1;u.xp=0;u.totalXp=0;u.job=null;u.bond=null;u.bondTarget=null;u.bondTrust=0;u.cpDiscount=0;u.visionGrowth=0;u.pendingChoices=[];u.choiceHistory=[];u.ward=0;u.fatigueUntil=0;u.history=[];u.hp=maxHp(u);u.hitsMax=1;u.hitsRemaining=1;u.learnedSkills=[];u.equippedSkills=[];u.skillChoices=[];u.skillCooldowns={};u.supportAwards={};u.skillWard=null;prepareSkills(u);
 fresh.acted=g.serial;u.acted=g.serial;g.ap-=cost;
 g.usedFissionLineages[lineage]=true;u.fissionOrigin=u.fissionOrigin||u.id;
 log(g,`${P[type]} #${oldId} split from level ${oldLevel} into two level-1 ${P[type]}s (#${oldId}, #${fresh.id}), sacrificing all veteran advantages.`);
 refreshBoth(g);return null;
}
function eligibleSummons(g,k,type){return ['P','N','B'].includes(type)?eligibleTrainingCamps(g,k.side).map(c=>c.pos):[];}
function summonAction(g,k,type,to){return startCampTraining(g,k,type,to);}

function trainAction(g,u,job){return 'New pawn routes now develop from skill choices at levels 3, 6, 9 and so on; legacy professions are preserved only on existing saves.';
 /* historical implementation
 if(u.type!=='P'||u.level<2||u.job)return 'Pawn must be level 2 or higher and have no profession.';
 if(!JOBS[job])return 'Unknown pawn profession.';
 if(u.acted===g.serial)return 'This pawn has acted already.';
 u.job=job;prepareSkills(u);u.acted=g.serial;g.ap-=activationCost(g,u);log(g,`Pawn #${u.id} became a ${JOBS[job]}.`);refreshBoth(g,u.side,u.id);return null;
*/}
function bondAction(g,u,q){if(u.type==='K'||u.type==='Q'||u.level<2||u.bond)return 'Need an unbonded level-2+ pawn, knight, or bishop.';
 if(!q||q.side!==u.side||q.type!=='Q'||distance(g,u.pos,q.pos)>4)return 'The queen must be nearby (within 4 tiles).';
 if(u.acted===g.serial)return 'This piece already acted.';
 
 const bond=u.type==='P'?'devoted':u.type==='B'?'lover':u.type==='N'?'protector':null;
 if(!bond)return 'This piece has no relationship archetype yet.';
 g.ap-=activationCost(g,u);u.acted=g.serial;u.bond=bond;u.bondTarget=q.id;u.bondTrust=10;
 if(bond==='lover')q.bond='lover';
 log(g,`${P[u.type]} #${u.id} formed a ${bond} bond with Queen #${q.id}.`);refreshBoth(g,u.side,u.id);return null;
}
function queenAction(g,q,ability,targetId,to){if(q.type!=='Q'||!q.alive)return 'Select a living queen.';
 if(q.acted===g.serial)return 'Queen has already acted this turn.';
 const bank=g.players[g.side];
 if(!equipped(q,ability))return 'That queen ability is learned but not equipped. Change the skill loadout near your king or a shrine.';
 if(q.queenPath==='war'){
  if(ability!=='stance')return 'This war skill is not available.';
  q.stance=q.stance==='global'?'local':'global';q.acted=g.serial;g.ap-=activationCost(g,q);log(g,`War Queen switched to ${q.stance==='global'?'global passive (vision aura unlocks at queen level 6)':'local guard (extra vision unlocks at queen level 6; protection within 4)'} stance.`);refreshBoth(g,q.side,q.id);return null;
 }
 if(q.queenPath==='phantom'){
  if(ability==='cloak'){
   
   q.cloakUntil=g.serial+6;q.acted=g.serial;g.ap-=activationCost(g,q);log(g,`Phantom Queen vanished for three rounds (unless detected nearby).`);refreshBoth(g,q.side,q.id);return null;
  }
  if(ability==='decoy'){
   
   if(!Number.isInteger(to)||to<0||to>=g.n*g.n||!g.players[q.side].sight[to]||distance(g,q.pos,to)>6||at(g,to)||g.terrain[to]===T.MOUNTAIN)return 'Place a decoy within 6 currently visible, free, passable squares of the queen.';
   q.acted=g.serial;g.ap-=activationCost(g,q);g.decoys.push({side:q.side,pos:to,until:g.serial+6,source:q.id});log(g,`Phantom Queen planted a false queen sighting.`);refreshBoth(g,q.side,q.id);return null;
  }
  return 'Unknown Phantom spell.';
 }
 if(q.queenPath==='choice'){
  if(ability==='surge'){
   if(bank.essence<8)return 'A surge consumes 8 essence.';
   if(bank.surgeUsed===g.round)return 'Only one blood surge per round.';
   bank.essence-=8;bank.surgeUsed=g.round;q.acted=g.serial;g.ap=Math.min(9,g.ap-activationCost(g,q)+3);log(g,`Choice Queen spent 8 essence: +1 net command power, capped at 9. Queen activation spent.`);return null;
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
   addXp(g,q,Math.min(8,amount*.6),'sacrificial bargain');q.acted=g.serial;g.ap-=activationCost(g,q);
   log(g,`Choice Queen sacrificed ${P[ally.type]} #${ally.id} for ${amount.toFixed(1)} essence (${Math.round(factor*100)}% conversion).`);refreshBoth(g,q.side,q.id);return null;
  }
  if(ability==='siphon'){
   let taken=Math.min(ally.xp,Math.max(4,Math.floor(expNext(ally)*.35)));
   if(taken<1)return 'That ally has no unspent experience to siphon.';
   ally.xp=Math.max(0,Math.round((ally.xp-taken)*100)/100);ally.fatigueUntil=g.serial+4;ally.bondTrust=Math.max(0,ally.bondTrust-3);
   addXp(g,q,taken*.5,'nonlethal siphon');q.acted=g.serial;g.ap-=activationCost(g,q);
   log(g,`Choice Queen siphoned ${taken.toFixed(1)} XP from ${P[ally.type]} #${ally.id}, leaving it fatigued.`);refreshBoth(g,q.side,q.id);return null;
  }
  if(ability==='mercy'){
   
   ally.ward=g.serial+2;ally.bondTrust+=4;q.acted=g.serial;g.ap-=activationCost(g,q);
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
 u.hp=hpOf(u)+amount;u.acted=g.serial;g.ap-=activationCost(g,u);
 log(g,`${P[u.type]} #${u.id} rested and recovered ${amount} HP (${u.hp}/${maxHp(u)}).`);refreshBoth(g,u.side,u.id);return null;
}
function scoutAction(g,u){if(u.type!=='P'||u.job!=='scout'||u.level<4||!equipped(u,'watch'))return 'Only a level-4+ Scout Pawn can establish a watch post.';
 const bank=g.players[g.side];
 if(u.acted===g.serial)return 'Pawn has acted.';
 if(g.beacons.filter(b=>b.side===g.side&&b.until>=g.serial).length>=2)return 'Maximum two active watch posts.';
 g.ap-=activationCost(g,u);u.acted=g.serial;g.beacons.push({side:g.side,pos:u.pos,range:u.level>=10?3:2,until:g.serial+8,source:u.id,forestPierce:forestScout(u)});
 log(g,`Scout Pawn #${u.id} set a temporary watch post (4 rounds).`);refreshBoth(g,u.side,u.id);return null;
}
// Active skills use normal military CP and activation limits. Learning is free;
// USING a skill is never free. Cooldowns use serials (two serials per friendly turn).
function skillCooldown(u,id){const kind=PAWN_SKILLS[id]?.active;
 if(kind==='signal')return {key:'signal',turns:3};
 if(kind==='guard'||kind==='self_guard')return {key:'guard',turns:equipped(u,'ready_guard')?2:3};
 return {key:'maneuver',turns:equipped(u,'march_drill')?1:2};
}
function skillReady(g,u,id){if(!u||u.type!=='P'||!PAWN_SKILLS[id]?.active||!equipped(u,id))return false;
 const cd=skillCooldown(u,id);return (u.skillCooldowns?.[cd.key]||0)<=g.serial;
}
function fullyVisibleLine(g,side,from,to){
 // Never consult hidden live terrain when offering a guard target.
 let y=row(g,from),x=col(g,from),tr=row(g,to),tc=col(g,to);
 const dy=Math.abs(tr-y),dx=Math.abs(tc-x),sy=y<tr?1:-1,sx=x<tc?1:-1;let err=dx-dy;
 while(x!==tc||y!==tr){let e2=2*err;if(e2>-dy){err-=dy;x+=sx;}if(e2<dx){err+=dx;y+=sy;}
  if(!g.players[side].sight[idx(g,y,x)])return false;
 }
 return los(g,row(g,from),col(g,from),tr,tc,false);
}
function maneuverVectors(u,id){const f=u.side==='w'?-1:1;
 return {sidestep:[[0,-1,1],[0,1,1]],withdraw:[[-f,0,1]],forced_march:[[f,0,2]],diagonal_march:[[f,-1,2],[f,1,2]]}[id]||[];
}
function maneuverPath(g,u,id,to){const r=row(g,u.pos),c=col(g,u.pos);
 for(const [dr,dc,n] of maneuverVectors(u,id))if(inside(g,r+dr*n,c+dc*n)&&idx(g,r+dr*n,c+dc*n)===to)return Array.from({length:n},(_,i)=>idx(g,r+dr*(i+1),c+dc*(i+1)));
 return [];
}
function skillTargets(g,u,id){if(!u||u.type!=='P'||!u.alive||u.project||!skillReady(g,u,id))return [];
 const kind=PAWN_SKILLS[id].active;
 if(kind==='signal')return [u.pos];
 const protectedNow=x=>x.ward>=g.serial||x.skillWard?.until>=g.serial;
 if(kind==='self_guard')return protectedNow(u)?[]:[u.pos];
 if(kind==='guard')return withSide(g,u.side).filter(x=>x!==u&&['P','N','B','R'].includes(x.type)&&distance(g,u.pos,x.pos)<=(id==='distant_cover'?2:1)&&!protectedNow(x)&&fullyVisibleLine(g,u.side,u.pos,x.pos)).map(x=>x.pos);
 if(kind==='relief')return withSide(g,u.side).filter(x=>x!==u&&['P','N','B','R'].includes(x.type)&&distance(g,u.pos,x.pos)===1&&!x.project&&x.acted!==g.serial&&knownPassable(g,u.side,u,x.pos)&&knownPassable(g,u.side,x,u.pos)).map(x=>x.pos);
 if(kind==='maneuver'){
  const out=[],r=row(g,u.pos),c=col(g,u.pos);
  for(const [dr,dc,n] of maneuverVectors(u,id)){
   if(!inside(g,r+dr*n,c+dc*n))continue;const to=idx(g,r+dr*n,c+dc*n),path=maneuverPath(g,u,id,to);
   if(path.every(j=>knownPassable(g,u.side,u,j)&&!knownOccupant(g,u.side,j)&&!apparentEnemy(g,u.side,j)))out.push(to);
  }return out;
 }
 return [];
}
function usePawnSkill(g,u,id,to,targetId){
 if(!skillReady(g,u,id))return 'This active skill must be equipped and off cooldown.';
 if(u.project||u.acted===g.serial)return 'A busy or already activated pawn cannot use another skill.';
 const kind=PAWN_SKILLS[id].active;
 if(kind==='signal'||kind==='self_guard')to=u.pos;
 else if(targetId){const target=byId(g,targetId);if(!target||target.side!==u.side)return 'Choose a friendly target.';to=target.pos;}
 if(!skillTargets(g,u,id).includes(to))return 'Choose a highlighted legal target; no blind captures, royal protection or stacked wards.';
 let cost=activationCost(g,u),ally=kind==='relief'?at(g,to):null;
 if(ally)cost+=activationCost(g,ally);
 if(g.ap<cost)return `This skill requires ${cost} CP${ally?' for both pieces':''}.`;
 g.ap-=cost;u.acted=g.serial;u.skillCooldowns??={};
 const cd=skillCooldown(u,id);u.skillCooldowns[cd.key]=g.serial+2*cd.turns;
 if(kind==='signal'){
  const range=id==='far_signal'?3:2,turns=id==='lasting_signal'?6:4;
  g.beacons.push({side:u.side,pos:u.pos,range,until:g.serial+2*turns-1,source:u.id,forestPierce:forestScout(u)});
  log(g,`Pawn #${u.id} used ${skillName(id)} (radius ${range}; ${turns} opposing response turns).`);
 }else if(kind==='guard'||kind==='self_guard'){
  const target=at(g,to);target.skillWard={source:u.id,until:g.serial+(equipped(u,'lasting_guard')?3:1)};
  log(g,`Pawn #${u.id} used ${skillName(id)} to protect ${P[target.type]} #${target.id} from one attack.`);
 }else if(kind==='relief'){
  const old=u.pos;u.pos=ally.pos;ally.pos=old;ally.acted=g.serial;ally.bonus=0;u.bonus=0;
  u.history.unshift({from:old,to:u.pos,round:g.round,skill:id});ally.history.unshift({from:u.pos,to:old,round:g.round,skill:id});
  u.history.length=Math.min(10,u.history.length);ally.history.length=Math.min(10,ally.history.length);
  log(g,`Pawn #${u.id} relieved ${P[ally.type]} #${ally.id}: swapped positions, both activations used (${cost} CP).`);
 }else if(kind==='maneuver'){
  const old=u.pos,path=maneuverPath(g,u,id,to);let stopped=false;
  for(const j of path){if(!canEnter(g,u,j)||at(g,j)){stopped=true;break;}u.pos=j;}
  if(u.pos!==old){u.history.unshift({from:old,to:u.pos,round:g.round,skill:id,interrupted:stopped});u.history.length=Math.min(10,u.history.length);claimedObjective(g,u);}
  g.lastEvent={type:stopped?'interrupted':'skill-move',side:u.side,unitId:u.id,from:old,to:u.pos,attempted:to};
  log(g,`Pawn #${u.id} used ${skillName(id)}${stopped?'; stopped before an unseen obstruction. Activation and cooldown consumed.':'. No capture.'}`);
 }
 refreshBoth(g,u.side,u.id);return null;
}

function endTurn(g){if(g.winner)return null;
 tickBuilders(g,g.side);tickTraining(g,g.side);
 for(const u of withSide(g,g.side))u.bonus=0; // bonus actions cannot be banked into a later turn
 g.side=other(g.side);g.serial++;if(g.side==='w')g.round++;
 g.ap=commandPower(g,g.side);
 let bank=g.players[g.side];
 for(const loc of g.shrines){let o=at(g,loc);if(o&&o.side===g.side)bank.gold=Math.min(90,bank.gold+2);}
 g.beacons=g.beacons.filter(b=>b.until>=g.serial);g.decoys=g.decoys.filter(d=>d.until>=g.serial);g.battleEcho=(g.battleEcho||[]).filter(b=>b.until>=g.serial);
 let q=queen(g,g.side);if(q&&q.griefUntil>=g.serial)q.fatigueUntil=q.griefUntil;
 // No automatic currency production or aura upkeep in the command-camp experiment.
 refreshBoth(g);log(g,`${g.side==='w'?'White':'Black'} command phase begins (${g.ap} CP; pawn-workers).`);return null;
}
function action(g,a){if(!g||g.winner)return {ok:false,error:'The game is finished.'};if(!a||!a.type)return {ok:false,error:'Unknown action.'};
 g.lastEvent=null;
 if(a.type==='end'){endTurn(g);return {ok:true};}
 const u=byId(g,a.unitId);
 if(!u||u.side!==g.side)return {ok:false,error:'Select a living unit from the active army.'};
 if(a.type==='chooseSkill'){const err=chooseSkillAction(g,u,a.skill,a.replace);return err?{ok:false,error:err}:{ok:true};}
 if(a.type==='milestone'){const err=milestoneAction(g,u,a.choice);return err?{ok:false,error:err}:{ok:true};}
 if(a.type==='build'){
  const err=startBuilding(g,u,a.project,a.to);
  return err?{ok:false,error:err}:{ok:true};
 }
 if(a.type==='work')return {ok:false,error:'The resource-economy worker system is retired; pawns build terrain projects.'};
 if(u.project)return {ok:false,error:'Worker cannot move or receive another order until its project completes.'};
 const bonus=a.type==='move'&&u.acted===g.serial&&u.bonus>0;
 if(u.acted===g.serial&&!bonus)return {ok:false,error:'This unit has already acted. Each unit gets one activation per turn unless an extra-action skill applies.'};
 const cost=bonus?0:a.type==='claimCamp'?1:activationCost(g,u);
 if(g.ap<cost)return {ok:false,error:`Requires ${cost} CP; only ${g.ap} available.`};
 let error='Unknown action type.';
 switch(a.type){
  case 'useSkill':error=usePawnSkill(g,u,a.skill,a.to,a.targetId);break;
  case 'move':error=moveAction(g,u,a.to);break;
  case 'fission':error=fissionAction(g,u,a.to,cost);break;
  case 'rest':error=restAction(g,u);break;
  case 'summon':error=u.type==='K'?summonAction(g,u,a.piece,a.to):'Only the king commands remote training.';break;
  case 'trainCamp':{const k=king(g,u.side);error=u.type==='P'?startPawnCampTraining(g,u,a.piece,a.mode):canOperateCamp(u)&&k?startCampTraining(g,k,a.piece,u.pos,u):'Camp production requires a level-4+ pawn standing on a friendly camp; the King can order XP-funded recruitment remotely.';break;}
  case 'claimCamp':error=claimCampAction(g,u);break;
  case 'train':error=trainAction(g,u,a.job);break;
  case 'maester':if(u.type!=='B'||u.level<15||u.job)return {ok:false,error:'Requires an unspecialized level-15 bishop.'};u.job='maester';u.acted=g.serial;g.ap-=activationCost(g,u);log(g,`Bishop #${u.id} became a Maester. Next friendly turns receive +1 base CP (cap 9).`);break;
  case 'bond':error=bondAction(g,u,queen(g,g.side));break;
  case 'queen':error=queenAction(g,u,a.ability,a.targetId,a.to);break;
  case 'watch':error=scoutAction(g,u);break;
  case 'equip':error=equipAction(g,u,a.skill,a.replace);break;
 }
 return error?{ok:false,error}:{ok:true};
}
function canAct(g,u){return u.side===g.side&&u.alive&&!u.project&&(u.type!=='V'||u.injuredUntil<g.round)&&(u.acted!==g.serial||u.bonus>0);}
function apparentEnemy(g,side,pos){const x=at(g,pos);if(x&&x.side!==side&&canObserveUnit(g,side,x))return x;
 const dec=g.decoys.find(d=>d.side!==side&&d.pos===pos&&d.until>=g.serial&&g.players[side].sight[pos]);if(dec)return {type:'Q',side:other(side),decoy:true};return null;
}
function aiChoice(g){if(g.winner||g.side!=='b')return null;
 const me='b',k=king(g,me);
 for(const p of withSide(g,me).filter(u=>u.type==='P')){const offers=skillOffers(p);if(offers.length){const skill=offers[(p.id+Math.floor(p.level/3))%offers.length];return {type:'chooseSkill',unitId:p.id,skill};}}
 const trainers=laborers(g,me).filter(u=>canOperateCamp(u)&&canAct(g,u)&&activationCost(g,u)<=g.ap).sort((a,b)=>activationCost(g,a)-activationCost(g,b));
 for(const worker of trainers){
  const camp=eligibleTrainingCamps(g,me).find(c=>c.pos===worker.pos);if(!camp)continue;
  if(worker.type==='P'&&trainingCapacity(g,me)>=1)return {type:'trainCamp',unitId:worker.id,piece:'N',mode:'stay'};
  if(worker.type==='V'&&k&&k.xp>=TRAIN_XP.P&&trainingCapacity(g,me)>=1)return {type:'trainCamp',unitId:worker.id,piece:k.xp>=TRAIN_XP.N&&rnum(g)<.23?'N':'P'};
 }
 if(!(g.camps||[]).some(c=>c.side===me))for(const worker of laborers(g,me)){
  if(!canAct(g,worker)||activationCost(g,worker)>g.ap)continue;
  const targets=eligibleBuilderTargets(g,worker,'camp');if(targets.length)return {type:'build',unitId:worker.id,project:'camp',to:targets[0]};
 }
 if(k&&canAct(g,k)&&activationCost(g,k)<=g.ap&&k.xp>=TRAIN_XP.P&&trainingCapacity(g,me)>=1){
  const camps=eligibleSummons(g,k,'P');if(camps.length&&rnum(g)<(g.round<=4?.40:.12))return {type:'summon',unitId:k.id,piece:'P',to:camps[0]};
 }
 const objective=g.shrines.filter(j=>g.players[me].seen[j]&&knownOccupant(g,me,j)?.side!==me);
 const visibleEnemy=withSide(g,'w').filter(u=>u.type!=='V'&&canObserveUnit(g,me,u));
 let opts=[];
 for(const u of combatUnits(g,me)){
  if(!canAct(g,u)||effectiveCost(g,u)>g.ap)continue;
  for(const j of orders(g,u)){
   const tar=apparentEnemy(g,me,j);
   const before=objective.length?Math.min(...objective.map(o=>manhattan(g,u.pos,o))):manhattan(g,u.pos,idx(g,Math.floor(g.n/2),Math.floor(g.n/2)));
   const after=objective.length?Math.min(...objective.map(o=>manhattan(g,j,o))):manhattan(g,j,idx(g,Math.floor(g.n/2),Math.floor(g.n/2)));
   let score=Math.max(-5,Math.min(7,(before-after)*1.2));
   if(tar)score+=tar.type==='K'?10000:V[tar.type]*9+10;
   if(rememberedTerrain(g,me,j)===T.SHRINE)score+=13;
   if(visibleEnemy.length){const d0=Math.min(...visibleEnemy.map(x=>manhattan(g,u.pos,x.pos))),d1=Math.min(...visibleEnemy.map(x=>manhattan(g,j,x.pos)));score+=(d0-d1)*.4;}
   if(u.type==='K')score-=5;
   if(u.history?.some(h=>h.from===j&&g.round-h.round<3))score-=7;
   score+=rnum(g)*3;
   opts.push({action:{type:'move',unitId:u.id,to:j},score});
  }
  if(u.type==='P'){
   for(const id of u.equippedSkills||[]){const kind=PAWN_SKILLS[id]?.active;if(!kind||kind==='relief')continue;
    for(const to of skillTargets(g,u,id)){
     let score=0;
     if(kind==='maneuver'){const anchor=visibleEnemy[0]?.pos||objective[0];if(anchor!==undefined)score=(manhattan(g,u.pos,anchor)-manhattan(g,to,anchor))*.8;}
     else if(kind==='guard'){const target=at(g,to);if(target&&visibleEnemy.some(e=>distance(g,e.pos,target.pos)<=2))score=6;}
     else if(kind==='self_guard'&&visibleEnemy.some(e=>distance(g,e.pos,u.pos)<=2))score=3;
     else if(kind==='signal'&&visibleEnemy.length)score=1;
     if(score>0)opts.push({action:{type:'useSkill',unitId:u.id,skill:id,to},score});
    }
   }
   for(const project of ['clear_forest','bridge','excavate'])for(const to of eligibleBuilderTargets(g,u,project)){
    const forward=row(g,to)>row(g,u.pos); // black advances toward increasing rows
    if(project==='clear_forest'||forward)opts.push({action:{type:'build',unitId:u.id,project,to},score:project==='clear_forest'?2:5});
   }
  }

  if(u.type==='B'&&u.level>=15&&!u.job)opts.push({action:{type:'maester',unitId:u.id},score:18});
 }
 if(!opts.length)return {type:'end'};
 opts.sort((a,b)=>b.score-a.score);return opts[rnum(g)<.1?Math.min(3,opts.length-1):0].action;
}
function liveGhosts(g,side){let p=g.players[side],output=[];
 for(const key of Object.keys(p.lastSeen)){
  const ghost=p.lastSeen[key];if(p.sight[ghost.pos])continue; // last-known, not currently visible
  if(g.round-ghost.round<=10)output.push({...ghost,stale:true});
 }return output;
}
function objectiveInfo(g){return g.shrines.map(j=>({pos:j,occupant:at(g,j)?.side||null}));}
function dump(g){return JSON.stringify(g);}
function load(json){const obj=typeof json==='string'?JSON.parse(json):json;
 if(!obj||![5,6,7,8,9,10,11,12,13].includes(obj.version)||obj.ruleset!=='command-camp'||!Array.isArray(obj.units)||![30,50,70].includes(obj.n)||obj.terrain?.length!==obj.n*obj.n)throw new Error('Stale-Mate v0.5.8 loads v0.5.1–v0.5.8 command-camp saves. Use the archived v0.4 build for older saves.');
 const previousVersion=obj.version;
 obj.camps??=[];obj.towers??=[];obj.workAwards??={w:{},b:{}};obj.wildlife??=[];obj.beacons??=[];obj.decoys??=[];obj.usedFissionLineages??={};
 obj.commandMode??='original';obj.campCaptureMode??='off';obj.deployment??='spread';obj.battleEcho??=[]; // older saves preserve original two-CP gameplay
 if(!['classic','hp','pips'].includes(obj.combatMode))obj.combatMode=obj.hpMode?'hp':'classic';
 obj.hpMode=obj.combatMode==='hp';obj.fissionEnabled=obj.fissionEnabled===true;
 for(const side of ['w','b']){const p=obj.players[side];
  if(!p||!Array.isArray(p.seen)||p.seen.length!==obj.n*obj.n)throw new Error('Missing player fog state.');
  if(!Array.isArray(p.sight)||p.sight.length!==obj.n*obj.n)p.sight=Array(obj.n*obj.n).fill(0);
  if(!Array.isArray(p.terrainMemory)||p.terrainMemory.length!==obj.n*obj.n){
   // v0.5.1 never stored last-observed terrain. For mist cells we cannot
   // reconstruct it without cheating. Assume ordinary passable floor until
   // re-observed, then resolve changed obstacles during actual movement.
   p.terrainMemory=p.seen.map((known,j)=>!known?-1:p.sight[j]?obj.terrain[j]:T.PLAIN);
   obj.migratedFogMemory=true;
  }
 }
 for(const u of obj.units){
  if(u.type==='V'&&u.project&&u.project.pos!==u.pos){
   // Old v0.5.1–v0.5.2 builders worked on adjacent tiles. Relocate the
   // builder onto its worksite once so existing saved construction survives.
   u.pos=u.project.pos;obj.migratedBuilderProjects=true;
  }
  u.project??=null;u.pendingChoices??=[];u.cpDiscount??=0;u.visionGrowth??=0;u.choiceHistory??=[];u.bonus??=0;u.acted??=-1;u.ninjaRolled??=-1;u.history??=[];if(!Number.isFinite(u.hp))u.hp=maxHp(u);u.hitsMax=Math.max(1,Math.min(MAX_CAPTURE_HITS,u.hitsMax||1));u.hitsRemaining=Math.max(1,Math.min(u.hitsMax,u.hitsRemaining||u.hitsMax));u.lineage??=u.id;prepareSkills(u);}
 // An old save might have a working engineer. Retire the unit in this
 // ruleset; preserve progress of already-paid XP training as a royal order.
 // A partially built terrain project is canceled (the old worker was free).
 let retiredEngineers=0,uncompletedProjects=0;
 for(const u of obj.units)if(u.type==='V'&&u.alive){
  if(u.project&&u.project.kind!=='training')uncompletedProjects++;
  u.alive=false;u.project=null;retiredEngineers++;
 }
 for(const c of obj.camps)if(c.queue?.workerId){
  const assigned=obj.units.find(u=>u.id===c.queue.workerId);
  if(assigned?.type==='V'){
   c.queue.workerId=null;c.queue.kind??='legacy';c.queue.mode??='xp';
   c.queue.migratedEngineerToRoyal=true;
  }
 }
 obj.version=13;obj.armyW=PRESETS[obj.armyW]?obj.armyW:'balanced';obj.armyB=PRESETS[obj.armyB]?obj.armyB:'expedition';obj.skillSystemVersion=1;obj.routeDisclosure=['effects','hints','full'].includes(obj.routeDisclosure)?obj.routeDisclosure:'effects';obj.build='Stale-Mate v0.5.8';
 if(previousVersion<13){
  obj.log??=[];
  log(obj,'v0.5.8: Organizational Flatness provides Traditional/Middle/Flatten starting armies. Historical saved armies stay unchanged; no delegation CP bonus is assumed.');
 }
 if(previousVersion<12){
  obj.log??=[];
  log(obj,`v0.5.7: ${retiredEngineers} engineer(s) retired; ${uncompletedProjects} in-progress terrain projects canceled. Paid training queues and remaining turns preserved. Pawns are the workers; no camp limit added.`);
 }
 if(previousVersion<11){
  obj.log??=[];log(obj,'v0.5.6 skills: base slots P/N/B/R/Q/K = 0/1/1/2/3/2. Pawn drafts at levels 3/6/9/...; existing professions/XP/projects/actions are preserved. Excess equipped skills remain learned.');
 }
 if(previousVersion<10){
  for(const c of obj.camps)if(c.queue){c.queue.kind??='legacy';c.queue.mode??='xp';c.queue.count??=1;}
  obj.log??=[];log(obj,'v0.5.6 rules now apply: Rook2/Bishop1 CP, forward-three pawn moves, worker ladder L1–4, camp/watchtower sight. Existing XP training queues, remaining CP and used activations are preserved.');
 }
 refreshBoth(obj);return obj;
}

Object.assign(E,{PAWN_SKILLS,PAWN_ROUTES,PAWN_SKILL_IDS,ORG_MODES,skillName,pendingSkillLevels,skillOffers,pawnRoute,chooseSkillAction,workDuration,pawnWorkLevel,skillTargets,skillReady,skillCooldown,canRemoveSkill,PAWN_WORK_LEVELS,WORK_XP,MILITARY_CAP,isWorker,laborers,canOperateCamp,campGarrison,campSight,towerSight,pawnBatchSize,reservedRecruits,trainingCapacity,EXPERIMENTAL_FISSION_LEVEL,MAX_CAPTURE_HITS,COMMAND_MODES,claimCampAction,rememberedTerrain,knownPassable,eligibleFissionSquares,T,P,V,COST,COST_FOOD,COST_WOOD,CIVILIAN_JOBS,WORK_PROJECTS,TRAIN_XP,TRAIN_TURNS,CP_MILESTONES,CHOICE_LEVELS,commandPower,activationCost,effectiveCost,eligibleBuilderTargets,eligibleTrainingCamps,trainingDuration,workerAt,SKILL_SLOTS,skillCapacity,prepareSkills,equipped,combatUnits,civilians,jobSite,BASE_HP,BASE_DAMAGE,maxHp,hpOf,damageFor,PRESETS,QPATH,JOBS,GLYPHS,create,byId,at,withSide,queen,king,idx,row,col,posName,other,inside,distance,manhattan,moves,orders,knownOccupant,canEnter,visionRadius,forestScout,visionDirections,personalSight,los,ensureWaterClusters,refreshSight,refreshBoth,addXp,expNext,expProgress,canObserveUnit,apparentEnemy,action,endTurn,aiChoice,eligibleSummons,liveGhosts,objectiveInfo,canAct,dump,load});
if(typeof module!=='undefined'&&module.exports)module.exports=E;
if(root){root.ChessLifeEngine=E;root.StaleMateEngine=E;} // Legacy namespace retained for saved builds
})(typeof window!=='undefined'?window:undefined);

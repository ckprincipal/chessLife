/* ChessLife browser app, canvas viewport + minimap. No external dependencies. */
(()=>{
'use strict';const E=window.ChessLifeEngine;const $=id=>document.getElementById(id);
let g=E.create(),selected=null,targeting=null,errorText='',camera={x:25,y:32,zoom:1},fogEnabled=true,aiBusy=false,pointer=null,redrawRequest=0;
const board=$('board'),ctx=board.getContext('2d'),minimap=$('minimap'),mctx=minimap.getContext('2d');
const color={plain1:'#75907b',plain2:'#698675',forest:'#365d4d',water:'#39677f',mountain:'#676e79',shrine:'#c9a65e',black:'#070c14',mist:'#8795a1'};
const short={w:'White',b:'Black'};
function resizeCanvas(canvas){const box=canvas.getBoundingClientRect(),ratio=Math.min(devicePixelRatio||1,2),w=Math.max(1,Math.round(box.width*ratio)),h=Math.max(1,Math.round(box.height*ratio));if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}return {w:box.width,h:box.height,dpr:ratio};}
function cellSize(){return 25*camera.zoom;}
function worldAt(x,y){const rect=board.getBoundingClientRect(),sz=cellSize();return {c:Math.floor(camera.x+(x-rect.left-rect.width/2)/sz),r:Math.floor(camera.y+(y-rect.top-rect.height/2)/sz)};}
function centerForUnit(u){if(!u)return;camera.x=E.col(g,u.pos)+.5;camera.y=E.row(g,u.pos)+.5;draw();}
function colorTerrain(tile,r,c){if(tile===E.T.FOREST)return color.forest;if(tile===E.T.WATER)return color.water;if(tile===E.T.MOUNTAIN)return color.mountain;if(tile===E.T.SHRINE)return color.shrine;return (r+c)%2?color.plain1:color.plain2;}
function draw(){if(redrawRequest){cancelAnimationFrame(redrawRequest);redrawRequest=0;}
 const {w,h,dpr}=resizeCanvas(board);ctx.setTransform(dpr,0,0,dpr,0,0);ctx.fillStyle='#07101b';ctx.fillRect(0,0,w,h);
 const cell=cellSize(),c0=Math.max(0,Math.floor(camera.x-w/(2*cell)-1)),c1=Math.min(g.n-1,Math.ceil(camera.x+w/(2*cell)+1)),r0=Math.max(0,Math.floor(camera.y-h/(2*cell)-1)),r1=Math.min(g.n-1,Math.ceil(camera.y+h/(2*cell)+1)),p=g.players.w;
 const possible=selected&&E.byId(g,selected)&&g.side==='w'?new Set(E.orders(g,E.byId(g,selected))):new Set();
 const dests=targeting?.kind==='summon'&&g.side==='w'?new Set(E.eligibleSummons(g,E.byId(g,targeting.unitId),targeting.piece)):new Set();
 const ghosts=new Map(E.liveGhosts(g,'w').map(x=>[x.pos,x]));const decoys=new Map(g.decoys.filter(d=>d.side==='b'&&d.until>=g.serial).map(d=>[d.pos,d]));
 for(let r=r0;r<=r1;r++)for(let c=c0;c<=c1;c++){
  const j=E.idx(g,r,c),x=(c-camera.x)*cell+w/2,y=(r-camera.y)*cell+h/2,visible=p.sight[j]===1,seen=p.seen[j]===1;
  ctx.fillStyle=seen?colorTerrain(g.terrain[j],r,c):color.black;ctx.fillRect(x,y,cell+.35,cell+.35);
  if(seen&&!visible){ctx.fillStyle='rgba(181,190,205,0.73)';ctx.fillRect(x,y,cell+.35,cell+.35);ctx.fillStyle='rgba(70,86,112,0.3)';if(cell>=17){ctx.fillRect(x+3,y+5,2,2);ctx.fillRect(x+cell-6,y+cell-7,2,2);}}
  if(visible){if(g.terrain[j]===E.T.SHRINE){ctx.strokeStyle='#fff5be';ctx.lineWidth=Math.max(.8,cell*.045);ctx.strokeRect(x+cell*.25,y+cell*.25,cell*.5,cell*.5);}
   else if(g.terrain[j]===E.T.FOREST&&cell>=14){ctx.fillStyle='#183c2d';ctx.beginPath();ctx.arc(x+cell*.48,y+cell*.42,cell*.21,0,Math.PI*2);ctx.fill();}
   else if(g.terrain[j]===E.T.WATER&&cell>=14){ctx.strokeStyle='#98b9c9';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x+cell*.16,y+cell*.55);ctx.quadraticCurveTo(x+cell*.35,y+cell*.38,x+cell*.55,y+cell*.55);ctx.quadraticCurveTo(x+cell*.73,y+cell*.71,x+cell*.85,y+cell*.5);ctx.stroke();}
   else if(g.terrain[j]===E.T.MOUNTAIN&&cell>=14){ctx.fillStyle='#a8abb2';ctx.beginPath();ctx.moveTo(x+cell*.17,y+cell*.75);ctx.lineTo(x+cell*.53,y+cell*.19);ctx.lineTo(x+cell*.85,y+cell*.75);ctx.closePath();ctx.fill();}
  }
  const wildlife=g.wildlife?.find(site=>site.pos===j);
  if(visible&&wildlife&&cell>=15){
   ctx.font=`${Math.min(cell*.66,34)}px system-ui,serif`;ctx.textAlign='center';ctx.textBaseline='middle';
   ctx.fillText(wildlife.kind==='dinosaur'?'🦖':'🐊',x+cell*.50,y+cell*.52);
   if(cell>=29){ctx.font=`bold ${Math.max(8,cell*.23)}px system-ui`;ctx.fillStyle='#fff4c0';ctx.fillText(''+wildlife.stock,x+cell*.85,y+cell*.85);}
  }
  if(cell>=16){ctx.strokeStyle='rgba(14,30,30,.17)';ctx.lineWidth=.4;ctx.strokeRect(x+.2,y+.2,cell-.5,cell-.5);}
  if(possible.has(j)){
   // Visual confidence: gold = currently observed; blue dashed = speculative mist route.
   const target=E.apparentEnemy(g,'w',j);
   ctx.fillStyle=visible?(target?'rgba(255,98,89,.50)':'rgba(239,211,111,.45)'):'rgba(89,185,245,.57)';
   ctx.beginPath();ctx.arc(x+cell/2,y+cell/2,Math.max(2,cell*.16),0,Math.PI*2);ctx.fill();
   if(!visible&&cell>=12){ctx.strokeStyle='#a5dafe';ctx.lineWidth=Math.max(1,cell*.06);ctx.setLineDash([Math.max(2,cell*.14),Math.max(2,cell*.1)]);ctx.strokeRect(x+2,y+2,cell-4,cell-4);ctx.setLineDash([]);}
  }
  if(dests.has(j)){ctx.strokeStyle='#edcd83';ctx.lineWidth=2;ctx.strokeRect(x+2,y+2,cell-4,cell-4);}
  const u=E.at(g,j),showUnit=u&&(u.side==='w'||(visible&&E.canObserveUnit(g,'w',u)));
  if(showUnit&&cell>=11){const symbol=E.GLYPHS[u.side==='w'?u.type:u.type.toLowerCase()];ctx.font=`${Math.min(56,cell*.78)}px 'DejaVu Sans','Segoe UI Symbol',Georgia,serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineWidth=Math.max(1,cell*.09);ctx.strokeStyle=u.side==='w'?'#1b292b':'#e8dfcc';ctx.fillStyle=u.side==='w'?'#fff8e7':'#17212b';ctx.strokeText(symbol,x+cell/2,y+cell*.54);ctx.fillText(symbol,x+cell/2,y+cell*.54);
   if(g.hpMode&&cell>=17){const health=Math.max(0,Math.min(1,E.hpOf(u)/E.maxHp(u)));ctx.fillStyle='#17252b';ctx.fillRect(x+cell*.09,y+cell*.055,cell*.82,Math.max(2,cell*.08));ctx.fillStyle=health>.55?'#78d7ad':health>.26?'#edb960':'#ed7275';ctx.fillRect(x+cell*.09,y+cell*.055,cell*.82*health,Math.max(2,cell*.08));}
   if(cell>=23){ctx.font=`bold ${Math.max(7,cell*.21)}px system-ui`;ctx.fillStyle=u.side==='w'?'#fff2ae':'#eec9c6';ctx.textAlign='right';ctx.fillText(''+u.level,x+cell*.94,y+cell*.9);if(u.job){ctx.fillStyle='#e6f4ed';ctx.beginPath();ctx.arc(x+cell*.18,y+cell*.18,cell*.09,0,Math.PI*2);ctx.fill();}}
   if(u.id===selected){ctx.strokeStyle='#ffdc6a';ctx.lineWidth=Math.max(2,cell*.09);ctx.strokeRect(x+1.4,y+1.4,cell-3,cell-3);}
   if(u.type==='Q'&&u.queenPath==='phantom'&&u.cloakUntil>=g.serial){ctx.strokeStyle='#cf9df5';ctx.lineWidth=2;ctx.strokeRect(x+4,y+4,cell-8,cell-8);}
  }else if(seen&&!visible&&ghosts.has(j)&&cell>=15){const gh=ghosts.get(j);ctx.font=`${cell*.60}px Georgia,serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='rgba(33,45,61,.38)';ctx.fillText(E.GLYPHS[gh.type.toLowerCase()],x+cell*.5,y+cell*.55);if(cell>=23){ctx.fillStyle='#343d52';ctx.font='bold 10px system-ui';ctx.fillText('?',x+cell*.78,y+cell*.25);}}
  if(visible&&decoys.has(j)&&!u&&cell>=13){ctx.font=`${cell*.69}px Georgia,serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#986bc2';ctx.fillText('♛',x+cell*.5,y+cell*.55);}
 }
 // Coordinate ruler in zoomed overview, never obscure piece names.
 if(cell>=18){ctx.font='10px system-ui';ctx.textAlign='left';ctx.fillStyle='rgba(240,247,248,.76)';for(let c=c0;c<=c1;c++)if(c%5===0){let x=(c-camera.x)*cell+w/2;ctx.fillText(''+(c+1),x+3,14);}for(let r=r0;r<=r1;r++)if(r%5===0){let y=(r-camera.y)*cell+h/2;ctx.fillText(''+(g.n-r),3,y+11);}}
 drawMinimap();
}
function drawMinimap(){const {w,h,dpr}=resizeCanvas(minimap);mctx.setTransform(dpr,0,0,dpr,0,0);const sz=Math.min(w,h),step=sz/g.n,p=g.players.w;mctx.fillStyle='#080d13';mctx.fillRect(0,0,w,h);
 for(let i=0;i<g.n*g.n;i++){let r=E.row(g,i),c=E.col(g,i);mctx.fillStyle=!p.seen[i]?'#080c13':!p.sight[i]?'#86929e':g.terrain[i]===E.T.SHRINE?'#c9a35d':g.terrain[i]===E.T.WATER?'#447895':g.terrain[i]===E.T.MOUNTAIN?'#6c6b7b':g.terrain[i]===E.T.FOREST?'#315b4a':'#63877a';mctx.fillRect(c*step,r*step,step+.3,step+.3);}
 for(const u of g.units){if(!u.alive||u.side==='b'&&!E.canObserveUnit(g,'w',u))continue;mctx.fillStyle=u.type==='V'?(u.side==='w'?'#6addce':'#d0a36b'):u.side==='w'?'#faf5d4':'#e65e69';const r=E.row(g,u.pos),c=E.col(g,u.pos);mctx.fillRect(c*step-.5,r*step-.5,Math.max(2,step*1.7),Math.max(2,step*1.7));}
 const rect=board.getBoundingClientRect(),viewW=rect.width/cellSize(),viewH=rect.height/cellSize();mctx.strokeStyle='#f1d177';mctx.lineWidth=1.6;mctx.strokeRect((camera.x-viewW/2)*step,(camera.y-viewH/2)*step,viewW*step,viewH*step);
}
function act(a){const result=E.action(g,a);if(!result.ok){errorText=result.error;update();return false;}errorText=g.lastEvent?.type==='interrupted'&&g.lastEvent.side==='w'?'Movement interrupted by an unseen blocker. Action spent; this piece cannot move again unless it has a bonus move.':g.lastEvent?.type==='civilian_raid'&&g.lastEvent.side==='w'?'A villager was routed rather than killed. They lost supplies and need time to recover.':g.lastEvent?.type==='damage'&&g.lastEvent.side==='w'?`Hit for ${g.lastEvent.amount} damage. Enemy survives with ${g.lastEvent.remaining} HP; attacker stays in place.`:'';if(E.byId(g,selected)==null)selected=null;targeting=null;update();if(g.side==='b'&&!g.winner)startAi();return true;}
function startAi(){if(aiBusy)return;aiBusy=true;function step(){if(g.side!=='b'||g.winner){aiBusy=false;update();return;}const choice=E.aiChoice(g);if(!choice||choice.type==='end'){E.endTurn(g);aiBusy=false;update();return;}
 const out=E.action(g,choice);if(!out.ok){E.endTurn(g);aiBusy=false;errorText='Opponent passed after a blocked move.';update();return;}
 update();setTimeout(step,135);
 }setTimeout(step,210);}
function handleCell(r,c){if(g.winner||g.side!=='w'){errorText='Wait for the other army, or start a new match.';update();return;}
 if(!E.inside(g,r,c))return;const pos=E.idx(g,r,c),who=E.at(g,pos),unit=E.byId(g,selected);
 if(targeting){const t=targeting;
  if(t.kind==='summon')act({type:'summon',unitId:t.unitId,piece:t.piece,to:pos});
  else if(t.kind==='decoy')act({type:'queen',unitId:t.unitId,ability:'decoy',to:pos});
  else if(t.kind==='queen-target'&&who)act({type:'queen',unitId:t.unitId,ability:t.ability,targetId:who.id});
  else{errorText='Click a valid friendly piece as the ritual target, or cancel.';update();}
  return;
 }
 if(unit&&E.orders(g,unit).includes(pos)){act({type:'move',unitId:unit.id,to:pos});return;}
 if(who&&who.side==='w'){selected=who.id;errorText='';update();return;}
 if(!g.players.w.seen[pos])errorText='Unknown territory. Explore with your pieces to reveal this area.';
 else if(!g.players.w.sight[pos])errorText='Mist: selectable blue moves are speculative and may stop before a concealed unit.';
 else errorText='Select one of your pieces, then a highlighted legal destination.';
 update();
}
function makeButton(label,onClick,disabled=false,title=''){const b=document.createElement('button');b.type='button';b.className='btn small';b.textContent=label;b.disabled=disabled;b.title=title;b.addEventListener('click',onClick);return b;}
function buttons(parent,entries){const wrap=document.createElement('div');wrap.className='action-list';entries.forEach(a=>wrap.append(makeButton(a.text,a.click,a.disabled,a.title)));parent.append(wrap);}
function addText(parent,text,cls='desc'){let p=document.createElement('p');p.className=cls;p.textContent=text;parent.append(p);}
function subtitle(parent,text){const b=document.createElement('div');b.className='subsection';let strong=document.createElement('strong');strong.textContent=text;b.append(strong);parent.append(b);return b;}
function panel(){const root=$('selectedPanel');root.replaceChildren();const u=E.byId(g,selected);$('selectedCoord').textContent=u?E.posName(g,u.pos):'';
 if(!u){addText(root,'Choose a friendly piece on the battlefield. You can inspect its level, profession, bonds and abilities.','muted');return;}
 const head=document.createElement('div');head.className='unit-head';const avatar=document.createElement('div');avatar.className='portrait';avatar.textContent=E.GLYPHS[u.type];head.append(avatar);const data=document.createElement('div');const strong=document.createElement('strong');strong.textContent=`${E.P[u.type]} #${u.id} · Level ${u.level}`;data.append(strong);
 addText(data,`${u.job?(u.type==='V'?E.CIVILIAN_JOBS[u.job]:E.JOBS[u.job])+' · ':''}${u.type==='Q'?E.QPATH[u.queenPath]+' · ':''}${u.bond?u.bond+' bond · ':''}${E.posName(g,u.pos)}`,'muted');head.append(data);root.append(head);
 const track=document.createElement('div');track.className='xp-track';const filled=document.createElement('div');filled.style.width=(E.expProgress(u)*100)+'%';track.append(filled);root.append(track);
 let next=u.level<99?`${u.xp.toFixed(1)} / ${E.expNext(u).toFixed(1)} XP until level ${u.level+1}`:'MAX LEVEL 99';addText(root,next,'small muted');
 if(g.hpMode){const hp=E.hpOf(u),max=E.maxHp(u);addText(root,`HEALTH ${hp}/${max} HP · ${u.type==='V'?'Noncombat civilian':`Damage ${E.damageFor(u)}`} · ${hp<max?'Wounded':'Healthy'}`,'desc');const health=document.createElement('div');health.className='xp-track health-track';const fill=document.createElement('div');fill.style.width=`${Math.round(100*hp/max)}%`;health.append(fill);root.append(health);}
 addText(root,u.type==='K'?'King earns 1.5× XP. Risk your king to explore, but losing him loses the match.':u.type==='Q'?'Queen earns 0.75× XP and needs 1.5× thresholds. Strong early, slow to develop.':u.type==='V'?'Protected civilian: gathers automatically each friendly turn, cannot attack soldiers, and survives raids with an XP/supply/recovery penalty.':u.type==='N'?'Knight gains +1 sight automatically at level 2.':'Discover NEW territory to gain 0.30 XP per newly seen square for your army.','desc');
 if(u.side!=='w'){addText(root,'Enemy piece: inspect only.','warn');return;}
 if(targeting){let box=document.createElement('div');box.className='targeting';box.textContent=`Choose a map target for ${targeting.label}. Click Cancel to stop.`;root.append(box);buttons(root,[{text:'Cancel target',click:()=>{targeting=null;errorText='';update();}}]);}
 const canAct=E.canAct(g,u)&&g.side==='w';
 if(u.type==='V'){
  const work=subtitle(root,'Civilian production · automatic');
  const site=E.jobSite(g,u);
  addText(work,`Current assignment: ${E.CIVILIAN_JOBS[u.job]||'Idle'}${u.job==='food'?' ('+u.prey+')':''}. ${site===null?'No adjacent usable resource site. Move near forests, mountains, dinosaurs or gators.':'Resource site in range; income arrives at the start of your next command phase.'}`);
  if(u.injuredUntil>=g.round)addText(work,`Injured / routed. Cannot work or move until after round ${u.injuredUntil}. Raid damage is NONLETHAL.`,'warn');
  const ready=g.side==='w'&&!g.winner&&u.assignedSerial!==g.serial;
  buttons(work,[
   {text:'Chop wood',disabled:!ready,click:()=>act({type:'work',unitId:u.id,job:'wood'})},
   {text:'Mine gold',disabled:!ready,click:()=>act({type:'work',unitId:u.id,job:'gold'})},
   {text:'Hunt 🦖',disabled:!ready,click:()=>act({type:'work',unitId:u.id,job:'food',prey:'dinosaur'})},
   {text:'Hunt 🐊',disabled:!ready,click:()=>act({type:'work',unitId:u.id,job:'food',prey:'gator'})},
   {text:'Stop work',disabled:!ready,click:()=>act({type:'work',unitId:u.id,job:'idle'})}
  ]);
  addText(work,'Work orders are free, limited to one change per civilian per turn, and production is passive. Moving a villager manually costs a command action. Hunting has injury risk; raid and wildlife injuries heal over time.');
  return;
 }
 const slots=subtitle(root,`Equipped skills · ${u.equippedSkills?.length||0}/${E.skillCapacity(u)} slots`);
 addText(slots,(u.equippedSkills?.length?u.equippedSkills.map(x=>x.replaceAll('_',' ')).join(' · '):'No equipped skills yet.')+' — skill capacity grows by level; learned skills may exceed available slots. Pawn profession traits do not consume these slots.');
 const missing=(u.learnedSkills||[]).filter(x=>!E.equipped(u,x));
 if(missing.length){
  addText(slots,'Change equipped skills near the king or at a shrine (cost: 1 command action; this piece cannot act again this turn).');
  const options=[];
  for(const skill of missing){
   if((u.equippedSkills||[]).length<E.skillCapacity(u))options.push({text:`Equip ${skill}`,disabled:!canAct,click:()=>act({type:'equip',unitId:u.id,skill})});
   else for(const replace of (u.equippedSkills||[]))options.push({text:`${replace} → ${skill}`,disabled:!canAct,click:()=>act({type:'equip',unitId:u.id,skill,replace})});
  }
  buttons(slots,options);
 }
 if(g.hpMode&&E.hpOf(u)<E.maxHp(u)){
  const rest=subtitle(root,'Recover from wounds');addText(rest,'Rest: recover 2 HP (4 while standing on a shrine). Costs an action and prevents this piece from moving again this turn.');
  buttons(rest,[{text:'Rest (1 action)',disabled:!canAct,click:()=>act({type:'rest',unitId:u.id})}]);
 }
 if(u.type==='P'){
  const area=subtitle(root,'Profession · choose one path');if(!u.job){addText(area,u.level>=2?'Choose a profession. Training consumes one action.':'Unlock at pawn level 2. Early discoveries help you train.');buttons(area,Object.keys(E.JOBS).map(job=>({text:E.JOBS[job],disabled:!canAct||u.level<2,click:()=>act({type:'train',unitId:u.id,job})})));}
  else{addText(area,{swimmer:'Cross rivers; future ferry upgrades.',climber:'Cross mountain terrain; future mountain watch sites.',scout:'Gain +2 vision; at level 4 place temporary watch posts.',ninja:'30% chance for ONE extra move after acting; never chains.'}[u.job]);if(u.job==='scout'){buttons(area,[{text:'Build watch post (6)',disabled:!canAct||u.level<4||!E.equipped(u,'watch')||g.players.w.gold<6,click:()=>act({type:'watch',unitId:u.id})}]);}}
 }
 if(u.type==='K'){
  const area=subtitle(root,'Summoner · king-only command');const summonTypes=['P','N','B','R','Q'];addText(area,'Choose a piece, then a free square within 1–2 tiles of the king. Costs gold + food + wood, and 2 actions (queen: 3). New units cannot be immediately sacrificed.');
  buttons(area,summonTypes.map(t=>{let lvl={P:1,N:5,B:5,R:11,Q:55}[t];return {text:`${E.P[t]} · ${E.COST[t]}g ${E.COST_FOOD[t]}f ${E.COST_WOOD[t]}w`,title:`Requires king level ${lvl}`,disabled:!canAct||!E.equipped(u,'summon')||g.ap<(t==='Q'?3:2)||g.players.w.gold<E.COST[t]||g.players.w.food<E.COST_FOOD[t]||g.players.w.wood<E.COST_WOOD[t]||u.level<lvl||!!(t==='Q'&&E.queen(g,'w')),click:()=>{targeting={kind:'summon',unitId:u.id,piece:t,label:`summoning ${E.P[t]}`};update();}};}));
 }
 if(u.type==='Q'){
  const area=subtitle(root,`${E.QPATH[u.queenPath]} · tactical decisions`);
  if(u.queenPath==='war'){
   addText(area,u.stance==='global'?'Global stance: all friendly pieces gain +1 vision. Switch to local for +2 sight and a one-time protective ward within 4 squares, with 2 command upkeep each friendly turn.':'Local stance: strong protection and +2 sight within 4; drains 2 command each friendly turn. Switch to global for +1 sight across the entire army.');
   buttons(area,[{text:`Switch to ${u.stance==='global'?'local':'global'} stance`,disabled:!canAct||!E.equipped(u,'stance'),click:()=>act({type:'queen',unitId:u.id,ability:'stance'})}]);
  }else if(u.queenPath==='phantom'){
   addText(area,'Cloak hides the queen unless nearby detectors expose her. A decoy creates a false queen on an empty square for a few rounds. Both cost actions and command.');
   buttons(area,[{text:'Cloak (7)',disabled:!canAct||!E.equipped(u,'cloak')||g.players.w.gold<7,click:()=>act({type:'queen',unitId:u.id,ability:'cloak'})},{text:'Plant decoy (5)',disabled:!canAct||!E.equipped(u,'decoy')||g.players.w.gold<5,click:()=>{targeting={kind:'decoy',unitId:u.id,label:'Phantom decoy (≤6 tiles)'};update();}}]);
  }else{
   addText(area,'Sacrifice for essence, siphon XP without killing, or pay command to protect a follower. Each path makes a different permanent or temporary cost. A surge spends 8 essence for 2 actions (net +1), once per round.');
   buttons(area,[{text:'Sacrifice ally',disabled:!canAct||!E.equipped(u,'sacrifice'),click:()=>{targeting={kind:'queen-target',ability:'sacrifice',unitId:u.id,label:'sacrificial bargain'};update();}},{text:'Siphon XP',disabled:!canAct||!E.equipped(u,'siphon'),click:()=>{targeting={kind:'queen-target',ability:'siphon',unitId:u.id,label:'nonlethal XP siphon'};update();}},{text:'Mercy / ward (5)',disabled:!canAct||!E.equipped(u,'mercy')||g.players.w.gold<5,click:()=>{targeting={kind:'queen-target',ability:'mercy',unitId:u.id,label:'mercy and protection'};update();}},{text:'Blood surge (8 essence)',disabled:!canAct||!E.equipped(u,'surge')||g.players.w.essence<8,click:()=>act({type:'queen',unitId:u.id,ability:'surge'})}]);
  }
 }
 if(['P','B','N'].includes(u.type)&&u.level>=2&&!u.bond){const q=E.queen(g,'w');const near=q&&E.distance(g,u.pos,q.pos)<=4;
  const section=subtitle(root,'Relationship · optional bond');addText(section,{P:'Devoted pawn: slower XP growth, eventually 100% sacrificial conversion.',B:'Secret lover: queen gains shared insight; if bishop dies, grief penalizes the queen.',N:'Sworn protector: once, intercept a strike on the queen at the cost of the knight’s life.'}[u.type]);
  buttons(section,[{text:{P:'Pledge devotion',B:'Secret bond',N:'Swear protection'}[u.type]+' (5)',disabled:!canAct||!near||g.players.w.gold<5,click:()=>act({type:'bond',unitId:u.id})}]);
 }
 if(u.bond){const section=subtitle(root,'Life history and relationships');addText(section,`Bond: ${u.bond}. Trust: ${u.bondTrust}. ${u.summonedAt?'Summoned during this match.':'Original army member.'} ${u.history.length} recent movements recorded.`);}
}
function update(){if(g.winner){$('phase').textContent=g.winner==='w'?'Victory — the opposing king was captured!':'Defeat — your king was captured!';}else $('phase').textContent=g.side==='w'?'Your command phase':'Enemy command phase';
 $('stats').textContent=`Round ${g.round} · ${g.ap} action${g.ap===1?'':'s'} left · ${g.n}×${g.n} · ${E.combatUnits(g,'w').length} vs ${E.combatUnits(g,'b').length} troops + ${E.civilians(g,'w').length} villagers`; 
 $('endTurn').disabled=g.side!=='w'||!!g.winner;$('economy').innerHTML=`<div class="economy-box"><div><b>${g.players.w.gold}</b><small>🪙 Gold</small></div><div><b>${g.players.w.food}</b><small>🍖 Food</small></div><div><b>${g.players.w.wood}</b><small>🪵 Wood</small></div><div><b>${g.players.w.essence.toFixed(1)}</b><small>Ritual essence</small></div><div><b>${E.combatUnits(g,'w').length}</b><small>Combat pieces</small></div><div><b>${E.civilians(g,'w').length}</b><small>Villagers (protected)</small></div></div><p class="small muted">+3 gold per turn, plus shrines and any nearby village mining. Villagers automatically harvest adjacent sites at the start of your turn. Royal summons cost gold, food and wood. Civilian raids are nonlethal.</p>`;
 $('log').replaceChildren();if(errorText){let el=document.createElement('div');el.textContent='⚠ '+errorText;el.className='warn';$('log').append(el);}g.log.slice(0,27).forEach(message=>{let el=document.createElement('div');const privateMove=/^\[\d+ B\]/.test(message);el.textContent=privateMove?'Enemy action under fog — details concealed.':message;$('log').append(el);});
 $('map-note').textContent=targeting?`TARGET MODE: ${targeting.label}. Click the appropriate tile or Cancel.`:`Gold = visible, blue = mist (hidden blockers stop movement) · ${g.hpMode?'HP combat':'one-hit captures'} · drag/pan · scroll/zoom`;$('zoomText').textContent=Math.round(camera.zoom*100)+'%';panel();draw();}
function newMatch(){const size=+$('size').value,seed=+$('seed').value||Math.floor(Date.now()%100000000);let bw=$('routeW').value,bb={war:'phantom',phantom:'choice',choice:'war'}[bw];
 g=E.create({size,seed,hpMode:$('hpMode').value==='on',armyW:$('armyW').value,armyB:$('armyB').value,routeW:bw,routeB:bb});selected=null;targeting=null;errorText='';camera={x:g.n/2,y:g.n/2+7,zoom:g.n===70?.87:g.n===30?1.08:1};aiBusy=false;update();}
board.addEventListener('pointerdown',ev=>{ev.preventDefault();board.setPointerCapture(ev.pointerId);pointer={sx:ev.clientX,sy:ev.clientY,x:ev.clientX,y:ev.clientY,drag:false};});
board.addEventListener('pointermove',ev=>{if(!pointer)return;const diff=Math.max(Math.abs(ev.clientX-pointer.sx),Math.abs(ev.clientY-pointer.sy));if(diff>6)pointer.drag=true;if(pointer.drag){camera.x-=(ev.clientX-pointer.x)/cellSize();camera.y-=(ev.clientY-pointer.y)/cellSize();camera.x=Math.max(-5,Math.min(g.n+5,camera.x));camera.y=Math.max(-5,Math.min(g.n+5,camera.y));draw();}pointer.x=ev.clientX;pointer.y=ev.clientY;});
board.addEventListener('pointerup',ev=>{if(!pointer)return;const wasDrag=pointer.drag;pointer=null;if(!wasDrag){const p=worldAt(ev.clientX,ev.clientY);handleCell(p.r,p.c);}});
board.addEventListener('pointercancel',()=>pointer=null);board.addEventListener('contextmenu',ev=>ev.preventDefault());
board.addEventListener('wheel',ev=>{ev.preventDefault();let scale=ev.deltaY>0?.88:1.14;const rect=board.getBoundingClientRect(),x=(ev.clientX-rect.left-rect.width/2)/cellSize(),y=(ev.clientY-rect.top-rect.height/2)/cellSize();const nx=Math.max(.45,Math.min(2.4,camera.zoom*scale));if(nx===camera.zoom)return;const nextSize=25*nx;camera.x+=x-(ev.clientX-rect.left-rect.width/2)/nextSize;camera.y+=y-(ev.clientY-rect.top-rect.height/2)/nextSize;camera.zoom=nx;draw();$('zoomText').textContent=Math.round(camera.zoom*100)+'%';},{passive:false});
minimap.addEventListener('click',ev=>{const rect=minimap.getBoundingClientRect();camera.x=(ev.clientX-rect.left)/rect.width*g.n;camera.y=(ev.clientY-rect.top)/rect.height*g.n;draw();});
$('zoomIn').onclick=()=>{camera.zoom=Math.min(2.4,camera.zoom*1.20);update();};$('zoomOut').onclick=()=>{camera.zoom=Math.max(.45,camera.zoom/1.20);update();};$('center').onclick=()=>centerForUnit(E.king(g,'w'));
$('new').onclick=()=>{if(g.log.length<2||confirm('Start a new match? Current unsaved progress will be lost.'))newMatch();};$('endTurn').onclick=()=>{if(g.side==='w'&&!g.winner){act({type:'end'});}};
$('save').onclick=()=>{const json=E.dump(g);try{localStorage.setItem('chesslife_v04_match',json);}catch(_){};
 const blob=new Blob([json],{type:'application/json'}),url=URL.createObjectURL(blob),link=document.createElement('a');
 link.href=url;link.download=`ChessLife_${g.n}x${g.n}_seed${g.seed}_round${g.round}.json`;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1200);
 errorText='Match exported to a JSON save file.';update();};
$('load').onclick=()=>$('savefile').click();
$('savefile').addEventListener('change',async ev=>{const file=ev.target.files?.[0];if(!file)return;try{
 g=E.load(await file.text());selected=null;targeting=null;errorText='Save file loaded successfully.';camera.x=g.n/2;camera.y=g.n/2+7;update();if(g.side==='b'&&!g.winner)startAi();
 }catch(e){errorText='Cannot load match: '+e.message;update();}finally{ev.target.value='';}});
window.addEventListener('keydown',ev=>{if(['INPUT','SELECT','TEXTAREA'].includes(document.activeElement?.tagName))return;const k=ev.key.toLowerCase();let handled=true;if(k==='arrowup'||k==='w')camera.y-=2;else if(k==='arrowdown'||k==='s')camera.y+=2;else if(k==='arrowleft'||k==='a')camera.x-=2;else if(k==='arrowright'||k==='d')camera.x+=2;else if(k==='+'||k==='=')camera.zoom=Math.min(2.4,camera.zoom*1.15);else if(k==='-'||k==='_')camera.zoom=Math.max(.45,camera.zoom/1.15);else if(k==='escape'){targeting=null;errorText='';}else handled=false;if(handled){ev.preventDefault();update();}});
window.addEventListener('resize',()=>{if(!redrawRequest)redrawRequest=requestAnimationFrame(draw);});
update();
})();

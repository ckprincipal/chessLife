/* Stale-Mate browser app, canvas viewport + minimap. No external dependencies. */
(()=>{
'use strict';const E=window.ChessLifeEngine;const $=id=>document.getElementById(id);
let g=E.create(),selected=null,targeting=null,errorText='',camera={x:25,y:32,zoom:1},fogEnabled=true,aiBusy=false,pointer=null,redrawRequest=0;
const board=$('board'),ctx=board.getContext('2d'),minimap=$('minimap'),mctx=minimap.getContext('2d');
const color={plain1:'#75907b',plain2:'#698675',forest:'#365d4d',water:'#39677f',mountain:'#676e79',shrine:'#c9a65e',black:'#070c14',mist:'#8795a1',bridge:'#c4b48a',camp:'#a78c58',tunnel:'#6e6661',tower:'#98a58a'};
const short={w:'White',b:'Black'};
function resizeCanvas(canvas){const box=canvas.getBoundingClientRect(),ratio=Math.min(devicePixelRatio||1,2),w=Math.max(1,Math.round(box.width*ratio)),h=Math.max(1,Math.round(box.height*ratio));if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}return {w:box.width,h:box.height,dpr:ratio};}
function cellSize(){return 25*camera.zoom;}
function worldAt(x,y){const rect=board.getBoundingClientRect(),sz=cellSize();return {c:Math.floor(camera.x+(x-rect.left-rect.width/2)/sz),r:Math.floor(camera.y+(y-rect.top-rect.height/2)/sz)};}
function centerForUnit(u){if(!u)return;camera.x=E.col(g,u.pos)+.5;camera.y=E.row(g,u.pos)+.5;draw();}
function colorTerrain(tile,r,c){if(tile===E.T.FOREST)return color.forest;if(tile===E.T.WATER)return color.water;if(tile===E.T.MOUNTAIN)return color.mountain;if(tile===E.T.SHRINE)return color.shrine;if(tile===E.T.BRIDGE)return color.bridge;if(tile===E.T.CAMP)return color.camp;if(tile===E.T.TUNNEL)return color.tunnel;if(tile===E.T.TOWER)return color.tower;return (r+c)%2?color.plain1:color.plain2;}
function draw(){if(redrawRequest){cancelAnimationFrame(redrawRequest);redrawRequest=0;}
 const {w,h,dpr}=resizeCanvas(board);ctx.setTransform(dpr,0,0,dpr,0,0);ctx.fillStyle='#07101b';ctx.fillRect(0,0,w,h);
 const cell=cellSize(),c0=Math.max(0,Math.floor(camera.x-w/(2*cell)-1)),c1=Math.min(g.n-1,Math.ceil(camera.x+w/(2*cell)+1)),r0=Math.max(0,Math.floor(camera.y-h/(2*cell)-1)),r1=Math.min(g.n-1,Math.ceil(camera.y+h/(2*cell)+1)),p=g.players.w;
 const possible=selected&&E.byId(g,selected)&&g.side==='w'?new Set(E.orders(g,E.byId(g,selected))):new Set();
 const dests=targeting?.kind==='pawnSkill'&&g.side==='w'?new Set(E.skillTargets(g,E.byId(g,targeting.unitId),targeting.skill)):targeting?.kind==='summon'&&g.side==='w'?new Set(E.eligibleSummons(g,E.byId(g,targeting.unitId),targeting.piece)):targeting?.kind==='builder'&&g.side==='w'?new Set(E.eligibleBuilderTargets(g,E.byId(g,targeting.unitId),targeting.project)):targeting?.kind==='fission'&&g.side==='w'?new Set(E.eligibleFissionSquares(g,E.byId(g,targeting.unitId))):new Set();
 const ghosts=new Map(E.liveGhosts(g,'w').map(x=>[x.pos,x]));const decoys=new Map(g.decoys.filter(d=>d.side==='b'&&d.until>=g.serial).map(d=>[d.pos,d]));
 for(let r=r0;r<=r1;r++)for(let c=c0;c<=c1;c++){
  const j=E.idx(g,r,c),x=(c-camera.x)*cell+w/2,y=(r-camera.y)*cell+h/2,visible=p.sight[j]===1,seen=p.seen[j]===1;
  ctx.fillStyle=seen?colorTerrain(E.rememberedTerrain(g,'w',j),r,c):color.black;ctx.fillRect(x,y,cell+.35,cell+.35);
  if(seen&&!visible){ctx.fillStyle='rgba(181,190,205,0.73)';ctx.fillRect(x,y,cell+.35,cell+.35);ctx.fillStyle='rgba(70,86,112,0.3)';if(cell>=17){ctx.fillRect(x+3,y+5,2,2);ctx.fillRect(x+cell-6,y+cell-7,2,2);}}
  if(visible){if(g.terrain[j]===E.T.SHRINE){ctx.strokeStyle='#fff5be';ctx.lineWidth=Math.max(.8,cell*.045);ctx.strokeRect(x+cell*.25,y+cell*.25,cell*.5,cell*.5);}
   else if(g.terrain[j]===E.T.FOREST&&cell>=14){ctx.fillStyle='#183c2d';ctx.beginPath();ctx.arc(x+cell*.48,y+cell*.42,cell*.21,0,Math.PI*2);ctx.fill();}
   else if(g.terrain[j]===E.T.WATER&&cell>=14){ctx.strokeStyle='#98b9c9';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x+cell*.16,y+cell*.55);ctx.quadraticCurveTo(x+cell*.35,y+cell*.38,x+cell*.55,y+cell*.55);ctx.quadraticCurveTo(x+cell*.73,y+cell*.71,x+cell*.85,y+cell*.5);ctx.stroke();}
   else if(g.terrain[j]===E.T.CAMP&&cell>=13){ctx.font=`${cell*.66}px serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('🏕️',x+cell*.52,y+cell*.52);}
   else if(g.terrain[j]===E.T.TOWER&&cell>=13){ctx.strokeStyle='#263a32';ctx.lineWidth=Math.max(1,cell*.05);ctx.strokeRect(x+cell*.32,y+cell*.36,cell*.36,cell*.43);ctx.beginPath();ctx.moveTo(x+cell*.23,y+cell*.36);ctx.lineTo(x+cell*.5,y+cell*.16);ctx.lineTo(x+cell*.77,y+cell*.36);ctx.stroke();}
   else if(g.terrain[j]===E.T.BRIDGE&&cell>=13){ctx.font=`${cell*.60}px serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('🪵',x+cell*.52,y+cell*.54);}
   else if(g.terrain[j]===E.T.TUNNEL&&cell>=13){ctx.font=`${cell*.60}px serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('🕳️',x+cell*.52,y+cell*.54);}
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
  const u=E.at(g,j),soldier=u,showUnit=u&&(u.side==='w'||(visible&&E.canObserveUnit(g,'w',u))); // All live pieces now use the military layer.
  if(showUnit&&cell>=11){const symbol=E.GLYPHS[u.side==='w'?u.type:u.type.toLowerCase()];ctx.font=`${Math.min(56,cell*.78)}px 'DejaVu Sans','Segoe UI Symbol',Georgia,serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineWidth=Math.max(1,cell*.09);ctx.strokeStyle=u.side==='w'?'#1b292b':'#e8dfcc';ctx.fillStyle=u.side==='w'?'#fff8e7':'#17212b';ctx.strokeText(symbol,x+cell/2,y+cell*.54);ctx.fillText(symbol,x+cell/2,y+cell*.54);
   if(g.combatMode==='pips'&&cell>=19&&u.type!=='V'){ctx.textAlign='left';ctx.fillStyle='#b0e9ff';ctx.font=`bold ${Math.max(9,cell*.22)}px system-ui`;ctx.fillText('◆'.repeat(u.hitsRemaining||1),x+cell*.10,y+cell*.18);}
   if(g.hpMode&&cell>=17){const health=Math.max(0,Math.min(1,E.hpOf(u)/E.maxHp(u)));ctx.fillStyle='#17252b';ctx.fillRect(x+cell*.09,y+cell*.055,cell*.82,Math.max(2,cell*.08));ctx.fillStyle=health>.55?'#78d7ad':health>.26?'#edb960':'#ed7275';ctx.fillRect(x+cell*.09,y+cell*.055,cell*.82*health,Math.max(2,cell*.08));}
   if(cell>=23){ctx.font=`bold ${Math.max(7,cell*.21)}px system-ui`;ctx.fillStyle=u.side==='w'?'#fff2ae':'#eec9c6';ctx.textAlign='right';ctx.fillText(''+u.level,x+cell*.94,y+cell*.9);if(u.job){ctx.fillStyle='#e6f4ed';ctx.beginPath();ctx.arc(x+cell*.18,y+cell*.18,cell*.09,0,Math.PI*2);ctx.fill();}}
   if(u.id===selected){ctx.strokeStyle='#ffdc6a';ctx.lineWidth=Math.max(2,cell*.09);ctx.strokeRect(x+1.4,y+1.4,cell-3,cell-3);}
   if(u.type==='Q'&&u.queenPath==='phantom'&&u.cloakUntil>=g.serial){ctx.strokeStyle='#cf9df5';ctx.lineWidth=2;ctx.strokeRect(x+4,y+4,cell-8,cell-8);}
  }else if(seen&&!visible&&ghosts.has(j)&&cell>=15){const gh=ghosts.get(j);ctx.font=`${cell*.60}px Georgia,serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='rgba(33,45,61,.38)';ctx.fillText(E.GLYPHS[gh.type.toLowerCase()],x+cell*.5,y+cell*.55);if(cell>=23){ctx.fillStyle='#343d52';ctx.font='bold 10px system-ui';ctx.fillText('?',x+cell*.78,y+cell*.25);}}
  if(visible&&decoys.has(j)&&!soldier&&cell>=13){ctx.font=`${cell*.69}px Georgia,serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#986bc2';ctx.fillText('♛',x+cell*.5,y+cell*.55);}
 }
 // Coordinate ruler in zoomed overview, never obscure piece names.
 if(cell>=18){ctx.font='10px system-ui';ctx.textAlign='left';ctx.fillStyle='rgba(240,247,248,.76)';for(let c=c0;c<=c1;c++)if(c%5===0){let x=(c-camera.x)*cell+w/2;ctx.fillText(''+(c+1),x+3,14);}for(let r=r0;r<=r1;r++)if(r%5===0){let y=(r-camera.y)*cell+h/2;ctx.fillText(''+(g.n-r),3,y+11);}}
 drawMinimap();
}
function drawMinimap(){const {w,h,dpr}=resizeCanvas(minimap);mctx.setTransform(dpr,0,0,dpr,0,0);const sz=Math.min(w,h),step=sz/g.n,p=g.players.w;mctx.fillStyle='#080d13';mctx.fillRect(0,0,w,h);
 for(let i=0;i<g.n*g.n;i++){let r=E.row(g,i),c=E.col(g,i);mctx.fillStyle=!p.seen[i]?'#080c13':!p.sight[i]?'#86929e':g.terrain[i]===E.T.SHRINE?'#c9a35d':g.terrain[i]===E.T.WATER?'#447895':g.terrain[i]===E.T.MOUNTAIN?'#6c6b7b':g.terrain[i]===E.T.FOREST?'#315b4a':'#63877a';mctx.fillRect(c*step,r*step,step+.3,step+.3);}
 for(const u of g.units){if(!u.alive||u.side==='b'&&!E.canObserveUnit(g,'w',u))continue;mctx.fillStyle=u.side==='w'?'#faf5d4':'#e65e69';const r=E.row(g,u.pos),c=E.col(g,u.pos);mctx.fillRect(c*step-.5,r*step-.5,Math.max(2,step*1.7),Math.max(2,step*1.7));}
 const rect=board.getBoundingClientRect(),viewW=rect.width/cellSize(),viewH=rect.height/cellSize();mctx.strokeStyle='#f1d177';mctx.lineWidth=1.6;mctx.strokeRect((camera.x-viewW/2)*step,(camera.y-viewH/2)*step,viewW*step,viewH*step);
}
function act(a){const result=E.action(g,a);if(!result.ok){errorText=result.error;update();return false;}errorText=g.lastEvent?.type==='shield-hit'&&g.lastEvent.side==='w'?`Target survived; ${g.lastEvent.remaining} protection pip(s) remain. Attack spent.`:g.lastEvent?.type==='forest-stop'&&g.lastEvent.side==='w'?'Entering forest ended the sliding move; this piece has used its activation.':g.lastEvent?.type==='interrupted'&&g.lastEvent.side==='w'?'Movement interrupted by an unseen blocker. Action spent; this piece cannot move again unless it has a bonus move.':g.lastEvent?.type==='damage'&&g.lastEvent.side==='w'?`Hit for ${g.lastEvent.amount} damage. Enemy survives with ${g.lastEvent.remaining} HP; attacker stays in place.`:'';if(E.byId(g,selected)==null)selected=null;targeting=null;update();if(g.side==='b'&&!g.winner)startAi();return true;}
function startAi(){if(aiBusy)return;aiBusy=true;function step(){if(g.side!=='b'||g.winner){aiBusy=false;update();return;}const choice=E.aiChoice(g);if(!choice||choice.type==='end'){E.endTurn(g);aiBusy=false;update();return;}
 const out=E.action(g,choice);if(!out.ok){E.endTurn(g);aiBusy=false;errorText='Opponent passed after a blocked move.';update();return;}
 update();setTimeout(step,135);
 }setTimeout(step,210);}
function handleCell(r,c){if(g.winner||g.side!=='w'){errorText='Wait for the other army, or start a new match.';update();return;}
 if(!E.inside(g,r,c))return;const pos=E.idx(g,r,c),who=E.at(g,pos),unit=E.byId(g,selected);
 if(targeting){const t=targeting;
  if(t.kind==='summon')act({type:'summon',unitId:t.unitId,piece:t.piece,to:pos});
  else if(t.kind==='builder')act({type:'build',unitId:t.unitId,project:t.project,to:pos});
  else if(t.kind==='pawnSkill')act({type:'useSkill',unitId:t.unitId,skill:t.skill,to:pos});
  else if(t.kind==='fission')act({type:'fission',unitId:t.unitId,to:pos});
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
 if(!u){addText(root,'Your starting organization determines whether you have 2, 6, or 9 pawn-workers (or 3 in a historical setup). Click ♙ Pawns to cycle through them. No free camp in Standard starts; a level-4 Pawn must build the first camp. The King may order training only after a camp exists. Quick Start optionally restores ready camps. No independent engineer.','muted');return;}
 const head=document.createElement('div');head.className='unit-head';const avatar=document.createElement('div');avatar.className='portrait';avatar.textContent=E.GLYPHS[u.type];head.append(avatar);const data=document.createElement('div');const strong=document.createElement('strong');strong.textContent=`${E.P[u.type]} #${u.id} · Level ${u.level}`;data.append(strong);
 addText(data,`${u.job?(E.JOBS[u.job]||u.job)+' · ':''}${u.type==='Q'?E.QPATH[u.queenPath]+' · ':''}${u.bond?u.bond+' bond · ':''}${E.posName(g,u.pos)}`,'muted');head.append(data);root.append(head);
 const track=document.createElement('div');track.className='xp-track';const filled=document.createElement('div');filled.style.width=(E.expProgress(u)*100)+'%';track.append(filled);root.append(track);
 let next=u.level<99?`${u.xp.toFixed(1)} / ${E.expNext(u).toFixed(1)} XP until level ${u.level+1}`:'MAX LEVEL 99';addText(root,next,'small muted');
 if(g.combatMode==='pips')addText(root,`PROTECTION ${'◆'.repeat(u.hitsRemaining||1)}${'◇'.repeat(Math.max(0,(u.hitsMax||1)-(u.hitsRemaining||1)))} · ${u.hitsRemaining||1}/${u.hitsMax||1} capture hit(s) left. This is an optional experiment, not default rules.`, 'desc');
 if(g.hpMode){const hp=E.hpOf(u),max=E.maxHp(u);addText(root,`HEALTH ${hp}/${max} HP · Damage ${E.damageFor(u)} · ${hp<max?'Wounded':'Healthy'}`,'desc');const health=document.createElement('div');health.className='xp-track health-track';const fill=document.createElement('div');fill.style.width=`${Math.round(100*hp/max)}%`;health.append(fill);root.append(health);}
 addText(root,u.type==='K'?'No idle/time XP. The King gets 1.5× XP from his own achievements, plus 20% of allied military base XP multiplied by 1.5 (= 0.30 royal XP per 1 base XP). His starting 3 XP is an opening grant. Training spends unspent XP, not levels already earned.':u.type==='Q'?'Queen earns 0.75× XP and needs 1.5× thresholds. Strong early, slow to develop.':u.type==='N'?'Knight sees L-shaped landing squares; gains longer sight at level 2 and forest-piercing sight at level 15.':'Discover NEW territory to gain 0.30 XP per newly seen square for your army.','desc');
 if(u.side!=='w'){addText(root,'Enemy piece: inspect only.','warn');return;}
 if(targeting){let box=document.createElement('div');box.className='targeting';box.textContent=`Choose a map target for ${targeting.label}. Click Cancel to stop.`;root.append(box);buttons(root,[{text:'Cancel target',click:()=>{targeting=null;errorText='';update();}}]);}
 const canAct=E.canAct(g,u)&&g.side==='w'&&(E.effectiveCost(g,u)<=g.ap);
 addText(root,`Activation: ${E.activationCost(g,u)} CP · ${g.ap} CP remaining · one activation per unit/turn initially; Ninja extra moves are exceptions. ${u.cpDiscount?`Efficiency reductions: ${u.cpDiscount}.`:''}`,'small muted');
 if(u.pendingChoices?.length){const ch=subtitle(root,`Level ${u.pendingChoices[0]} choice · choose ONE benefit`);addText(ch,'Command Efficiency permanently lowers activation cost by 1 CP (never below 1). Character Growth instead extends sight in natural directions. Taking either forfeits the other reward for this milestone.');const choices=[{text:'Command efficiency (−1 CP)',click:()=>act({type:'milestone',unitId:u.id,choice:'efficient'})},{text:'Character growth (+1 sight)',click:()=>act({type:'milestone',unitId:u.id,choice:'growth'})}];
 if(g.combatMode==='pips'&&u.pendingChoices[0]>=25&&['K','Q','R','B','N'].includes(u.type)&&(u.hitsMax||1)<3)choices.push({text:'Defensive growth (+1 protection hit)',click:()=>act({type:'milestone',unitId:u.id,choice:'fortify'})});
 buttons(ch,choices);}
 const capacity=E.skillCapacity(u);
 const slots=subtitle(root,`Equipped skills · ${u.equippedSkills?.length||0}/${capacity} slots`);
 addText(slots,u.type==='P'?'One slot at every third level: 3, 6, 9, …, 99 (33 slots). Learning a milestone skill is free; USING an active skill costs normal CP and this piece’s activation.':'Starting slots P/N/B/R/Q/K = 0/1/1/2/3/2. These are capacity, not automatically granted powers. The existing non-pawn level-50 extra slot remains.');
 for(const id of u.equippedSkills||[]){const def=E.PAWN_SKILLS[id];addText(slots,`${E.skillName(id)}${def?' — '+def.description:''}`,'skill-effect');}
 if(!u.equippedSkills?.length)addText(slots,'No equipped skills yet.');
 if(u.type==='P'){
  const pending=E.pendingSkillLevels(u),offers=E.skillOffers(u);
  if(pending.length){const area=subtitle(root,`Level ${pending[0]} · choose ONE of THREE skills`);area.classList.add('skill-draft');
   addText(area,`${pending.length} choice${pending.length===1?'':'s'} waiting. Selection is permanent for this match; equipment can be changed near the King or a shrine. Choosing does not reset your activation or cooldowns.`);
   for(const id of offers){const def=E.PAWN_SKILLS[id],card=document.createElement('div');card.className='skill-card';
    const name=document.createElement('strong');name.textContent=def.name;card.append(name);addText(card,def.description);
    if(g.routeDisclosure==='hints')addText(card,`Tendency: ${E.PAWN_ROUTES[def.family]} (prototype route).`,'small muted');
    if(g.routeDisclosure==='full')addText(card,`Route score: +1 ${E.PAWN_ROUTES[def.family]}. No additional hidden bonus.`,'small muted');
    const btn=makeButton(`Learn ${def.name}`,()=>act({type:'chooseSkill',unitId:u.id,skill:id}),g.side!=='w'||!!g.winner);btn.dataset.skillChoice=id;card.append(btn);area.append(card);
   }
   if(u.equippedSkills.length>=capacity)addText(area,'All slots are occupied by earlier learned skills. The choice will still be learned; then equip it using the loadout controls.','warn');
  }else if(u.level<99)addText(slots,`Next skill slot and three-choice draft: level ${3*(Math.floor(u.level/3)+1)}.`,'small muted');
  if(g.routeDisclosure!=='effects'){const route=E.pawnRoute(u);addText(slots,`Developing route: ${route.name}. Determined by permanent skill choices, not the current loadout.`,'small muted');if(g.routeDisclosure==='full')addText(slots,`Pathfinder ${route.scores.scout} · Pioneer ${route.scores.pioneer} · Companion ${route.scores.guardian}. First identity after 3 picks; tied leads remain Mixed. Labels add no powers.`,'small muted');}
 }
 const missing=(u.learnedSkills||[]).filter(x=>!E.equipped(u,x));
 if(missing.length){
  addText(slots,`Change equipped skills near the King or at a shrine: ${E.activationCost(g,u)} CP and this piece’s activation. Learned skills are never erased by a smaller capacity.`);
  const options=[];
  for(const skill of missing){
   if((u.equippedSkills||[]).length<capacity)options.push({text:`Equip ${E.skillName(skill)}`,disabled:!canAct,click:()=>act({type:'equip',unitId:u.id,skill})});
   else for(const replace of (u.equippedSkills||[]))options.push({text:`${E.skillName(replace)} → ${E.skillName(skill)}`,disabled:!canAct||!E.canRemoveSkill(g,u,replace),click:()=>act({type:'equip',unitId:u.id,skill,replace})});
  }
  buttons(slots,options);
 }
 if(u.type==='P'){
  const active=(u.equippedSkills||[]).filter(id=>E.PAWN_SKILLS[id]?.active);
  if(active.length){const section=subtitle(root,'Active skills · normal CP / one activation');
   for(const id of active){const def=E.PAWN_SKILLS[id],cd=E.skillCooldown(u,id),remaining=Math.max(0,Math.ceil(((u.skillCooldowns?.[cd.key]||0)-g.serial)/2));
    buttons(section,[{text:`Use ${def.name}${remaining?' · '+remaining+' turn cooldown':''}`,disabled:!canAct||!E.skillReady(g,u,id)||!E.skillTargets(g,u,id).length,click:()=>{
     if(['signal','self_guard'].includes(def.active))act({type:'useSkill',unitId:u.id,skill:id});
     else{targeting={kind:'pawnSkill',unitId:u.id,skill:id,label:`${def.name} (choose a highlighted target)`};update();}
    }}]);
   }
  }
 }
 if(g.fissionEnabled&&['P','N'].includes(u.type)){const area=subtitle(root,'Fission · experimental irreversible tradeoff');
  addText(area,`At level ${E.EXPERIMENTAL_FISSION_LEVEL}, a pawn or knight can learn and equip Fission. The veteran becomes TWO level-1 pieces. Both lose veteran skills, professions, bonds and protection. One use per lineage; full army cap respected.`);
  buttons(area,[{text:'Fission into two level-1 pieces',disabled:!canAct||u.level<E.EXPERIMENTAL_FISSION_LEVEL||!E.equipped(u,'fission')||!E.eligibleFissionSquares(g,u).length,click:()=>{targeting={kind:'fission',unitId:u.id,label:'Fission (choose a visible, vacant neighbor)'};update();}}]);}
 if(g.hpMode&&E.hpOf(u)<E.maxHp(u)){
  const rest=subtitle(root,'Recover from wounds');addText(rest,'Rest: recover 2 HP (4 while standing on a shrine). Costs an action and prevents this piece from moving again this turn.');
  buttons(rest,[{text:'Rest (1 action)',disabled:!canAct,click:()=>act({type:'rest',unitId:u.id})}]);
 }
 if(u.type==='P'){
  const work=subtitle(root,'Pawn worker · levels 1–4');
  addText(work,'Move one square: forward-left, forward, forward-right. Capture only forward-left/right. No sideways or backward move. The same three forward directions provide basic sight.');
  addText(work,'L1: clear forest. L2: bridge water and build watchtowers. L3: excavate mountains. L4: build/operate training camps. Pawns remain capturable, blocking military units.');
  addText(work,`Starting work uses ${E.activationCost(g,u)} CP and this pawn’s activation. Work ticks at the end of YOUR turns; the pawn stays busy. Bridge/mountain work can target an adjacent visible square from safe land. Other construction is underfoot.`, 'small muted');
  if(u.project)addText(work,`BUSY: ${u.project.kind.replace('_',' ')} · ${u.project.remaining}/${u.project.total} friendly work turns left. Capture or displacement cancels unfinished pawn work.`, 'warn');
  const jobs=[['clear_forest','Clear forest · Lv1',2],['bridge','Bridge water · Lv2',2],['tower','Build watchtower · Lv2',2],['excavate','Clear mountain · Lv3',3],['camp','Build training camp · Lv4',3],...((u.equippedSkills||[]).includes('land_reclamation')?[['fill','Fill water · skill',1]]:[]),...((u.equippedSkills||[]).includes('tunnelcraft')?[['tunnel','Dig tunnel · skill',3]]:[])];
  buttons(work,jobs.map(([key,label,dur])=>({text:`${label} · ${E.workDuration(u,key)} ${E.workDuration(u,key)===1?'turn':'turns'}`,disabled:!canAct||!E.eligibleBuilderTargets(g,u,key).length,click:()=>{
   const targets=E.eligibleBuilderTargets(g,u,key);
   if(targets.length===1&&targets[0]===u.pos)act({type:'build',unitId:u.id,project:key,to:u.pos});
   else{targeting={kind:'builder',unitId:u.id,project:key,label:`${label} (choose a highlighted worksite)`};update();}
  }})));
  addText(work,'Watchtower: eight neighboring squares of permanent sight. Camp: eight neighbors, plus one outer ring while a friendly pawn stands on it. Terrain blocks extended sight.', 'small muted');
  const camp=(g.camps||[]).find(c=>c.pos===u.pos&&c.side===u.side&&g.terrain[u.pos]===E.T.CAMP);
  if(camp){
   const section=subtitle(root,'Training camp · pawn production (Lv4)');
   addText(section,`Choose 2 pawns, 1 knight or 1 bishop, all level 1. Keep this pawn stationed for ${E.equipped(u,'instructor')?4:5} friendly work turns, or permanently sacrifice it for a 2-turn batch. No King XP charge for pawn production. Camp construction time is separate.`);
   const queue=camp.queue;
   if(queue)addText(section,`${queue.count||1} ${E.P[queue.type]}: ${queue.remaining}/${queue.total} friendly work turns remaining (${queue.mode||'legacy XP'}). A ready batch waits for free exits.`, 'warn');
   else for(const type of ['P','N','B']){
    const count=E.pawnBatchSize(type),label=`${count} ${E.P[type]}${count>1?'s':''}`;
    buttons(section,[{text:`Keep pawn → ${label} · ${E.equipped(u,'instructor')?4:5} turns`,disabled:!canAct||!E.canOperateCamp(u)||E.trainingCapacity(g,u.side)<count,click:()=>act({type:'trainCamp',unitId:u.id,piece:type,mode:'stay'})},
     {text:`Sacrifice pawn → ${label} · 2 turns`,disabled:!canAct||!E.canOperateCamp(u)||E.trainingCapacity(g,u.side)+1<count,click:()=>{if(confirm(`Permanently sacrifice level-${u.level} Pawn #${u.id} to produce ${label} in 2 friendly work turns? Its XP and upgrades are lost.`))act({type:'trainCamp',unitId:u.id,piece:type,mode:'sacrifice'});}}]);
   }
  }
  if(u.job){const area=subtitle(root,'Legacy profession · preserved from an older save');addText(area,`${E.JOBS[u.job]||u.job}: retained for this existing pawn. New pawns develop through skill choices instead of a separate profession purchase.`);if(u.job==='scout')buttons(area,[{text:'Place scout beacon',disabled:!canAct||u.level<4||!E.equipped(u,'watch'),click:()=>act({type:'watch',unitId:u.id})}]);}

 }
 if(u.type==='K'){
  const area=subtitle(root,'Commander · training-camp recruitment');
  const camps=E.eligibleTrainingCamps(g,'w'),queue=(g.camps||[]).filter(c=>c.side==='w');
  addText(area,`Command power ${E.commandPower(g,'w')} per friendly turn. ${g.startingCamp==='ready'?'Quick Start provides a ready training camp.':'No free training camp: train a Pawn to level 4 through scouting, construction or combat, then build one.'} There is no engineer. Order initial recruitment through the King for ${E.activationCost(g,u)} CP. At level 4, a pawn standing on a camp can operate it instead. Training spends the King's UNSPENT XP. Training a pawn costs ${E.TRAIN_XP.P} XP and 2 turns; knight ${E.TRAIN_XP.N} XP / 3 turns; bishop ${E.TRAIN_XP.B} XP / 4 turns. Graduates always begin level 1. Every three graduates of the same type from one camp add a training turn.`);
  if(!queue.length)addText(area,'No friendly training camps. A level-4+ Pawn must construct your first camp on a visible plain square; until then King recruitment is unavailable.','warn');
  else queue.forEach(c=>addText(area,`${E.posName(g,c.pos)}: ${c.queue?E.P[c.queue.type]+' in training ('+c.queue.remaining+' turns)':'Idle / available'}`,'small muted'));
  buttons(area,['P','N','B'].map(t=>({text:`Train ${E.P[t]} · ${E.TRAIN_XP[t]} king XP · ${E.TRAIN_TURNS[t]}+ turns`,disabled:!canAct||!E.equipped(u,'summon')||u.xp<E.TRAIN_XP[t]||!camps.length||E.trainingCapacity(g,'w')<1,click:()=>{targeting={kind:'summon',unitId:u.id,piece:t,label:`training level-1 ${E.P[t]} (click an available camp)`};update();}})));
 }
 if(u.type==='B'&&u.level>=2){const b=subtitle(root,'Bishop · earned farsight');addText(b,'Level 2 permanently grants +1 layer of diagonal vision, automatically. It is an actual early-level upgrade, not only a badge.');}
 if(u.type==='B'&&u.level>=15&&!u.job){const b=subtitle(root,'Maester Bishop progression');addText(b,'Become a Maester: permanently unlock +1 total military CP on later friendly turns (hard cap 9), in exchange for this activation.');buttons(b,[{text:'Become Maester Bishop',disabled:!canAct,click:()=>act({type:'maester',unitId:u.id})}]);}
 if(u.type==='Q'){
  const area=subtitle(root,`${E.QPATH[u.queenPath]} · tactical decisions`);
  if(u.queenPath==='war'){
   addText(area,u.stance==='global'?'Global stance: from queen level 6, all allies gain +1 directional sight. Before then, sight remains baseline. Local stance provides defense and, from level 6, +2 nearby sight.':`Local stance: protects nearby allies. +2 directional sight unlocks at queen level 6. Switching costs ${E.activationCost(g,u)} CP; global sight bonus also unlocks at level 6.`);
   buttons(area,[{text:`Switch to ${u.stance==='global'?'local':'global'} stance`,disabled:!canAct||!E.equipped(u,'stance'),click:()=>act({type:'queen',unitId:u.id,ability:'stance'})}]);
  }else if(u.queenPath==='phantom'){
   addText(area,'Cloak hides the queen unless nearby detectors expose her. A decoy creates a false queen on an empty square for a few rounds. Both consume a Queen activation and CP; no resources required.');
   buttons(area,[{text:'Cloak',disabled:!canAct||!E.equipped(u,'cloak'),click:()=>act({type:'queen',unitId:u.id,ability:'cloak'})},{text:'Plant decoy',disabled:!canAct||!E.equipped(u,'decoy'),click:()=>{targeting={kind:'decoy',unitId:u.id,label:'Phantom decoy (≤6 tiles)'};update();}}]);
  }else{
   addText(area,'Sacrifice for essence, siphon XP without killing, or pay command to protect a follower. Each path makes a different permanent or temporary cost. A surge spends 8 essence for 2 actions (net +1), once per round.');
   buttons(area,[{text:'Sacrifice ally',disabled:!canAct||!E.equipped(u,'sacrifice'),click:()=>{targeting={kind:'queen-target',ability:'sacrifice',unitId:u.id,label:'sacrificial bargain'};update();}},{text:'Siphon XP',disabled:!canAct||!E.equipped(u,'siphon'),click:()=>{targeting={kind:'queen-target',ability:'siphon',unitId:u.id,label:'nonlethal XP siphon'};update();}},{text:'Mercy / ward',disabled:!canAct||!E.equipped(u,'mercy'),click:()=>{targeting={kind:'queen-target',ability:'mercy',unitId:u.id,label:'mercy and protection'};update();}},{text:'Blood surge (8 essence)',disabled:!canAct||!E.equipped(u,'surge')||g.players.w.essence<8,click:()=>act({type:'queen',unitId:u.id,ability:'surge'})}]);
  }
 }
 if(g.campCaptureMode==='on'&&u.type!=='V'){
  const enemyCamp=(g.camps||[]).find(c=>c.pos===u.pos&&c.side!==u.side);
  if(enemyCamp){const section=subtitle(root,'Enemy training camp · capture (experimental)');
   addText(section,'Occupy the camp through the opponent’s response turn, then spend 1 CP and this piece’s activation to claim it. Any queue is canceled.');
   buttons(section,[{text:'Claim camp · 1 CP',disabled:!canAct||g.ap<1||u.history?.[0]?.round===g.round,click:()=>act({type:'claimCamp',unitId:u.id})}]);
  }
 }
 if(['P','B','N'].includes(u.type)&&u.level>=2&&!u.bond){const q=E.queen(g,'w');const near=q&&E.distance(g,u.pos,q.pos)<=4;
  const section=subtitle(root,'Relationship · optional bond');addText(section,{P:'Devoted pawn: slower XP growth, eventually 100% sacrificial conversion.',B:'Secret lover: queen gains shared insight; if bishop dies, grief penalizes the queen.',N:'Sworn protector: once, intercept a strike on the queen at the cost of the knight’s life.'}[u.type]);
  buttons(section,[{text:{P:'Pledge devotion',B:'Secret bond',N:'Swear protection'}[u.type],disabled:!canAct||!near,click:()=>act({type:'bond',unitId:u.id})}]);
 }
 if(u.bond){const section=subtitle(root,'Life history and relationships');addText(section,`Bond: ${u.bond}. Trust: ${u.bondTrust}. ${u.summonedAt?'Summoned during this match.':'Original army member.'} ${u.history.length} recent movements recorded.`);}
}
function update(){const readyPawns=E.withSide(g,'w').filter(u=>E.pendingSkillLevels(u).length);$('skillReady').textContent=`Skills ready${readyPawns.length?' · '+readyPawns.length:''}`;$('skillReady').disabled=!readyPawns.length||!!g.winner||g.side!=='w';if(g.winner){$('phase').textContent=g.winner==='w'?'Victory — the opposing king was captured!':'Defeat — your king was captured!';}else $('phase').textContent=g.side==='w'?'Your command phase':'Enemy command phase';
 $('stats').textContent=`Round ${g.round} · ${g.ap} / ${E.commandPower(g,g.side)} military CP · ${g.n}×${g.n} · ${E.combatUnits(g,'w').length} vs ${E.combatUnits(g,'b').length} units · ${E.withSide(g,'w').filter(u=>u.type==='P').length} vs ${E.withSide(g,'b').filter(u=>u.type==='P').length} pawn-workers`;
 $('endTurn').disabled=g.side!=='w'||!!g.winner;
 const king=E.king(g,'w'),camps=(g.camps||[]).filter(c=>c.side==='w');
 $('economy').innerHTML=`<div class="economy-box"><div><b>${g.ap}</b><small>CP remaining</small></div><div><b>${E.commandPower(g,'w')}</b><small>Base + command bonuses</small></div><div><b>${king?king.xp.toFixed(1):'—'}</b><small>Unspent king XP</small></div><div><b>${(g.camps||[]).filter(c=>c.side==='w'&&g.terrain[c.pos]===E.T.CAMP).length}</b><small>Active camps</small></div><div><b>${E.combatUnits(g,'w').length}/20</b><small>Military supply</small></div><div><b>${g.players.w.essence.toFixed(1)}</b><small>Choice essence</small></div></div><p class="small muted">King CP grows at levels 5/15/30/50/75/95; army achievements award XP even while he stands still; idle turns award none. Maester Bishop and developed War Queen can add CP (max 9). Each unit's activation CP cost rises with rank; level milestones can trade a new sight ability for cheaper commands. Pawn construction consumes its normal military activation and CP. L1 forest; L2 bridge/watchtower; L3 mountain; L4 camp. Pawn production: sacrifice for 2 turns, or stay for 5; 2 pawns / 1 knight / 1 bishop. Queued recruits reserve army slots. Camp vision: adjacent ring, plus one outer ring with a friendly pawn on the camp.</p>`;
 for(const c of (g.camps||[]).filter(c=>c.side==='w'&&c.queue)){const q=c.queue;addText($('economy'),`Camp ${E.posName(g,c.pos)}: ${q.count||1} ${E.P[q.type]} · ${q.remaining>0?q.remaining+' friendly work turns left':'ready; awaiting free exit(s)'} · ${q.mode||'XP training'}`, 'small muted');}
 $('log').replaceChildren();const contacts=(g.battleEcho||[]).filter(x=>x.side==='w'&&x.until>=g.serial&&E.byId(g,x.unitId)?.pos===x.pos);
 if(contacts.length){const note=document.createElement('div');note.className='warn';note.textContent='Combat contact: an attacker who just struck your army is temporarily revealed for recapture.';$('log').append(note);}if(errorText){let el=document.createElement('div');el.textContent='⚠ '+errorText;el.className='warn';$('log').append(el);}g.log.slice(0,27).forEach(message=>{let el=document.createElement('div');const privateMove=/^\[\d+ B\]/.test(message);el.textContent=privateMove?'Enemy action under fog — details concealed.':message;$('log').append(el);});
 $('map-note').textContent=targeting?`TARGET MODE: ${targeting.label}. Click the appropriate tile or Cancel.`:`Directional vision · unlimited clear-line R/B/Q movement through explored squares · forest soft-stops on entry · mountain/water hard-stop land units · water transparent to sight · 3 CP playtest / 2 CP legacy · ${E.PRESETS[g.armyW]?.name||g.armyW} organization · ${g.combatMode==='hp'?'Legacy numeric HP':g.combatMode==='pips'?'experimental shield pips':'one-hit captures'}`;$('zoomText').textContent=Math.round(camera.zoom*100)+'%';panel();draw();}
const ORGANIZATION_EXPLAIN={
 traditional:'<strong>Traditional · deputy and middle managers</strong> — 1 King, 1 Queen (deputy), 2 Rooks, 2 Knights + 2 Bishops (middle managers), 2 end-to-end Pawn-workers. Strong hierarchy; limited starting workforce.',
 middle:'<strong>Middle · team-led</strong> — 1 King, 2 Knights (cost-efficient leads), 6 junior Pawn-workers. Tactical pairing without the Queen/deputy layer.',
 flat:'<strong>Flatten · direct reporting</strong> — 1 King and 9 Pawn-workers. Construction, scouting, and combat compete for the same King-directed CP budget. “You get to talk to the King directly. Is that actually a good idea?”',
 balanced:'<strong>Historical · Balanced Court</strong> — preserved v0.5.7 army, including Rooks; available for comparisons and old saves.',
 expedition:'<strong>Historical · Explorers</strong> — preserved v0.5.7 army, available for comparisons and old saves.',
 bastion:'<strong>Historical · Fortress</strong> — preserved v0.5.7 army, available for comparisons and old saves.'
};
function updateOrganizationPreview(){const v=$('armyW').value,o=$('armyB').value;
 $('orgPreview').innerHTML=(ORGANIZATION_EXPLAIN[v]||ORGANIZATION_EXPLAIN.traditional)+` <em>Opponent: ${o==='mirror'?'same starting organization':E.PRESETS[o]?.name||o}. ${$('startingCamp').value==='ready'?'Quick Start: one free camp per side.':'Standard: no starting camps; build the first one at Pawn level 4.'} No delegation CP bonus or camp-count restriction yet. “Executing royal plans” means real Pawn-worker actions, not free labor.</em>`;
 $('routeW').disabled=!['traditional','balanced','expedition','bastion'].includes(v);
 $('routeW').title=$('routeW').disabled?'No Queen in the starting army; retained for legacy compatibility.':'Choose the starting Queen specialization.';
}
$('armyW').addEventListener('change',updateOrganizationPreview);
$('armyB').addEventListener('change',updateOrganizationPreview);
$('startingCamp').addEventListener('change',updateOrganizationPreview);
updateOrganizationPreview();
function newMatch(){const size=+$('size').value,seed=+$('seed').value||Math.floor(Date.now()%100000000);let bw=$('routeW').value,bb={war:'phantom',phantom:'choice',choice:'war'}[bw];
 g=E.create({size,seed,startingCamp:$('startingCamp').value,commandMode:$('commandMode').value,campCaptureMode:$('campCaptureMode').value,combatMode:$('hpMode').value,fissionEnabled:$('fissionMode').value==='on',armyW:$('armyW').value,armyB:$('armyB').value==='mirror' ? $('armyW').value : $('armyB').value,routeW:bw,routeB:bb});selected=null;targeting=null;errorText='';camera={x:g.n/2,y:g.n/2+7,zoom:g.n===70?.87:g.n===30?1.08:1};aiBusy=false;update();}
board.addEventListener('pointerdown',ev=>{ev.preventDefault();board.setPointerCapture(ev.pointerId);pointer={sx:ev.clientX,sy:ev.clientY,x:ev.clientX,y:ev.clientY,drag:false};});
board.addEventListener('pointermove',ev=>{if(!pointer)return;const diff=Math.max(Math.abs(ev.clientX-pointer.sx),Math.abs(ev.clientY-pointer.sy));if(diff>6)pointer.drag=true;if(pointer.drag){camera.x-=(ev.clientX-pointer.x)/cellSize();camera.y-=(ev.clientY-pointer.y)/cellSize();camera.x=Math.max(-5,Math.min(g.n+5,camera.x));camera.y=Math.max(-5,Math.min(g.n+5,camera.y));draw();}pointer.x=ev.clientX;pointer.y=ev.clientY;});
board.addEventListener('pointerup',ev=>{if(!pointer)return;const wasDrag=pointer.drag;pointer=null;if(!wasDrag){const p=worldAt(ev.clientX,ev.clientY);handleCell(p.r,p.c);}});
board.addEventListener('pointercancel',()=>pointer=null);board.addEventListener('contextmenu',ev=>ev.preventDefault());
board.addEventListener('wheel',ev=>{ev.preventDefault();let scale=ev.deltaY>0?.88:1.14;const rect=board.getBoundingClientRect(),x=(ev.clientX-rect.left-rect.width/2)/cellSize(),y=(ev.clientY-rect.top-rect.height/2)/cellSize();const nx=Math.max(.45,Math.min(2.4,camera.zoom*scale));if(nx===camera.zoom)return;const nextSize=25*nx;camera.x+=x-(ev.clientX-rect.left-rect.width/2)/nextSize;camera.y+=y-(ev.clientY-rect.top-rect.height/2)/nextSize;camera.zoom=nx;draw();$('zoomText').textContent=Math.round(camera.zoom*100)+'%';},{passive:false});
minimap.addEventListener('click',ev=>{const rect=minimap.getBoundingClientRect();camera.x=(ev.clientX-rect.left)/rect.width*g.n;camera.y=(ev.clientY-rect.top)/rect.height*g.n;draw();});
$('zoomIn').onclick=()=>{camera.zoom=Math.min(2.4,camera.zoom*1.20);update();};$('zoomOut').onclick=()=>{camera.zoom=Math.max(.45,camera.zoom/1.20);update();};$('center').onclick=()=>centerForUnit(E.king(g,'w'));
$('skillReady').onclick=()=>{const choices=E.withSide(g,'w').filter(u=>E.pendingSkillLevels(u).length);if(choices.length){const i=choices.findIndex(u=>u.id===selected),u=choices[(i+1)%choices.length];selected=u.id;targeting=null;centerForUnit(u);update();}};
$('pawns').onclick=()=>{const pawns=E.withSide(g,'w').filter(u=>u.type==='P');if(!pawns.length)return;const previous=pawns.findIndex(u=>u.id===selected),next=pawns[(previous+1)%pawns.length];selected=next.id;centerForUnit(next);errorText='';update();};
$('new').onclick=()=>{if(g.log.length<2||confirm('Start a new match? Current unsaved progress will be lost.'))newMatch();};$('endTurn').onclick=()=>{if(g.side==='w'&&!g.winner){act({type:'end'});}};
$('save').onclick=()=>{const json=E.dump(g);try{localStorage.setItem('stalemate_v0510_match',json);}catch(_){};
 const blob=new Blob([json],{type:'application/json'}),url=URL.createObjectURL(blob),link=document.createElement('a');
 link.href=url;link.download=`Stale-Mate_v0.5.10_${g.n}x${g.n}_seed${g.seed}_round${g.round}.json`;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1200);
 errorText='Match exported to a JSON save file.';update();};
$('load').onclick=()=>$('savefile').click();
$('savefile').addEventListener('change',async ev=>{const file=ev.target.files?.[0];if(!file)return;try{
 g=E.load(await file.text());$('size').value=String(g.n);$('seed').value=String(g.seed);$('hpMode').value=g.combatMode||'classic';$('commandMode').value=g.commandMode||'original';$('campCaptureMode').value=g.campCaptureMode||'off';$('startingCamp').value=g.startingCamp||'none';$('fissionMode').value=g.fissionEnabled?'on':'off';$('armyW').value=g.armyW||'traditional';$('armyB').value=g.armyB===g.armyW?'mirror':g.armyB||'traditional';$('routeW').value=g.routeW||'war';updateOrganizationPreview();selected=null;targeting=null;errorText='Save file loaded successfully.';camera.x=g.n/2;camera.y=g.n/2+7;camera.zoom=g.n===70?.87:g.n===30?1.08:1;update();if(g.side==='b'&&!g.winner)startAi();
 }catch(e){errorText='Cannot load match: '+e.message;update();}finally{ev.target.value='';}});
window.addEventListener('keydown',ev=>{if(['INPUT','SELECT','TEXTAREA'].includes(document.activeElement?.tagName))return;const k=ev.key.toLowerCase();let handled=true;if(k==='arrowup'||k==='w')camera.y-=2;else if(k==='arrowdown'||k==='s')camera.y+=2;else if(k==='arrowleft'||k==='a')camera.x-=2;else if(k==='arrowright'||k==='d')camera.x+=2;else if(k==='+'||k==='=')camera.zoom=Math.min(2.4,camera.zoom*1.15);else if(k==='-'||k==='_')camera.zoom=Math.max(.45,camera.zoom/1.15);else if(k==='escape'){targeting=null;errorText='';}else handled=false;if(handled){ev.preventDefault();update();}});
window.addEventListener('resize',()=>{if(!redrawRequest)redrawRequest=requestAnimationFrame(draw);});
update();
})();

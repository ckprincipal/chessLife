# ChessLife — Living Design Bible v0.4

**Status:** working concept + prototype specification, 2026-10-29. **Working title:** ChessLife (previously Chesscraft; ChessStory remains an alternative). This is a design and balance proposal, not a claim that all rules have been playtested. **Primary criterion: fun and consequential character decisions.**

## 1. The fantasy

Chess pieces are characters rather than interchangeable tokens. They develop skills, professions, bonds, loyalties, ambitions, and scars through **what they actually do**. A level-50 unit should play differently, not simply receive a stat multiplier. Players tell stories through their tactical choices, especially choices they hesitate to make.

- **King:** The only royal unit. He risks his life on the map to discover terrain, gain XP faster, build command power, and eventually summon improved pawns and other pieces. **1.5× XP**. King capture, not mate, ends the game. The queen never inherits royal victory status.
- **Queen:** Exceptionally strong at the start, especially in the first ~15% of play; gains levels **slowly** and with diminishing marginal returns. The other units grow into niches. Her specializations are mutually exclusive: War, Phantom, and **Choice / Blood**. She may gain a limited commander-like ability at very high level, without becoming another king.
- **Pawns:** Fast specialization and identity: Swimmer, Mountaineer, Scout, Ninja (30% chance for one bonus move per turn, never chainable). Rare Devoted Pawn bond enables unusually efficient queen rituals but permanently sacrifices other developmental freedom.
- **Knight:** Mobility, rescue, protective vows, reconnaissance; vision +1 is a desirable and simple upgrade. Can grow into a sworn protector.
- **Bishop:** Terrain/intelligence/support or secret-lover bond with the queen; the romantic story is optional and develops through play rather than being assigned at spawn.
- **Rook:** Defends objectives, anchors lines and formations; particularly costly to sacrifice because of its enduring positional value.

## 2. Board, turns, and victory

- **Default map 50×50** (2,500 tiles). Selectable 30×30 / 50×50 / 70×70 in prototype; arbitrary larger sizes later after performance testing.
- Map is procedurally generated with mirrored strategic terrain; distinct biomes and neutral command objectives. Selection of **starting army preset** before each match, independently for player and opponent. Later: custom army builder under a shared point budget and multiple map presets.
- Initial force is forward-deployed near central objectives; otherwise 50×50 produces boring marching. **Three command actions per side per turn** in initial test build; every unit normally acts once per turn. A Ninja may trigger one non-chainable bonus move.
- Baseline attacks/movement retain chess identities. On large boards, **slider movement is capped at seven squares per action** (rook straight, bishop diagonal, queen both) so nobody attacks an entire 50-tile file/diagonal. Level growth never lengthens these rays. Terrain, visibility, and blocking apply.
- Enemy king captured = victory. No check/checkmate requirement, no stalemate; a side with no legal action **passes**, not draws. A turn may also be spent summoning, researching or using class powers. Draw/stalemate from immobilization does not exist. Optional surrender/turn limit can be added after testing.
- Gameplay should not hinge on unbounded pawn-spam or king farming; summoning has command costs, cooldowns and supply caps.

## 3. Three-state fog (critical)

Every square has one of three states **for each player**, recomputed each action:

1. **Unexplored = deep black**: neither terrain nor hidden enemy pieces visible.
2. **Explored but not currently in vision = pale mist**: show remembered terrain, not real-time enemy positions. Last-known sightings may appear as visibly stale *ghosts* with timestamp.
3. **Currently visible = clear**: show live terrain and enemy units if not successfully concealed.

Vision is **not permanent** merely because a tile was once explored. Most units provide short, temporary sight while occupying an area. Special skills may extend duration or establish longer-lived watch posts; truly permanent sight should have a significant tradeoff (upkeep, limited capacity, fragile emitter, line-of-sight obstruction, or counterplay).

No information leak through destination highlighting or AI: do not use perfect-information legal moves in player-visible suggestions, and the opponent AI must only react to presently observed enemies. If a speculative move enters concealed blockage, rules must specify whether the action is consumed and what becomes revealed.

## 4. Experience and ranks

**Every piece has levels 1–99 (cap 99)** and independent XP, build choices, ability cooldowns and possibly relationship status. XP source sketch (tune in simulations):

| Trigger | Suggested base XP | Guard against farming |
|---|---:|---|
| First discovery of a square for *that army* | 0.30 per square | Paid only once globally per army; credited to discovering unit; a tile seen again gives zero discovery XP |
| Detect an enemy unit the first time | 1.5 | One reward per enemy unique ID per side |
| Discover new terrain landmark | 0.5–2 | First discovery only |
| First claim/meaningful recapture of objective | 5 | Per-objective cooldown & change in control; no vacate/reoccupy loop |
| Hold/defend a contested objective | 1–2 | Once per encounter / action, not every passive tick |
| Capture piece | 4 + piece-value bonus | Suppress abuse with summoned units; clamp level bonuses |
| Protect ally / successfully support a battle | 1–3 | Only if a meaningful attack was thwarted or objective progressed |
| Survive actual danger | 1–2 | Once per enemy engagement; no stationary farming |

**King earns 1.5× all base XP**. Queen earns roughly **0.75× base XP** and has **1.5× XP requirements**: approximately **half normal levelling pace**. Effective rates are proposals and should be tested against game length. Devotion may reduce follower XP by ~20–30% in return for relationship powers. Level thresholds should grow nonlinearly so level 99 represents a long arc, not necessarily one short match.

**Persistent progression across battles** is a particularly promising ChessLife feature but not yet decided. Prototype should first support save/load for a match; campaign/permadeath/injury rules should be decided after playtesting.

## 5. Pawn professions

A pawn chooses one primary career (first unlock early, then meaningful branching choices at milestone levels):

- **Swimmer:** enter and cross water, eventually escort a friendly unit or establish ferry access. No attack-range changes.
- **Mountaineer:** cross mountains/rough terrain, deploy lookout sites, hold passes.
- **Scout:** +1 to +3 sight, first-sighting XP and eventually a temporary or costly persistent beacon; weakest direct combat improvements.
- **Ninja:** on the first move in a turn, 30% chance to earn **one** free additional move. Cannot recursively trigger. Late upgrades emphasize ambush/disengage rather than raw odds approaching 100%.

Devotion is **separate from profession** but limits future options. Bond grows from sharing dangerous missions with a queen, not from free menu clicks. A devoted pawn may convert to ritual power at 100% efficiency, but has weaker independent progression and can be worth more alive than sacrificed.

## 6. Queen specializations: preserve THREE branches

### A. War Queen — leadership

- **Local stance:** Strong buffs for nearby soldiers: temporary protection/extra coordination, stronger objective defense, and short-lived team maneuvers. Concentrating forces is vulnerable to ambush and terrain restrictions.
- **Global stance:** Small passive benefit to the whole living army, e.g. +1 sight or modest XP/command efficiency. Cannot stack maximum local and global bonuses; switching stance costs an action or cooldown.
- High ranks may orchestrate a limited extra coordinated action but never extend rook/bishop/queen attack rays.

### B. Phantom Queen — stealth and misdirection

- Early: stealth windows, escape, conceal intentions.
- Mid: decoys, fake enemy sightings, deceptive routes and false signals.
- Late: clandestine scout network, counter-reconnaissance and intelligence denial.
- **Counterplay:** scouts/detectors, adjacency, cooldowns, decoy expiry, action/economy cost. Permanent invisibility is not a fun endpoint; mastery means manipulating decisions, not becoming untargetable.

### C. Choice Queen / Blood Queen — hard decisions, not just killing allies

**Core theme is tradeoffs and decisions.** Potential abilities should let the queen choose between:

1. **Sacrifice now:** destroy an allied unit for a temporary surge, vision manipulation, escape, defense, or ritual. A rook/veteran is **not** a cheap battery; conversion efficiency is discounted.
2. **Siphon without killing:** take some follower XP/loyalty or temporarily disable it, gain a smaller benefit, preserve its life but potentially damage the relationship.
3. **Spare / protect / bind:** forgo immediate power to save a follower, increase long-term loyalty, guard against death, or build a future ritual network. Sacrifice is not automatically optimal.

Illustrative sacrifice conversion factors: ordinary pawn 0.70; veteran pawn perhaps 0.40; **devoted pawn 1.00**; knight 0.60; bishop 0.55; rook 0.35. A veteran can yield more gross power yet worse return on years of investment. The player should choose between increasing ritual amplitude **or** efficiency, not trivially maxing both. Freshly summoned units get little or no ritual value until they have survived and contributed, avoiding summon→sacrifice loops.

**Relationships / narrative candidates:** Devoted Pawn (crush/faithful servant), Bishop (secret lover, high-risk bond, grief penalties), Knight (sworn protector, last stand), possibly distrust, rivalries, betrayal, and preference conflicts. Relationships emerge from repeated tactical actions and may be optional; avoid stereotyped forced pairings. A queen with a lover may decide that keeping him alive is worth more than maximum ritual efficiency.

At very high levels, all queen branches may gain **limited commander-like support or summoning** as a rare capstone. The queen remains mortal; king capture ends the match even if the queen survives. **No second-king succession mechanic.**

## 7. King: mobile summoner, not a line attacker

- Adjacent chess-king movement and capture; not upgraded to long-range attacking.
- Gains 1.5× XP through sight, objectives, defense, and frontline leadership; risk/reward intentional.
- Summon pawns at low levels; unlock knights/bishops and then rooks at higher levels. Summoned unit level increases gradually with king experience, subject to costs and hard caps.
- Advanced summons demand more resources, more command actions, cooldowns and supply budget. Prevent free XP farms with recently summoned units.
- A king deployed to scout becomes a meaningful liability; support and escape options should reward skill, not encourage suicide rushes.

## 8. Economy, match pacing, and fairness

- Resource income: small fixed command income + controlled map shrines; objective control should motivate movement and contention.
- Turn pacing: 3 command actions; avoid excessive multi-action chains. Alternate side after actions or End Turn.
- Starting army presets (balanced, expedition/scout, fortress) should have roughly comparable supply value; user can select both own and opponent presets. Later custom preset builder with cost budget.
- **Early queen dominance** should emerge from her intrinsic chess mobility and threat. Do not nerf queen numerically after 15%; other units gain useful specialized power over time. Avoid linear stat inflation.
- Measure king risk/reward, XP distribution across classes, exploration rate, number of turns until first contact, average game length, fog information leaks, queen-route usage/choice entropy, sacrifice regret, faction win rate, and bot non-cheating.

## 9. Implementation strategy

**Milestone P0 — trustworthy playable vertical slice:** configurable 30/50/70 map, zoom/pan/minimap, 3-state fog, deterministic seeded map, 3 AP, chess-pattern movement with capped sliders, king capture, no stalemate, selectable army presets, objectives, save/load, basic opponent that respects visibility.

**P1 — progression:** per-piece XP/level (to 99), exploration XP, profession choices, vision buffs with costs, king summoning and anti-farming; visible progression UI and deterministic unit/terrain tests.

**P2 — queen identity:** War local/global, Phantom deception with counterplay, Choice queen 3-way sacrificial/nonlethal/mercy decisions, distinct cool-downs and resource costs. Provide test encounters for each.

**P3 — relationships & emergent story:** trust, devotion, bishop/knight bonds, hard sacrifices, combat histories, events and campaign persistence.

**P4 — game feel & balance:** AI self-play, analytics, animations, sound, onboarding, asset pipeline; refine turn economy/size/XP curves based on empirical outcomes.

This ordering is deliberately iterative. Do not promise a balanced final game from one prototype; prioritize accessible, testable fun.

## 10. Decisions locked / open

**Locked for now:** working title ChessLife; default >=50×50; 99-level cap; three-state fog; 1.5× King XP; slow queen growth; 3 queen routes including Choice/Blood; differentiated pawn careers; strong character identity; king-only royal capture; no stalemate; no expanding long-line attacks; ability to choose armies and map size.

**Provisional until playtests:** 3 actions/turn; 7-square slider cap; exact XP triggers/thresholds; map biomes; unit costs, spells, unlock levels; loyalty mechanics; long-term campaign persistence/permadeath; number of pieces; game-turn duration; queen specialization naming; final public-facing title and trademark check.


## 11. Addendum v0.4 — fog, HP, slots, and protected civilian economy

These rules update the earlier prototype milestone decisions and leave the core fantasy intact. Full parameter table and edge cases live in `BALANCE_BASELINE.json` and `ECONOMY_CREW.md`.

- **Fog and long-range movement:** Never-seen black squares cannot be entered or targeted in a movement order. Previously explored but currently misted squares are selectable according to known geometry/remembered terrain; an unseen blocking piece stops movement **one square before it**, consumes the action and is not blind-captured. A unit does not move again unless it has a learned/triggered bonus action such as Ninja. Neither a queen nor a rook may freely scan 50 tiles through fog. Provisional maximum slider length remains 7 squares even in clear visibility; compare longer fog-constrained ranges via playtests.
- **Tactical HP:** Default HP-on mode, with classic one-hit as an optional match configuration. Attack uses the normal chess direction geometry but subtracts HP instead of instant-killing; attacker stays put while defender survives. Enough accumulated damage defeats the piece and occupies its tile. Units level, but HP growth is deliberately sublinear so builds/skills/relationships matter more than numerical inflation.
- **Military roster cut roughly in half:** Balanced and Fortress start with 11 troops; Explorers 12. Civilians described below are separately counted and excluded from military supply.
- **Skill capacity:** King and Queen start at 3 equipped skill slots; Knight/Bishop/Rook start at 2; Pawn at 0 but gains one at levels 4, 15, and 35; civilians have zero military slots. Learned and equipped skills are distinct. Queen Choice starts with 4 available tactical choices but can equip only 3. Switching a loadout uses the unit's action near a king or a shrine. The 99-level complete inventories remain future work.
- **Civilian production:** See `ECONOMY_CREW.md`. Three protected villagers per side (lumberjack, miner, hunter), separate from the combat supply count, with food, gold and wood automatic income at adjacent resource sites. Dinosaurs and gators are neutral hunting grounds with finite stocks and injury risk. Workers cannot attack regular units, and regular combat pieces can raid but not kill them. A raid causes material loss, some unspent XP loss, 1 remaining HP and 2 rounds of recovery. Repeated raiding cannot farm XP. Choice Queen cannot use villagers as cheap ritual fuel. This is intentionally provisional to test fun and fairness.
- **Character progression:** Civilian occupations are additional life paths with XP and potential future professions. Skills and relationships should shape labor and survival choices: reliable safe harvesting vs dangerous rare prey, bodyguards protecting a mine, a queen using supplies for mercy vs a military advantage. Keep work mostly automated so 50×50 does not become 40 clicks of housekeeping per turn.

The following remain unresolved rather than implicitly locked: whether villagers should ever die, the eventual number of workers, speed of wildlife restocking, whether injuries use HP/stamina/MP, how raid counterplay works, the optimal fully visible slider cap, and all deep 99-level skill branches.

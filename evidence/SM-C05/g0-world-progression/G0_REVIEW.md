# SM-C05 G0 world and progression review

Status: source-backed proposal, not a frozen contract or production implementation.

- Commander instruction: [6543631079](https://github.com/ckprincipal/chessLife/issues/1#issuecomment-6543631079), `STLM-C00-S2-G0-INTAKE-2026-10-31-01`.
- Exact source intake: `83a0baa8a4486562c5c67144324cede402f29cf7`.
- Session: `01a191e1-345e-7ad0-9375-46c22a1e0d02`; existing `sm/c05-r2-world` worktree retained.
- CONTRACT SHA: **NOT FROZEN**. Production implementation remains **HOLD**.
- Scope: C05's world/observer, work/queues and progression boundaries for C01's single candidate; C03 owns shared types, C04 tactical legality and C02 independent verification.

## Evidence and limits

The first [BLOCKED receipt](https://github.com/ckprincipal/chessLife/issues/1#issuecomment-6543762966) precedes this larger G0 work. The [byte diagnosis update](https://github.com/ckprincipal/chessLife/issues/1#issuecomment-6543838248) supplies C01 with two separate Windows portability failures.

All 39 retained JS/viewer Git blobs match provenance. Thirty-eight Windows working files differ only by LF-to-CRLF conversion. No reference file or shared configuration was edited. The three attempts are preserved under `../2026-10-31-g0-intake/`:

| Attempt | Result | Executed scope |
|---|---|---|
| Working checkout, original wrapper | Exit 1 at `CURRENT_HANDOFF.md` hash | No child commands |
| Default `git archive`, original wrapper | Exit 1 at the same hash | Default archive also inherits `core.autocrlf=true`; no child commands |
| Command-scoped LF Git export, original wrapper | Exit 1 at final HTML hash | All ten child commands exit 0: 173 focused checks, 8,412 randomized actions on 60 maps including staged-level maps, builder invocation, original viewer fixture/schema check |

The unmodified builder's Windows text output contains 1,522 CRLF sequences and is 152,378 bytes. A read-only LF comparison equals the exact 150,856-byte frozen HTML hash. This does **not** turn the overall wrapper failure into a pass. See `../2026-10-31-g0-intake/byte-diagnosis.json`, the failed receipts and their individual logs. `probe_bytes.py` is a reproducible diagnostic, not a gameplay repair.

Node 24.20.0, Python 3.14.8 and .NET SDKs 3.1.426/5.0.408 were observed. Browser checks, Unity Editor compilation, platform builds and C# parity were not run. Viewer fixture success validates historical 8/7/6-per-side data; it does not validate current 10/9/10 gameplay. BUG-001 remains OPEN/UNREPRODUCED.

## Three bounded stages

Each stage needs C00's exact contract freeze, C05's ACK and an expressly named implementation scope before code is ported. The future stages are separate PRs targeting `campaign/unity-r2`.

| Stage | Bounded implementation proposal | Dependencies and acceptance boundary |
|---|---|---|
| 1: world/fog | Seeded terrain and post-deployment water repair; known-terrain/passability and occupancy queries; directional/structure sight; observer memory and explicit refresh causes | C03 RNG, coordinates, stable IDs, state/observation DTOs and numeric semantics; C04 speculative orders versus authoritative execution; C01 facade ordering; C02 same-seed and observer traces. Compare each supported action's state and both observations, not a screenshot. |
| 2: labor/training | L1-L4 projects and skill modifiers; worker/worksite locks; camps/towers; royal XP training and pawn stay/sacrifice queues; capacity, cancellation, ordered atomic deployment and save state | Stage 1 sight/memory; C04 cost/activation and death hooks; C03 projects, queue union/defaults and unit factory; C02 side/tick/cap/exit/migration scenarios. No new camp-count limit. |
| 3: XP/skills | Complete XP/level/milestone accounting; deterministic three-choice drafts; all 36 authored pawn skills, loadouts, cooldowns, protection/support ledgers, route presentation and optional Fission reset integration | Earlier world/work effects; C04 movement/combat/AI execution hooks; C03 persistent/transient fields and migrations; C06 filtered presentation; C02 independent skill and numeric traces. No invented non-pawn tree or route bonus. |

Stage 1 has a real dependency on the XP primitive: `refreshSight` can award exploration/first-contact XP and create level/skill state. C01's candidate must include the minimal exact `addXp`/unit-preparation boundary needed by supported G1 traces. Silently omitting these fields until stage 3 would fail per-action state parity. Stage 3 completes the authored progression subsystem; it is not permission to use incorrect temporary XP in stage 1. C00 should name the supported slice and any unsupported higher-level skill actions explicitly.

Preserve Traditional K1 Q1 R2 N2 B2 P2; Middle K1 N2 P6; Flatten K1 P9; zero Standard camps; no independent engineer; the two-worker corporate inefficiency; no new camp cap. Existing optional pips/HP/Fission/camp-capture behavior stays separately flagged. Requested free-King/facility changes are not baseline work.

## Source map

Line anchors refer to `reference/js-v0.5.10/prototype/engine.js` at the exact intake, not a future branch tip. `SOURCE_PINS.json` records source identities.

| Concern | Source anchors |
|---|---|
| Terrain/work/training/vision constants | 6-36 |
| All 36 skills, capacities, preparation, draft, route and learning | 44-153 |
| CP, numeric XP/levels and new-unit defaults | 202-233 |
| Terrain generation, water repair, formation and optional starter camps | 234-324, 594-602 |
| Build eligibility, payment, project ticks and work awards | 399-470 |
| Royal training, pawn batches, cancellation and exit/deployment order | 471-548 |
| Existing optional camp capture | 549-565 |
| Milestone/loadout actions | 566-592 |
| Actual versus known terrain, orders, LOS, sight and memory refresh | 604-739 |
| Shrine XP, worker death, movement/guard/capture XP and Fission reset | 740, 749-755, 774-867 |
| Active skill targets, cooldowns and execution | 960-1032 |
| End-turn and dispatch ordering | 1034-1081 |
| Schema 15 and migrations from 5-14 | 1148-1212 |
| UI training controls/confirmation | `app.js:95-105,157-179`; dispatch/result handling at 66-70 |

## Candidate hook boundaries for C01/C03 review

Names below are labels for discussion, not an existing C# API. C03 should express these using its single shared DTO candidate; C01 publishes that candidate. C05 will review the exact revision when supplied rather than introduce another schema or facade.

| Boundary | Inputs and result | Required behavior and composition owner |
|---|---|---|
| Initialize terrain / repair water | Mutable new-game draft, C03 uint32 RNG, ordered placements | C05 reproduces draws and row/neighbor iteration. C01 orders generation, both formations, optional camps, final repair, King XP grant, CP and initial sight. |
| Read known terrain / passability / occupancy | Read-only state, observer side, position, unit capabilities | `-1` for unexplored; live terrain only in current sight; stale terrain memory in mist. Own units are known; enemies require observability. C04 consumes these for previews, never an omniscient move list. |
| LOS / personal / structure sight | True-state geometry, unit/facility capability inputs | C05 computes authority-side visibility. Preserve Bresenham endpoints, forest/mountain stops, directional rays, cap six and structure LOS. C04 guard previews require every intermediate square currently visible before consulting true LOS. |
| Refresh knowledge | Mutable state, optional actor side/ID, initial flag | State-changing hook, not an observation getter. Updates sight, seen, terrain memory and contacts; actor refresh may award XP. Preserve source call sites and `w` then `b` order. |
| Build-target query and begin build | Worker, project kind, target; eligible sites or outcome | Query is project eligibility, not complete action availability. C04/C01 preserve the dispatch's special build branch and exactly one CP/activation payment; C05 applies project/lock effects at the source phase. |
| Begin royal or pawn training | Commander/operator, output type, camp, explicit mode | Two separate routes: unspent King XP and 1 recruit versus pawn count/mode, no King XP. C04 supplies activation-cost policy; C01 freezes which handler commits the payment so it is not duplicated. |
| Tick construction / tick training | Ending friendly side, mutable ordered arrays | Call once each at friendly end, construction first. Preserve per-unit/per-camp order, completion/XP/refresh timing and cap/exits. These are not UI timers or incoming-turn ticks. |
| Unit removed / queue canceled | Removed unit ID; camp and reason | Synchronous worker cleanup during capture/sacrifice before subsequent effects. Cancel assigned queues and projects as coded. Preserve paid-legacy no-refund behavior. C04 invokes the C05 effect hook from the actual removal path. |
| Add XP / prepare unit | Unit ID, base amount, reason, royal-share flag | JS double arithmetic and rounding, spend/level order, preparation/defaults and 20% base-XP royal share. Return actual gain; no idle-time awards or recursive share. C03 owns representation, C05 effects. |
| Draft / route / loadout | Unit skill state; optional pick/replacement | Offers are read-only, deterministic and consume no RNG. Learning and milestones precede ordinary CP/project gates; loadout changes use the paid command path. Keep learned/equipped/choices distinct. |
| Active skill contribution | Equipped metadata, target/path, cost and serial context | C04 owns legality/physical movement/attack resolution; C05 supplies world/progression/ward/cooldown effects. Freeze one executor and exact ordering; do not charge CP or move twice across owners. |
| Protection absorbed / shrine claim | Source/target identity or eligible mover, current serial/round | C04 invokes only the relevant source branch. Support XP occurs on real absorption; not on ward casting. Normal/interrupt/maneuver movement may claim shrines; Relief's source branch does not call `claimedObjective`. |
| Project/queue/progression save projection | C03 state/save envelope and legacy defaults | Keep full authority data and observer memory separate. C03 owns serialization/migration; C05 reviews these fields and C02 checks canonical results. |

## Ordering that the facade must preserve

### New game and visibility

`create` builds state -> generates terrain -> places white and black armies -> optionally adds both starter camps -> repairs water clusters -> grants each King 3 XP/total XP -> initializes white CP -> refreshes white and black with `initial=true` -> logs setup.

`refreshSight` unions living friendly personal sight, active owned camps/towers, unexpired beacons and applicable battle echoes. It then replaces `sight`, updates `seen` and `terrainMemory` only at visible cells, awards `.30 * newly discovered personal cells` to the supplied actor, and processes visible enemy contacts for `lastSeen`/one-time contact XP. Initial refresh suppresses XP. Actorless refresh still records knowledge/contacts, so adding an actor or moving the hook can change later XP.

This creates a strict split: an explicit refresh commits knowledge/XP; an observation accessor returns its filtered projection without changing state or drawing RNG. The JS has helpers and raw state, not an existing `PlayerObservation` DTO. C03/C02/C06 must review that projection and the treatment of raw debug logs/events. Do not expose authoritative enemy queues, hidden unit objects, global logs or hidden terrain through a generic state serializer.

At level 1 the executable `baseVision` gives **Q/R two directional layers**, others one. Pawns see three forward rays; knights see scaled L landings. Preserve code rather than an older all-units-one-layer description. Forest Lore changes a pawn's personal rays; structure sight calls LOS with forest piercing disabled. Camp garrison uses any friendly living pawn/legacy laborer on the tile, independently of the L4 production gate. Sentry Platform's tower bonus requires its equipped pawn to occupy that friendly tower.

### Friendly end turn

1. If the game is won, direct `endTurn` returns without ticking; public `action` rejects finished games.
2. Tick construction for the ending side, in laborer array order. Revalidate worker anchor, distance, true terrain and occupier; cancel or decrement. On completion, change terrain/add facility, clear project, apply once-per-kind/site/side work XP, then refresh with this worker as actor.
3. Tick that side's training queues, in camp array order. Validate facility and assigned teacher; cancel invalid queues. An enemy occupant pauses before decrement. Decrement positive remaining ticks, mirror a teacher's remaining value, then perform live-count cap and ordered full-batch exit checks. A ready blocked queue stays at zero.
4. For a full batch, allocate fresh level-1 units in source spot order, set `acted` to the ending serial, increment `trained[type]` by the entire batch, clear teacher/queue, and refresh without actor credit.
5. Clear ending-side bonuses; flip side; increment serial; increment round only on return to white; calculate incoming CP; retain existing shrine gold bookkeeping; expire beacons/decoys/echoes; apply incoming Queen grief fatigue; refresh without an actor; log the phase.

Construction can free an exit before training checks it on the same end turn. The first tick is the end of the turn in which work/training starts. Ending the opponent's turn does not decrement this side's queue. Graduates do not act during end-turn resolution; the source marks them with the outgoing serial. Do not substitute an incoming-turn decrement or a real-time coroutine.

### Actions and progression

The dispatcher rejects absent/won games and missing action types before clearing `lastEvent`; subsequent typed dispatch clears it even on some rejections. `end`, unit lookup, `chooseSkill`, `milestone` and `build` precede ordinary project/activation/CP gates. A free draft can occur at zero CP or after activation and does not refresh that activation. `prepareSkills` may normalize data before a rejected pick/equip. Therefore “all failed actions are a bitwise no-op” is not a valid baseline contract.

Ordinary capture removes the victim and synchronously cancels its work, awards capture XP, sets victory if royal, moves/records history, claims a shrine where applicable, logs, then refreshes with the attacker as actor. Hidden-blocker movement may be a successful consumed action with no displacement. Skill maneuvers spend CP/activation and start their cooldown before resolving true obstructions. Relief pays and consumes both activations, swaps both histories and clears bonuses; its branch does not claim a shrine. Preserve these distinctions rather than adding a universal post-move callback.

`addXp` rounds the unit's gain and balances to cents with JS `Math.round`, uses the source threshold loop and `1e-7` comparison tolerance, queues crossed milestones and prepares skills on level-up, then gives the King 20% of the **base** amount with `royalShare=false`. The King's 1.5 multiplier is applied on that nested award; a devoted pawn's personal 0.75 modifier does not shrink the base used for the King. At level 99 the function returns before sharing; crossing into 99 zeros remaining XP but follows that call's subsequent share path. C03 numeric tests must preserve both cases.

## Data the shared candidate must retain

| State area | Required fields/semantics |
|---|---|
| World and observer | Terrain numeric enum 0-8; `n/seed/rng`; shrines; per-side `seen/sight/terrainMemory/lastSeen/firstSeenUnits/shrineClaim`; beacons; decoys; battle echoes and inclusive serial expiries |
| Facility | Ordered camps/towers with owner and position; optional provenance (`starter`, `builtBy`, `capturedRound`); camp `trained` counters and nullable queue |
| Project | `kind,pos,workerPos,remaining,total`; worker anchor versus target must remain distinct; `workerPos ?? pos` is a legacy fallback |
| Queue | `kind,mode,type,count,remaining,total,started,kingId?,workerId?,founderId?`; absent `count` uses 1 in the relevant baseline paths; nullable worker does not mean an invalid sacrifice queue |
| XP and milestones | `level,xp,totalXp,pendingChoices,choiceHistory,cpDiscount,visionGrowth`; initialization grant versus earned/spent XP |
| Skill/protection | `learnedSkills,equippedSkills,skillChoices,skillCooldowns,supportAwards,skillWard`; family ID `guardian` displays Companion; `scout` displays Pathfinder; choice-history order and catalogue insertion order |
| Cross-owner transient state | `acted/bonus/serial/round`, histories, `lastEvent`, HP/pips and Fission lineage/reset data, `campSacrifice`, fatigue/cloak/grief and legacy professions; preserve source presence/default semantics |
| Anti-farming state | `workAwards[side][kind:pos]`, first-contact markers, per-ally support awards, shrine claim rounds; elapsed turns alone create no XP |

C03's migration proposal must keep actual deployments/camps and existing CP/activations, import versions 5-14 into 15, retire living legacy V engineers, cancel their terrain work, and detach already-paid engineer training into a royal queue without recharging XP. Missing old mist memory uses remembered PLAIN until re-observed; it must not reveal live hidden terrain. `load` ends with actorless refresh and can update derived knowledge, so raw dump/load string equality is not an unconditional contract.

## Skill and scenario inventory

`skill-catalogue.json` is exported from the exact engine bytes and contains every ID, name, family, description and active kind, in source order. It is evidence, not a new catalogue authority. The source's catalogue document retains a historical v0.5.7 heading; exact engine behavior is v0.5.10 at the intake.

`SCENARIOS.md` identifies baseline scenarios and existing source tests. They are review/acceptance inventory, not newly executed C# cases. `BUG001_SOURCE_TRACE.md` supplies C02/C06 the UI/engine path and distinguishing evidence to collect.

## Decisions and dependent review still needed

C03's provisional data component at `c2806a2bdf3a888567a694cdd3d05a5e62f7bb35` was published during this work and is now reviewed in `C03_CANDIDATE_REVIEW.md`. Its two carrier files, proposal and descriptive save schema were read without merging or rerunning C03's compilation/probes. Eight concrete field-list/payload, presence/access, aliasing, queue and refresh-boundary requests are supplied to C01/C03. This completes C05 component review at that exact revision; the single composed C01 candidate still requires its own exact-revision review and C00 freeze.

Peer review performed: C06's `evidence/SM-C06/2026-10-31-g0-presentation-review.md` at exact revision `d292b03fb23e6f0f5b913fe15755faf427dc4134`, announced in [6543856113](https://github.com/ckprincipal/chessLife/issues/1#issuecomment-6543856113), was fetched and read without merging it. This is review of one interface proposal, not review/acceptance of a composed C01/C03 contract.

C05 supports C06's filtered observation boundary, explicit known/remembered/current cells, queue feedback surviving operator removal, and center-first exit terminology. “Fresh observation after outcome” must mean reading the committed knowledge projection, not unconditionally invoking `refreshBoth`: extra refreshes can change contacts/XP or stale visibility relative to the JS. Keep hidden exit-occupant identity out of feedback. The audience for own-queue updates after an unseen future facility burn remains a C00/C02/C03 review question; memory must not be silently updated from true terrain. UI duplicate-input suppression is appropriate presentation state; any new version-based action rejection policy must be explicit in the shared contract rather than an unannounced baseline rule.

C04's `evidence/SM-C04/G0_TACTICAL_REVIEW.md` at `3daf13b4347aad8d64d0310a66dd50b3b464a145`, announced in [6543943853](https://github.com/ckprincipal/chessLife/issues/1#issuecomment-6543943853), was also fetched and read without merging. The proposed tactical boundary agrees on known orders versus true execution, synchronous worker/queue death cleanup, builder-before-training ticks, outgoing-serial recruits, actor-attributed XP refresh and branch-specific guard behavior. C04's staged T09 observes the Maester switch mutating job/CP/activation while retaining its default error; the source at `engine.js:1073` agrees. C05 has not rerun that staged probe or independently accepted a defect. C02 should triage and C00 should decide any versioned repair separately. A generic failure rollback would erase current source effects and cannot be silently imposed on this baseline.

1. C01/C03: supply one exact shared candidate SHA for C05 review, including C02's canonical observation/outcome representation. None is frozen by this report. Do not copy these discussion labels into separate competing game loops.
2. C01/C04: settle one authority for CP/activation commits and retain source-specific validation order, including early build/draft/milestone paths and successful interrupted moves.
3. C01/C03/C02: pin refresh causes/actor attribution, ordered end-turn hooks, numeric rounding and every action-relevant nullable/transient field; preserve baseline behavior before considering a separately authorized cleanup.
4. C03/C06/C02: review filtered observations, permitted error/event information, memory ghosts and debug-state separation; never pass the global raw state to presentation as its public observation.
5. C01: address both Windows byte-preservation issues in owned build/verification configuration. Do not change the frozen oracle or its expected hashes. Current wrapper scope remains failed despite ten successful child commands.
6. C00: after review, freeze an exact revision and name a bounded next scope. CR-001 movement/capture/activation and CR-002 facility eligibility/cost/hold/queues/burn/migration remain separate unresolved delta decisions. Optional existing camp capture is not approval for general burning; bridge/tunnel demolition stays deferred.

Only `evidence/SM-C05/` is authored by this G0 delivery. No C#, reference, shared schema, package, assembly, project configuration or gameplay default is changed.

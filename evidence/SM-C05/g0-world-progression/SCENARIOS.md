# C05 scenario inventory for the shared G0 candidate

Source intake: `83a0baa8a4486562c5c67144324cede402f29cf7`. CONTRACT SHA: NOT FROZEN.

These are proposed oracle/acceptance scenarios, not newly implemented or passing C# tests. Existing JS suites executed successfully only in the explicit LF disposable export; its wrapper still failed the final Windows HTML byte check. C02 owns independent fixtures and verification. C05 owns implementation effects after C00's exact freeze and named scope.

In the tables, `organization`, `regression`, `pawn_workers` and `skills` mean the corresponding `reference/js-v0.5.10/tests/*_v0510.cjs` files. Existing coverage does not prove every cross-product or newly identified edge case. Rows marked extension need a C02 fixture/review; they are not claimed to exist already.

## World and observer

| ID | Scenario and required comparison | Existing evidence / gap |
|---|---|---|
| W01 | Same seed, size 30/50/70 and each 10/9/10 organization; mirror and independent opponent; Standard versus Quick Start. Compare terrain, ordered units/IDs, final RNG, CP, initial knowledge and King grants. | organization; randomized smoke; extend exact per-action C# traces |
| W02 | Seed coercion (including zero fallback and uint32 wrap), terrain draw/neighbor order, and water repair after placement. No 1-2-cell final water remnant created by deployment. | organization/regression/randomized evidence; explicit numeric/seed cases require C03/C02 review |
| W03 | Directional sight: three Pawn rays; scaled Knight landings; Q/R base two; other base one; growth/fatigue/legacy/War Queen modifiers; cap six. | pawn_workers, skills, regression; cross-owner C04 modifiers must be traced |
| W04 | Endpoint forest/mountain visible, beyond opaque; water transparent; personal forest-piercing never sees beyond mountains; structure LOS does not inherit a garrison's forest skill. | pawn_workers, skills; add structure-versus-personal comparison |
| W05 | Twin worlds differ only in currently unseen terrain/facility changes. Known terrain, previews, UI observation and mist rendering stay equal until legitimate re-observation. Then update only newly seen cells. | regression, pawn_workers, skills; extend complete filtered event/observation equality |
| W06 | Hidden unit/changed terrain never shortens a speculative known order. Execution stops at source-defined last safe/forest square, charges CP/activation and does not blind-capture. | regression, pawn_workers, skills; compare outcome and `lastEvent`, not just position |
| W07 | Camp center plus adjacent ring; any friendly living Pawn on it, including L1, adds outer ring subject to LOS. Leaving/dying removes current sight but preserves remembered terrain. Enemy pawn and ordinary manager do not extend the owner's camp. | pawn_workers; explicit L1-versus-L4 garrison/operation distinction extension |
| W08 | Tower outer ring requires its owner's equipped Sentry Platform Pawn occupying it; leaving/unequipping/death removes bonus. Map-edge cells stay in bounds. | skills and pawn_workers |
| W09 | Repeated read-only observation/orders/offers consume no RNG or XP. Explicit actor refresh awards personal discovery and one-time contact XP; initial/actorless refresh still records knowledge without actor credit. | skills/regression plus new refresh-cause extension for C02 |
| W10 | Inclusive beacon/echo/cloak expiry; visible enemy filtering, decoy appearance and stale `lastSeen` ghosts. Do not return an invisible live unit through a memory object or debug event. | regression/skills; full observation envelope is a shared-candidate gap |

## Labor, camps and training

| ID | Scenario and required comparison | Existing evidence / gap |
|---|---|---|
| L01 | L1 forest=2, L2 bridge/tower=2, L3 mountain=3, L4 camp=3 friendly ticks, with proper underfoot/adjacent targets and level gates. Start spends normal CP/activation once; worker remains locked. | pawn_workers |
| L02 | All six work-duration modifiers; fill/tunnel skill unlocks; Road Crew/Field Survey/Site Planner only add adjacent visible targets, never unrestricted entry or remote construction. | skills |
| L03 | Two friendly workers cannot reserve one site. Current sight, expected terrain, known enemy occupier and camp/tower occupancy/duplicate-facility rules govern initial targets. Do not replace these with an indiscriminate “no unit may ever occupy a worksite” rule. | pawn_workers/skills; full friendly-occupant matrix extension |
| L04 | Worker captured/displaced or true terrain/occupancy changed during work: cancel without overwriting unrelated terrain. Distinguish worker position from target and preserve the legacy anchor fallback. | pawn_workers; extend exact cancellation outcome/log timing |
| L05 | Useful completion XP once per work kind/site/side; fill/tunnel have no WORK_XP entry. Separate construction XP from any legitimate discovery XP after completion. Rebuilding cannot farm the ledger. | pawn_workers, skills |
| L06 | King route spends unspent XP P/N/B=3/8/10 and CP; count 1, base ticks 2/3/4 plus floor(camp trained[type]/3). Compare at trained=2 and 3 and after a pawn batch increments trained by 2. | regression/pawn_workers; cross-route counter-boundary extension |
| L07 | Pawn route: stay=5, Instructor stay=4, sacrifice=2 for P count2/N count1/B count1. No King XP charge; sacrifice immediately removes operator, while stay locks it. Newborns receive fresh level-1 defaults, not veteran XP/loadout/lineage advantages. | pawn_workers, skills |
| L08 | Capacity uses living military plus every reserved batch. At 19 live, two-Pawn stay fails; sacrifice can free the operator slot. Parallel queues and optional Fission cannot overbook. Retain no camp-count cap. | pawn_workers/skills; reservation/completion ordering extension |
| L09 | Exit order is camp center then NW,N,NE,W,E,SW,S,SE. Require the full batch of empty genuinely passable cells for fresh units. A sacrificed operator leaves the center as one possible exit; a stationed teacher occupies it. Never deploy only one Pawn from a two-Pawn batch. | pawn_workers; explicit center/order and teacher occupancy extension |
| L10 | At zero ticks with too few exits or live-count cap, retain the queue/reservation and wait. Free an exit on a later tick, deploy exactly once in order, increment trained by count and release teacher/queue. | pawn_workers |
| L11 | Tick only at ending friendly turns, including the start turn. Constructor completion precedes queue exit checks on the same end turn. Opponent end turns do not decrement this queue. | pawn_workers; same-end-turn builder/exit interaction extension |
| L12 | Enemy on camp pauses before decrement; missing/wrong/displaced teacher cancels; worker removal immediately cancels linked work/queue. A sacrificed founder's dead ID does not invalidate its workerless queue. | pawn_workers; exact pause/cancel phase extension |
| L13 | Mid-project/midqueue save/load preserves position versus target, remaining/total, CP, acted, work ledger, reservation and output type/count. Legacy paid engineer queue detaches worker without another XP charge; old construction is canceled. | pawn_workers plus fixture engine_v056; C03 owns full v5-v15 matrix |
| L14 | Existing opt-in camp claim cancels old queue/teacher, resets trained counters, flips sight ownership and temporary battle echo; default off. Royal capture ends game and pending work/queues do not continue. | pawn_workers/regression; general facility burning is outside baseline |

## XP, skills and cross-owner effects

| ID | Scenario and required comparison | Existing evidence / gap |
|---|---|---|
| P01 | JS rounding of fractional gain/threshold loop, `1e-7` tolerance, devoted modifier, King multiplier/share, multi-level crossing, level 99 entry versus already 99. Compare xp, totalXp, level, HP adjustment and milestones in order. | skills/regression; explicit rounding/max-level boundary extension through C03/C02 |
| P02 | Idle turns give no XP; discovery/contact/work/shrine/capture/actual support absorption use their own ledgers and source order. Source's shrine cooldown is seven rounds; capture before objective/visibility refresh. | skills, pawn_workers, organization/regression; integrated numeric trace extension |
| P03 | Every 3rd Pawn level through 99 adds one slot/pending pick; exactly three deterministic source-order offers, family fallback and no RNG draws or rerolls. Learned, equipped and permanent choices remain separate. | skills, including all 33 milestones with family preferences |
| P04 | Learning at zero CP/after action, and while otherwise project-locked, preserves used activation/cooldowns. Unoffered/duplicate/enemy/post-victory choices reject in source order; milestones 10/25/45/70/90 remain a separate system. | skills; project-locked and exact rejection-field extension |
| P05 | Paid loadout change near living King (Chebyshev distance<=4) or shrine; the source still requires a King to exist. No automatic re-equip on load; replacing swimming/climbing cannot strand a Pawn. | skills; missing-King artificial-state edge is not ordinary play proof |
| P06 | Every one of the 36 IDs in skill-catalogue.json has exact effect coverage. Same effects across disclosure modes; route scores derive from permanent choices, not equipment; ties Mixed and fewer than 3 picks Developing. | skills; exact metadata inventory exported separately |
| P07 | Signal/guard/maneuver shared cooldown keys use absolute serial `serial+2*turns`; Ready Guard and March Drill shorten only their family clock. Lifetime/ward expiry comparisons are inclusive and saved. | skills |
| P08 | Cover/Distant Cover/Entrench protect once; no King/Queen/stacked wards; visible guard LOS. Lasting Guard changes expiry, not hit count. Support Training gives 1 base XP once per other ally only on real absorption by a living equipped source, with royal share. | skills; C04 attack order integration |
| P09 | Maneuver previews use known state; true obstruction consumes CP/activation/cooldown and can stop at origin. Relief pays both costs, consumes both activations, clears both bonuses and keeps both histories. Relief's source branch does not claim a shrine. | skills; shrine-versus-Relief extension for C02 |
| P10 | Opt-in Fission at level60 and one use/lineage: both results reset to level1 without veteran skill/protection/history advantages; newborn-safe source/destination, queued capacity and fresh ID order. It cannot create a second free action. | skills/regression; C04 behavior, C03 state, C05 reset review |
| P11 | All save versions 5-15 with actual old deployments/queues/camps; missing fog memory never reconstructed from unseen true terrain. Preserve cooldowns, draft choices, ledgers and action counters; load's final actorless refresh may update derived knowledge. | engine_v056/v058/v059 fixtures, skills/organization/pawn_workers; full migration sweep is C03/C02 work |
| P12 | Rejection canonicalization includes `lastEvent` reset after typed dispatch, preparation mutations and Maester's job/CP/activation change with a false result; successful no-displacement interruptions are distinct from rejected input. No blanket rollback/ignore-transients rule. | source action/chooseSkill/equip; C04 T09 at 3daf13b4347aad8d64d0310a66dd50b3b464a145 is a peer staged observation, not C05 execution or C02 acceptance; explicit C02 extension |

## All 36 skills: ownership review grouping

The exact descriptions and active kinds are in `skill-catalogue.json`; this grouping only identifies integration hooks.

| Hook family | Exact skill IDs |
|---|---|
| Personal/structure sight | trailcraft, flank_watch, rear_watch, forest_lore, summit_watch, long_sight, sentry_platform |
| Terrain traversal | swimming, climbing |
| Beacon actions | signal_post, far_signal, lasting_signal |
| Work duration | woodsman, bridgewright, masonry, campwright, towerwright, quarry_master |
| Work unlock | land_reclamation, tunnelcraft |
| Adjacent work targets | roadcrew, field_survey, site_planner |
| Stationed training duration | instructor |
| Protection actions | cover, distant_cover, entrench |
| Tactical maneuver | sidestep, withdraw, forced_march, diagonal_march, relief |
| Cooldown, ward lifetime and actual-support XP | ready_guard, lasting_guard, march_drill, support_training |

## Replay evidence required for any implemented slice

Each C02 fixture should identify exact source/ruleset/config/seed and initial authority state; the ordered action including rejected input; result/error/lastEvent; before/after RNG, CP, serial and side; canonical full authority state for the oracle; separate permitted observations for both sides; and any allowed event audience. Preserve IDs, queue and unit array order where it affects iteration. Do not remove nullable/transient fields merely to make equality pass.

Run cross-cutting cases for both sides, Standard/Quick Start, cap boundaries, save/load mid-action history, multiple queues/projects, currently visible/mist/black terrain and victory during pending work. Preserve failed/rejected cases and distinguish staged fixtures from ordinary-play traces. Unsupported slices must remain explicitly unsupported, not pass by omission.

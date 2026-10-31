# SM-C03 data contract candidate 1 — G0 review only

**NOT FROZEN. No production port, serializer, loader, RNG or facade is implemented.**
Prepared in session `01a191e1-3413-7c52-927d-715ec7c628fb` under activation
https://github.com/ckprincipal/chessLife/issues/1#issuecomment-6543631079.
Base/intake: `83a0baa8a4486562c5c67144324cede402f29cf7`.
Oracle engine SHA-256: `7e0253b99b339611c5e149ccf3a7e527f62d31df008bb3e7fe0145d541b89776`.
C01 publishes the single combined candidate; C02 reviews fixtures/canonicalization;
C04/C05/C06 review their interfaces; C00 alone freezes an exact revision.

## Candidate artifacts and bounds

`unity/Assets/Scripts/Core/CandidateJson.cs` supplies lossless JSON-compatible value carriers.
`CandidateContracts.cs` supplies minimal state/config/action/observation/outcome/event/RNG/envelope carriers.
They are in the explicitly provisional `StaleMate.Core.ContractCandidate` namespace.
They have no UnityEngine, packages, assembly definitions, parser, serializer, RNG algorithm,
cloner, migration pipeline, action handler or separate game loop. C01 owns shared assembly/build configuration.
The accompanying schema describes structure; executable source probes record actual behavior.
Neither freezes a wire format or implements all legacy validation.

Typed normalized state fields are projections, not a new nested save shape. Unknown fields
remain in `AdditionalFields` at every modeled object; ordered JSON members preserve unknown
subtrees. Known members must not also occur in `AdditionalFields`. No field may be silently dropped.
The future adapter must document name mapping and validation before implementation.
Carrier field defaults are allocations/CLR defaults only, not new-game or migration defaults;
an unpopulated carrier is not a valid game state. The future codec/factory must apply the exact
source defaults and invariants rather than relying on these zero/null initial values.

| Candidate data | Exact baseline wire mapping |
|---|---|
| GameState scalar members | version, ruleset, build, n, seed, rng, nextId, side, ap, round, serial, winner |
| GameState collections | terrain, shrines, units, camps, towers, wildlife, beacons, decoys, battleEcho, workAwards, usedFissionLineages, log, lastEvent |
| GameState.White / Black | players.w / players.b; no white/black wire renaming |
| GameState.Settings | Flat root armyW/B, routeW/B, commandMode, campCaptureMode, deployment, combatMode, hpMode, fissionEnabled, startingCamp, routeDisclosure, skillSystemVersion; no nested settings key |
| UnitState | id, side, type, pos, alive, level, xp, totalXp, acted, bonus, project, learnedSkills, equippedSkills, skillChoices, skillCooldowns |
| PlayerState | seen, sight, terrainMemory, lastSeen, firstSeenUnits, shrineClaim; bank/ai/surgeUsed and unknowns retained separately |
| StructureState | side, pos, queue; trained/starter/other source members retained separately |
| GameAction.Fields | Entire original action object; preserve absent/null and unknown commands for source-equivalent rejection |
| ActionOutcome | Exact ok plus error presence; additional source result members retained. New events are adapter metadata, not baseline state |
| SaveEnvelope | Proposed envelopeVersion/baselineIntakeSha/contractRevision/rulesetId/state. Legacy JS imports remain direct state objects |

Reference anchors below are at this intake's `reference/js-v0.5.10/prototype/engine.js`.
Actual archived fixtures are `tests/fixtures/engine_v056.cjs`, `engine_v058.cjs`, `engine_v059.cjs`.

## Numbers, IDs, ordering and nullability

All JS Number data uses IEEE-754 binary64 (`double`), including XP, ID, position, round,
serial and activation stamps. Board `n` is the validated integer 30/50/70. Do not narrow
IDs to int, stringify them, compact dead records, renumber nextId, or sort unit arrays.
Actual generated IDs are increasing numbers; strict `===` lookup and first-match list order
matter (`byId`, `at`, `withSide`, lines 195–201). Malformed/non-numeric identity admission
is an explicit compatibility question, not permission to silently coerce it.

Use JS Number arithmetic and operation order. `Math.round` ties toward positive infinity,
including negative-zero results in [-0.5,0), rather than .NET's default banker rounding.
XP applies `Math.round(x*100)/100` exactly where source does (lines 216–231); do not replace
binary64 with decimal or globally round every field. HP uses source floor/sqrt order.
Large, negative, non-finite and fractional seed behavior is recorded in `source-probes.json`.

`create` applies `Number(options.seed) >>> 0`, then falls back to 43971 if zero (line 594).
ToUint32 maps non-finite/zero to zero, truncates toward zero, reduces modulo 2^32, and makes
the result nonnegative. Loaded `rng` is retained as a Number until the next source draw,
which applies ToUint32. `RngState.Value` is the resulting cursor, not an extra saved field.

For the source `rnum` (line 190), the proposed future port must perform this exact bit pattern
under explicit unchecked 32-bit arithmetic, logical right shifts, and division by 2^32:

```text
t = unchecked(ToUint32(rng) + 0x6D2B79F5); rng = t
z = unchecked((t XOR (t >>> 15)) * (t OR 1))
z = z XOR unchecked(z + unchecked((z XOR (z >>> 7)) * (z OR 61)))
numerator = ToUint32(z XOR (z >>> 14))
result = numerator / 4294967296.0
```

The signed Math.imul return is represented by the same low 32 bits. `rint` is floor(draw*n).
Do not use System.Random, change RNG calls/draw order, or save an invented draw count.
The five-by-five vectors are extracted from the exact source function; they are C03 proposals
for C02 review, not an independently accepted replay oracle.

Runtime arrays preserve insertion order, including dead units, queues, skills, offers and logs.
JS object enumeration places canonical array-index keys in numeric order, then other strings
in insertion order. For example, keys `10,2,01,x` enumerate `2,10,01,x`.
Do not replace lastSeen/object iteration with an arbitrary .NET dictionary order.
The probe's sorted-key state hash is only a C03 comparison aid; C02 owns the final canonicalization.
It keeps array order and every state field; it never removes fog or transient state.

Missing, explicit null, false, zero and empty containers are distinct. `JsonField.Present=false`
represents an absent member; present `NullData` is JSON null; present C# null is invalid.
UndefinedData is in-memory only: JSON.stringify omits object members, writes array undefined
as null, writes non-finite Numbers as null, and serializes -0 as 0. A JSON parser never creates
UndefinedData. Preserve unknown keys/values; no default omission based merely on C# zero values.
The proposed legacy writer uses exact source key names and JSON.stringify number/string
semantics (shortest round-tripping JS Number spelling, UTF-8 output, no Unicode normalization).
Object/array order follows the rules above. C02 must review the concrete canonical comparison
format before any C# writer exists; the current sorted-key JS hashes are not that freeze.

## State, observation and events

The complete authoritative snapshot includes true terrain, both players' seen/sight/memory,
lastSeen/firstSeenUnits/shrineClaim, live/dead units, wildlife, structures and queue payloads.
Observer output is a different carrier and exposes no raw GameState or enemy AdditionalFields.
Each cell contains Unexplored/Remembered/Visible and `rememberedTerrain` (line 608): unknown -1,
mist memory, or current visible truth. An invisible terrain/facility change must not refresh memory.

Visible units use `canObserveUnit`, including cloak/battle-echo detection (lines 711–716).
Apparent decoys need not have a real ID (`apparentEnemy`, line 1082). Ghosts come from remembered
lastSeen, skip currently sighted cells, and expire after ten rounds (`liveGhosts`, line 1140).
Do not remove a remembered enemy because omniscient state knows it died elsewhere.
Structure/queue visibility and the visible unit-field whitelist require C05/C06 review;
they are not permission to copy enemy internals into an observation.
Orders come from observer-safe `orders`/skill target queries, not omniscient `moves`.

No general event stream exists in the JS result. New GameEvent names/payload visibility are
provisional C01/C04/C05/C06 adapter hooks; they must follow source mutation order and identify
eligible observers. Preserve source `lastEvent` and `log` in state. Do not expose every global
log string or raw authoritative diff to an ordinary observer.

## Action results, turn phases, cloning and replay

Source action names: end, chooseSkill, milestone, build, work (retired/rejected), useSkill,
move, fission, rest, summon, trainCamp, claimCamp, train, maester, bond, queen, watch, equip.
Payload keys include type, unitId, to, piece, mode, project, skill, replace, choice, job,
ability and targetId. Keep exact strings/case and absence; unknown actions reach source rejection.
There is no generic extra capture verb or new freeKing/burn action in this baseline.

`action` returns `{ok:true}` or `{ok:false,error:string}` (lines 1046–1079).
**Ok=false does not imply unchanged state.** The function resets lastEvent after its first guards,
before unit lookup; some skill validation calls prepareSkills before rejecting.
At this source revision the maester switch branch mutates job/acted/ap/log but leaves the default
error string, returning `{ok:false,error:'Unknown action type.'}`. The probe preserves it and
requests C04/C02 review as a separately tracked baseline finding; no repair is included.
Malformed/finished/null requests can return before lastEvent reset. Do not implement a universal
rollback or normalize all rejections into a no-op.

End-turn ordering (lines 1034–1044): if no winner, tick builders, tick training for the departing
side, clear that side's bonuses, switch side, increment serial, increment round on White,
compute entering CP, credit existing shrine gold, prune beacons/decoys/battleEcho, propagate Queen
grief fatigue, refresh both observations, prepend log. C04/C05 must own each mutation exactly once;
C01 composes those hooks. This candidate introduces no competing turn loop.

CloneRaw must deeply copy every field/subtree and preserve order, numeric values, presence,
activation stamps, RNG, projects, queues, transient skills, memory and unknowns. It must not call
load, refreshBoth or prepareSkills. The current fixed-action replay probe uses canonical
JSON-compatible source states, for which JSON.parse(dump(g)) is sufficient; this is not proof
for arbitrary undefined/non-finite in-memory graphs. Future C# clone tests must cover those separately.

LegacyLoad is distinct: it parses/normalizes/migrates and calls refreshBoth, potentially changing
sight/memory/firstSeen maps. `load(object)` mutates its argument and can mutate before throwing;
`load(string)` owns its parsed graph. C01 must decide whether the C# public API accepts strings
only or explicitly exposes this object-alias behavior. Do not mask recomputed fog fields in parity.
Replay must name source/contract/ruleset/config/seed and compare each action, outcome, complete
state and per-side observation. AI choice may itself draw RNG before action: capture pre/post
AI-choice cursor or replay fixed actions rather than accidentally drawing twice.

## v5–v15 normalization and migration

The loader is a single version-aware normalizer, not a fabricated v5->v6->... chain.
Admission requires version in 5..15, ruleset command-camp, units array, numeric n 30/50/70,
terrain length n*n; both players require seen arrays length n*n (lines 1149–1157).
The schema adds descriptive object structure for well-formed saves; additional runtime length,
shape/error behavior remains source-driven. It is not a replacement for the JS loader.

| Condition/order | Exact required behavior |
|---|---|
| All accepted versions | Nullish defaults for camps/towers/workAwards/wildlife/beacons/decoys/usedFissionLineages; commandMode original, campCaptureMode off, deployment spread, battleEcho [] if nullish; normalize combatMode/hpMode/fissionEnabled |
| Per player | Repair missing/wrong sight length to zeros. Missing/wrong memory length: unseen -> -1, currently sighted -> true terrain, mist -> PLAIN; set migratedFogMemory. Never reconstruct unseen memory from truth |
| Per unit | Relocate a V's differing project worksite before later retirement (even before checking alive). Nullish project/pending choices/discount/vision/history/bonus/acted/ninja defaults; finite HP fallback; pips clamp to source 1..3; lineage default; prepareSkills preserves chosen learned/equipped semantics |
| All versions, alive V only | Retire living engineers and cancel their project. Keep dead record/ID. Already dead V is not blanket-retired/canceled again. Queues referencing V, alive or dead, get workerId null, nullish kind legacy/mode xp, migratedEngineerToRoyal true; remaining/total/started and paid XP are retained |
| All versions | Infer startingCamp from explicit ready/none or starter flags; normalize version=15, army identifiers (fallback balanced/expedition), skillSystemVersion=1, routeDisclosure, build string |
| previous <15 / <14 / <13 / <12 / <11 | Add the exact version-specific log entries in source order; **do not grant new rosters or remove existing camps** |
| previous <10 | Nullish queue kind legacy/mode xp/count 1; add its rule-change log; preserve remaining CP and acted stamps |
| Final | refreshBoth with no actor; no migration XP grant; preserve unknown fields and action-relevant state |

Existing rosters, camp counts, training reservations, zero-tick blocked queues, worker locks,
CP already spent and used activations are save state, never replaced by new-game defaults.
Include hp/pips/fission flags and lineage/ward/bond/choice/loadout/cooldown/support-award fields.
The minimal DTOs preserve these in AdditionalFields until reviewed typed expansions are needed.

`source-probes.json` contains an explicitly **synthetic** 5..15 version matrix and seven cases
from three actual archived engines. Synthetic labels are not real v5–v12 archive coverage.
The archived v0.5.8 cases preserve the original 8/7/6 organizations and ready camps;
the actual archived v0.5.9 fixture also has 8/7/6 armies and retains its no-camp Standard;
do not substitute a release-description roster for those fixture bytes. v0.5.6 exercises engineer retirement
and paid-queue reassignment. These are staged migration tests, not BUG-001 ordinary-play evidence.
Only schemas 11, 13 and 14 come from actual old engine fixtures here; v5–v10 and v12
remain synthetic-only test provenance, not authentic historical save coverage.
C02 must supply/identify them before broader historical coverage is claimed.

## Review requests and pending decisions

1. C01: review typed projections plus lossless unknown-field/presence carriers, flat wire mapping,
   object-vs-string loading, envelope metadata, assembly ownership and concrete public codec API.
2. C02: independently review/replace the source vectors, replay hash canonicalization, schema
   admission and historical coverage. Add C# parity only after implementation is authorized.
3. C04: review full action payload vocabulary, mutation-on-error/maester finding, CP/activation
   stamps and turn order. Preserve baseline outcomes pending any separately authorized bug task.
4. C05/C06: review observation whitelist, remembered structures/queues, callback order and visible
   event payloads. No hidden truth in a preview or rejection reason beyond legitimate execution.
5. C00: keep King free-move activation/capture and facility occupation/cost/queue/save semantics
   unresolved until explicit decisions. This candidate adds none of their counters or action rules.

Shared Windows checkout/bundler remedies remain C01's lane. C03 source integrity is established
from pinned Git bytes; the unmodified overall wrapper still FAILs on Windows output newlines.
No source test pass is a Unity compile, independent C02 acceptance or contract freeze.

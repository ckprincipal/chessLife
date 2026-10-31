# Single shared-contract candidate — G0 working draft

**INCOMPLETE / NOT FREEZE-READY. CONTRACT SHA NOT FROZEN. Production HOLD.**
This is C01's one integration draft. It records sourced constraints and pending inputs, without substituting C01's own data model for C03's proposal.
The candidate revision is the exact containing commit named in C01's mailbox receipt; it does not replace intake `83a0baa8a4486562c5c67144324cede402f29cf7`.
C00 alone can freeze it after the required proposal/reviews and decisions.

## Input provenance and review state

| Input | Exact source/revision | Current state |
|---|---|---|
| C00 authority | [6543631079](https://github.com/ckprincipal/chessLife/issues/1#issuecomment-6543631079) | G0 only; no production or contract freeze |
| Frozen behavior | Intake `83a0baa8a4486562c5c67144324cede402f29cf7`, reference `engine.js`/`app.js` and old fixtures | Source identities verified; native Windows build portability findings retained separately |
| C03 data/action/observation/outcome/RNG/save types | `c2806a2bdf3a888567a694cdd3d05a5e62f7bb35`, [PR #8](https://github.com/ckprincipal/chessLife/pull/8), [delivery 6543984967](https://github.com/ckprincipal/chessLife/issues/1#issuecomment-6543984967) | Exact proposal and carrier/schema files read; included by dependency pin; no merge or acceptance |
| C02 replay/canonicalization | Not yet submitted to C01 with an exact schema revision | Required; first intake receipt is not schema approval |
| C04 tactics/AI ordering | `3daf13b4347aad8d64d0310a66dd50b3b464a145`, `evidence/SM-C04/G0_TACTICAL_REVIEW.md` | Exact proposal read and incorporated; exact-candidate review still pending |
| C05 world/work/training/progression | Source-backed hooks and candidate review pending | Required; byte diagnosis is not a world contract |
| C06 presentation/environment | `d292b03fb23e6f0f5b913fe15755faf427dc4134`, `evidence/SM-C06/2026-10-31-g0-presentation-review.md` | Read and incorporated as a proposal input; not a review/ACK of this candidate |
| C01 assembly/CI | [Assembly/CI/ownership plan](assembly-ci-ownership-plan.md) in this revision | Proposed dependencies, ownership and actual build limits |

No peer ACK, data type name, schema revision, or acceptance is inferred from a receipt or this table.

## C03 data proposal incorporated by exact dependency

The candidate manifest binds C03's two carrier files, their associated metadata, proposal, descriptive save schema,
source probes and carrier-compile receipt at the exact revision above. This branch does not cherry-pick unaccepted owner code.
The single candidate is this reviewed integration document plus its exact dependency pins, not a second C01-authored type model.

- Proposed namespace: `StaleMate.Core.ContractCandidate`; minimal `GameConfig`, `GameState`, `UnitState`, `PlayerState`, `StructureState`,
  `GameAction`, `PlayerObservation`, `ActionOutcome`, `GameEvent`, `RngState` and `SaveEnvelope` carriers. No parser, codec, RNG algorithm or game loop is supplied.
- `CandidateJson.cs` models ordered object members, arrays, binary64 numbers, undefined/null and presence. `JsonField.Present=false`
  differs from present `NullData`. C# null is not an alternate JSON-null representation. Source `JSON.stringify` rules still govern future encoding.
- Typed state fields project exact flat JS keys. `Settings` maps to root options, White/Black map to `players.w/b`, and all unknown or
  not-yet-typed fields remain in `AdditionalFields`. The future codec must reject duplicate modeled/additional keys and preserve order/unknown subtrees.
- Numbers/IDs/positions/clocks use JS binary64 semantics except validated board size and the explicit ToUint32 RNG cursor. No ID renumbering,
  dead-record compaction, arbitrary dictionary sorting, decimal XP arithmetic or invented RNG draw counter.
- `CloneRaw` is distinct from `LegacyLoad`: cloning must not refresh sight, normalize skills or migrate; source object loading mutates its input
  and can partially mutate before throwing. C01 proposes a string-only public legacy import into a detached owned graph; object-alias compatibility remains for C03/C02 review.
- C03's descriptive schema admits well-formed v5–v15 state and a proposed future envelope. It is not the source loader's complete validation contract.
  Actual archived-engine coverage is schemas 11/13/14; other historical versions are synthetic-only evidence at this stage.
- Carrier defaults are CLR allocations/zeros, not a valid new game. C03's successful direct Roslyn carrier compile is inherited evidence only;
  no Unity compile, gameplay parity or complete serialization is inferred.

C01 review issues for C03/C06: observers must be detached from authoritative collections/unknown fields, even though the provisional carriers have mutable public fields;
decide readonly public access versus detached mutable snapshots explicitly. Freeze an observation whitelist and safe event/queue descriptors before any adapter copies fields.
C02 must settle canonical number encoding, malformed-load scope and complete-state/observation comparisons rather than inheriting C03's sorted-key probe hash as accepted.

## Proposed facade boundary to review with C03/C02

One C01 Runtime facade composes the accepted pure modules. Conceptual capabilities below are requirements/questions, not implemented method signatures:

| Capability | Boundary and pending decisions |
|---|---|
| Create / import / export | Configuration plus explicit source/ruleset/save identity; use actual v15 and v5–v14 source migration semantics, retaining deployments/queues/action state; error and ownership semantics from C03 |
| Observe a side | Immutable observer projection, not `GameState` or raw engine helpers; C05 filters terrain memory/visibility and C04/C05 preserve Phantom/decoy behavior; C02 specifies per-step evidence |
| Query orders / inspect | Knowledge-based targets, permitted costs/disabled reasons and observer-safe own action/queue/skill descriptors; no hidden true blocker scan in UI |
| Submit action | C03 action envelope into one dispatch; C04 validation and C05 world/progression effects follow exact source ordering; no optimistic UI authority mutation |
| End turn | Preserve the exact builder/training/bonus/side/serial/round/CP/temporary-state/sight order, then supply the permitted result/observation |
| Choose AI action | Explicit stateful operation where the source consumes RNG; C02/C03/C04 must decide its replay boundary and preserve draw/order behavior |
| Receive result / refresh | Accepted/rejected result plus permitted events/reasons and a fresh observer projection; rejection does not imply universal rollback |

C03 has supplied provisional types and nullable/absent, numeric, cloning and serialization semantics; the exact revision is bound above.
C02 must supply stable replay operation encoding, canonicalization, retained fields, RNG-state treatment, output/observation comparisons and supported/unsupported scope.
This draft does not choose those details on their behalf.

## Source-backed invariants and questions

1. **Authority and observation:** never provide presentation a full enemy list, current hidden terrain, raw hidden event log or private enemy queues.
   Distinguish current sight, remembered terrain, unknown cells, observed entities, ghosts and decoys. Review the exact allowed objective/queue details;
   do not automatically expose every field returned by an omniscient source helper.
2. **Rejections and phase order:** `engine.js:1046` clears `lastEvent` before several rejected requests. Capture/order/work helpers can have source-specific effects.
   C04/C05/C02 must review mutation and refresh behavior per path; do not implement universal transactional rollback or assume all action paths use the same guards.
   `endTurn` at `:1034` ticks builders then training before side/serial/round/CP updates and final refresh/logging.
   C04 independently staged the Maester branch returning `ok:false` after job/CP/activation mutation. Retain the raw baseline outcome unless C00 authorizes
   a separately versioned repair; C02 triage is pending. Do not make refresh unconditional: sight refresh can award XP and its call sites differ by protection branch.
3. **Freshness and input:** C06 requests enough observation/serial metadata to invalidate stale target previews and pending confirmations.
   UI double-click suppression and correlation stay presentation state. Whether a facade rejects stale requests and how that relates to source/replay/save semantics
   needs explicit C03/C02 review; no new gameplay rule is silently added here.
   A fresh observer projection reads the stored source sight/memory; it must not itself call effectful `refreshBoth` or award discovery XP.
4. **Save and deterministic replay:** preserve true state, remembered state, RNG and draw order, stable IDs/iteration, action-relevant transients,
   queues/reservations, used activations/bonuses, skill offers/loadouts/cooldowns and numeric edge behavior. Do not strip fields merely to make a C# comparison pass.
5. **Queue semantics:** C05 owns work/training effects and C04 action eligibility. A sacrifice removes the operator immediately and schedules a two-friendly-tick batch;
   two-Pawn output needs two legal placements from `spawnAtCamp`'s actual order, which includes an unoccupied camp tile before neighbors (`engine.js:519`).
   C06 must retain camp/queue feedback when selection of the sacrificed Pawn disappears. Safe disclosure after unseen facility changes requires review.
6. **Presentation handover:** consume only observer DTOs; clear side-specific selection, tooltip/minimap caches, target modes and pending confirmation during handover.
   The historical viewer's white-only full-state DTO, static fixture and raw tile inspection cannot become the live observation contract.
7. **Baseline versus deltas:** keep current rosters, no-camp Standard, deliberate two-worker inefficiency, no independent engineer and no new camp cap.
   CR-001 free-King movement versus command activation/capture price, and CR-002 facility eligibility/cost/occupation/queue/migration policies remain C00 decisions.
   No new fields or semantics for those changes are frozen here. BUG-001 stays OPEN / UNREPRODUCED.

## Review checklist and next request

- C03: review the integration of the submitted exact revision, the proposed string-only public import and observer detachment; identify remaining provisional fields/interfaces and confirm v15/v5–v14, numeric/uint32 and absent/null/transient semantics.
- C02: submit the exact replay schema and canonicalization review; identify source operations that consume RNG or mutate state outside an accepted action.
- C04: review tactical guards/effects/order, invalid actions, CP/activation, hidden blockers, King victory and AI against this exact candidate revision.
- C05: review observer boundaries and ordered world/work/training/progression hooks, capacity/reservations/placements and fog-safe queue feedback.
- C06: review the concrete C03-backed adapter/result/observation shape once available; report an actual Editor receipt or the precise environment blocker.

These are requests to the existing assigned owners through C00, not reassignments or presumed completion.
After incorporating the actual inputs and resolving disagreements, C01 publishes a revised exact candidate for C00 review.
Freeze, implementer ACKs and the named G1 scope remain separate later records.

# C05 review of the single C01 working draft 8ec6723

Exact reviewed revision: `8ec67237d3132869c5fb6602e88fd9b990cd2785`, [delivery/review request 6544040760](https://github.com/ckprincipal/chessLife/issues/1#issuecomment-6544040760), draft PR #9.

Read without merging: `docs/contracts/shared-contract-candidate.md`, `candidate-dependencies.json` and `assembly-ci-ownership-plan.md`. Intake remains `83a0baa8a4486562c5c67144324cede402f29cf7`. This is C05's requested exact-candidate interface review. It is not a freeze/contract ACK, C01 runtime acceptance, independent C02 certification or approval to apply the root-verifier patch. CONTRACT SHA: **NOT FROZEN**; production HOLD.

Disposition: the traced turn/rejection/observation invariants are aligned. **Revise and retain INCOMPLETE / NOT FREEZE-READY** until the missing C05 dependency/hooks, concrete observation payloads and C02 oracle schema are incorporated and reviewed.

## Aligned portions

The draft correctly distinguishes the exact intake from its containing candidate revision, incorporates C03 by explicit pin, leaves C02/C05 input pending honestly, and does not claim owner ACKs. It retains one facade, pure assemblies, stable JS numeric/order/identity/presence semantics, raw clone versus load, knowledge-based orders, stateful AI choice, source-specific rejection/guard refresh and the exact outgoing builder-before-training turn sequence.

The proposal also correctly says a fresh observation reads stored sight/memory rather than invoking `refreshBoth`; rejects a universal failure rollback; keeps camp center in the batch placement list; separates original 8/7/6 viewer checks from current 10/9/10 gameplay; and holds King/facility deltas for C00 decisions. These conclusions are supported by C05's source tracing and the cited C03/C04/C06 component reviews.

## Revision requests

| ID | Exact part needing revision | Required C05 input |
|---|---|---|
| C05-I01 | Dependency table and `inputs.C05.sha=null` | Bind the containing C05 evidence revision from this delivery, including G0_REVIEW.md, C03_CANDIDATE_REVIEW.md, SCENARIOS.md, BUG001_SOURCE_TRACE.md and exact metadata/source pins. Replace “world proposal pending” only after reading the actual files; record this as review of **8ec6723**, not an ACK of a future revision. |
| C05-I02 | Dependency sequence stages 1/2 versus later stage5 XP | Add the basic XP/level/unit-preparation dependency to the first world/fog slice. `refreshSight` already awards discovery/contact XP and can create level, slot and milestone state. The full skill subsystem can remain stage3, but a placeholder XP implementation would corrupt per-action state parity in stage1. C00 must name the supported slice explicitly; do not mark unsupported progression paths passed. |
| C05-I03 | Pure assembly edges and effect callback contract | World and Progression both depend only on Core in this registry. Publish the Core-owned callback/access convention that permits World refresh and work completion to synchronously award exact Progression XP without a World<->Progression assembly cycle. C01 composes one implementation. Preserve the source's immediate side effects and actor attribution rather than collecting unordered/deferred XP events from stale snapshots. The C05 hook table supplies discussion boundaries, not final API names. |
| C05-I04 | World/work/queue hook details | Freeze inputs/mutation authority for known-terrain/occupant reads, explicit refresh causes, build-target query versus complete action eligibility, begin-build/royal-training/pawn-training payment, synchronous removal cleanup, once-per-friendly-end builder and queue ticks, ordered full-batch deployment and save projection. Exactly one owner commits each CP/activation effect. Keep camp garrison sight independent of L4 training eligibility, `workerPos` distinct from target, zero-tick waiting queues and current reserved capacity. |
| C05-I05 | C03-backed observation/action/result payloads | Resolve C05-R01..R08 in C03_CANDIDATE_REVIEW.md: explicit visible field lists/JSON shapes, detached data, optional queue/project presence, known object accessors and action-specific descriptors; no raw AdditionalFields passthrough. Player terrain memory has no facility-owner memory map. Do not label current camp ownership as remembered or disclose hidden exit-blocker identity. The later unseen-burn/own-queue disclosure question remains explicit. |
| C05-I06 | Ordered action effects and comparison surface | The current high-level invariants are right; pin the per-path refresh/XP/cleanup points from G0_REVIEW.md and C04's exact trace. A generic final refresh or rollback on false outcome changes the oracle. Preserve Relief's source branch without a shrine claim, protection-support XP only on absorption, raw false-with-mutation Maester outcome pending C02/C00 triage, and typed-dispatch lastEvent clearing. |
| C05-I07 | Replay and acceptance inventory | Incorporate the 36 W/L/P scenario entries as requirements, not as new passing tests. C02 must still bind its schema/canonicalization and compare complete per-action authority plus permitted observations, including queue reservations, ledgers, serial/round expiries, actor causes and stable placements. Keep staged and authentic historical migration provenance explicit; genuine archived schemas here are 11/13/14. |

## Source details the next combined revision must retain

- Sight refresh is a state-changing ordered operation. Actorless refresh can record contacts and consume first-contact opportunities even without awarding actor XP. Reading an observation must not introduce a refresh.
- Basic camp sight expands with any friendly laborer on the tile, including a Pawn below L4; L4 gates production. Structure sight uses its own non-forest-piercing LOS path.
- Royal training and pawn batches are distinct. Royal P/N/B prices are 3/8/10 unspent King XP and durations2/3/4 plus floor(trained[type]/3); pawn stay/sacrifice uses fixed output2/1/1 and clocks5(or Instructor4)/2, without extra King XP. Pawn graduates increment trained counters by the batch count, affecting later royal training.
- An ending-side builder can free an exit before that side's training checks it on the same end turn. Deploy center first, then KING neighbor order, atomically for the whole batch; newborns use fresh passability and outgoing-serial acted stamps. A dead founder with null worker is a valid sacrifice queue.
- XP primitive order and rounding, anti-farming ledgers, deterministic catalogue offers without RNG, shared skill cooldown keys and exact state/default presence are part of the state comparison, not optional UI bookkeeping.

## Portability proposal boundary

C05's executed diagnosis independently supports the two underlying causes: checkout CRLF and original-builder CRLF. C01's draft now also records the UTF-8 environment requirement. C05 has read the integration plan's proposed generated-artifact treatment; this review **does not** claim to have run/accepted C01's normalizer, patch or proposal harness. C02/C00 retain independent review/application decisions. C05's own original-wrapper runs remain overall FAIL, with successful child scope kept separate. No shared configuration or reference bytes were changed in this role branch.

## Next handoff

C01 should revise the same single candidate after incorporating this exact C05 revision and C02's submitted oracle schema. C03/C04/C05/C06 then review the revised exact candidate as required by C00; review of 8ec6723 does not silently transfer to it. C00 alone freezes an exact reviewed revision, requests implementer ACKs and opens a named next scope. The existing C05 session is available for that bounded follow-up; no automatic polling or phase advancement is established.

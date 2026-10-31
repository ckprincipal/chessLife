# Acceptance gates and evidence

## Source-publication prerequisite

Recover the canonical source tree, verify the original inputs and clean checkout, and record one exact intake SHA.
C00 then issues an exact-SHA G0 intake activation in the mailbox. The partial launch base `7c0b113807b154902de284c6650c61d9e047a583`,
a written prompt or a launched local session does not satisfy this prerequisite. Until activation, follow the bounded preparation/HOLD decision.
Source publication and G0 intake activation do not themselves freeze a contract or authorize production implementations.

## G0 — Intake, contracts and environments

- C01 verifies repository intake and source manifests; establishes PR/ownership/CI plan without changing gameplay.
- C02 independently reruns JS, defines canonical replay/oracle schema, confirms sampled output is from the frozen source, and starts BUG-001.
- C03 proposes pure-C# `GameState`, config, actions, observations, outcome/events, RNG and save envelope. Names are proposals, not existing APIs.
- C04/C05/C06 review legality/execution/turn effects/observation contracts. C06 supplies a real Editor import/compile result or precise blocker.
- C00 freezes an exact contract revision only after the relevant reviews; agents ACK that revision before production module implementations. The C00 freeze/gate decision names the bounded next implementation scope.

Contract must define: uint32 RNG/JS numeric equivalence; stable IDs/iteration order; action atomicity and rejection; events/XP order;
end-turn phase hooks; true state vs observer/memory; invalid actions; cloning/replay; legacy saves; baseline vs future ruleset identifiers.
UnityEngine must not be required in pure rules. Presentation cannot mutate authority. One composed facade, not six separate game loops.

## G1 — Small playable baseline slice
Same-seed setup for three modes/30,50,70 boards; current rosters; no-camp Standard and Quick Start; filtered fog/terrain; legal move
previews and hidden-blocker resolution; CP/turns/one activation; classic attacks and King-capture end; real hot-seat Unity interactions.
C02 compares legal orders, outcomes, state and observations after each traced action; not only final board screenshots.
C06 proves actual C# calls and compilation, not a replay of stale opening JSON.

## G2 — Baseline functional parity
Labor, camps/towers, queues/ticks/exits/unit caps, King XP, all 36 pawn skills/offers/loadouts/cooldowns, save import v5–v15 and roundtrip,
AI legality and actual optional modes. Track each subsystem as pass/fail/blocked/not-implemented; don't label a default-only slice full parity.
Include all three organizations, both sides, seeded random/adversarial traces, hidden terrain mutation, phantom probing, blocked armies,
King captured during queues, temporary skill state, schema migration, and action budget invariants.
Catalogue completion is distinct from implemented non-pawn skill infrastructure. No human fun/balance claims from mechanical tests.

## G3 — Approved post-baseline changes
BUG-001 reproduction and specific repair or honestly unresolved status, CR-001 free King movement, CR-002 facilities and UI-001 feedback.
Use separately versioned expected outputs. Unaffected baseline mechanics continue to pass; explicitly report intended differences.
C00 decides pending move/command/capture, cost, hold, queue and migration semantics before implementation.

## G4 — Build/release candidate
Real Editor and Test Runner logs on named Editor version; real platform build artifacts and launch/smoke checks for each claimed target.
First practical acceptance: desktop playable build (Windows preferred for user testing). Mac/Android/web/iOS are separate explicit receipts;
missing SDK/hardware/licensing is BLOCKED or NOT RUN, never passed. No console claim from an ordinary desktop build.
Keep the JS fallback usable. Unity starter version pin is an INPUT, not proof of Editor availability or compatibility.

## Receipt requirements
For each delivery: exact branch/base/HEAD and dependency SHAs; diff/owned paths; exact commands and exit codes; test source plus console
or JUnit/logs; screenshot/build artifacts where relevant; reproducible scenario; limitations; unsupported paths; known regression/failures.
Persist compact evidence under `evidence/SM-C0N/`. Do not commit credentials, Unity license tokens, caches, Library/Temp/obj, or large build outputs.
Publish build outputs as appropriate release/CI artifacts when authorized and link exact run/commit, not an untraceable filename.

C02 must verify the exact integration candidate, not just each branch alone. C01 cannot certify its own assembly by inheriting other
agents' counts. C00 acceptance names the exact SHA and supported scope. A source-code delivery without actual Unity compile evidence
cannot be accepted as a playable Unity implementation.

## Verification provenance and current intake evidence

S1's handoff rerun of the unmodified v0.5.10 package recorded 173 focused Node checks, 132 Chromium checks and 8,412 randomized actions
on 60 seeded maps, plus a byte-identical standalone rebuild with SHA-256
`f0124c3798def328136093afa471a5eff4e2a5c68578809f21c5b0ab7e079297`.
Those historical receipts remain in `evidence/SM-C00/s1-handoff/`. They are not newly executed S2 or independent C02 results.

The current recovery verified all 32 bundle manifest entries, all 33 original JS manifest entries and all 9 original Unity manifest entries
before preparing the clean source subset. Exact input hashes, included paths and five omitted generated screenshots are recorded in `PROVENANCE.json`.
The original screenshot-inclusive manifest stays unchanged; use the clean-import verifier for this checkout.

The C00 source-recovery receipt uses `python tools/verify_baseline.py --test --starter --log-dir evidence/intake/c00-source-recovery`.
For a new intake rerun, use your owned `evidence/SM-C0N/<unique-run>/` directory instead; preserve the recorded C00 and peer receipts.
`--test` checks the immutable JS and runs Node suites and standalone generation in a disposable copy.
`--starter` checks original viewer files and fixture/schema data only: it is intake-specific, not a freeze of later authorized Unity files or an Editor compile.
The optional `--browser` flag with `--test` runs the original browser scripts in a disposable copy and requires Python Playwright plus
`CHROMIUM_PATH` or an installed Playwright browser. Missing dependencies are **NOT RUN**, not a pass.

Read the actual JSON/stdout receipts under `evidence/intake/` for the current run's scope and limitations.
No Unity Editor or platform compilation is asserted by source integrity, JS tests or viewer fixture validation.

# Stale-Mate — Unity Implementation Dispatch R1
**Prepared:** 2026-10-31  
**Status:** Proposed work orders ONLY. No Codex assignments activated; no GitHub modification by this dispatch.  
**Authoritative gameplay implementation:** Stale-Mate v0.5.10 JavaScript Source ZIP (bundled).  
**Unity starter:** v0.1, based on *obsolete* v0.5.8 opening fixtures, viewer only. Treat as UI scaffolding, not gameplay parity.

## Read before starting

1. Unzip `INPUT_Stale-Mate_v0.5.10_Source.zip` and read `README_FIRST.md`, `CURRENT_HANDOFF.md`, `DECISIONS_AND_OPEN_QUESTIONS.md`, `SKILL_CATALOGUE.md`. Inspect `prototype/engine.js` and `prototype/app.js`; do not implement from historical v0.5.8 Unity docs alone.
2. Unzip `INPUT_Unity_Starter_v0.1.zip`. Confirm it is not a functioning C# gameplay port. It contains `Assets/Scripts/StaleMateBootstrap.cs` (opening viewer) and `Assets/Resources/openings_v058.json` (obsolete data).
3. Verify SHA-256 of both bundled inputs against `INPUT_SHA256SUMS.txt`. Run the original JS tests before converting anything: `python tools/run_release_tests.py` and `python tools/verify_sha256.py` from the unpacked JS source folder. `run_release_tests.py` requires Node, Python, Playwright and Chromium. Report missing dependencies honestly; run available Node suites regardless.
4. Check live repo `https://github.com/ckprincipal/chessLife`; as of dispatch, `main=aaea2f3b26f421923f98e967e027b0fcd5aff0ef` and PRs #3/#4 were historical drafts; the JS v0.5.10 is **not in the repo**. Do not merge old drafts as a substitute for importing the new baseline. Preserve `baseline/v04-golden`.
5. Decide privately/publicly hosted repository with owner before importing unreleased game source: any branch in a public repository is public. No credentials/secrets or unrelated private context in public issues.

## Non-negotiable v0.5.10 functional contract

- **New game, Standard:** ZERO starting training camps (optional `startingCamp=ready` Quick Start creates one each side). No independent invulnerable engineer. Pawns are capturable scouts, fighters and level-gated workers.
- **Starting rosters (new games only):** Traditional (default) K1 Q1 R2 N2 B2 P2 = 10; Middle K1 N2 P6 = 9; Flatten K1 P9 = 10; mirror or choose different opponent. Historical saved games retain their original units/camps and do NOT receive newly specified opening units.
- **Budget:** default 3 military CP; opening R2/B1/Q3/P1/N1/K1. Max one normal activation per piece/turn. Original 2-CP comparison option remains. Management delegation or extra engineering CP premium **not implemented/approved yet**.
- **Board/rules:** 50x50 default, 30x30/70x70 alternatives; seeded terrain; black/mist/clear fog with memory of last-observed terrain and no hidden-world leakage; rook/bishop/queen rays through previously explored path, forest soft-stop, opaque obstacles; unique King, King capture is win, no stalemate draw, passing allowed.
- **Pawn:** move to empty forward-left/forward/forward-right; attack only forward diagonals. Work: forest at L1, bridge/watchtower L2, mountain L3, camp L4. Camp construction 3 friendly work turns absent skills. No arbitrary camp-count limit. 20-military-unit capacity still exists.
- **Training:** King may spend unspent XP plus CP only when an eligible camp is available; delayed training queues. L4 pawn at camp can remain stationed for 5 friendly turns or sacrifice itself for a 2-turn batch (2 pawns OR 1 knight OR 1 bishop). Camp has 8-neighbor sight plus outer ring with qualifying friendly laborer standing there, subject to LOS.
- **Progression:** King receives achievement-related XP (including royal multiplier), not XP for waiting. Starting skill-slot capacities P/N/B/R/Q/K = 0/1/1/2/3/2. Pawn gets slot/draft levels 3,6,...,99; 36 authored prototype pawn skills with Scout/Pioneer/Companion family affinities; no secret route bonuses. Full non-pawn trees are NOT yet authored.
- **Experimental flags:** classic one-hit capture default; optional pips/HP, fission, camp capture remain opt-in. No default rule changes, gameplay redesign, camp-cap or economy added by the port.
- **Save contract:** current schema version 15; imports v5–v14 while preserving real old units, XP, skills, camps, worker project migration, training queues, visibility and action budgets. Distinguish raw saved-game data from Unity preview fixtures.

## Existing evidence and caveat

The *JavaScript source* previously passed 173 focused engine checks, 132 Chromium UI checks, and 8,412 randomized actions on 60 seeded maps. These are reference evidence, **not proof the Unity implementation passes**. Unity Editor compilation and cross-platform builds are NOT yet verified. Preserve JS fallback until independent Unity parity is established.

## Team and dependencies

Six proposed roles, unique write ownership. See `AGENTS/SM-C01.md` through `AGENTS/SM-C06.md`.

| Code | Role | Owns | Unblocks |
|---|---|---|---|
| SM-C01 | Coordinator / integration | docs/contracts, integration plan, branch/PR gates, CI wiring | all |
| SM-C02 | Independent JS oracle / parity QA | tools/parity and tests/parity ONLY | C03–C06 |
| SM-C03 | State, deterministic RNG, save/schema | unity/Assets/Scripts/Core and state tests | C04–C05 |
| SM-C04 | Tactical rules | unity/Assets/Scripts/Rules/Tactics | C06 game loop |
| SM-C05 | World, fog, labor; then progression | unity/Assets/Scripts/Rules/World and Progression (staged) | C06 game loop |
| SM-C06 | Unity UI, editor integration, build pipeline | unity/Assets/Scripts/Presentation, Assets/Editor, Scenes | releases |

**Phase 0 (do first):** C01 imports the immutable JS package + Unity starter to a named production baseline (in the repository approved by owner), C02 establishes the oracle fixture format and test runner, C03 defines *only* shared game state/actions/observation contracts. C04/C05/C06 should review interfaces and current source but must not concurrently invent conflicting models. C01 freezes shared contract v1; each implementer ACKs it.

**Phase 1:** C03 implements state/RNG/load/save with parity; C04 implements legal orders/movement/turn/CP/combat and king-capture resolution; C05 implements terrain/fog memory/LOS and no-camp pawn work; C06 refreshes v0.5.10 opening fixtures and builds an interactive 2D hot-seat board over the actual C# core. Use separate PRs and no engine-wide rewrites.

**Phase 2:** C05 extends into training/XP/36 Pawn skills (or split as SM-C07 if a 7th agent is available); C04 adds AI parity and experimental combat after default classic rules pass; C06 adds save UI, battle HUD, mobile interaction, platform builds. C02 runs independent adversarial seeded traces throughout.

**Phase 3:** Unity Editor compilation (real installed 6.3 LTS or other explicitly pinned compatible Editor), Unity Test Runner, real Windows/macOS/Android/Web builds only where builders exist. Do not claim iOS/console tests from environments without their toolchains. Avoid polish/cross-platform marketing claims before evidence.

## Shared v1 interface proposal — to be explicitly approved by C01

Keep pure rules isolated from `UnityEngine` (e.g., `GameState`, `GameConfig`, `GameAction`, `PlayerObservation`, `ActionOutcome`, `SaveEnvelope`). A Unity view must never directly mutate authoritative state. A single facade should expose:

- `NewGame(config)` including board size, seed, two organizational modes, command and camp modes, optional experimental flags.
- `GetObservation(side)` — side-filtered view, remembered terrain separate from true terrain, with strict no-leak contract.
- `GetLegalActions(side, unitId)` — observer-visible speculative orders; hidden blockers resolved only upon attempted execution.
- `ApplyAction(action)` and `EndTurn()` — outcome with exact CP, activation, turn, combat, win updates.
- `Serialize()` / `Load(save)` — v15 plus old-save migration where supported.

The labels are a recommended starting contract, **not existing C# APIs**. Freeze canonical JSON contracts and a common seeded RNG specification before parallel implementation. For comparisons prefer semantic canonicalization (stable field order and explicit number/boolean/null policies); do not assert raw Unity JSON is byte-identical to JS output without building such a contract.

## Parity gates / required evidence

1. **Reference intake:** source ZIP hash, exact imported commit, unaltered JS tests/results. Any environment blocker listed with command/exit code.
2. **State parity:** fixed seeds across 30/50/70 and three opening modes; terrain generation, units, IDs, camps (zero in Standard), initial fog, CP/turn/side and schema. Include archived v0.5.8/v0.5.9 saves and version 15 round-trip.
3. **Tactical parity:** identical legal-order sets and actual resolved actions on traced moves, attacks, King capture, pass, CP exhaustion, forest/water/mountain, unseen blocker/mist scenarios. Compare observer-visible outputs separately from hidden state.
4. **World/progression parity:** fog terrain-memory anti-leak, worker lock/ticks, tower/camp sight, training queues, XP, skill offers/equip/active uses/cooldowns. Preserve exact v0.5.10 defaults.
5. **Unity runtime:** Editor C# compiles, board loads *v0.5.10* rosters, actual play interactions invoke C# rule facade, ended game stops, UI responds to fog; Unity Test Runner logs + a true build/smoke receipt where supported. A read-only viewer alone is not accepted as playable parity.

Never use only 'test counts passed' as acceptance. Every agent receipt must list exact ref/branch/commit, commands, environment, outputs, coverage and limitations. Refuse a feature-complete claim when required parity suites or Unity builds were not run.

## Coordination

Start from https://github.com/ckprincipal/chessLife/issues/1 (existing public mailbox, **currently Codex standby**). Activation requires owner's explicit handoff to the chosen agent(s); this file alone does not activate them. Suggested dedicated project coordination issue if private repo is used. For each workstream use `READY/ACK/RECEIPT/HANDOFF` with exact prior comment URL, BASE SHA, HEAD SHA, owned paths, executed commands, PR, limitations, next owner. C01 alone handles integration/merge; others work on named topic branches and do not modify `main` or archived refs.

## Success definition

**Milestone A:** a real Unity-native interactive hot-seat vertical slice (state, moves, turns, fog, King capture), whose tested behavior matches the JS oracle on agreed fixtures. **Milestone B:** full v0.5.10 mechanics parity (pawn labor, recruitment, XP, 36 skills, AI, save migration and optional modes), demonstrated by independent tests. **Milestone C:** actual platform builds and UI polish. Never conflate these milestones.

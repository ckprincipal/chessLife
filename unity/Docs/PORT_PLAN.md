# Port plan: Stale-Mate v0.5.8 → Unity

**State:** phase 0 presentation scaffold. The JS implementation is still the test oracle. No full C# port claim.

## Contracts to preserve (non-negotiable)

- Default 50×50 board (30/70 alternatives), seeded symmetric terrain, fog black/mist/clear with last-observed terrain, no unrevealed-map leaks.
- Unique King. Capturing King immediately ends the game; no stalemate draws.
- CP economy and one activation per soldier each turn; 3 CP roomy default, 2 CP original comparison; R2/B1/Q3 (Q2 in original)/P1/N1/K1 before rank adjustments.
- Pawn is scout, combatant and worker (not invulnerable engineer): forward-three legal moves to empty cells, diagonal-only captures, level-gated construction (forest L1, bridge/tower L2, mountain L3, camp L4).
- Camp sight adjacent 8 squares, one additional ring while friendly Pawn is on camp. Available unlimited camps for now; 20-soldier supply cap retained.
- Camp batches: sacrifice level-4 operator for 2 friendly turns versus keep for 5, with 2 pawns or one knight/bishop. King can spend unspent XP and CP to recruit immediately into a delayed training queue.
- Pawn skills every three levels, 36-skill catalogue, slots P/N/B/R/Q/K = 0/1/1/2/3/2, skill route choices. Starting organizational modes determine opening pieces ONLY; no automatic CP discounts or magic passive managerial auras.
- Asymmetric organizational choices allowed, default mirrored. New opening Traditional K+Q+2N+2B+2P; Middle K+2N+4P; Flat K+5P. Original v0.5.7 presets remain archived and loadable.
- Version 13 game save source of truth. Saves v5–v12 migrate; no mixing local archived raw JSON with Unity-native preview fixtures.

## Incremental gates

0. (This bundle) Native scene renderer showing actual deterministic v0.5.8 opening fixtures. **Cannot execute game moves.**
1. Port clean C# state model and exact deterministic RNG. Compare snapshots/terrain/hashes for seeds, maps, organizational presets.
2. Port legal movements, occupancy and hidden blockers; compare legal-order sets and resolved actions to JS engine on 30/50/70 maps and misted terrain.
3. Port King capture, combat options, CP, action budget, endings. Run model-based cross-implementation tests.
4. Port fog memory, camps, construction/work ticks, XP, selectable pawn skills; verify action traces and serialization crosswalk.
5. Port AI and deterministic smoke, then create Unity-native UI and production art pipeline.
6. Test Unity desktop (Windows/macOS/Linux), WebGL, Android/iOS packages on real editor/build agents. Test pixel density, offline saves, touch, availability of Chinese/Japanese text and fonts (fonts must be licensed).

## Engineering principles

- Never claim Unity engine parity merely because it renders a familiar opening; no hidden state mutations in presentation layer.
- Preserve the HTML release as a baseline and recoverable fallback throughout migration.
- No platform store promises before actually producing and testing binary builds.
- Never add client-visible opponent hidden truth for eventual network multiplayer; define authoritative server boundary separately.
- No GitHub push or merge is implied by packaging this starter.

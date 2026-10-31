# Stale-Mate — Organizational Flatness (concept v0.1)

**Recorded:** 2026-10-30  
**Status:** User-proposed game-mode selector, NOT IMPLEMENTED. Latest playable game remains v0.5.7.  
**Theme:** Different management structures allocate command attention and practical work differently. The King has ambitious high-level ideas; his forces are **“executing royal plans”**.

## User proposal (preserve meaning)

User suggested game mode selection by *“flatenness”* (interpreted here as **organizational flatness**), with three starting organizations:

| UI working label | User shorthand | Explicit initial army interpreted | Total units | Management structure |
|---|---|---|---:|---|
| **Default / Traditional** | `K1Q2N2B2P` | 1 King + 1 Queen + 2 Knights + 2 Bishops + 2 Pawns | 8 | King → Queen (deputy) → Knights/Bishops (middle managers) → 2 Pawns (end-to-end workers) |
| **Middle / Team-led** | `K2N4P` | 1 King + 2 Knights + 4 Pawns | 7 | King → Knights (real team leads) → 4 junior Pawns |
| **Flatten / Flat** | `K5P` | 1 King + 5 Pawns | 6 | King ↔ 5 Pawns (direct coordination, for better or worse) |

**Notation:** K is one King; `1Q`, `2N`, `2B`, `2P`, etc. are counts of Queen/Knight/Bishop/Pawn. No Rooks are specified in any of these *starting* lineups. Do not silently add any. Whether Rooks are recruitable or unlockable later is undecided.

**Exactly preserved interpretation:** In the default setup the Queen is a **deputy**, Knights and Bishops are **middle-level managers**, and two Pawns are the actual **end-to-end workers**. In the middle setup, **Knights are valuable and cost-efficient frontline team leads**, responsible for supervising junior pawns and absorbing King's management pressure. In the flattened setup, **five Pawns interact directly with the King**; this may be powerful or chaotic, like a novel/very flat company.

## What is accepted versus proposed

- **Record this three-way selector as a design direction.** It is **NOT a request to immediately replace v0.5.7's existing Balanced/Explorers/Fortress armies** or to change saved game rules.
- The structure is **not merely cosmetic**: eventual gameplay should reflect delegation, supervision, command pressure, and the cost of getting useful work done, without pretending extra actions are free.
- Pawns remain **scouts, combatants, and construction workers**, not separate invulnerable engineers. The previous independent engineer was removed from v0.5.7 and should not return through these presets.
- A Pawn's *potential* to do end-to-end work does **not** mean a level-1 pawn already has every building ability: L1 forest, L2 bridges/watchtowers, L3 mountain, L4 training camps. Preserve pawn leveling and skill choices.
- **“Executing royal plans”** remains the exact desired phrase. The earlier *Work, Baby, Work!* concept (King + five pawn-workers) closely matches the Flatten roster, but merging the title/theme with this selector is **a proposal, not a concluded naming decision**. Its historical screenshot showing five **engineers** remains preserved as an old concept card, not a current unit roster.
- **No new training camp cap** at this stage. The user's explicit deferral still stands.

## Gameplay design opportunities (NOT accepted mechanics)

1. **Traditional / Default:** Deputy Queen may relay high-level orders; Knights/Bishops coordinate smaller teams. More powerful starting soldiers, but management layers can create costly bureaucracy or bottlenecks. Two Pawn-workers make each pawn important.
2. **Middle / Team-led:** Knights may organize their paired Pawns and reduce King's direct order pressure. Their current low activation cost and valuable tactical mobility make this a particularly promising practical configuration. Bishops and the Queen are absent *at game start*.
3. **Flatten / Flat:** Five low-ranking Pawns have maximal direct access to the King; construction, scouting and fighting compete for a tight command budget. The King is vulnerable to management overload. No Knights, Bishops, or Queen at game start. Working caption: *“You get to talk to the King directly. Is that actually a good idea?”*
4. **Order/delegation mechanic idea:** Distinguish strategic assignment from unit action; managers may coordinate a team or reduce *order issuance friction* but should not automatically create free movements or extra attacks. An engineer-style *work order CP premium* remains a concept from *Work, Baby, Work!*; amount, start-vs-per-turn payment, and mode scope are undecided.
5. **Pairing matters:** Knight + Pawn (leader + junior) can be a meaningful tactical pair because both provide practical board coverage. Avoid introducing passive aura buffs as a substitute for actual teamwork without playtesting.

## Balance risks / design questions

- **Power asymmetry:** 8 starting pieces with a Queen versus 7 with Knights versus 6 with Pawns is not balanced by unit count. These are distinct starting economies and battlefield capabilities. First test mirrored games (same preset on both sides), record turn-to-first-contact, CP exhaustion, training pace, worker survival and actual tactical value; then test cross-preset matchups.
- **Current CP:** v0.5.7 starts at 3 CP in its default comparison, with initial costs P/N/K=1, B=1, R=2, Q=3. Simply changing rosters without adding order rules would make this mainly a **starting-army preset**, not a true organizational simulation.
- **From-scratch infrastructure:** Earlier *Work, Baby, Work!* proposed no prebuilt military and possibly no camp; whether Flat starts with a camp is still **undecided**. Removing a camp requires a viable King/Pawn route to building and recruiting; do not introduce a softlock.
- **Organizational permanence:** If a Flat kingdom later recruits Knights/Bishops, do they become team leads? Option A: mode determines permanent command doctrine. Option B: mode sets *starting* structure, and the organization can evolve as soldiers develop. No decision yet.
- **Recruitable units:** v0.5.7 camps produce Pawns, Knights and Bishops, but not Queens/Rooks. Consider how each mode gains high-level roles later; do not invent recruitment now.
- **Visibility and routes:** Players may need transparency about management costs while Pawn skill/route affinities may remain discoverable. These disclosure concerns can be separate.

## Proposed rollout / acceptance gates

1. Record as **concept only** alongside v0.5.7; preserve current game and historical versions.
2. First implementation experiment (only on user direction): make these three **starting-roster presets**, retaining existing CP and worker rules; verify fairness limitations openly.
3. Separately prototype command delegation/management load with focused tests, then compare whether flatness feels mechanically distinct rather than only weaker/stronger.
4. Avoid a premature Phaser/Unity rewrite until the rules core, saves and tests are independently preserved.

## Continuity and links

- Latest working source: ChatGPT Library `/Stale-Mate/v0.5.7_2026-10-30/`; v0.5.7 remains local, **not on GitHub**.
- Prior mode concept: `/Stale-Mate/modes/Work_Baby_Work_2026-10-30/WORK_BABY_WORK_CONCEPT_v0.2.md`.
- Historical screenshot retained unchanged: `/Stale-Mate/modes/Work_Baby_Work_2026-10-30/Original_Concept_Card_1King_5Engineers.png`.
- GitHub repository and coordination mailbox are **not changed by this design note**.

# ChessLife decision log

- **D-001 (2026-10-29):** Working title ChessLife; ChessStory alternative; final public name undecided.
- **D-002:** Default 50×50, selectable 30/50/70; 50×50 must be usable via viewport zoom/pan rather than downscaled tiny cells.
- **D-003:** Level cap 99 per unit (reduced from 300), with character-changing skill trees.
- **D-004:** No stalemate: if unable to act, pass; only enemy king capture determines victory.
- **D-005:** King-only royal; 1.5× XP; king route is summoner/commander; queen never becomes second king.
- **D-006:** Queen initially strong and XP-inefficient; exactly three primary paths: War, Phantom, Choice/Blood. Choice path is about costly decisions, not generic allied sacrifice.
- **D-007:** Fog = never seen / remembered but not currently visible / currently visible. Forget current enemy positions out of sight; limited ability-specific persistent vision with expense and counters.
- **D-008:** Vision new square ~0.30 XP, rewards diversified and anti-farmed.
- **D-009:** Pawn professions swimmer, mountaineer, scout, ninja (~30% one-time bonus move). Relationships built organically, with possible devoted pawn, bishop secret lover, knight protector.
- **D-010 (provisional):** 7-square maximum slider move on 50×50, 3 AP each side per turn, symmetric procedural terrain with forward deployment and objectives. Tune through testing.

- **D-011 (2026-10-29):** 50×50 chess line movers may select legal *explored mist* destinations only; cannot move into unexplored black. Resolve unseen blockers at execution: stop immediately before first blocker, spend normal action, no blind capture. Ninja/other bonus moves can circumvent the standard once-per-turn restriction. 7-step limit remains provisional in addition to fog limits.
- **D-012:** Small tactical HP is default ON (toggle OFF for classic one-hit captures), so level-1 pawns cannot one-shot high-rank queens. A surviving defender keeps its square. Combat counts reduced to Balanced 11, Explorers 12, Fortress 11 *military units* per side.
- **D-013:** Skill inventory vs equipped skill slots are separate. Default capacity: King 3, Queen 3, Rook/Bishop/Knight 2, Pawn 0 (can learn), Villager 0 *military* skills. Equipping different learned skills consumes an action at the king or shrine. Not all available slots have implemented learnable skills yet.
- **D-014:** Introduce *noncombat civilian villagers* (prototype 3 per army, military headcount unaffected) who gather food from dinosaurs/gators, wood from forests, gold from mountains on automatic work orders. Manual move costs AP, one free work reassignment per turn.
- **D-015 (provisional):** Civilians are *nonlethally raided*: lose HP, unspent XP, some resources and work time, but cannot be killed. No attacking regular units, no combat XP for raids, no queen sacrifice or siphon. Compare against alternative mortal civilian rules in balancing.
- **D-016:** Resources gold+food+wood jointly constrain royal summoning; neutral dinosaur/gator grounds have limited stocks and injury chance, not yet independent AI agents. Guard economy from unlimited production/sacrifice loops.
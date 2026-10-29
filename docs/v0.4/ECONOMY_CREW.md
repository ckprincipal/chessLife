# ChessLife — Civilian crew and production (v0.4 rules)

**Purpose:** Make supply lines and character development matter without turning a 50×50 chess-RPG into repetitive worker micromanagement.

## Workers are not soldiers

- Three **protected villagers** per side at game start. These are *in addition to* 11–12 military pieces. They do **not** consume military supply capacity.
- Each villager has an ID, level (up to 99), unspent XP, HP, assignment, work location, and injury/recovery state. They are separate from the king/queen/rook/bishop/knight/pawn military classes.
- Villagers move one square as a tactical action but **cannot attack regular military pieces**. Unlike a traditional pawn, they are civilian economy actors.
- When attacked by a soldier, a villager **never dies**. The soldier uses its action to **raid**: the villager is displaced toward its home, receives a temporary incapacitation/recovery period, falls to 1 HP, loses 10% of **unspent** XP (never de-levels), and loses up to 3 units of the resource linked to its job. Repeated raids during recovery do not impose additional XP/resource penalties. **No combat XP** is granted for raiding civilians.
- Civilians cannot serve as Choice Queen sacrifice or siphon targets, nor as free ingredients for ritual/economy loops.

## Work orders (automatic, not another AP chore)

- `Lumberjack` harvests forest within 1 tile: **+3 wood** each production turn.
- `Miner` extracts from mountain within 1 tile: **+2 gold**.
- `Hunter` hunts a nearby dinosaur or gator ground within 1 tile: **+3 food for dinosaur**, **+2 food for gator**. Dinosaur has a 20% injury chance (2 HP); gator 30% (1 HP). These are *provisional game-balance parameters*, not biological realism.
- Wildlife grounds have finite stocks (dinosaur 6, gator 5) and regenerate slowly; resources are not infinite each turn.
- A villager earns **0.60 XP** on each of its first four productive visits to a particular source/job, then **0.15 XP** for later repeated visits. This is separate from once-per-team 0.30 XP awarded for discovering new squares.
- One free assignment change per civilian per command turn; reassignment applies at the next friendly production phase. Military movement or king summoning still uses the normal 3 AP economy. A worker cannot harvest during active incapacitation.
- Each army also receives base gold income +3 per turn, plus +2 gold from each currently held shrine.

## King summoning costs (initial prototype)

| Summon | Gold | Food | Wood | AP |
|---|---:|---:|---:|---:|
| Pawn | 6 | 3 | 0 | 2 |
| Knight | 15 | 4 | 1 | 2 |
| Bishop | 15 | 4 | 1 | 2 |
| Rook | 24 | 5 | 4 | 2 |
| Queen | 60 | 9 | 6 | 3 |

The king's existing summoning level requirements and supply cap still apply. Civilian production is a complementary advantage, not a way to erase the normal opportunity cost of military deployment.

## Important open questions for Codex and future playtests

1. Are **protected-but-raided workers** actually more fun than fully mortal workers? Make their immortality a config rule during simulations; avoid presenting it as immutable balance.
2. Is 3 villagers per side too much? Compare 2 vs 3 vs 4 starting workers by map size. A 50×50 board is big, and slow manual worker movement could still be dull.
3. What should injuries mean? Current HP penalizes workers and gradually heals; future versions may use stamina/MP, fear, injuries, recovery houses, and rescue skills. Do not add all currencies before testing.
4. Should hunting move animals? Current dinosaurs and gators are static neutral *hunting sites*, NOT hostile mobile NPCs. Implement real wildlife AI only if it improves skillful risk management.
5. Prevent raid-grief loops, free villager XP exploits, map seed abuse, resources scaling infinitely, and royal summon/sacrifice loops. Run deterministic fuzz/self-play tests.
6. Link resource supply to professions, queen decisions, and meaningful high-level skills. The goal is **tradeoffs**, not adding farming for its own sake.
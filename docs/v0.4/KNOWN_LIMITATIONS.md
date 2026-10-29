# ChessLife v0.4 prototype limitations and Codex priorities

1. **No competitive information security yet.** Gameplay visibility is three-state, but the full game state resides client-side. Movement options can indirectly reveal occupied squares hidden by Phantom stealth, and some opponent logic relies on true blockers. Build a distinct side-scoped observation/action layer before multiplayer or a serious AI evaluation.
2. **Early progression only.** Pawn professions, simple bonds, king summons, and first queen powers work. The richer level-99 skill branching, relationship changes, veteran stories, progression between matches, injuries/permadeath, and deep commander capstones are intentionally reserved for Codex.
3. **Balance untested.** The seven-tile slider limit, three actions per turn, forward-deployment distance, early queen advantage, ritual rates, and boss/king safety need bot simulations and playtesting.
4. **No pathfinding tactical AI.** Current bot is a greedy heuristic, not adversarial search; it may overvalue objectives and lack counterplay against enemy spells. It does not use the full queen/king ability menu.
5. **No full fog memory UI.** Last-seen ghosts are basic (up to ~10 rounds) and terrain memory is static; weather/dynamic terrain, recon-counterplay, planted fake sightings and permanent beacons need expansion.
6. **Potential forced-pass corner cases.** The AI passes when it has no practical move; humans can End turn. A robust scheduler should formally implement the no-legal-actions rule for all players without generating infinite auto-pass loops. There is deliberately no stalemate draw.
7. **Prototype saves are match snapshots.** Export/import JSON works locally, but no version migration, campaign roster, cross-match progression or cloud sync has been built. Competitive clients would not receive raw full-state JSON.
8. **UI accessibility and art.** Character portraits, animations, performance tuning for >70×70, touch onboarding, audio and accessible fog/visual alternatives remain future work.

**Codex recommendation:** Fix (1) and (6) first; then develop content-rich, meaningful level milestones and queen tradeoff scenarios while collecting playtest evidence. Do not spend the next development cycle only on graphical polish.

9. **Skills:** King/Queen capacity 3, N/B/R capacity 2, pawn capacity 0 initially are implemented, but several slots are empty because deep skills for these classes do not yet exist. Do not advertise this as a complete three-skill character system.
10. **Civilian realism:** Worker hunting is a static habitat/hunting-site stock mechanic, not moving autonomous dinosaurs/gators. Workers auto-produce only when within one tile of matching terrain/habitat; assignment UI does not automatically pathfind to a worksite. Protected-worker raids are a balance experiment, not a finalized rule.
11. **Client/server fairness:** Engine checks cover fog-safe movement orders and hidden blockers, but server-authoritative observer validation, competitive saves, secure AI information boundaries and multiplayer synchronization are not implemented.
12. **Economy balance:** Food/wood/gold incomes, injuries, resupply and skill loadout costs have not been measured via self-play; 3 civilians/army and 7-tile slider cap may need revision.

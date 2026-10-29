# ChessLife — playable prototype and living design

**Status (2026-10-29):** This branch brings the verified playable **v0.4 source/tests** into the original repository and adds **v0.5 design-only experiments**. Do not claim the v0.5 mechanics are already implemented or balanced.

## Verify and play
```sh
node tests/engine.test.cjs
python tools/build_standalone.py
# Open prototype/index.html, or run: cd prototype && python -m http.server 8765
```

v0.4 features include a 50×50 default board (also 30/70), three-state fog (black/mist/visible), speculative mist movement, king-capture victory without stalemate, level-99 cap, queen War/Phantom/Choice paths, professions, skill-slot loadouts, optional numeric HP, and an experimental civilian economy. The 99-level trees are skeletal and gameplay balance is not established.

## Read these first
1. [Codex work order and acceptance](docs/CODEX_NEXT.md)
2. [Coordination mailbox #1](https://github.com/ckprincipal/chessLife/issues/1) and [mailbox protocol](docs/MAILBOX_PROTOCOL.md)
3. [v0.5 experimental design](docs/v0.5/DISCRETE_HITS_AND_FISSION.md) and [decision status](docs/v0.5/DECISION_STATUS.md)
4. [v0.4 design snapshot](docs/v0.4/DESIGN_BIBLE.md), [limitations](docs/v0.4/KNOWN_LIMITATIONS.md), and [original v0.4 README](docs/v0.4/README.md)

The original `doc/` contains user-imported v0.2 design material retained for provenance; newer decisions supersede incompatible old assumptions. `prototype/` and `tests/` are the v0.4 runtime baseline, not v0.5 gameplay.

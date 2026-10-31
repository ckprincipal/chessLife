# Stale-Mate v0.5.10 — accepted changes and open questions

## User-confirmed choices implemented

- Traditional starting roster: **K1 Q1 R2 N2 B2 P2** (10). Middle: **K1 N2 P6** (9). Flatten: **K1 P9** (10). Mirrored opponent by default; independent selection possible.
- Rook action cost remains **2 CP** and bishop **1 CP**; default budget 3 CP. Skill system from v0.5.6 preserved, not reset by a new match.
- **Standard continues to start with no free training camp (since v0.5.9)**, meaning level-4 Pawn construction is required to recruit. Ready starter camp remains a deliberately labeled **optional Quick Start** only.
- Pawns are the workers/scouts/soldiers; no invulnerable independent engineer. Camp proliferation controls explicitly deferred by the user.
- 20-unit military cap remains, no extra camp-count cap added; all construction still pays action cost and requires progression.

## Scope not silently expanded

- No new delegation mechanics or extra engineering CP charges yet. The management metaphors are an organizational design concept until further specified.
- Full skill trees outside Pawn are not authored. Existing slot capacities and Queen/King signature abilities remain; do not market them as six complete trees.
- User's 'Work, Baby, Work!' mode concept is distinct from Flatten. Keep visual concept card and phrase **"executing royal plans"**.
- Unity starter still refers to v0.5.8 openings and is not a playable C# port.

## Balance experiments to consider

- **Traditional has only two starting Pawns** and no camp; might lose the entire construction path early.
- Flatten has nine Pawns but only three CP; too many idle units or powerful pairing opportunities?
- Rooks cost two CP and are useful after exploration; do their initial sight and forest stops justify that price in the Traditional opening?
- Fastest feasible first camp at Pawn level 4; is level progression achievable before the first major battle in a 50×50 board?
- Should Knight/Queen/Bishop support eventually reduce command overhead, or should command budget reflect all orders to avoid hidden buffs?
- Work/engineer activity might cost more CP **in a separate mode**, but the user has not specified values.
- How should the UI present Pawn route destiny, skill affinity, and long-term choices (effects only vs hints vs full)?

**These are untested balance questions.** Existing mechanics tests do not establish fun or commercial readiness.

# ChessLife — v0.5 design addendum (2026-10-29)

**Status:** Design discussion; not a claim that v0.4 implements these rules. Retain v0.4 as a playable experimental baseline.

## Confirmed design intent

- Levels cap at **99**. Leveling must develop a unit's identity, choices, roles, learned skills and relationships, **not primarily inflate damage or HP numbers**.
- Reconsider granular numeric HP; user proposes **up to three successful hits to defeat certain pieces**.
- At sufficiently high levels, **certain pieces may divide into two**. **Both** the original and the new unit reset to **level 1**. This is a consequential trade-off: gain a second body, sacrifice accumulated progression.
- Prior ChessLife rules remain: default 50×50 map; remembered mist versus unexplored black fog; fog-aware movement; skill-slot limits (K/Q 3, R/B/N 2, pawn 0 initially); king unique summoner; three queen paths; no stalemate; king capture victory. The full civilian economy and granular HP are experimental, not core decisions.

## Testable combat model (proposed, not yet decided)

- Basic pieces start with **one capture hit**; dedicated defensive traits, skills or milestones can grant **two** or exceptionally **three** total hits; hard cap three. Represent visually as one, two, or three shield pips rather than numeric HP/damage bars.
- On a nonlethal legal capture attempt: remove one pip; defender stays on its square; attacker stays on the attacking square; action is spent. On the final hit, capture normally and advance to the vacated square.
- No automatic pip regeneration each turn. Defensive restoration is scarce and explicitly tied to a limited skill or milestone. Hit protection is not an unconditional reward for all 99 levels.
- Test viability particularly on royalty and the early-game powerful queen: three hits should be rare and come with opportunity costs in skill slots and specializations.

## Testable fission/splitting model (proposed, not yet decided)

- A late-tier, unit-type-specific **Fission** skill turns one advanced unit into two **level-1** pieces of that same type: the source remains in place, a new piece appears in an adjacent legally vacant visible traversable square.
- Both pieces lose their veteran-level abilities, equipped skills (apart from level-1 defaults), and any level-derived extra hit protection. Preserve a *narrative-only lineage marker* to remember their origin without doubling earned bonds or experience.
- Consumes an action; no immediate bonus action on the split turn. Respect unit-count cap and require a legal spawn square. Prevent repeated multiplication with a once-per-lineage limit or equivalent constraint.
- Start testing with pawn/knight; evaluate bishop/rook carefully because two base sliding pieces may be stronger than a veteran one. **Do not let the king split**, since there must be one unique king. Queen splitting is not initially permitted: two level-1 queens could be especially overpowering because the queen is already exceptionally strong at baseline; optional Phantom decoys remain distinct from permanent splitting.
- Important anti-exploit: a newly spawned level-1 piece must not receive "first discovery" XP for squares its side already explored, or copy stored XP/skills/vision/bond bonuses.

## Design question to validate in playtests

1. Are shield pips permanent for the match, or restorable only through rare abilities? (Suggestion: the latter.)
2. Which pieces can earn a second or third capture hit, at which branches/milestones, and at what opportunity cost?
3. Should splitting be gated by one-time-per-unit, one-time-per-lineage, or limited cooldown/resources? Test without adding another general currency.
4. Should a split preserve any relationship story (non-stat narrative) while resetting actual abilities? Avoid duplicating unique allegiance/lover benefits.
5. How frequently should important qualitative progression choices occur? A suggested model is frequent small decisions and more dramatic profession/evolution/relationship decisions at milestone levels, without creating 99 separate manual menus.

## Engineering handoff (Codex)

Create a feature-flagged experiment alongside v0.4 rather than silently replacing v0.4 saves. Test that nonfinal hits do not displace pieces, that the third hit captures, that split resets **both** entities to level 1, that there is exactly one king, no immediate double action, no XP/relationship duplication, and no growth beyond the unit cap. Keep fog logic and legal-move validation authoritative on the game state, not UI-only.

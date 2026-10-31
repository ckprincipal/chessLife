# Stale-Mate v0.5.7 — unchanged provisional pawn skill catalogue

All 36 entries below are implemented. Names, family assignments and numerical values are authoring proposals, not finalized player-facing routes or established balance. Exact effects appear on selection cards. Newborn pawns have no skills. One of three choices is offered at each of Lv3/6/9/.../99. Learning does not create a free action.

## Pathfinder — provisional authoring family

### Trailcraft

`trailcraft` · Equipped passive

Passive: +1 sight layer along the three forward rays; terrain still blocks sight.

### Flank Watch

`flank_watch` · Equipped passive

Passive: see the two immediately sideways squares. This does not change movement or attacks.

### Rear Watch

`rear_watch` · Equipped passive

Passive: see the three immediately rearward squares. This does not change movement or attacks.

### Forest Lore

`forest_lore` · Equipped passive

Passive: your sight rays penetrate forests, but never mountains.

### River Walker

`swimming` · Equipped passive

Passive: your normal pawn moves may enter water. Attacks remain forward-diagonal only.

### Mountaineer

`climbing` · Equipped passive

Passive: your normal pawn moves may enter mountains. Mountains still block sight beyond them.

### Signal Post

`signal_post` · Active action

Action: place a temporary radius-2 sight beacon at your square for four opposing response turns. Costs normal CP; 3-friendly-turn cooldown.

### Summit Watch

`summit_watch` · Equipped passive

Passive: +1 forward sight layer while standing on a mountain; the normal sight cap remains six.

### Long Sight

`long_sight` · Equipped passive

Passive: +1 forward sight layer, stacking with Trailcraft up to the normal cap of six.

### Sentry Platform

`sentry_platform` · Equipped passive

Passive: a friendly watchtower gains one outer sight ring only while you are standing on it. Terrain blocks extended sight.

### Far Signal

`far_signal` · Active action

Action: place a radius-3 sight beacon for four opposing response turns. Shares the Signal Post cooldown.

### Lasting Signal

`lasting_signal` · Active action

Action: place a radius-2 sight beacon for six opposing response turns. Shares the Signal Post cooldown.

## Pioneer — provisional authoring family

### Woodsman

`woodsman` · Equipped passive

Passive: forest clearing takes one friendly work turn instead of two.

### Bridgewright

`bridgewright` · Equipped passive

Passive: bridge construction takes one friendly work turn instead of two. Level-2 work gate remains.

### Masonry

`masonry` · Equipped passive

Passive: mountain excavation takes two friendly work turns instead of three. Level-3 gate remains.

### Campwright

`campwright` · Equipped passive

Passive: camp construction takes two friendly work turns instead of three. Level-4 gate remains; recruitment clocks are separate.

### Towerwright

`towerwright` · Equipped passive

Passive: watchtower construction takes one friendly work turn instead of two. Level-2 gate remains.

### Land Reclamation

`land_reclamation` · Equipped passive

Passive: at level 2+, unlock the engineer-style water-fill project (one work turn), from an adjacent visible shore.

### Tunnelcraft

`tunnelcraft` · Equipped passive

Passive: at level 3+, unlock tunnel construction through an adjacent visible mountain (three work turns).

### Quarry Master

`quarry_master` · Equipped passive

Passive: mountain excavation takes one friendly work turn. Replaces, rather than stacks below, the Masonry reduction.

### Road Crew

`roadcrew` · Equipped passive

Passive: forest clearing may target an adjacent visible square instead of only the square underfoot.

### Field Survey

`field_survey` · Equipped passive

Passive: build watchtowers on an adjacent visible, vacant plain square. You remain at the work position.

### Site Planner

`site_planner` · Equipped passive

Passive: build camps on an adjacent visible, vacant plain square. Level-4 gate remains; you must enter the completed camp to operate it.

### Instructor

`instructor` · Equipped passive

Passive: keeping this pawn stationed for a training batch takes four friendly turns instead of five. Sacrifice stays two; recruits stay level 1.

## Companion — provisional authoring family

### Cover

`cover` · Active action

Action: protect one adjacent friendly pawn, knight, bishop or rook from one attack through the next enemy turn. No king/queen targets, no stacking. Normal CP; 3-friendly-turn shared guard cooldown.

### Sidestep

`sidestep` · Active action

Action: move one square sideways without capturing, only through explored passable terrain. Normal CP; 2-friendly-turn shared maneuver cooldown.

### Withdraw

`withdraw` · Active action

Action: move one square straight backward without capturing. Known passable route required. Normal CP; shared maneuver cooldown.

### Forced March

`forced_march` · Active action

Action: move two squares straight forward without capturing or jumping blockers. Both squares must be explored. Normal CP; shared maneuver cooldown.

### Diagonal March

`diagonal_march` · Active action

Action: move two squares along one forward diagonal without capturing or jumping blockers. Known passable route required. Normal CP; shared maneuver cooldown.

### Entrench

`entrench` · Active action

Action: protect yourself from one attack through the next enemy turn. Normal CP; shared guard cooldown. No stacking.

### Relief

`relief` · Active action

Action: swap with an adjacent, unacted friendly pawn/knight/bishop/rook. Both must be idle and able to enter the other square. Pays BOTH activation costs and uses BOTH activations. Shared maneuver cooldown.

### Distant Cover

`distant_cover` · Active action

Action: Cover a friendly pawn/knight/bishop/rook up to two squares away along clear line of sight. Same one-hit protection, CP and shared guard cooldown.

### Ready Guard

`ready_guard` · Equipped passive

Passive: guard actions recover after two friendly turns instead of three. Requires an equipped Cover, Distant Cover or Entrench action.

### Lasting Guard

`lasting_guard` · Equipped passive

Passive: protection you grant lasts through two opposing response turns instead of one, but still absorbs only ONE attack.

### March Drill

`march_drill` · Equipped passive

Passive: equipped maneuver skills may be used on consecutive friendly turns. Never grants a second activation in the same turn.

### Support Training

`support_training` · Equipped passive

Passive: when your granted protection actually absorbs an attack, earn 1 base XP once per protected ally per match. No XP for merely casting protection.

## Draft and route rules

Each offer takes the first unlearned entry in each family, filling from the remaining catalogue when a family is exhausted. Unchosen entries are not permanently discarded. With 36 entries and 33 milestones, each draft has three distinct offers. No reloading or waiting reroll exists. A pawn may mix families.

The route label uses +1 family point per permanent selection, begins after three picks, and remains Mixed on a tied lead. The label adds no powers and is not a locked class. Current gameplay UI hides that tally while showing exact skill effects. Changing equipment does not rewrite the history.

## Important inherited limits

All sight respects terrain unless the named skill explicitly penetrates forest; mountains remain opaque beyond themselves. Maneuvers never capture, jump blockers or cross unexplored cells. Skills do not remove one-activation rules. Guard effects are single-hit, not health inflation. Camp production preserves queue reservation, the military cap, safe exits and level-1 recruits. Passive reductions never retroactively shorten a construction project already in progress.

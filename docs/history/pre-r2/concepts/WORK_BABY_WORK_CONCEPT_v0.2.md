# Stale-Mate — Work, Baby, Work! (concept v0.2)

**Date:** 2026-10-30  
**Status:** concept / future game mode; **NOT IMPLEMENTED** in Stale-Mate v0.5.7.  
**Exact thematic phrase to preserve:** **“executing royal plans”**.  
**Full thematic formulation:** The King develops ambitious high-level plans; the pawn-workers do the difficult, time-consuming work of **executing royal plans**.

## Most recent user direction

- **Mode identity:** *Work, Baby, Work!* — a from-scratch, infrastructure-first alternative to the standard game.
- **Special-mode opening (current working interpretation):** **1 King + 5 pawns**. The user explicitly said, “So we have 5 pawns, they can still do scouting work, and fight, somehow.” This **refines the previous visual concept of 1 King + 5 separate Engineers**; do not silently turn the five pawns into invulnerable, noncombat engineers.
- **Pawn-workers have three roles:** engineering/construction, reconnaissance, and fighting. Their engineering work must **not** erase their ability to scout or to fight and survive as military units. How to distribute time/CP among these jobs is a key tactical choice.
- **Engineering actions should cost more CP** than ordinary pawn activity. No exact CP amounts were decided; test a distinct higher cost for work orders (construction/terraforming) versus movement/scouting/attacks. Maintain a meaningful cost for royal management and worker time. This is a *design proposal*, not an implemented numerical rule.
- **From scratch:** No free ready-made military force beyond the King's starting pawn-workers. No ready-made camp was previously proposed as a plausible mode distinction, but the precise initial infrastructure is **still undecided**.
- **No training-camp proliferation cap now:** The user explicitly deferred that balance concern to a later stage. Do not invent a fixed number of camps for this mode.

## Distinction from current standard game

- **Standard Stale-Mate v0.5.7:** exactly **3 starting pawns per side**, **0 independent engineers**, **1 ready camp per side**, and other starting military units according to army preset.
- **Work, Baby, Work! concept:** **1 King + 5 pawn-workers**, with scouting and combat still possible; no separate independent engineers **in the current working interpretation**. This is a separate mode; do not accidentally revert standard mode to five pawns.

## Open design questions (not decided)

1. Does the special mode use five pawn-workers **instead of** the original five specialists, or should a later variant keep a separate engineer class? The latest wording favors five pawn-workers; get explicit confirmation before coding a contradictory roster.
2. Exact CP prices for clearing forests, bridging, mountain work, watchtowers, and training camps, and whether project initiation or every turn of work consumes CP.
3. Does the King issue an extra limited pool of engineering orders, or are ordinary CP sufficient to capture managerial overhead?
4. Whether worker vulnerability, capture, and restoration require any special mode-only exceptions (default assumption: pawns retain ordinary vulnerability).
5. Initial terrain, recruiting, whether there is any starter camp, and how the King bootstraps an army with only pawn-workers.

## Screenshot retention

`Original_Concept_Card_1King_5Engineers.png` is the user-selected **unchanged historical concept screenshot**, preserved intentionally. Its image and label show **1 King + 5 Engineers**, an *earlier illustration*. It is **not evidence that the final roster has to contain a separate engineer class**; the newer user statement expressly calls the workforce "5 pawns" that can scout and fight.

## Scope

No code changes, changes to GitHub, or activation of Codex are implied by this concept note. Revisit and balance later, after the standard ruleset is stable.

# Stale-Mate — SM-C00 Central Commander Successor Handoff

**Handoff ID:** STLM-C00-HO-2026-10-31-R2  
**Prepared:** 2026-10-31  
**Outgoing role:** ChatGPT SM-C00 / 000-S1  
**Incoming role:** the next ChatGPT commander session; retain **SM-C00** as the stable role ID. `000-S2` is a suggested session label, not a seventh Codex agent.  
**Campaign:** SM-UNITY-R2  
**Repository:** https://github.com/ckprincipal/chessLife  
**Single mailbox:** https://github.com/ckprincipal/chessLife/issues/1  
**Working branch:** `campaign/unity-r2`  
**Operational status:** **HOLD — source publication incomplete; no verified six-agent R2 activation.**

This is a role and project handoff, not a gameplay release, contract freeze, deployment order, or authorization to merge. Publishing this document does not make the existing partial campaign branch playable. Read the current mailbox and branch heads before acting: this is an explicitly dated snapshot.

## 0. Read this first

You inherit a working JavaScript prototype and an unfinished attempt to consolidate its source, a Unity viewer, and six Codex work orders into Git. You do **not** inherit a finished Unity port or an already functioning six-agent team.

The user's immediate previous instruction was to stop the scattered patches/guides, put everything into a clean Git-backed campaign, write six individual Codex prompts, and make this ChatGPT role the centralized commander communicating through the mailbox. The current instruction is to write a comprehensive handoff for your successor in that role.

The essential distinction is:

| Item | Actual state at handoff preparation |
|---|---|
| Authoritative playable game | **Stale-Mate v0.5.10 JavaScript**, source ZIP and standalone HTML available |
| JavaScript mechanical evidence | Freshly rerun during this handoff: 173 focused checks, 132 Chromium checks, 8,412 randomized actions; all passed |
| User-reported Pawn-sacrifice failure | **OPEN / UNREPRODUCED**; controlled tests passing do not close it |
| Unity Starter v0.1 | v0.5.8-era native C# opening **viewer**, not gameplay parity; no Unity compilation/build receipt |
| Six R2 prompts and consolidated guides | Eleven exact Markdown files recovered locally and preserved in the companion bundle |
| Complete canonical R2 source tree | Not present in the current mounted R2 directory; not extracted/published on Git at the inspected SHA |
| Git import staging | Import workflow plus fourteen `.b64` parts committed; **no `.import/READY`**, no verified payload manifest |
| R2 campaign pull request | None observed; only historical draft PRs #3 and #4 |
| R2 agent activation and ACKs | None observed in the inspected mailbox; a prepared prompt is not a running agent |
| Main/golden preservation | Verified unchanged at the SHAs recorded below |

Your first priority is **publication recovery and an honest intake pin**, not more feature design or a new coordination hierarchy. Do not ask the user to restate decisions already preserved here.

## 1. Your role and authority

The **user is the final product/design authority**. You are **SM-C00**, responsible for turning those decisions into bounded assignments and evidence-backed integration. The six Codex roles are implementation and verification roles beneath this coordination structure.

Your responsibilities are to maintain one authoritative status, read and answer the mailbox during active sessions, assign task ownership, resolve cross-module dependencies, distinguish accepted mechanics from suggestions, freeze shared contracts after review, open the next gate explicitly, and accept or reject exact delivered revisions. You also maintain continuity so a new session can resume without rereading an entire conversation.

**SM-C01 is the integration engineer, not a second commander.** Older R1 material calls C01 a coordinator and grants it contract-freeze authority. R2 supersedes that arrangement: C01 prepares and publishes the candidate; C00 freezes/accepts it. C01 does not reassign agents, decide product rules, accept its own integration, or merge to `main` on its own.

**SM-C02 is independent verification.** It may write oracle fixtures, test runners, and bug reproducers. It must not author the runtime candidate it independently certifies. Its own tests also need review; a verifier title does not make a result automatically correct.

C00 may make engineering decisions within the user's accepted scope. Material gameplay ambiguities must remain explicit: prepare a concrete proposal and obtain a recorded design decision rather than attributing a prior assistant interpretation to the user. A mailbox comment's GitHub account alone does not identify which agent wrote it; honor its `FROM`, task, ACK, SHA, and evidence fields.

No autonomous/background supervision is established. A successor can review the mailbox in its current session. It cannot honestly promise continuous polling, claim sessions have launched from written prompts, or say work will be delivered later without an actual supported scheduling mechanism. No automation is created by this handoff.

## 2. Authority hierarchy and stale-document traps

Use these distinct sources for distinct questions:

1. **Design intent:** the user's latest explicit decisions, preserved in the R2 change ledger and reconciled with later mailbox decisions.
2. **Current coordination:** latest applicable C00 mailbox decision, with exact task and commit pins. Read it live.
3. **Frozen implementation behavior:** the exact v0.5.10 source archive, especially `prototype/engine.js`, `prototype/app.js`, and its tests. This is the initial parity oracle, even where a future repair is wanted.
4. **R2 working rules:** `COMMAND_CENTER.md`, `RULES_AND_CHANGES.md`, `ACCEPTANCE.md`, and six R2 agent prompts, subject to the publication HOLD in this handoff.
5. **Historical context only:** R1/R1.1 dispatch, older releases, Unity starter documentation, conceptual game modes, and the old v0.2 Git design documents.

Do not conflate intended design, implemented code, tested behavior, uploaded files, integrated commits, or accepted releases. Each can be at a different state.

### Critical corrections to the previous response and draft prompts

- The R2 README, deployment guide, and all six prompts were written for a **completed future import**. Sentences such as “source/reference and Unity starter are already in Git,” “all six can start intake now,” and “no attachment or Library access needed” are **not true at the inspected partial-upload state**. Treat those as conditional instructions, not evidence. Repair their readiness wording before actual deployment.
- The previous response described a prepared full R2 tree. In this handoff environment, only its **eleven Markdown files** are mounted. Do not assume `AGENTS.md`, `STATUS.json`, `PROVENANCE.json`, `reference/`, `unity/`, `tools/verify_baseline.py`, or `evidence/intake/` survived locally. Their intended layout is documented; their missing bytes are not magically recoverable from prose.
- Original source and starter ZIPs **are** mounted and verified. Their contents can recover the actual game and viewer without relying on an unverified staging archive.
- R1's “ask before public import” was superseded by the user's request to put this campaign in the existing Git repository. R2 records publication authorization. That is permission for project material, not unrelated private context, secrets, or raw conversation dumps.
- R1.1's detailed King shared-activation/free-capture behavior was an assistant interpretation. R2 correctly restores those details to unresolved design questions.
- v0.5.10's original `STATE.json` says its Unity status is “not v0.5.9 parity.” Preserve that historical string, but understand the substantive status: the viewer has not demonstrated **v0.5.10 parity either**.

## 3. Live Git and mailbox snapshot

The following refs were fetched through the connected GitHub tool during handoff preparation, **before adding this handoff document**:

| Ref | Exact SHA | Meaning |
|---|---|---|
| `main` | `aaea2f3b26f421923f98e967e027b0fcd5aff0ef` | Historical v0.2 design documents and six concept images; not the latest playable source |
| `baseline/v04-golden` | `8070772c89df6b0ea9550e2c438822d0aa9ff0da` | Preserved v0.4 source fallback |
| `handoff/v04-baseline-v05-design` | `8070772c89df6b0ea9550e2c438822d0aa9ff0da` | Historical source/design import branch |
| `validation/v04-p0-receipt` | `2cb2c2ad4990b349bd9295484c63c841cff80651` | Historical independent v0.4 evidence |
| `campaign/unity-r2` | `1b520a5808c4058eee96a8cbc40de3918ba3aa68` | **Partial import staging only** |

A subsequent documentation commit may advance `campaign/unity-r2`. Its presence must not be mistaken for completed source publication. The handoff's actual publication commit belongs in the mailbox receipt and companion `PUBLICATION_RECEIPT.json`, not retroactively in the above snapshot.

The recursive tree at `1b520a...` contains old `doc/` and `char-image/` plus `.github/workflows/import-campaign.yml` and `.import/part-01.b64` through `part-14.b64`. It has no extracted canonical `reference/` or `unity/`, no root campaign README, and no `.import/READY`.

Remote staging sizes are important for recovery diagnostics, not integrity proof:

| Parts | Bytes per part |
|---|---:|
| 01–09 | 20,000 each |
| 10 | 17,867 |
| 11 | 51,912 |
| 12 | 41,403 |
| 13 | 54,745 |
| 14 | 30,733 |
| Total | 376,660 |

These irregular lengths neither prove validity nor prove corruption. No trusted complete original payload manifest was recovered here. A direct container download attempt failed with DNS resolution, so the staged stream was **not** decoded/decompressed during this handoff. Do not report a checksum or XZ/TAR pass that did not occur.

### Import workflow already on Git

The workflow is triggered by a push to `campaign/unity-r2` touching `.import/READY`. It reads that JSON manifest, checks each part's SHA-256 and the decoded payload SHA-256, concatenates and base64-decodes the parts, decompresses XZ/LZMA, extracts approved regular files, runs `python3 tools/verify_baseline.py --test`, then commits the import and removes the staging/workflow files.

The intended top-level extraction allowlist is `README.md`, `AGENTS.md`, `.gitignore`, `docs`, `reference`, `unity`, `tools`, `tests`, and `evidence`. The workflow can write back to the campaign branch. **Do not create READY blindly.** Its existence is an execution trigger, not a harmless progress marker. Inspect the actual workflow and current branch before using it; never skip validation just to make an import succeed.

### Mailbox continuity anchors

| Comment ID | Role in history |
|---|---|
| `6498596792` | Initial v0.4 source handoff and exact ACK requirement |
| `6498758206` | Historical Codex READY for v0.4 P0 |
| `6498789213` | Coordinator preservation/scope gate |
| `6499005591` | Historical Codex P0 handoff; evidence pending acceptance then |
| `6499645521` | User-selected **Stale-Mate** title and v0.5.1 experimental design |
| `6500031229` | Pause/continuity record; Codex standby |
| `6539424277` | v0.5.10 source/evidence receipt |
| `6539591837` | Latest pre-handoff gameplay amendment: information only, **NO ACTIVATION** |

Use `https://github.com/ckprincipal/chessLife/issues/1#issuecomment-<ID>` for these mailbox comments. Historical P0 detailed evidence is also in issue #2 comment `6498969410`. Draft PR #3 is the v0.4 source/design import; draft PR #4 is v0.4 P0 validation. Both were still open drafts when inspected. Do not merge them as a shortcut to v0.5.10 or pretend they are R2 implementation PRs.

## 4. Recoverable inputs and integrity

The companion bundle preserves the exact JavaScript source ZIP, standalone HTML, and Unity starter ZIP. It also includes the eleven R2 Markdown documents unchanged, selected historical supporting notes, the exact staged sacrifice-control script, and fresh test receipts. This is a recovery/continuity package, not a substitute for completing the Git source tree.

| Input | Bytes | SHA-256 |
|---|---:|---|
| `Stale-Mate_v0.5.10_Source.zip` | 2,248,680 | `fde6227f2524576381968c44fd7fa838e2a94986d5036f391154515f2ab40355` |
| `Stale-Mate_v0.5.10_Play.html` | 150,856 | `f0124c3798def328136093afa471a5eff4e2a5c68578809f21c5b0ab7e079297` |
| `Stale-Mate_Unity_Starter_v0.1.zip` | 13,139 | `46148d5906a869ce5673cf7004a47d98ed5308f1f8e7b8dd0944ec3f7806e091` |
| Historical R1.1 dispatch ZIP | 2,282,309 | `b72a89784c502c98a8f95e04df3f42248c59a17a924d6c025cd59271655518d9` |

Exact source identities inside the JS ZIP:

- `prototype/engine.js`: `7e0253b99b339611c5e149ccf3a7e527f62d31df008bb3e7fe0145d541b89776`.
- `prototype/app.js`: `e5743a2d72455f9ade7d3786ce99c2c7f3864ddfb91810a18747a26a44e3bf53`.
- `tools/run_release_tests.py`: `7777283634c2f6ba6f63b16fb718bbb104125681ee07e7ad1c2ea99381b133df`.

The original source ZIP's CRC check passed, and **all 33 original manifest entries matched before rerunning tests**. The starter and R1.1 ZIP CRC checks also passed. These validations were performed for this handoff, not merely copied from an older response.

Current mounted paths were `/mnt/data/Stale-Mate_v0.5.10_Source.zip`, `/mnt/data/Stale-Mate_v0.5.10_Play.html`, `/mnt/data/Stale-Mate_Unity_Starter_v0.1.zip`, and `/mnt/data/Stale-Mate_Unity_Campaign_R2/`. Sandbox paths are session-specific: verify existence or recover the attached bundle in a successor session. A filename or prior download link does not establish a currently accessible file.

Historical Library locations recorded by earlier sessions include `/Stale-Mate/v0.5.10_2026-10-31/`, `/Stale-Mate/unity/Codex_Dispatch_R1_1_2026-10-31/`, and `/Stale-Mate/continuity_2026-10-29/`. These are retrieval hints, not public URLs or proof the next Codex agent can access ChatGPT Library. Prefer the bundled exact inputs and actual Git checkout.

### Intended clean Git layout

```text
README.md
AGENTS.md
.gitignore
docs/
  COMMAND_CENTER.md
  RULES_AND_CHANGES.md
  ACCEPTANCE.md
  DEPLOY_SIX_AGENTS.md
  STATUS.json
  PROVENANCE.json
  agents/SM-C01.md ... SM-C06.md
  contracts/
  history/
  SM-C00_SUCCESSOR_HANDOFF_2026-10-31.md
reference/js-v0.5.10/
  prototype/engine.js, app.js, index.html, style.css
  tests/ and tests/fixtures/
  tools/
  CURRENT_HANDOFF.md, STATE.json, SKILL_CATALOGUE.md, ...
  Stale-Mate_v0.5.10_Play.html
unity/
  Assets/
  Packages/
  ProjectSettings/
tools/integration/, tools/parity/, tools/build/
tests/triage/, tests/parity/
evidence/intake/, evidence/SM-C01/ ... evidence/SM-C06/
```

The JS ZIP has files at its root; the Unity ZIP has a `Stale-Mate_Unity_Starter_v0.1/` wrapper directory. Strip that wrapper when populating `unity/`; do not accidentally nest a second project inside it.

R2 intended to omit five generated browser screenshots from the clean source import while recording their original hashes. They are still retained in the original source ZIP. The original manifest therefore must be checked **before** omissions or test reruns. Use a new, explicit clean-import manifest afterward; never pretend the full original manifest passes against an intentionally reduced tree. Rerunning browser tests can change screenshot bytes without changing game source. Preserve original evidence separately from rerun evidence.

The original user-selected Work, Baby, Work! concept image is different from disposable test screenshots and should remain as historical context. It is not current roster authority.

## 5. Product and version continuity

The displayed title is **Stale-Mate**, with that capitalization and hyphen. The repository remains `ckprincipal/chessLife`; legacy `ChessLifeEngine` compatibility is retained alongside `StaleMateEngine`. Do not rename the repository or break save compatibility merely to match the title.

The core idea is characterful tactical chess: pieces develop identities, skills, professions, relationships, and consequential choices rather than becoming interchangeable higher-stat tokens. The King is the sole royal unit; the Queen is not a second King. The management metaphor matters, particularly the phrase **“executing royal plans.”** Pawns can build, scout, and fight.

Version history must not be flattened:

| Version/material | Historical meaning; do not overstate inheritance |
|---|---|
| v0.2 Git `main` | Older design and concept art, not current game code |
| v0.4 | Playable predecessor; preserve its golden branch and independent P0 evidence |
| v0.5 design | Three-hit durability/Fission proposal; originally design-only |
| v0.4.1 / v0.5.1 | Directional vision/terrain and command/camp experiments; v0.5.1 did not implement all v0.5 proposals |
| v0.5.5 | Pawn-worker ladder and forward-three Pawn movement refinement |
| v0.5.6 | 36 authored Pawn skills, slots/drafts/loadouts and associated tests |
| v0.5.7 | Independent engineer removed; preserve later source's exact legacy-save retirement behavior |
| v0.5.8 | Organizational opening presets; Unity viewer fixtures originate here and have old 8/7/6 counts |
| v0.5.9 | Standard starts without free camps; optional Quick Start retained |
| v0.5.10 | Current 10/9/10 opening rosters; schema 15; latest frozen JS oracle |
| R1 / R1.1 / R2 | Dispatch/campaign document revisions, **not gameplay version numbers** |

Earlier unimplemented three-hit/Fission statements describe their original date, not necessarily today's executable. v0.5.10 actually contains opt-in `pips`, legacy HP, Fission, and camp-capture mechanisms. Preserve their current source behavior and flags; do not enable them by default because an old concept sounded approved.

## 6. Frozen v0.5.10 gameplay contract

### 6.1 Organizations and deliberate inefficiency

| Organization | Exact new-game roster | Total |
|---|---|---:|
| Traditional, default | 1 King, 1 Queen, 2 Rooks, 2 Knights, 2 Bishops, **2 Pawns** | 10 |
| Middle | 1 King, 2 Knights, **6 Pawns** | 9 |
| Flatten (`flat` internally) | 1 King, **9 Pawns** | 10 |

Opponent mirrors by default; independent selection is possible. Historical presets/saves retain their appropriate identities. The most recent roster changes restored two Traditional Rooks, added two Middle Pawns, and added four Flatten Pawns relative to v0.5.8/v0.5.9.

**Traditional's two end-to-end Pawn-workers are intentionally inefficient corporate structure.** Many managers and few workers are the user's intended contrast. Do not “fix” it by adding workers, free camps, rescue production, passive subsidies, or equalized armies. Test its consequences without silently changing the design.

Flatness currently changes the starting organization; it is not evidence of a completed delegation/management simulation. Knights as frontline team leads and Queen/Bishops as managers are theme and future design opportunity, not automatically implemented auras or free orders.

### 6.2 Commands, activation, and victory

Default initial command budget is **3 CP**. Opening costs are P=1, N=1, B=1, R=2, Q=3, K=1; these are opening values, not a claim every later level has the same cost. The original 2-CP comparison remains available. Preserve the actual King milestone/discount/bonus calculations in source rather than substituting a simplified constant.

One normal activation per unit per friendly turn applies, except actual explicit implemented bonus mechanisms. CP budget and unit activation eligibility are distinct. Recruitment, work, attacks, and abilities cannot be made free merely because a new rule changes movement. The free-King rule below is **not** in this baseline.

King capture wins and ends the game. There is **no chess stalemate draw**. A blocked side can pass; “no legal move” must not create a draw or corrupt the turn loop. Do not invent a Queen royal-loss condition.

### 6.3 Board, terrain, and observer fog

Default board is **50×50**, with 30×30 and 70×70 alternatives. Preserve seeded terrain and exact RNG/iteration semantics. Black/unexplored, remembered mist, and current sight are different states.

For legal previews/orders, use player knowledge and last-observed terrain. Resolve hidden true blockers only through legitimate execution. Never read current unseen terrain to narrow a move list, expose an enemy structure change, or leak an invisible unit. Ordinary UI must consume filtered observations, not raw omniscient state.

Sliders preserve their normal orthogonal/diagonal geometry; exploration and terrain affect legal order rays. Forest soft-stops and terrain line of sight must match source. Do not replace directional piece vision with a generic radius. Camps/towers add sight subject to actual terrain LOS, not global revealing circles.

Historical fog-memory leakage was a confirmed defect in older experiments; the current reference includes tests and remembered-terrain behavior. A port can reintroduce that defect even while rendering a convincing opening board.

### 6.4 Pawn movement and work

Pawns move one square into an empty passable **forward-left, forward, or forward-right** tile. They capture only **forward diagonals**. Forward-three movement does not authorize straight captures, sideways movement, or slider attacks.

Pawns are vulnerable military units, scouts, and workers. There is no independent invulnerable engineer in new games. The work ladder is forest clearing at level 1; bridges/watchtowers at level 2; mountain excavation at level 3; camps and Pawn camp operation at level 4.

Ordinary project durations are source-defined: forest 2 friendly work ticks, bridge/tower 2, mountain excavation 3, camp 3; skills can change duration or legal targets. Skill-unlocked fill/tunnel/adjacent projects remain distinct. Preserve worksite restrictions, project locks, activation/CP payment, completion/XP timing, and interruption semantics. Do not assume an ordinary Pawn has every legacy engineer action.

### 6.5 Camps, queues, and capacity

Standard new games start with **zero camps on both sides**. Optional Quick Start (`startingCamp:'ready'`) creates one ready camp per side. Camp-building requires a level-4 Pawn and ordinary construction time. No new camp-count cap has been approved; the military cap of **20** still applies.

King recruitment spends **unspent King XP and CP** at an eligible camp and creates a delayed queue. Source base XP costs are P=3, N=8, B=10; base King-training durations are P=2, N=3, B=4, with the existing camp-trained-count duration calculation. Do not confuse that route with Pawn-produced batches.

An eligible level-4 Pawn on an idle owned camp can remain stationed for **5 friendly training ticks**, or be permanently sacrificed for **2 friendly training ticks**, to produce **two level-1 Pawns OR one level-1 Knight OR one level-1 Bishop**. Instructor shortens stationed training to 4; sacrifice stays 2. Pawn batches do not additionally charge King XP.

Sacrifice removes the operator immediately; graduates arrive later. Batch size is not veteran cloning: do not copy operator XP, skills, lineage privileges, or immediate extra actions. Capacity includes reserved recruits, and sacrifice can free the operator's own slot. A two-Pawn batch needs **two legal/free exits**. At zero remaining ticks without exits, the batch waits rather than silently losing a recruit. “Two turns” means two friendly training ticks, not any two arbitrary UI clicks.

Camp/tower sight covers the eight neighboring cells subject to LOS. Camp laborer occupancy adds an outer ring under actual code rules. For an exact port, inspect `campGarrison` rather than assuming the production-level gate and sight-bonus gate are identical; the reference finds a friendly laborer on the camp, while production additionally requires level eligibility. Watchtower skill modifiers are separate.

### 6.6 XP, skill slots, and routes

King starts with **3 XP**, has a **1.5×** royal XP multiplier, and receives the existing nonroyal military achievement-sharing calculation: 20% of base XP before the King multiplier. No passive XP just for waiting through turns. Preserve actual event, spending, level-up, and rounding order.

Starting skill-slot capacities P/N/B/R/Q/K are **0/1/1/2/3/2**. Pawn slots and choice milestones occur every three levels: 3, 6, …, 99. The current prototype has **36 authored Pawn skills**, twelve in each Scout/Pioneer/Companion family. Offers, chosen skills, equipped skills, cooldowns, and route display are distinct. Keep the exact catalogue and effects; do not summarize thirty-six behaviors into a handful of approximate skills.

The engine uses internal route keys including `guardian` for Companion, and the visible route label for `scout` is Pathfinder. Preserve internal identifiers when porting. Disclosure modes are reversible presentation settings; route affinity adds no invented secret bonus. Full authored skill trees for all other pieces are **not complete**. The current Queen source uses `war`, `phantom`, and `choice`; do not replace these with an older remembered Vampire design without a task.

### 6.7 Saves and legacy behavior

Current save schema is **15**; source loads versions **5–14** through its migration logic. Preserve existing military deployments, camps, queues, XP, equipment choices, CP already spent, and activations already used. New-game 10/9/10 roster defaults must not inject new units into historical saves.

“Preserve old saves” does not mean preserve every obsolete entity unchanged: current `load` explicitly retires living legacy `V` engineers, cancels their unfinished terrain projects, and converts their paid training assignment as coded. This exception is part of the reference, not a new migration proposal. Preserve its exact rules and receipts rather than blindly deleting all old queues or reintroducing engineers.

Keep `tests/fixtures/engine_v056.cjs`, `engine_v058.cjs`, and `engine_v059.cjs`; they support real historical migration cases. Compare semantic state with documented canonicalization. Raw JSON key-order equality is not automatically the save contract. Do not erase action-relevant transient state or hidden/memory state to make comparisons pass.

## 7. Outstanding user requests: separate from the baseline

### BUG-001 — Sacrifice Pawn → two Pawns appears not to work

**Status:** OPEN / UNREPRODUCED, P0 user-facing triage. The operation exists in JS and controlled tests pass. There is no demonstrated repair of the user's actual experience.

Relevant frozen-source locations: `engine.js:496` (`startPawnCampTraining`), `engine.js:523` (`tickTraining`), and `app.js:170–179` (camp panel, disabled-button conditions, confirmation dialog). R1.1 cites a broader range starting at 515; use the function names and exact source, not stale line numbers in isolation.

C02 owns reproduction. C05 owns a training-engine repair if needed; C06 owns visible UI feedback. Any JS hotfix needs a separate C00-authorized writer and versioned branch; never edit the immutable oracle in place.

The next diagnosis should reach level 4 by **ordinary legal play**, construct a camp, enter/operate it, and reproduce the actual UI path. The nine supplied positive controls manually grant level 4 and therefore are not ordinary-progression reproducers. Record before/after save, seed, side, round/serial, unit ID/level/alive/acted/project, CP, camp ownership/terrain/queue, reserved capacity, exits, confirm outcome, browser errors and game log.

Explicitly cover cancellation or blocking of `window.confirm`, having moved onto the camp earlier in the same turn, wrong side/ownership, busy Pawn/camp, insufficient CP, 20-unit capacity, needing two exits, queue at zero but waiting, rapid/double clicks, ended games, and midqueue save/load. A correct but poorly explained queue delay is a possible UI diagnosis, not proof of an engine defect. Do not assume the user's failure is misuse either.

Close only as a reproduced defect with failing regression then repair, or a trace-supported explanation with clear UI correction and product validation. Otherwise report unresolved. Neither the 132 browser checks nor nine positive controls justify “fixed.”

### CR-001 — King moves for 0 CP once each friendly turn

**User-approved intent:** legal King movement costs zero CP, remains possible when team CP is already zero, and is limited to one movement per friendly turn. Recruitment, commands, and unrelated abilities do not automatically become free.

**Unresolved:** whether move-to-capture is free, and whether that movement shares the existing command activation or has a separate movement allowance. R1.1 proposed shared activation and interpreted captures as moves; those details were not separately user-approved. Do not silently finalize them. Preserve baseline behavior in baseline tests until an explicit delta decision.

C04 owns behavior; C03 owns counters/save migration; C02 owns adversarial tests; C06 owns UI. Never set the King's global `activationCost` to zero. Test zero/positive CP, rejected/blocked moves, repeated actions, bonus-action bypass, save/load during a turn, turn resets, capture victory, and the eventual decided relationship to paid commands. Record ruleset application to old saves explicitly.

### CR-002 — Capture or burn opponent facilities

**User-approved capability:** symmetric capture/burning of opposing facilities. Baseline has only experimental camp capture, default OFF; general facility burning is absent.

C04 and C05 should jointly propose the exact semantics. Camps and watchtowers are the proposed first scope, not a silently expanded list of every terrain object. The old camp-capture mechanism (`claimCampAction`, line 549) is a reference input, not automatic approval to use its entire policy for new burning.

Still provisional: occupation requirements, surviving an enemy response turn, 1 CP/one activation, which units may act, default versus feature flag, queue cancellation/no refund, worker/project lock treatment, ongoing construction, and legacy-save behavior. Capture must coherently change ownership and sight; burn must remove facility/production/sight effects without arbitrarily deleting unrelated occupants. Keep remembered fog honest; a hidden destruction must not update an absent observer's map.

Bridge/tunnel demolition is deferred because underlying terrain provenance and occupant safety need decisions. Do not guess “destroyed bridge becomes plain.” Shrines are objectives and not automatically burnable. Include both sides, AI use, repeated actions, partial construction, live queues, blocked exits, capacity reservations, replacement building, and serialization in the test plan.

### UI-001 — Explain yellow squares and action feedback

Solid yellow/gold shrine terrain is `T.SHRINE=4`. A qualifying claim awards **5 base XP** with a **seven-round repeat cooldown per side/shrine**; royal modifiers can change received XP. A shrine also permits learned-skill loadout access away from the King. Legacy shrine gold bookkeeping exists; that does not authorize a new compulsory economy.

Gold selection border, small gold currently visible legal-move dots, gold action-target outline, and minimap gold viewport rectangle are separate indicators. Remembered-mist orders use dashed blue cues. C06 should add a legend/inspection feedback and distinguish queue start, waiting, completion, rejection, and cancellation. No shrine-bonus redesign is authorized.

## 8. Six-agent roster, ownership, and launch state

All six prompts exist as exact files in `campaign-docs/docs/agents/` in the bundle. Their common startup text assumes the import is complete; the HOLD here overrides that assumption until corrected and explicitly activated. No R2 READY/ACK has been observed. Do not invent availability, sessions, branches, or results.

| Role | Branch convention | First bounded assignment after valid activation |
|---|---|---|
| C01 Integration | `sm/c01-r2-integration` | Verify intake/toolchain; assemble ownership/assembly/CI plan; publish contract candidate for C00 |
| C02 Oracle and QA | `sm/c02-r2-oracle` | Independently rerun frozen JS; define replay schema/canonicalization; begin normal-path BUG-001 triage |
| C03 State/RNG/saves | `sm/c03-r2-state` | Propose pure C# state/action/observation/outcome/RNG/save contracts and minimal types |
| C04 Tactics/AI | `sm/c04-r2-tactics` | Trace tactical behavior, propose hooks/scenarios, review shared contract; await freeze for production porting |
| C05 World/progression | `sm/c05-r2-world` | Propose world/fog → labor/training → XP/skills sequence and hooks; assist triage; await freeze |
| C06 Unity client/build | `sm/c06-r2-client` | Actually import/compile the viewer or report blocker; propose presentation adapter; await freeze for gameplay binding |

Exclusive write scopes, including associated `.meta` files:

| Owner | Paths / responsibilities |
|---|---|
| C00 | Command center, design/change statuses, authoritative acceptance and gate records |
| C01 | `docs/contracts/` publication/index; `tools/integration/`; `.github/`; shared root build configuration; Unity Packages/ProjectSettings and assembly-definition registry; `unity/Assets/Scripts/Runtime/`; integration evidence |
| C02 | `tools/parity/`, `tests/parity/`, `tests/triage/`, `unity/Assets/Tests/Parity/`, `evidence/SM-C02/` |
| C03 | `unity/Assets/Scripts/Core/`, `unity/Assets/Tests/EditMode/SMC03/`, `evidence/SM-C03/` |
| C04 | `unity/Assets/Scripts/Rules/Tactics/`, `unity/Assets/Scripts/Rules/AI/`, `unity/Assets/Tests/EditMode/SMC04/`, `evidence/SM-C04/` |
| C05 | `unity/Assets/Scripts/Rules/World/`, `unity/Assets/Scripts/Rules/Progression/`, `unity/Assets/Tests/EditMode/SMC05/`, `evidence/SM-C05/` |
| C06 | `unity/Assets/Scripts/Presentation/`, `unity/Assets/Editor/`, `unity/Assets/Scenes/`, `unity/Assets/Resources/`, UI/art/input assets, PlayMode UI tests, `tools/build/`, `evidence/SM-C06/`, existing `StaleMateBootstrap.cs` viewer |

`reference/` is read-only. C01 owns shared `.asmdef`, Packages and ProjectSettings changes; C06 proposes required fixes rather than racing it. C03 defines shared DTOs; C01 publishes their reviewed contract and composes modules in Runtime. C04 supplies tactical validation and action/CP intent; C05 supplies world/queue/fog/progression effects. Exact call boundaries must be frozen at G0 so validation is not independently duplicated.

C05 has the broadest lane and must deliver sequentially, not a monolithic engine rewrite. Keep six roles; an old R1 suggestion about a possible seventh agent is not authorization to create one.

Use isolated worktrees and topic branches from a pinned completed campaign intake. Agent PRs target `campaign/unity-r2`, not `main`. No force pushes or rebases that destroy published evidence, no unapproved historical merges, and no casual edits in another owner's directory.

## 9. Shared contract before parallel production implementation

Contract names such as `GameState`, `GameConfig`, `GameAction`, `PlayerObservation`, `ActionOutcome`, and `SaveEnvelope` are **proposals, not an existing implemented C# API**. The proposed facade supports new game, filtered observation, legal actions/orders, apply action, end turn, serialize, and load. One composed facade owns authoritative progression; do not create six competing game loops.

G0 must settle these engineering contracts:

- Exact JS unsigned-32-bit/random-number behavior and draw order; stable IDs, array iteration, terrain generation, seed coercion, numeric precision and rounding.
- Board coordinates/indexing, serialized enums, nullable versus absent fields, stable canonical output, and schema/ruleset/build identifiers.
- True state versus observer state versus remembered terrain; legal speculative orders versus execution against hidden blockers; no leaks through UI or rejected-action reasons.
- CP and activation, bonus actions, project locks, alive/ended state, and whether a rejected action mutates any field. Preserve the reference; do not assume every rejection is a universal no-op without inspecting it.
- Transaction ordering for capture, guards/interception, objective claims, XP/levels, queues, worker ticks, cooldowns, side changes, serial and round counters.
- Deterministic cloning/replay, step-by-step oracle snapshots and outcomes, save roundtrip, old-save migration, and transient action-relevant fields.
- Integration hooks and module ownership; who validates, who commits state changes, who refreshes observation, and how events reach presentation.
- Separate baseline outputs and approved-delta outputs, with explicit unsupported inventory rather than hidden TODOs represented as passes.

Pure rules cannot depend on `UnityEngine`. Presentation cannot directly mutate authoritative state. A readonly v0.5.8 JSON fixture shown in Unity does not satisfy any dynamic gameplay parity requirement.

C01 publishes an exact candidate SHA; C02 reviews replay/observation semantics; C03 owns data correctness; C04/C05/C06 review their interfaces. C00 freezes the exact revision after resolving disagreements. Implementers ACK that exact freeze before production porting. Independent environment checks and reproduction work do not need to wait unnecessarily.

## 10. Acceptance gates and evidence

| Gate | Required result | What does not count |
|---|---|---|
| Publication recovery prerequisite | Complete clean Git checkout, pinned intake, source identities, runnable verification, corrected readiness docs | Encoded parts, a README promise, or a documentation-only commit |
| G0 Intake/contracts | Toolchain receipts, independent JS oracle design, shared contract review/freeze, actual ACKs | Six incompatible module sketches or C01 self-freeze |
| G1 Small playable slice | Same-seed current rosters/terrain/fog, move/orders, CP/turns, capture/King victory, actual hot-seat Unity interaction | Static opening viewer, screenshots alone, stale fixture playback |
| G2 Baseline functional parity | Labor, structures, queues/caps/exits, XP, all 36 Pawn skills/loadouts/cooldowns, saves v5–v15, AI and selected optional modes | Default-only mechanics advertised as complete parity |
| G3 Approved deltas | Separately versioned BUG-001 resolution/status, CR-001, CR-002, UI-001 under explicit semantics | Mutating frozen goldens or silently accepting provisional gameplay |
| G4 Build/release candidate | Named Editor compile/Test Runner evidence, real platform artifacts, actual launch/smoke for every claimed target | Browser tests treated as Unity build proof or unsupported-platform promises |

G0 acceptance means the contract is frozen; it opens the authorized implementation stage, not an indefinite “wait for another G0.” Avoid ambiguous gate language. Preparing future designs and tests is allowed within an assignment, but implementing or claiming approval still requires the relevant recorded decision.

First practical platform acceptance is desktop, **Windows preferred for user testing**. macOS, Android, web, iOS, and consoles are separate scopes/receipts. Missing Editor/SDK/license/hardware is BLOCKED or NOT RUN, not PASS. The starter file pins `6000.3.0f1`; that is an input value, not current external verification that the required Editor is installed or every platform works.

Each delivery must include exact base, contract, dependency and HEAD SHAs; branch/PR; changed owned paths; commands and exit codes; test source and logs/JUnit; scenario/seed/config; screenshot or build evidence where relevant; failures, limitations, unsupported scope; and the next requested decision. Evidence belongs under `evidence/SM-C0N/` with source version attached. Large binaries use appropriate authorized release/CI artifacts, not unexplained Git blobs.

C01 assembles only accepted revisions into an integration candidate. C02 verifies **that exact composition**, not merely its individual parents. C00 acceptance names the exact SHA and supported scope. Any later commit creates a new candidate whose verification scope must be assessed; do not transfer an old pass uncritically.

## 11. Mailbox protocol and commander operating loop

All coordination remains in issue #1. Agent PRs store code/reviewable evidence; they are not alternative command hierarchies. Cross-agent questions go to C00 with affected roles in CC. Read the mailbox before starting, after a milestone, before taking a dependency, and before handoff. Silence is not consent.

```text
FROM: SM-C0N / actual-session-id
TO: SM-C00
CC: affected roles or none
KIND: READY | QUESTION | BLOCKED | DELIVERY | REVIEW | HANDOFF
CAMPAIGN: SM-UNITY-R2
TASK / GATE: exact task
ACK OF: exact instruction comment URL/ID
BASE SHA / CONTRACT SHA: actual pins, or explicitly not frozen
BRANCH / HEAD SHA / PR: actual values
OWNED PATHS CHANGED: ...
TESTS: exact commands, exit codes, test source, log/artifact paths
RESULT: implemented and verified scope
LIMITATIONS / NOT RUN: ...
NEXT / DECISION REQUESTED: ...
```

C00 adds a unique decision ID, accepted/rejected SHA, authorized scope, and next gate. Decision kinds include ACTIVATE, CONTRACT-FREEZE, GATE-OPEN, ACCEPT, REVISE, and HOLD. A HANDOFF/receipt is not automatically an ACTIVATE or ACCEPT.

When the user says “review the mailbox,” read live data first. Separate new receipt from stale repeated summary; verify its actual branch and exact files; compare owned-path diff; inspect or rerun targeted tests when possible; decide PASS for a named scope, REVISE for a concrete defect, or BLOCKED with the precise missing input. Do not re-review every historical artifact when a focused diff suffices.

Maintain a compact six-row status view: agent, session, task/gate, base/contract/HEAD, PR, latest receipt URL, tested scope, blocker, next owner. Suggested states are NOT ACTIVATED, READY, WORKING (only with a real receipt), BLOCKED, DELIVERED/PENDING REVIEW, ACCEPTED FOR NAMED SCOPE, and STANDBY. `STATUS.json` was intended but not recovered; reconstruct it honestly rather than marking all six active.

An ACK must identify the exact comment or contract being accepted. A link to an issue alone is not enough when several conflicting revisions exist. Never fabricate another agent's ACK or certify a future workflow result.

## 12. Immediate successor work order

### Step A — Establish current truth without disturbing ongoing work

Read this handoff and the latest mailbox comments, then fetch current branches/tree/PRs. Compare with the snapshot above. Look for changes since the document was written, including a newer import or actual activation. Preserve any uncommitted/local work encountered; never hard reset or clean an unknown worktree.

Post a brief **commander takeover / HANDOFF-ACK + HOLD** referencing this handoff's publication receipt. Keep the stable SM-C00 role. State that publication recovery is the active task and that no six-agent production gate is open unless a later valid decision already opened it.

### Step B — Recover source publication

Prefer the original verified ZIP inputs and direct normal Git import from a writable authenticated environment. Do not spend another session manually pasting huge opaque base64 strings. The previous staging attempt consumed substantial effort without producing a verified working tree; it must not become the main project.

When only the existing staging stream is available, fetch the exact pinned parts in numeric order and verify strict base64, XZ checksum/end-of-stream, archive members, no traversal/absolute paths/symlinks/hardlinks, expected files, and original source hashes **before** preparing READY. A newly calculated checksum of already-corrupted bytes is not original provenance. The original source identities above are independent checks. If recovery fails, preserve that failure and reconstruct from known inputs; never fill missing compressed bytes by guessing.

Rebuild the intended tree with one explicit import owner. Missing generated files such as `AGENTS.md`, `PROVENANCE.json`, `STATUS.json`, or `tools/verify_baseline.py` may be authored anew from the verified inputs and R2 contract, but label them newly reconstructed. Do not claim byte-exact recovery of unknown files. Preserve the old main/golden refs, original versioned artifacts, historical documents, and this handoff.

Put source under `reference/js-v0.5.10/`, viewer under `unity/`, guides/prompts under `docs/`. Make baseline verification real. Record exact input archive hashes, included/omitted paths, and executable-source identities. Keep the immutable reference distinct from generated parity fixtures and later fixes. Review the tree for secrets, caches, unrelated files, duplicate old patches, and invalid links.

Only after a successful clean checkout/test receipt should the import be announced complete. Remove temporary staging from the working tree once safely superseded; preserve Git history. Do not force-push away evidence. A campaign draft PR can then document the consolidated branch for review; opening it is not main-merge authorization.

### Step C — Correct and activate the six existing roles

Update readiness text and commander session labels as needed, without changing stable role IDs or creating another dispatch generation unnecessarily. Publish one exact C00 ACTIVATE comment naming the completed intake SHA, the six prompt paths, current G0-only permissions, and mandatory exact ACKs. The user launches the sessions unless a real launch tool is available; a comment alone is not a process launch.

C01–C03 start intake/contracts/oracle work; C04–C05 review boundaries; C06 validates the actual Editor environment and viewer. Track incoming READY receipts. Do not activate production feature implementation merely because agents have all said hello.

### Step D — Freeze contracts, then build the smallest playable slice

Resolve the contract topics above, freeze one exact revision, collect implementer ACKs, and authorize G1-sized deliveries. Keep C05 sequential. Obtain independent verification of a composed candidate. Do not start a wholesale rewrite or platform-polish campaign before dynamic play works.

Carry BUG-001 triage in parallel when independently possible. Keep approved King/facility directions visible but separate from frozen baseline expectations. Decide unresolved semantics before implementing the deltas. Preserve the browser fallback until Unity has real gameplay and build evidence.

### Step E — Report completion with exact boundaries

Tell the user what is on Git, the actual campaign intake/integration SHA, what the agents have actually delivered, what they tested, and what still blocks the next gate. Do not call this handoff or a source import a finished game. Lead with working artifacts and actionable state, not another stack of patch names.

## 13. Fresh verification receipt from this handoff

A clean copy of the original ZIP was extracted in `/mnt/data/sm_c00_handoff_work/reference-check/`. Original manifest/CRC verification preceded test execution. Node `v22.16.0`, Python `3.13.5`, and `/usr/bin/chromium` were available. No Unity or .NET build was run; their executables were not found on PATH during the inventory command. This is not a claim about every possible installation on another host.

The exact release runner executed these commands, all exit 0:

```sh
node --check prototype/engine.js
node --check prototype/app.js
node tests/organization_v0510.cjs
node tests/regression_v0510.cjs
node tests/pawn_workers_v0510.cjs
node tests/skills_v0510.cjs
node tests/randomized_smoke_v0510.cjs
node tests/randomized_skills_v0510.cjs
python tools/build_standalone.py
python tests/browser_organization_v0510.py
python tests/browser_workers_v0510.py
python tests/browser_skills_v0510.py
```

Counts: focused Node **41 + 23 + 54 + 55 = 173**. Chromium **38 + 46 + 48 = 132**. Randomized smoke: **36 seeded maps**, including 12 staged-Pawn-level maps, **5,495 actions**, 326 projects, 31 queues, 8,260 invariant checks. Randomized skills: **24 staged-level maps**, 1,794 skill picks, **2,917 actions** including 1,115 active skills and 289 builds, 6,319 invariant checks. Total randomized actions **8,412** over 60 maps; those maps are not all ordinary unmodified progression runs.

The rebuilt standalone HTML is 150,856 bytes and matches SHA-256 `f0124c3798def328136093afa471a5eff4e2a5c68578809f21c5b0ab7e079297` byte-for-byte.

The exact additional R1.1 staged sacrifice script was rerun separately against this engine: **9/9 positive controls passed**, three organizations × seeds 43971, 112233, 88001. It grants level 4 directly, builds a camp over three friendly ticks, sacrifices for a two-tick batch, then checks two graduates. It does not reproduce the real UI symptom.

Fresh logs are in the companion bundle's `evidence/`. Original `TEST_RESULTS.txt` remains inside the immutable source ZIP. These are C00's reruns, not a future C02 independent receipt, not human balance evidence, and not Unity proof.

To repeat, extract a disposable copy, run `python tools/verify_sha256.py` **before** tests, then `python tools/run_release_tests.py`. The latter writes `TEST_RESULTS_RERUN.txt` when the original log is present. Browser scripts require Playwright and a usable Chromium; report exact missing dependencies rather than modifying tests silently. Keep generated screenshots out of source-change claims.

## 14. Risks, deliberate non-goals, and practical guidance

Traditional may lose its production route if its two Pawns die before camp construction. Flatten may have nine Pawns competing for three CP. Rooks may be costly before exploration. These are **untested balance questions**, not instructions to rebalance. The user values the organizational asymmetry. Useful future measurements include time to first contact, first camp, first recruitment, worker survival, CP idle/exhaustion, and actual pairing utility; do not invent human win/fun rates.

Work, Baby, Work! remains a separate historical/future mode concept. Its earlier image shows one King and five Engineers, but later wording used five Pawn-workers who scout and fight. Neither that image nor the old Flatten five-Pawn roster overrides current standard rosters. Additional work CP premiums, delegation bonuses, compulsory economies, camp proliferation limits, authored non-Pawn trees, or permanent route locks are not part of this migration.

Do not broaden normal chess attack geometry, revive stalemate, make Queen royal, expose hidden state to the UI, discard historical saves, or redesign combat under the label “porting.” Preserve exact executable behavior until a named change is authorized.

Avoid project-management inflation. One mailbox, one command center, one status table, six owners, and exact source pins are enough. When a concrete blocker appears, make a targeted decision or assign a small repair instead of launching a new review ceremony. Do not reuse FORGE task IDs, mailboxes, reviewer roles, or evidence from the user's unrelated project.

No credentials, Unity license tokens, caches (`Library`, `Temp`, `obj`), full private chats, or unrelated work belong in public Git. Art/font licensing and current platform licensing require separate verification when needed; this handoff makes no legal/commercial clearance claim. Do not infer release rights from the presence of concept images.

## 15. Source navigation and reading order

For a successor, the efficient order is this handoff → live mailbox → R2 command center/change ledger/acceptance → actual JS source/handoff/skills/tests → own task-relevant Unity files. Do not start from old `doc/DESIGN_BIBLE.md` or the viewer's v0.5.8 roster description.

Frozen-source navigation anchors (hash pins above; line numbers may change in later versions):

| Concern | Current source anchor |
|---|---|
| Terrain codes/work ladder/training constants | `engine.js` beginning, especially lines 6–36 |
| Skill catalogue and state | `engine.js` lines 40 onward; exact `SKILL_CATALOGUE.md` |
| Opening presets/Queen paths | `engine.js:167–176` |
| CP/activation/XP | `engine.js:204`, `:209`, `:215`, `:216` |
| Work duration | `engine.js:404` |
| King-training duration | `engine.js:473` |
| Pawn camp training/ticks | `engine.js:496`, `:523` |
| Experimental camp capture | `engine.js:549` |
| New game | `engine.js:594` |
| Memory/passability/moves/orders | `engine.js:608–635` |
| Personal sight/observer filtering/refresh | `engine.js:699`, `:716–739` |
| Shrine XP | `engine.js:740` |
| End turn/action/canAct/AI | `engine.js:1034`, `:1046`, `:1081`, `:1085` |
| Save dump/load/migrations | `engine.js:1148–1213` |
| Exported JS APIs | `engine.js:1215–1217` |
| Sacrifice UI/confirmation | `app.js:170–179` |

Source records supporting this handoff:

- **S1:** Exact v0.5.10 Source ZIP and its `CURRENT_HANDOFF.md`, `STATE.json`, `DECISIONS_AND_OPEN_QUESTIONS.md`, `RELEASE_NOTES.md`, `README_FIRST.md`, `SKILL_CATALOGUE.md`, executable source and tests.
- **S2:** Eleven recovered R2 Markdown files, preserved verbatim under `campaign-docs/` in the companion bundle. Their publication-ready language is overridden by the explicit HOLD here.
- **S3:** Historical R1.1 `MASTER_HANDOFF.md`, `ADDENDUM/CHANGES_AND_BUG_TRIAGE.md`, owner work orders and staged-control script. Preserve superseded proposals as historical, not active authority.
- **S4:** Exact Unity Starter v0.1 ZIP, including native viewer, opening fixtures, port plan, manifest, and `ProjectVersion.txt`.
- **S5:** Live GitHub refs, recursive tree at `1b520a...`, PR collection, and issue #1 comments read during preparation; URLs and exact pins above.
- **S6:** Fresh reference runner and staged-control results retained in `evidence/`; do not conflate with original historical logs.
- **S7:** Organizational Flatness and Work, Baby, Work! concept documents plus unchanged historical image, retained only for design continuity.

## 16. Successor bootstrap prompt

```text
Continue as ChatGPT SM-C00, the centralized commander of Stale-Mate SM-UNITY-R2.
You replace the previous ChatGPT commander; you are not Codex-01 and not a seventh implementer.
The user remains final design authority. Repository: ckprincipal/chessLife.
Single coordination mailbox: https://github.com/ckprincipal/chessLife/issues/1.

Read docs/SM-C00_SUCCESSOR_HANDOFF_2026-10-31.md at the handoff publication SHA
and the latest mailbox comments. Use the attached complete handoff bundle for exact
source ZIPs, six R2 prompts and test evidence when the Git import remains incomplete.

Initial state is HOLD, not deployable R2: pre-handoff campaign HEAD
1b520a5808c4058eee96a8cbc40de3918ba3aa68 contained an import workflow and 14 encoded
parts, no READY and no extracted source. A later documentation commit alone is not
source completion. Recheck live refs before making any assertion or write.

First recover/verify the canonical source publication from the hash-pinned v0.5.10
archive and Unity starter. Do not blindly trigger the importer or manually invent
compressed bytes. Preserve main, v0.4 golden and historical draft PRs.
Correct conditional-ready claims in the R2 guides, then publish one exact-SHA intake
activation only when the checkout is real. Collect actual READY/ACK receipts.
C01 integrates; C02 independently verifies; C03 state/RNG/saves; C04 tactics/AI;
C05 world/fog/labor/progression in stages; C06 Unity presentation and real builds.
C00 alone freezes the shared contract, opens gates and accepts exact candidates.

Preserve Traditional K1 Q1 R2 N2 B2 P2, Middle K1 N2 P6, Flatten K1 P9;
intentional Traditional two-worker inefficiency; no-camp Standard; no separate
engineer; no new camp cap. Keep the JS oracle immutable. Pawn-sacrifice bug is
OPEN/UNREPRODUCED. Zero-CP once/turn King movement and enemy-facility capture/burn
are approved directions, not baseline code; unresolved command/capture/cost/queue
semantics need explicit decisions. Unity is a viewer, not proven gameplay.

Do not ask the user to repeat these decisions. Do not claim agents are active,
contracts accepted, builds tested or background supervision running without evidence.
Post a takeover ACK/HOLD and give the user a compact factual status and next bounded action.
```

## 17. What the next handoff must preserve

Update this document or a clearly linked successor, not a detached stack of patches. Preserve exact current refs and intake/integration/contract pins, mailbox instruction and ACK URLs, six-agent status with blockers, design decisions and unresolved alternatives, test source/environment/logs, versioned playable fallback, and known failures. Keep original experiment versions and denominators.

**Bottom line:** the user asked for a coherent team, not another prototype reset. Restore a trustworthy Git baseline, retain the six-agent structure under SM-C00, preserve intentional design choices, and require actual evidence for every promotion from planned to implemented to verified to accepted.

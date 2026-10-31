// G0 CANDIDATE: submit through C01; C00 has NOT frozen this API.
// Data carriers only. No UnityEngine, facade, RNG algorithm, serializer or game rules.
using System.Collections.Generic;

namespace StaleMate.Core.ContractCandidate
{
    public enum TerrainCode
    {
        Plain = 0, Forest = 1, Water = 2, Mountain = 3, Shrine = 4,
        Bridge = 5, Camp = 6, Tunnel = 7, Tower = 8
    }

    public enum FogStatus { Unexplored, Remembered, Visible }

    public sealed class GameConfig
    {
        // Exact create(options) input, before Number/ToUint32/default coercion.
        public ObjectData Options = new ObjectData();
    }

    public struct RngState
    {
        // Source cursor after ToUint32, before/after one source RNG draw.
        // No extra draw counter is inserted into the legacy wire format.
        public uint Value;
    }

    public sealed class GameState
    {
        // Projection of NORMALIZED source state, not an alternative JS save layout.
        // The adapter maps these fields to the exact legacy keys listed in the proposal.
        public int Version;
        public string Ruleset;
        public string Build;
        public int N;
        public double Seed;
        public double Rng;
        public double NextId;
        public string Side;
        public double Ap;
        public double Round;
        public double Serial;
        public JsonField Winner;
        public List<double> Terrain = new List<double>();
        public List<double> Shrines = new List<double>();
        public List<UnitState> Units = new List<UnitState>();
        public PlayerState White;
        public PlayerState Black;
        public List<StructureState> Camps = new List<StructureState>();
        public List<StructureState> Towers = new List<StructureState>();
        public ArrayData Wildlife = new ArrayData();
        public ArrayData Beacons = new ArrayData();
        public ArrayData Decoys = new ArrayData();
        public ArrayData BattleEcho = new ArrayData();
        public ObjectData WorkAwards = new ObjectData();
        public ObjectData UsedFissionLineages = new ObjectData();
        public List<string> Log = new List<string>();
        public JsonField LastEvent;
        // Flat root settings: armyW/B, routeW/B, commandMode, campCaptureMode,
        // deployment, combatMode, hpMode, fissionEnabled, startingCamp,
        // routeDisclosure, skillSystemVersion. Never serialize a nested settings key.
        public ObjectData Settings = new ObjectData();
        // Remaining source/unknown keys (including migration flags), not duplicates
        // of modeled keys. They must survive clone/roundtrip without normalization.
        public ObjectData AdditionalFields = new ObjectData();
    }

    public sealed class UnitState
    {
        // Keep JS numeric identity; no ID renumbering, string conversion, list sorting,
        // live-unit filtering or int narrowing during persistence.
        public double Id;
        public string Side;
        public string Type; // K/Q/R/B/N/P; legacy V remains a representable record.
        public double Pos;
        public bool Alive;
        public double Level;
        public double Xp;
        public double TotalXp;
        public double Acted;
        public double Bonus;
        public JsonField Project;
        public List<string> LearnedSkills = new List<string>();
        public List<string> EquippedSkills = new List<string>();
        public ArrayData SkillChoices = new ArrayData();
        public ObjectData SkillCooldowns = new ObjectData();
        // All remaining fields: job/bonds, health/pips, lineage, pendingChoices,
        // choiceHistory, cooldown/ward/project/work counters, and future unknowns.
        public ObjectData AdditionalFields = new ObjectData();
    }

    public sealed class PlayerState
    {
        public List<double> Seen = new List<double>();
        public List<double> Sight = new List<double>();
        public List<double> TerrainMemory = new List<double>();
        public ObjectData LastSeen = new ObjectData();
        public ObjectData FirstSeenUnits = new ObjectData();
        public ObjectData ShrineClaim = new ObjectData();
        public ObjectData AdditionalFields = new ObjectData(); // bank, ai, surgeUsed, unknowns
    }

    public sealed class StructureState
    {
        public string Side;
        public double Pos;
        public JsonField Queue;
        // Keep exact queue payload: kind/mode/type/count/remaining/total/started,
        // workerId/kingId/founderId and migratedEngineerToRoyal where present.
        public ObjectData AdditionalFields = new ObjectData();
    }

    public sealed class GameAction
    {
        // Exact source command object. Preserve missing/null, unknown action names
        // and all payload fields until source-equivalent validation is performed.
        public ObjectData Fields = new ObjectData();
    }

    public sealed class CellObservation
    {
        public int Index;
        public FogStatus Fog;
        public int Terrain; // -1 unknown; otherwise rememberedTerrain, never raw hidden truth.
    }

    public sealed class UnitObservation
    {
        public JsonField Id; // Apparent decoys need not carry a real unit ID.
        public string Type;
        public string Side;
        public int Pos;
        public bool OwnUnit;
        public bool ApparentDecoy;
        // C05/C06 must review a visibility whitelist; never copy enemy AdditionalFields.
        public ObjectData VisibleFields = new ObjectData();
    }

    public sealed class PlayerObservation
    {
        public string ObserverSide;
        public string ActiveSide;
        public int N;
        public double Round;
        public double Serial;
        public double Ap;
        public JsonField Winner;
        public List<CellObservation> Cells = new List<CellObservation>();
        public List<UnitObservation> Units = new List<UnitObservation>();
        public ArrayData Ghosts = new ArrayData();
        public ArrayData VisibleStructures = new ArrayData();
        // Own legal orders/skill targets, already filtered by the owning rules module.
        public ArrayData Orders = new ArrayData();
    }

    public sealed class GameEvent
    {
        // NEW adapter events are provisional; they do not replace source lastEvent/log.
        public string Kind;
        public ObjectData Payload = new ObjectData();
        public List<string> ObserverSides = new List<string>();
    }

    public sealed class ActionOutcome
    {
        public bool Ok;
        public JsonField Error; // absent on {ok:true}; never manufacture a null error key.
        public ObjectData AdditionalFields = new ObjectData();
        public List<GameEvent> Events = new List<GameEvent>();
        // No Changed=false promise when Ok=false. Compare the actual before/after state.
    }

    public sealed class SaveEnvelope
    {
        // Proposed future C# envelope; legacy imports remain direct JS state objects.
        // No writer is authorized by these carriers or the proposed schema.
        public int EnvelopeVersion;
        public string BaselineIntakeSha;
        public string ContractRevision;
        public string RulesetId;
        public ObjectData State = new ObjectData();
        public ObjectData AdditionalFields = new ObjectData();
    }
}

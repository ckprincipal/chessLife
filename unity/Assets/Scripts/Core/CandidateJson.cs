// G0 DATA CONTRACT CANDIDATE ONLY. No parser, serializer, rules or migration implementation.
using System.Collections.Generic;

namespace StaleMate.Core.ContractCandidate
{
    // JS Number is binary64. NumberData deliberately retains -0 and non-finite values
    // in memory; a future JSON writer must apply JSON.stringify's documented rules.
    public abstract class JsonData { }
    // In-memory only: omit object members, write array elements as null.
    // Parsing JSON never produces UndefinedData.
    public sealed class UndefinedData : JsonData { }
    public sealed class NullData : JsonData { }
    public sealed class BooleanData : JsonData { public bool Value; }
    public sealed class NumberData : JsonData { public double Value; }
    public sealed class StringData : JsonData { public string Value; }
    public sealed class ArrayData : JsonData
    {
        public List<JsonData> Items = new List<JsonData>();
    }
    public sealed class MemberData
    {
        public string Name;
        public JsonData Value;
    }
    public sealed class ObjectData : JsonData
    {
        // Preserve property order separately from lookup. Runtime enumeration follows
        // ECMAScript integer-index ordering, then string insertion order.
        public List<MemberData> Members = new List<MemberData>();
    }
    public struct JsonField
    {
        // Missing: Present=false, Value=null. Present JSON null: Present=true,
        // Value=new NullData(). Present C# null is invalid, not JSON null.
        public bool Present;
        public JsonData Value;
    }
}

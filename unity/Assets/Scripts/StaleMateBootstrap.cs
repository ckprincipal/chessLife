// Stale-Mate Unity 6.3 LTS presentation spike.
// VERSION/SAFETY: Only the opening STATE PREVIEW has been ported. Gameplay
// orders, fog enforcement, XP, saving, AI and skills remain authoritative in
// the tested JS v0.5.8 engine. Do not claim gameplay parity or save compatibility.
using System;
using UnityEngine;

namespace StaleMate.UnityStarter
{
    [Serializable]
    public sealed class OpeningBundle
    {
        public OpeningState[] openings;
    }

    [Serializable]
    public sealed class OpeningState
    {
        public string mode;
        public string title;
        public string structure;
        public int size;
        public int seed;
        public int[] terrain;
        public int[] sightWhite;
        public int[] seenWhite;
        public int[] rememberedWhite;
        public PreviewUnit[] units;
    }

    [Serializable]
    public sealed class PreviewUnit
    {
        public string side;
        public string type;
        public int pos;
        public int level;
    }

    /// <summary>
    /// Unity-native, read-only 2D board display of exact JS-engine opening snapshots.
    /// The runtime component is created automatically on Play, even in a blank scene.
    /// No external package, plugin, network connection, or art assets are required.
    /// </summary>
    public sealed class StaleMateBootstrap : MonoBehaviour
    {
        private OpeningBundle data;
        private OpeningState current;
        private int active = 0;
        private float centerX = 25f, centerY = 30f;
        private float pixelsPerTile = 25f;
        private string selected = "Click a piece to inspect its role; movement is intentionally disabled in this Unity preview.";
        private static readonly Color BlackFog = new Color(.035f,.050f,.075f);
        private static readonly Color Mist = new Color(.35f,.43f,.50f);
        private static readonly Color PlainA = new Color(.42f,.54f,.44f);
        private static readonly Color PlainB = new Color(.39f,.51f,.42f);
        private static readonly Color Forest = new Color(.15f,.35f,.24f);
        private static readonly Color Water = new Color(.21f,.40f,.57f);
        private static readonly Color Mountain = new Color(.48f,.49f,.53f);
        private static readonly Color Camp = new Color(.71f,.51f,.27f);
        private static readonly Color Tower = new Color(.61f,.65f,.48f);
        private GUIStyle titleStyle, smallStyle, pieceStyle, panelStyle;

        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)]
        private static void Install()
        {
            if (FindFirstObjectByType<StaleMateBootstrap>() != null) return;
            var go = new GameObject("Stale-Mate Unity Preview");
            DontDestroyOnLoad(go);
            go.AddComponent<StaleMateBootstrap>();
        }

        private void Awake()
        {
            Application.targetFrameRate = 60;
            var resource = Resources.Load<TextAsset>("openings_v058");
            if (resource == null)
            {
                Debug.LogError("Missing Assets/Resources/openings_v058.json");
                return;
            }
            data = JsonUtility.FromJson<OpeningBundle>(resource.text);
            if (data == null || data.openings == null || data.openings.Length != 3)
            {
                Debug.LogError("Invalid opening snapshot bundle.");
                return;
            }
            for (int i = 0; i < data.openings.Length; i++)
            {
                var o = data.openings[i];
                if (o.size * o.size != o.terrain.Length || o.size * o.size != o.sightWhite.Length ||
                    o.size * o.size != o.seenWhite.Length || o.size * o.size != o.rememberedWhite.Length)
                    throw new Exception("Invalid preview map array length: " + o.mode);
            }
            Activate(0);
        }

        private void Activate(int index)
        {
            active = index;
            current = data.openings[index];
            PreviewUnit king = null;
            foreach (var piece in current.units)
                if (piece.side == "w" && piece.type == "K") { king = piece; break; }
            centerX = king == null ? current.size / 2f : (king.pos % current.size) + .5f;
            centerY = king == null ? current.size / 2f : (king.pos / current.size) - 4.5f;
            selected = "Opening: " + current.structure + ". Select a piece for details. No Unity gameplay orders yet.";
        }

        private void SetupStyles()
        {
            if (titleStyle != null) return;
            titleStyle = new GUIStyle(GUI.skin.label) { fontSize = 25, fontStyle = FontStyle.Bold };
            titleStyle.normal.textColor = new Color(.91f,.94f,.96f);
            smallStyle = new GUIStyle(GUI.skin.label) { fontSize = 13, wordWrap = true };
            smallStyle.normal.textColor = new Color(.8f,.84f,.87f);
            pieceStyle = new GUIStyle(GUI.skin.label) { alignment = TextAnchor.MiddleCenter, fontSize = 19, fontStyle = FontStyle.Bold };
            panelStyle = new GUIStyle(GUI.skin.box) { alignment = TextAnchor.UpperLeft, wordWrap = true, fontSize = 13 };
        }

        private static void Tile(Rect r, Color color)
        {
            var saved = GUI.color;
            GUI.color = color;
            GUI.DrawTexture(r, Texture2D.whiteTexture);
            GUI.color = saved;
        }

        private static string Abbrev(string type)
        {
            switch (type)
            {
                case "K": return "K";
                case "Q": return "Q";
                case "N": return "N";
                case "B": return "B";
                case "R": return "R";
                case "P": return "P";
                default: return "?";
            }
        }

        private static Color TerrainColor(int t, int r, int c)
        {
            switch (t)
            {
                case 1: return Forest;
                case 2: return Water;
                case 3: return Mountain;
                case 5: return new Color(.69f,.65f,.47f);
                case 6: return Camp;
                case 7: return new Color(.39f,.35f,.31f);
                case 8: return Tower;
                case 4: return new Color(.83f,.65f,.34f);
                default: return ((r + c) & 1) == 0 ? PlainA : PlainB;
            }
        }

        private void OnGUI()
        {
            SetupStyles();
            Tile(new Rect(0,0,Screen.width,Screen.height),new Color(.035f,.063f,.09f));
            GUI.Label(new Rect(18,12,760,39),"Stale-Mate · Unity presentation preview",titleStyle);
            GUI.Label(new Rect(20,51,760,24),"Exact v0.5.8 starting states · no gameplay-port claims",smallStyle);
            if (current == null)
            {
                GUI.Label(new Rect(25,100,900,100),"Cannot find valid starting-state fixtures in Resources/openings_v058.json.");
                return;
            }
            const float margin = 14f;
            var top = 95f;
            var sidebarWidth = Mathf.Min(300f,Screen.width * .32f);
            var board = new Rect(margin,top,Mathf.Max(100,Screen.width - sidebarWidth - 3*margin),Mathf.Max(100,Screen.height - top - margin));
            var sidebar = new Rect(board.xMax + margin,top,sidebarWidth,board.height);
            Tile(board,new Color(.02f,.04f,.06f));
            GUI.Box(sidebar,"",panelStyle);
            GUI.Label(new Rect(sidebar.x+12,top+12,sidebarWidth-24,26),"Organizational flatness",smallStyle);
            string[] labels = {"Traditional","Middle","Flatten"};
            for (int i = 0; i < 3; i++)
                if (GUI.Button(new Rect(sidebar.x+12,top+46+i*35,sidebarWidth-24,30), labels[i] + (i == active ? " ✓" : "")) && i != active)
                    Activate(i);
            GUI.Label(new Rect(sidebar.x+12,top+165,sidebarWidth-24,85),current.structure,smallStyle);
            GUI.Label(new Rect(sidebar.x+12,top+247,sidebarWidth-24,110),selected,smallStyle);
            GUI.Label(new Rect(sidebar.x+12,top+369,sidebarWidth-24,115),
                "Native Unity viewer: zoom with scroll; drag to pan; click a piece. The full 50×50 tactical rules, saves, skills, AI and battle execution still run in the reference JavaScript version.",smallStyle);
            GUI.Label(new Rect(sidebar.x+12,top+493,sidebarWidth-24,80),
                "Next port gate: implement C# movement/attack/capture and match its results to saved JS fixtures before treating Unity as playable.",smallStyle);

            // Render only tiles intersecting the viewport to avoid drawing all 2,500
            // cells each GUI frame on large or small screens.
            int minC = Mathf.Max(0,Mathf.FloorToInt(centerX - board.width/(2*pixelsPerTile))-1);
            int maxC = Mathf.Min(current.size-1,Mathf.CeilToInt(centerX + board.width/(2*pixelsPerTile))+1);
            int minR = Mathf.Max(0,Mathf.FloorToInt(centerY - board.height/(2*pixelsPerTile))-1);
            int maxR = Mathf.Min(current.size-1,Mathf.CeilToInt(centerY + board.height/(2*pixelsPerTile))+1);
            GUI.BeginGroup(board);
            for (int row = minR;row <= maxR;row++)
            for (int col = minC;col <= maxC;col++)
            {
                int pos = row * current.size + col;
                float x = board.width*.5f + (col - centerX)*pixelsPerTile;
                float y = board.height*.5f + (row - centerY)*pixelsPerTile;
                var cell = new Rect(x,y,pixelsPerTile+.4f,pixelsPerTile+.4f);
                bool visible = current.sightWhite[pos] != 0;
                Color fill = current.seenWhite[pos] == 0 ? BlackFog :
                    (visible ? TerrainColor(current.terrain[pos],row,col) : Mist);
                Tile(cell,fill);
                if (visible && current.terrain[pos] == 6) GUI.Label(cell,"C",pieceStyle);
                if (visible && current.terrain[pos] == 8) GUI.Label(cell,"T",pieceStyle);
            }
            foreach (var unit in current.units)
            {
                bool show = unit.side == "w" || current.sightWhite[unit.pos] != 0;
                if (!show) continue;
                int row = unit.pos / current.size, col = unit.pos % current.size;
                if (row < minR || row > maxR || col < minC || col > maxC) continue;
                float x = board.width*.5f + (col - centerX)*pixelsPerTile;
                float y = board.height*.5f + (row - centerY)*pixelsPerTile;
                var cell = new Rect(x,y,pixelsPerTile,pixelsPerTile);
                pieceStyle.normal.textColor = unit.side == "w" ? Color.white : new Color(.12f,.14f,.18f);
                if (pixelsPerTile >= 16) GUI.Label(cell,Abbrev(unit.type),pieceStyle);
            }
            GUI.EndGroup();
            HandleBoardInput(board);
        }

        private Vector2? dragOrigin;
        private bool isPanning;
        private void HandleBoardInput(Rect board)
        {
            var ev = Event.current;
            if (ev.type == EventType.ScrollWheel && board.Contains(ev.mousePosition))
            {
                pixelsPerTile = Mathf.Clamp(pixelsPerTile - ev.delta.y*1.6f,12f,58f);
                ev.Use();
            }
            if (ev.type == EventType.MouseDown && ev.button == 0 && board.Contains(ev.mousePosition))
            {
                dragOrigin = ev.mousePosition;
                isPanning = false;
                ev.Use();
            }
            if (ev.type == EventType.MouseDrag && dragOrigin.HasValue)
            {
                var offset = ev.mousePosition - dragOrigin.Value;
                if (offset.sqrMagnitude > 1f) isPanning = true;
                centerX -= offset.x/pixelsPerTile;
                centerY -= offset.y/pixelsPerTile;
                centerX = Mathf.Clamp(centerX,0,current.size);
                centerY = Mathf.Clamp(centerY,0,current.size);
                dragOrigin = ev.mousePosition;
                ev.Use();
            }
            if (ev.type == EventType.MouseUp && dragOrigin.HasValue && ev.button == 0)
            {
                var offset = ev.mousePosition - dragOrigin.Value;
                // Mouse down/use is intended to select, not move. No game mutation.
                if (!isPanning && offset.magnitude < 4f && board.Contains(ev.mousePosition))
                {
                    int col = Mathf.FloorToInt(centerX + (ev.mousePosition.x-board.center.x)/pixelsPerTile);
                    int row = Mathf.FloorToInt(centerY + (ev.mousePosition.y-board.center.y)/pixelsPerTile);
                    if (col >= 0 && row >= 0 && col < current.size && row < current.size)
                    {
                        int pos = row * current.size + col;
                        selected = "Terrain " + current.terrain[pos] + ". ";
                        foreach (var unit in current.units)
                            if (unit.pos == pos && (unit.side == "w" || current.sightWhite[pos] != 0))
                            {
                                selected = (unit.side == "w" ? "Your " : "Enemy ") + unit.type +
                                    " level " + unit.level + ". This opening view does not execute moves.";
                                break;
                            }
                    }
                }
                dragOrigin = null;
                ev.Use();
            }
        }
    }
}

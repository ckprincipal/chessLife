// Create the first scene using the Unity Editor instead of shipping fragile
// hand-authored Unity serialization YAML. Open project then use the Tools menu.
#if UNITY_EDITOR
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine.SceneManagement;
namespace StaleMate.UnityStarter
{
    public static class StaleMateSceneMenu
    {
        [MenuItem("Tools/Stale-Mate/Create Bootstrap Scene")]
        public static void CreateScene()
        {
            const string scenePath = "Assets/Bootstrap.unity";
            var scene = EditorSceneManager.NewScene(NewSceneSetup.DefaultGameObjects,NewSceneMode.Single);
            EditorSceneManager.SaveScene(scene,scenePath);
            EditorBuildSettings.scenes = new[] { new EditorBuildSettingsScene(scenePath,true) };
            UnityEngine.Debug.Log("Stale-Mate Unity preview scene created and added to Build Settings: " + scenePath);
        }
    }
}
#endif

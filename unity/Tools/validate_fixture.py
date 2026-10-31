"""Validate exported Unity JSON preview snapshots without the Unity Editor."""
import json
from pathlib import Path
root=Path(__file__).resolve().parents[1]
scenes=json.loads((root/'Assets/Resources/openings_v058.json').read_text())['openings']
expected={'traditional':{'K':1,'Q':1,'B':2,'N':2,'P':2},'middle':{'K':1,'N':2,'P':4},'flat':{'K':1,'P':5}}
assert [x['mode'] for x in scenes]==list(expected)
for x in scenes:
    n=x['size'];assert n==50
    for key in ['terrain','seenWhite','sightWhite','rememberedWhite']:
        assert len(x[key])==n*n, (key,x['mode'])
    for side in ['w','b']:
        got={}
        for u in x['units']:
            assert 0<=u['pos']<n*n
            if u['side']==side:got[u['type']]=got.get(u['type'],0)+1
        assert got==expected[x['mode']],(x['mode'],side,got)
    print('PASS Unity fixture',x['mode'],len(x['units']),'units',sum(x['sightWhite']),'visible tiles')
assert 'RuntimeInitializeOnLoadMethod' in (root/'Assets/Scripts/StaleMateBootstrap.cs').read_text()
assert 'Create Bootstrap Scene' in (root/'Assets/Editor/StaleMateSceneMenu.cs').read_text()
print('Unity fixture/schema and source inventory validated; UNITY EDITOR NOT RUN')

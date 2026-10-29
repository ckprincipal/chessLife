"""Bundle prototype HTML, CSS and JavaScript into one offline ChessLife file."""
from pathlib import Path
root=Path(__file__).resolve().parents[1]
base=root/'prototype'
s=(base/'index.html').read_text(encoding='utf-8')
s=s.replace('<link rel="stylesheet" href="style.css">','<style>\n'+(base/'style.css').read_text(encoding='utf-8')+'\n</style>')
for f in ('engine.js','app.js'):
 s=s.replace('<script src="'+f+'"></script>','<script>\n'+(base/f).read_text(encoding='utf-8').replace('</script>','<\\/script>')+'\n</script>')
out=root.parent/'ChessLife_v0.4_Play.html';out.write_text(s,encoding='utf-8')
print(f'Built {out} ({out.stat().st_size:,} bytes)')

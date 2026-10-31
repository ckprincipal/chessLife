from pathlib import Path
import hashlib,sys
root=Path(__file__).resolve().parents[1]
manifest=root/'SHA256SUMS.txt'
count=0
for line in manifest.read_text().splitlines():
    if not line.strip():continue
    digest,name=line.split('  ',1)
    p=root/name
    if not p.exists() or hashlib.sha256(p.read_bytes()).hexdigest()!=digest:
        print('FAIL',name,file=sys.stderr);sys.exit(1)
    count+=1
print('PASS SHA256 verification:',count,'files')

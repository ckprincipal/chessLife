"""Execute exact v0.5.10 engine/browser tests and retain stdout/stderr evidence."""
from pathlib import Path
import datetime
import subprocess
import sys
import hashlib

root=Path(__file__).resolve().parents[1]
commands=[
 ['node','--check','prototype/engine.js'],
 ['node','--check','prototype/app.js'],
 ['node','tests/organization_v0510.cjs'],
 ['node','tests/regression_v0510.cjs'],
 ['node','tests/pawn_workers_v0510.cjs'],
 ['node','tests/skills_v0510.cjs'],
 ['node','tests/randomized_smoke_v0510.cjs'],
 ['node','tests/randomized_skills_v0510.cjs'],
 ['python','tools/build_standalone.py'],
 ['python','tests/browser_organization_v0510.py'],
 ['python','tests/browser_workers_v0510.py'],
 ['python','tests/browser_skills_v0510.py'],
]
target=root/('TEST_RESULTS_RERUN.txt' if (root/'TEST_RESULTS.txt').exists() else 'TEST_RESULTS.txt')
report=['STALE-MATE v0.5.10 TEST EVIDENCE', 'Generated UTC '+datetime.datetime.now(datetime.timezone.utc).isoformat(),
'Engine v0.5.10, save schema 15; default zero camps; Quick Start one per side',
'Browser: actual local Chromium via Python Playwright',
'Known limitation: mechanical checks do not measure balance, fun or Unity parity.', '']
for cmd in commands:
 p=subprocess.run(cmd,cwd=root,text=True,capture_output=True)
 log=(p.stdout or '')+(p.stderr or '')
 line=log.strip().splitlines()[-1] if log.strip() else '(no output)'
 print(' '.join(cmd),'EXIT',p.returncode,'LAST',line,flush=True)
 report.extend(['='*75,'$ '+' '.join(cmd),'exit_code='+str(p.returncode),log])
 if p.returncode:
  target.write_text('\n'.join(report),encoding='utf-8')
  sys.exit(p.returncode)
report.append('ALL EXECUTED CHECKS PASSED')
target.write_text('\n'.join(report),encoding='utf-8')
html=(root/'Stale-Mate_v0.5.10_Play.html')
print('Built HTML SHA256',hashlib.sha256(html.read_bytes()).hexdigest(), 'bytes',html.stat().st_size)

"""Independently test the exact C01 G0 portability proposal in a disposable export.

Run with PYTHONUTF8=1 and an installed CHROMIUM_PATH:
uv run --with playwright==1.64.1 python tools/parity/review_portability.py
No peer/live file is patched and the authorized intake is not changed.
"""
from pathlib import Path
import argparse
import hashlib
import io
import json
import os
import subprocess
import sys
import tarfile
import tempfile

ROOT = Path(__file__).resolve().parents[2]
C01 = '8ec67237d3132869c5fb6602e88fd9b990cd2785'
INTAKE = '83a0baa8a4486562c5c67144324cede402f29cf7'
OUT = ROOT / 'evidence/SM-C02/c01-portability-8ec6723-20261031'
GIT = ['git', '-c', f'safe.directory={ROOT.as_posix()}']


def sha(data):
    return hashlib.sha256(data).hexdigest()


def git(*args):
    return subprocess.check_output(GIT + list(args), cwd=ROOT)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--log-dir', type=Path, default=OUT)
    out = parser.parse_args().log_dir.resolve()
    assert (ROOT / 'evidence/SM-C02').resolve() in out.parents
    out.mkdir(parents=True, exist_ok=False)
    live_wrapper = (ROOT / 'tools/verify_baseline.py').read_bytes()
    head = git('rev-parse', 'HEAD').decode().strip()
    report = {'reviewer': 'SM-C02', 'reviewed_c01_revision': C01,
        'authorized_intake': INTAKE, 'c02_head_at_execution': head,
        'scope': 'Disposable C01 proposal only; no live verifier patch, integration or contract acceptance',
        'commands': [], 'guards': []}
    try:
        archive = git('archive', '--format=tar', C01)  # Native settings; tests the proposed attributes.
        with tempfile.TemporaryDirectory(prefix='SM-C02-review-C01-') as tmp:
            work = Path(tmp).resolve()
            with tarfile.open(fileobj=io.BytesIO(archive), mode='r:') as bundle:
                for member in bundle.getmembers():
                    selected = member.name in {'.gitattributes', 'docs/PROVENANCE.json', 'tools/verify_baseline.py'} or member.name.startswith(('reference/js-v0.5.10/', 'unity/', 'tools/integration/'))
                    if not selected or member.isdir():
                        continue
                    target = work / member.name
                    assert member.isfile() and target.resolve().is_relative_to(work)
                    target.parent.mkdir(parents=True, exist_ok=True)
                    target.write_bytes(bundle.extractfile(member).read())
            provenance = json.loads((work / 'docs/PROVENANCE.json').read_text(encoding='utf-8'))
            count = 0
            for base, key in [('reference/js-v0.5.10', 'reference_included'), ('unity', 'unity_included')]:
                for entry in provenance[key]:
                    raw = (work / base / entry['path']).read_bytes()
                    assert sha(raw) == entry['sha256'] and len(raw) == entry['size_bytes']
                    count += 1
            report['native_export_input_hashes_verified'] = count
            wrapper = work / 'tools/verify_baseline.py'
            original = wrapper.read_bytes()
            pinned_wrapper = git('show', INTAKE + ':tools/verify_baseline.py')
            assert original == pinned_wrapper or original.replace(b'\r\n', b'\n') == pinned_wrapper, 'Exported root verifier differs beyond checkout newlines'
            report['root_wrapper_export_crlf_only'] = original != pinned_wrapper
            patch = (work / 'tools/integration/windows-verifier-proposal.patch').read_bytes()
            lines = patch.decode('utf-8').splitlines()
            assert sum(line.startswith('@@') for line in lines) == 1
            assert '+++ b/tools/verify_baseline.py' in lines
            hunk = lines[next(i for i, line in enumerate(lines) if line.startswith('@@')) + 1:]
            before = '\n'.join(line[1:] for line in hunk if line.startswith((' ', '-'))) + '\n'
            after = '\n'.join(line[1:] for line in hunk if line.startswith((' ', '+'))) + '\n'
            # Match C01's explicit read_text insertion policy for this non-oracle
            # wrapper. Its native archive still converts the un-attributed root file.
            text = original.decode('utf-8').replace('\r\n', '\n')
            assert text.count(before) == 1
            proposed = text.replace(before, after, 1).encode('utf-8')
            assert proposed != original and b'normalize_generated_html.py' in proposed
            # Independently applied exact hunk must match the candidate's declared script bytes.
            declared = json.loads(git('show', C01 + ':evidence/SM-C01/2026-10-31-g0-portability-proposal-r3/proposal-check.json'))
            assert sha(proposed) == declared['proposed_verifier_sha256']
            wrapper.write_bytes(proposed)
            normalizer = work / 'tools/integration/normalize_generated_html.py'
            report['script_pins'] = {'original_verifier': sha(original), 'proposal_patch': sha(patch),
                'proposed_verifier': sha(proposed), 'normalizer': sha(normalizer.read_bytes())}
            command = [sys.executable, 'tools/verify_baseline.py', '--test', '--starter', '--browser', '--log-dir', str(out / 'proposed-wrapper')]
            run = subprocess.run(command, cwd=work, capture_output=True, env=dict(os.environ, PYTHONUTF8='1'))
            (out / 'wrapper-console.txt').write_bytes(run.stdout + run.stderr)
            report['commands'].append({'command': command, 'exit_code': run.returncode})
            receipt = json.loads((out / 'proposed-wrapper/receipt.json').read_text(encoding='utf-8'))
            assert run.returncode == 0 and len(receipt['commands']) == 14
            assert all(c['exit_code'] == 0 for c in receipt['commands'])
            expected = provenance['reference_included']
            expected = next(e['sha256'] for e in expected if e['path'] == 'Stale-Mate_v0.5.10_Play.html')
            assert receipt['rebuilt_html_sha256'] == expected
            report['rebuilt_html_sha256'] = expected
            report['child_commands'] = len(receipt['commands'])
            report['browser_status'] = receipt['browser_status']
            report['export_git_context'] = receipt['git_context']
            protected = work / 'reference/js-v0.5.10/Stale-Mate_v0.5.10_Play.html'
            bad = work / 'changed-content.html'
            bad.write_bytes(b'<html>changed</html>\r\n')
            canonical = work / 'already-lf.html'
            canonical.write_bytes(protected.read_bytes())
            for name, artifact, exit_code in [('changed content rejected', bad, 1),
                    ('protected reference rejected', protected, 1), ('already LF unchanged', canonical, 0)]:
                before_bytes = artifact.read_bytes()
                args = [sys.executable, str(normalizer), '--artifact', str(artifact), '--expected-sha256', expected]
                result = subprocess.run(args, capture_output=True)
                assert result.returncode == exit_code and artifact.read_bytes() == before_bytes
                report['guards'].append({'name': name, 'exit_code': result.returncode, 'bytes_unchanged': True})
            for base, key in [('reference/js-v0.5.10', 'reference_included'), ('unity', 'unity_included')]:
                for entry in provenance[key]:
                    assert sha((work / base / entry['path']).read_bytes()) == entry['sha256']
        assert (ROOT / 'tools/verify_baseline.py').read_bytes() == live_wrapper
        assert git('rev-parse', 'HEAD').decode().strip() == head
        report['live_wrapper_and_c02_head_unchanged'] = True
        report['result'] = 'PASS exact disposable C01 proposal with original browser checks; C00 application/ownership decision remains pending'
        code = 0
    except Exception as error:
        report['result'] = 'FAIL'
        report['error'] = type(error).__name__ + ': ' + str(error)
        code = 1
    (out / 'receipt.json').write_bytes((json.dumps(report, indent=2) + '\n').encode('utf-8'))
    print(json.dumps(report))
    return code


if __name__ == '__main__':
    raise SystemExit(main())

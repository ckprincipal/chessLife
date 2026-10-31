"""Diagnose the original bundler on Windows; this is not a baseline-pass workaround."""
from __future__ import annotations

import hashlib
import json
from pathlib import Path
import subprocess
import sys
import tempfile

ROOT = Path(__file__).resolve().parents[2]
INTAKE = "83a0baa8a4486562c5c67144324cede402f29cf7"


def main() -> int:
    prefix = "reference/js-v0.5.10/"
    paths = ["prototype/index.html", "prototype/style.css", "prototype/engine.js",
             "prototype/app.js", "tools/build_standalone.py", "Stale-Mate_v0.5.10_Play.html"]
    original = subprocess.check_output(["git", "show", INTAKE + ":" + prefix + paths[-1]], cwd=ROOT)
    with tempfile.TemporaryDirectory(prefix="sm-c03-bundle-") as temporary:
        copy = Path(temporary)
        for name in paths:
            destination = copy / name
            destination.parent.mkdir(parents=True, exist_ok=True)
            destination.write_bytes(subprocess.check_output(
                ["git", "show", INTAKE + ":" + prefix + name], cwd=ROOT))
        result = subprocess.run([sys.executable, "tools/build_standalone.py"], cwd=copy,
                                capture_output=True, encoding="utf-8")
        rebuilt = (copy / paths[-1]).read_bytes()
    normalized = rebuilt.replace(b"\r\n", b"\n")
    receipt = {
        "runner": "SM-C03", "intake_sha": INTAKE,
        "command": ["python", "tools/build_standalone.py"], "exit_code": result.returncode,
        "source": "Six files copied byte-for-byte from git show INTAKE:path; original script unmodified",
        "original_bytes": len(original), "rebuilt_bytes": len(rebuilt),
        "original_sha256": hashlib.sha256(original).hexdigest(),
        "rebuilt_sha256": hashlib.sha256(rebuilt).hexdigest(),
        "rebuilt_crlf_count": rebuilt.count(b"\r\n"),
        "diagnostic_lf_sha256": hashlib.sha256(normalized).hexdigest(),
        "diagnostic_lf_equals_original": normalized == original,
        "scope": "Only diagnoses text-mode newline expansion; original wrapper remains FAIL, no oracle/verifier edit",
    }
    output = ROOT / "evidence/SM-C03/windows-bundle-diagnosis.json"
    if output.exists():
        raise SystemExit("Preserve prior bundle diagnosis")
    output.write_text(json.dumps(receipt, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(receipt, indent=2))
    return 0 if result.returncode == 0 and normalized == original and rebuilt != original else 1


if __name__ == "__main__":
    raise SystemExit(main())

"""Verify canonical Git bytes without changing a Windows-converted checkout."""
from __future__ import annotations

import argparse
import hashlib
import io
import json
import os
from pathlib import Path
import subprocess
import sys
import tarfile
import tempfile

ROOT = Path(__file__).resolve().parents[2]
INTAKE = "83a0baa8a4486562c5c67144324cede402f29cf7"


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--log-name", default="canonical-lf-intake-20261031-6543631079")
    args = parser.parse_args()
    if Path(args.log_name).name != args.log_name:
        raise SystemExit("Use a single log-directory name")
    logs = ROOT / "evidence/SM-C03" / args.log_name
    if logs.exists():
        raise SystemExit("Preserve prior evidence: canonical log directory already exists")
    head = subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=ROOT, text=True).strip()
    export_command = ["git", "-c", "core.autocrlf=false", "-c", "core.eol=lf",
                      "archive", "--format=tar", INTAKE]
    payload = subprocess.check_output(export_command, cwd=ROOT)
    logs.mkdir(parents=True)
    metadata = {
        "runner": "SM-C03 / 01a191e1-3413-7c52-927d-715ec7c628fb",
        "intake_sha": INTAKE,
        "role_head_at_export": head,
        "export_command": export_command,
        "export_sha256": hashlib.sha256(payload).hexdigest(),
        "method": "Canonical pinned Git archive; no checkout conversion, no new Git worktree, no oracle edits",
        "note": "The unmodified wrapper runs outside Git, so its git_context is null; this export records the exact source pin.",
        "production_authorized": False,
        "contract_sha": "NOT FROZEN",
    }
    with tempfile.TemporaryDirectory(prefix="sm-c03-canonical-") as temporary:
        copy = Path(temporary)
        with tarfile.open(fileobj=io.BytesIO(payload), mode="r:") as archive:
            for member in archive.getmembers():
                path = Path(member.name)
                if not (member.isfile() or member.isdir()) or path.is_absolute() or ".." in path.parts:
                    raise ValueError(f"Unexpected archive member: {member.name}")
            archive.extractall(copy, filter="data")
        metadata["engine_sha256"] = hashlib.sha256(
            (copy / "reference/js-v0.5.10/prototype/engine.js").read_bytes()
        ).hexdigest()
        command = [sys.executable, str(copy / "tools/verify_baseline.py"),
                   "--test", "--starter", "--log-dir", str(logs)]
        environment = dict(os.environ, PYTHONUTF8="1", PYTHONIOENCODING="utf-8")
        result = subprocess.run(command, cwd=copy, env=environment, capture_output=True,
                                encoding="utf-8", errors="replace")
        (logs / "wrapper-console.txt").write_text(result.stdout + result.stderr, encoding="utf-8")
        metadata["verification_command"] = command
        metadata["exit_code"] = result.returncode
    (logs / "git-export-receipt.json").write_text(json.dumps(metadata, indent=2) + "\n", encoding="utf-8")
    receipt_path = logs / "receipt.json"
    if receipt_path.exists():
        receipt = json.loads(receipt_path.read_text(encoding="utf-8"))
        print(json.dumps({key: receipt.get(key) for key in [
            "result", "error", "reference_files_verified", "starter_files_verified",
            "source_identities", "rebuilt_html_sha256", "commands"]}, indent=2))
    print(json.dumps(metadata, indent=2))
    return result.returncode


if __name__ == "__main__":
    raise SystemExit(main())

"""Rerun the unmodified intake verifier against an exact-byte disposable export.

No checkout configuration or reference file is modified. The initial failed local
checkout receipt remains beside this script. This export is not another session,
worktree, branch, or production candidate.
"""
from __future__ import annotations

import hashlib
import io
import json
from pathlib import Path, PurePosixPath, PureWindowsPath
import subprocess
import sys
import tarfile
import tempfile


ROOT = Path(__file__).resolve().parents[3]
INTAKE = "83a0baa8a4486562c5c67144324cede402f29cf7"
LOGS = ROOT / "evidence/SM-C06/2026-10-31-g0-exact-export"


def main() -> int:
    if LOGS.exists():
        raise RuntimeError("Preserve the existing run; choose a new evidence path")
    archive_command = [
        "git", "-c", "core.autocrlf=false", "-c", "core.eol=lf",
        "archive", "--format=tar", INTAKE,
        "AGENTS.md", "README.md", "docs/PROVENANCE.json",
        "tools/verify_baseline.py", "reference/js-v0.5.10", "unity",
    ]
    payload = subprocess.run(
        archive_command, cwd=ROOT, capture_output=True, check=True
    ).stdout
    with tempfile.TemporaryDirectory(prefix="sm-c06-exact-intake-") as temporary:
        snapshot = Path(temporary)
        with tarfile.open(fileobj=io.BytesIO(payload), mode="r:") as archive:
            for member in archive.getmembers():
                relative = PurePosixPath(member.name)
                if relative.is_absolute() or ".." in relative.parts or PureWindowsPath(member.name).drive:
                    raise ValueError("Unsafe archive path: " + member.name)
                if member.isdir():
                    continue
                if not member.isfile():
                    raise ValueError("Non-regular archive entry: " + member.name)
                destination = snapshot.joinpath(*relative.parts)
                destination.parent.mkdir(parents=True, exist_ok=True)
                source = archive.extractfile(member)
                if source is None:
                    raise ValueError("Missing archive data: " + member.name)
                destination.write_bytes(source.read())
        provenance = json.loads((snapshot / "docs/PROVENANCE.json").read_text(encoding="utf-8"))
        verified = {}
        for directory, key in [("reference/js-v0.5.10", "reference_included"), ("unity", "unity_included")]:
            for entry in provenance[key]:
                data = (snapshot / directory / entry["path"]).read_bytes()
                if len(data) != entry["size_bytes"] or hashlib.sha256(data).hexdigest() != entry["sha256"]:
                    raise ValueError("Exact export integrity failure: " + directory + "/" + entry["path"])
            verified[directory] = len(provenance[key])
        LOGS.mkdir(parents=True)
        command = [sys.executable, "tools/verify_baseline.py", "--test", "--starter", "--log-dir", str(LOGS)]
        result = subprocess.run(command, cwd=snapshot, capture_output=True, text=True)
        (LOGS / "wrapper-stdout.txt").write_text(result.stdout + result.stderr, encoding="utf-8")
        wrapper = json.loads((LOGS / "receipt.json").read_text(encoding="utf-8"))
        context = {
            "executing_role": "SM-C06",
            "session_id": "01a191e1-3785-74b0-9230-c98605e5e1eb",
            "intake_sha": INTAKE,
            "contract_sha": "NOT FROZEN",
            "source": "git archive of exact intake with per-process autocrlf=false/eol=lf; no Git configuration file changed",
            "archive_command": archive_command,
            "archive_sha256": hashlib.sha256(payload).hexdigest(),
            "export_manifest_entries_verified": verified,
            "command": command,
            "exit_code": result.returncode,
            "wrapper_result": wrapper.get("result"),
            "wrapper_error": wrapper.get("error"),
            "child_commands": len(wrapper.get("commands", [])),
            "note": "Export has no .git; wrapper git_context is null. Intake pin is established by archive and manifests. Initial working-checkout failure is not superseded.",
        }
        (LOGS / "export-context.json").write_text(json.dumps(context, indent=2) + "\n", encoding="utf-8")
        print(json.dumps(context, indent=2))
        return result.returncode


if __name__ == "__main__":
    raise SystemExit(main())

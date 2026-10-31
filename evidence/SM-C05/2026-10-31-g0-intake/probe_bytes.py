"""Diagnose Windows intake bytes without editing the reference or Git settings."""
from __future__ import annotations

import argparse
import hashlib
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile

ROOT = Path(__file__).resolve().parents[3]
INTAKE = "83a0baa8a4486562c5c67144324cede402f29cf7"


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def blob(path: str) -> bytes:
    return subprocess.check_output(["git", "show", f"{INTAKE}:{path}"], cwd=ROOT)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    provenance = json.loads(blob("docs/PROVENANCE.json"))
    entries = []
    for prefix, key in [("reference/js-v0.5.10", "reference_included"),
                        ("unity", "unity_included")]:
        for expected in provenance[key]:
            path = prefix + "/" + expected["path"]
            committed = blob(path)
            actual = (ROOT / path).read_bytes()
            entries.append({
                "path": path,
                "expected_sha256": expected["sha256"],
                "git_blob_sha256": sha(committed),
                "git_blob_matches_provenance": (
                    sha(committed) == expected["sha256"]
                    and len(committed) == expected["size_bytes"]),
                "worktree_sha256": sha(actual),
                "git_blob_bytes": len(committed),
                "worktree_bytes": len(actual),
                "working_bytes_equal": actual == committed,
                "only_lf_to_crlf_conversion": (
                    actual != committed and committed.replace(b"\n", b"\r\n") == actual),
            })
    with tempfile.TemporaryDirectory(prefix="sm-c05-builder-probe-") as temporary:
        copy = Path(temporary)
        needed = ["prototype/index.html", "prototype/style.css", "prototype/engine.js",
                  "prototype/app.js", "tools/build_standalone.py"]
        for name in needed:
            target = copy / name
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(blob("reference/js-v0.5.10/" + name))
        env = os.environ.copy()
        env["PYTHONUTF8"] = "1"
        command = [sys.executable, "tools/build_standalone.py"]
        run = subprocess.run(command, cwd=copy, env=env, capture_output=True,
                             text=True, encoding="utf-8", check=False)
        generated = (copy / "Stale-Mate_v0.5.10_Play.html").read_bytes()
        expected_html = blob("reference/js-v0.5.10/Stale-Mate_v0.5.10_Play.html")
        build = {
            "method": "Exact original builder and four inputs read from pinned Git blobs into a disposable directory; original builder executed without modification",
            "command": command,
            "exit_code": run.returncode,
            "stdout": run.stdout.strip(),
            "stderr": run.stderr.strip(),
            "generated_bytes": len(generated),
            "generated_sha256": sha(generated),
            "original_bytes": len(expected_html),
            "original_sha256": sha(expected_html),
            "generated_crlf_count": generated.count(b"\r\n"),
            "generated_lf_normalized_sha256": sha(generated.replace(b"\r\n", b"\n")),
            "generated_lf_normalized_equals_original": (
                generated.replace(b"\r\n", b"\n") == expected_html),
            "no_generated_file_was_normalized": True,
        }
    receipt = {
        "role": "SM-C05",
        "session_id": "01a191e1-345e-7ad0-9375-46c22a1e0d02",
        "intake_sha": INTAKE,
        "scope": "Read-only byte diagnosis and a disposable original-builder reproduction; not an overall verifier pass or gameplay repair",
        "counts": {
            "entries": len(entries),
            "git_blobs_match_provenance": sum(e["git_blob_matches_provenance"] for e in entries),
            "working_files_different": sum(not e["working_bytes_equal"] for e in entries),
            "differences_explained_by_lf_to_crlf": sum(e["only_lf_to_crlf_conversion"] for e in entries),
        },
        "files": entries,
        "standalone_builder": build,
        "reference_or_shared_configuration_modified": False,
    }
    args.output.write_text(json.dumps(receipt, indent=2) + "\n", encoding="utf-8", newline="\n")
    print(json.dumps({"counts": receipt["counts"], "standalone_builder": build}))
    return 0 if all(e["git_blob_matches_provenance"] for e in entries) and run.returncode == 0 else 1


if __name__ == "__main__":
    raise SystemExit(main())

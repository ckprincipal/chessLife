#!/usr/bin/env python3
"""Verify the recovered JS reference; execute checks only in disposable copies.

--test runs the original non-browser JS checks and rebuilds the standalone HTML.
--browser additionally runs the original Playwright scripts; failures are failures.
--starter checks the original viewer snapshot, not a subsequent Unity port.
"""
from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import json
from pathlib import Path
import platform
import shutil
import subprocess
import sys
import tempfile


ROOT = Path(__file__).resolve().parents[1]


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def verify_files(base: Path, entries: list[dict], exact: bool) -> int:
    expected = {entry["path"] for entry in entries}
    for entry in entries:
        path = base / entry["path"]
        if path.is_symlink() or not path.is_file():
            raise ValueError(f"Missing or non-regular baseline file: {path.relative_to(ROOT)}")
        if path.stat().st_size != entry["size_bytes"] or digest(path) != entry["sha256"]:
            raise ValueError(f"Baseline mismatch: {path.relative_to(ROOT)}")
    if exact:
        actual = {str(path.relative_to(base)).replace("\\", "/")
                  for path in base.rglob("*") if path.is_file()}
        extras = sorted(actual - expected)
        if extras:
            raise ValueError("Unexpected reference files; run tests through this wrapper: "
                             + ", ".join(extras))
    return len(entries)


def git_context() -> dict:
    try:
        head = subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=ROOT,
                                       text=True, stderr=subprocess.DEVNULL).strip()
        status = subprocess.check_output(["git", "status", "--porcelain"], cwd=ROOT,
                                         text=True, stderr=subprocess.DEVNULL)
        return {"head_at_execution": head, "worktree_clean_at_start": not bool(status)}
    except (OSError, subprocess.CalledProcessError):
        return {"head_at_execution": None, "worktree_clean_at_start": None}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--test", action="store_true")
    parser.add_argument("--browser", action="store_true")
    parser.add_argument("--starter", action="store_true")
    parser.add_argument("--log-dir", type=Path)
    args = parser.parse_args()
    if args.browser and not args.test:
        parser.error("--browser requires --test")
    log_dir = args.log_dir.resolve() if args.log_dir else None
    reference = ROOT / "reference/js-v0.5.10"
    if log_dir and (log_dir == reference or reference in log_dir.parents):
        parser.error("logs must be outside the immutable reference")
    receipt = {
        "generated_utc": dt.datetime.now(dt.timezone.utc).isoformat(),
        "verifier": "SM-C00 / 000-S2 publication verification wrapper",
        "source_version": "v0.5.10", "git_context": git_context(),
        "environment": {"python": platform.python_version(), "platform": platform.platform()},
        "commands": [], "browser_status": "NOT RUN (not requested)",
        "unity_editor_status": "NOT RUN", "unity_build_status": "NOT RUN",
        "scope": "Source integrity and executed mechanical checks; not balance, human validation, BUG-001 closure, or Unity gameplay parity.",
    }
    if log_dir:
        log_dir.mkdir(parents=True, exist_ok=True)
    try:
        provenance = json.loads((ROOT / "docs/PROVENANCE.json").read_text(encoding="utf-8"))
        receipt["reference_files_verified"] = verify_files(
            reference, provenance["reference_included"], exact=True)
        receipt["omitted_generated_screenshots"] = [
            entry["path"] for entry in provenance["reference_omitted_generated_screenshots"]]
        receipt["source_identities"] = {
            name: digest(reference / name)
            for name in ["prototype/engine.js", "prototype/app.js", "Stale-Mate_v0.5.10_Play.html"]}
        if args.starter:
            receipt["starter_files_verified"] = verify_files(
                ROOT / "unity", provenance["unity_included"], exact=False)
        with tempfile.TemporaryDirectory(prefix="stale-mate-verify-") as temp:
            work = Path(temp)
            js = work / "reference"
            shutil.copytree(reference, js)
            commands: list[tuple[list[str], Path]] = []
            if args.test:
                node = shutil.which("node")
                if not node:
                    raise ValueError("Node is unavailable; no JS checks were run")
                receipt["environment"]["node"] = subprocess.check_output(
                    [node, "--version"], text=True).strip()
                commands = [([node, "--check", "prototype/engine.js"], js),
                            ([node, "--check", "prototype/app.js"], js)]
                for name in ["organization_v0510", "regression_v0510", "pawn_workers_v0510",
                             "skills_v0510", "randomized_smoke_v0510", "randomized_skills_v0510"]:
                    commands.append(([node, f"tests/{name}.cjs"], js))
                commands.append(([sys.executable, "tools/build_standalone.py"], js))
                if args.browser:
                    receipt["browser_status"] = "REQUESTED / PENDING"
                    for name in ["organization", "workers", "skills"]:
                        commands.append(([sys.executable, f"tests/browser_{name}_v0510.py"], js))
            if args.starter:
                viewer = work / "unity"
                shutil.copytree(ROOT / "unity", viewer,
                                ignore=shutil.ignore_patterns("Library", "Temp", "obj", "Logs"))
                commands.append(([sys.executable, "Tools/validate_fixture.py"], viewer))
            for index, (command, cwd) in enumerate(commands, 1):
                result = subprocess.run(command, cwd=cwd, text=True, capture_output=True)
                output = (result.stdout or "") + (result.stderr or "")
                name = f"{index:02d}-{Path(command[-1]).name}.txt"
                if log_dir:
                    (log_dir / name).write_text(output, encoding="utf-8")
                item = {"command": command, "working_copy": cwd.name,
                        "exit_code": result.returncode, "log": name if log_dir else None,
                        "last_line": output.strip().splitlines()[-1] if output.strip() else ""}
                receipt["commands"].append(item)
                print(json.dumps(item), flush=True)
                if result.returncode:
                    if "browser_" in command[-1]:
                        receipt["browser_status"] = "FAILED (see command log)"
                    raise ValueError(f"Command failed: {' '.join(command)}")
            if args.test:
                receipt["rebuilt_html_sha256"] = digest(js / "Stale-Mate_v0.5.10_Play.html")
                if receipt["rebuilt_html_sha256"] != receipt["source_identities"]["Stale-Mate_v0.5.10_Play.html"]:
                    raise ValueError("Rebuilt standalone HTML differs from frozen original")
            if args.browser:
                receipt["browser_status"] = "PASS (three original browser scripts)"
        # Confirm the source was not modified by the checks.
        verify_files(reference, provenance["reference_included"], exact=True)
        receipt["result"] = "PASS FOR EXECUTED SCOPE"
        code = 0
    except (OSError, ValueError, KeyError, subprocess.CalledProcessError) as error:
        receipt["result"] = "FAIL"
        receipt["error"] = str(error)
        code = 1
    if log_dir:
        (log_dir / "receipt.json").write_text(json.dumps(receipt, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(receipt, indent=2))
    return code


if __name__ == "__main__":
    raise SystemExit(main())

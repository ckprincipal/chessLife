"""Test C01's verifier-hook proposal in a disposable Git export, never in place."""
from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import importlib.util
import io
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tarfile
import tempfile


ROOT = Path(__file__).resolve().parents[2]
INTAKE = "83a0baa8a4486562c5c67144324cede402f29cf7"
GIT = ["git", "-c", f"safe.directory={ROOT.as_posix()}"]


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--log-dir", type=Path, required=True)
    args = parser.parse_args()
    log_dir = args.log_dir.resolve()
    owned = (ROOT / "evidence/SM-C01").resolve()
    if owned not in log_dir.parents or log_dir.exists():
        parser.error("use a new directory below evidence/SM-C01")
    log_dir.mkdir(parents=True)
    wrapper = ROOT / "tools/verify_baseline.py"
    before = wrapper.read_bytes()
    report = {"generated_utc": dt.datetime.now(dt.timezone.utc).isoformat(),
              "intake": INTAKE, "scope": "Disposable proposal validation; the live original verifier is not changed or relabeled PASS.",
              "original_verifier_sha256": sha(before), "checks": []}
    try:
        head = subprocess.check_output(GIT + ["rev-parse", "HEAD"], cwd=ROOT, text=True).strip()
        report["head_at_export"] = head
        subprocess.run(GIT + ["merge-base", "--is-ancestor", INTAKE, head], cwd=ROOT, check=True)
        archive = subprocess.check_output(GIT + ["archive", "--format=tar", head], cwd=ROOT)
        with tempfile.TemporaryDirectory(prefix="stale-mate-c01-proposal-") as location:
            work = Path(location).resolve()
            with tarfile.open(fileobj=io.BytesIO(archive), mode="r:") as bundle:
                for member in bundle.getmembers():
                    name = member.name
                    selected = name in {".gitattributes", "docs/PROVENANCE.json", "tools/verify_baseline.py"} or name.startswith(("reference/js-v0.5.10/", "unity/"))
                    if not selected or member.isdir():
                        continue
                    target = work / name
                    if not member.isfile() or not target.resolve().is_relative_to(work):
                        raise ValueError("Unsafe export entry: " + name)
                    target.parent.mkdir(parents=True, exist_ok=True)
                    target.write_bytes(bundle.extractfile(member).read())
            provenance = json.loads((work / "docs/PROVENANCE.json").read_text(encoding="utf-8"))
            entries = [("reference/js-v0.5.10/", e) for e in provenance["reference_included"]]
            entries += [("unity/", e) for e in provenance["unity_included"]]
            for prefix, entry in entries:
                data = (work / prefix / entry["path"]).read_bytes()
                if sha(data) != entry["sha256"] or len(data) != entry["size_bytes"]:
                    raise ValueError("Export byte mismatch: " + prefix + entry["path"])
            report["checks"].append({"check": "Git export preserves all pinned input bytes with native Git settings", "files": len(entries), "result": "PASS"})
            integration = work / "tools/integration"
            integration.mkdir(parents=True)
            normalizer = ROOT / "tools/integration/normalize_generated_html.py"
            shutil.copyfile(normalizer, integration / normalizer.name)
            report["normalizer_sha256"] = sha(normalizer.read_bytes())
            patch = ROOT / "tools/integration/windows-verifier-proposal.patch"
            report["proposal_patch_sha256"] = sha(patch.read_bytes())
            result = subprocess.run(GIT + ["apply", "--check", str(patch)], cwd=ROOT, text=True, capture_output=True)
            if result.returncode:
                raise ValueError("Proposal patch check failed: " + result.stderr)
            # Git apply outside a worktree can skip a path without a nonzero
            # status. Insert this one-hunk proposal into the disposable file
            # explicitly, and prove it changed before executing anything.
            addition = "\n".join(line[1:] for line in patch.read_text(encoding="utf-8").splitlines()
                                 if line.startswith("+") and not line.startswith("+++")) + "\n"
            anchor = '                commands.append(([sys.executable, "tools/build_standalone.py"], js))\n'
            exported_wrapper = work / "tools/verify_baseline.py"
            original_text = exported_wrapper.read_text(encoding="utf-8")
            if original_text.count(anchor) != 1 or not addition.strip():
                raise ValueError("Proposal insertion anchor is not unique")
            exported_wrapper.write_bytes(original_text.replace(anchor, anchor + addition, 1).encode("utf-8"))
            if "normalize_generated_html.py" not in exported_wrapper.read_text(encoding="utf-8"):
                raise AssertionError("Proposed hook was not inserted")
            report["proposed_verifier_sha256"] = sha((work / "tools/verify_baseline.py").read_bytes())
            command = [sys.executable, "tools/verify_baseline.py", "--test", "--starter", "--log-dir", str(log_dir / "proposed-wrapper")]
            environment = dict(os.environ, PYTHONUTF8="1")
            report["process_environment"] = {"PYTHONUTF8": "1"}
            run = subprocess.run(command, cwd=work, text=True, capture_output=True, env=environment)
            (log_dir / "proposed-wrapper-console.txt").write_text(run.stdout + run.stderr, encoding="utf-8")
            report["proposal_command"] = command
            report["proposal_exit_code"] = run.returncode
            receipt = json.loads((log_dir / "proposed-wrapper/receipt.json").read_text(encoding="utf-8"))
            report["proposal_result"] = receipt["result"]
            report["child_commands"] = len(receipt["commands"])
            report["rebuilt_html_sha256"] = receipt.get("rebuilt_html_sha256")
            if run.returncode or len(receipt["commands"]) != 11 or any(c["exit_code"] for c in receipt["commands"]):
                raise ValueError("Proposed wrapper did not complete all eleven checks")
            spec = importlib.util.spec_from_file_location("c01_normalizer", normalizer)
            module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(module)
            expected = receipt["source_identities"]["Stale-Mate_v0.5.10_Play.html"]
            bad = work / "semantic-difference.html"
            bad.write_bytes(b"<html>changed content</html>\r\n")
            bad_before = bad.read_bytes()
            try:
                module.normalize_generated_html(bad, expected)
                raise AssertionError("Semantic difference was accepted")
            except ValueError:
                if bad.read_bytes() != bad_before:
                    raise AssertionError("Rejected output was changed")
            report["checks"].append({"check": "Reject semantic differences without modifying output", "result": "PASS"})
            protected = ROOT / "reference/js-v0.5.10/Stale-Mate_v0.5.10_Play.html"
            protected_before = protected.read_bytes()
            try:
                module.normalize_generated_html(protected, expected)
                raise AssertionError("Immutable-reference write was accepted")
            except ValueError:
                if protected.read_bytes() != protected_before:
                    raise AssertionError("Protected reference changed")
            report["checks"].append({"check": "Reject immutable-reference path without modifying it", "result": "PASS"})
            canonical = work / "already-canonical.html"
            canonical.write_bytes(protected_before)
            if module.normalize_generated_html(canonical, expected)["changed"]:
                raise AssertionError("Canonical artifact unexpectedly changed")
            report["checks"].append({"check": "Already canonical output is unchanged", "result": "PASS"})
        if wrapper.read_bytes() != before:
            raise AssertionError("Live root verifier changed")
        report["original_verifier_unchanged"] = True
        report["result"] = "PASS FOR DISPOSABLE PROPOSAL AND BUILD GUARDS"
        code = 0
    except (OSError, ValueError, AssertionError, subprocess.CalledProcessError) as error:
        report["result"] = "FAIL"
        report["error"] = str(error)
        code = 1
    (log_dir / "proposal-check.json").write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, indent=2))
    return code


if __name__ == "__main__":
    raise SystemExit(main())

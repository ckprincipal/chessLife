"""Restore LF bytes in generated HTML only when they match a supplied exact pin.

This is a declared build step for disposable output, not a reference repair or a
relaxed comparison. The caller must verify the immutable inputs separately.
"""
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]


def normalize_generated_html(artifact: Path, expected_sha256: str) -> dict:
    path = artifact.resolve(strict=True)
    reference = (ROOT / "reference/js-v0.5.10").resolve()
    if path == reference or reference in path.parents:
        raise ValueError("Refusing to write inside the immutable reference")
    if artifact.is_symlink() or not path.is_file():
        raise ValueError("Generated artifact must be a regular file, not a symlink")
    if len(expected_sha256) != 64 or any(c not in "0123456789abcdef" for c in expected_sha256):
        raise ValueError("Expected SHA-256 must be a lowercase 64-character pin")
    original = path.read_bytes()
    original.decode("utf-8", errors="strict")
    candidate = original.replace(b"\r\n", b"\n")
    actual = hashlib.sha256(candidate).hexdigest()
    if actual != expected_sha256:
        raise ValueError("Generated HTML does not match the exact pin after CRLF-to-LF conversion; output preserved")
    if candidate != original:
        path.write_bytes(candidate)
    if hashlib.sha256(path.read_bytes()).hexdigest() != expected_sha256:
        raise ValueError("Generated artifact verification failed after writing")
    return {
        "artifact": str(path),
        "original_sha256": hashlib.sha256(original).hexdigest(),
        "final_sha256": actual,
        "original_bytes": len(original),
        "final_bytes": len(candidate),
        "converted_crlf_sequences": original.count(b"\r\n"),
        "changed": candidate != original,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--artifact", required=True, type=Path)
    parser.add_argument("--expected-sha256", required=True)
    args = parser.parse_args()
    try:
        print(json.dumps(normalize_generated_html(args.artifact, args.expected_sha256)))
        return 0
    except (OSError, UnicodeError, ValueError) as error:
        print(json.dumps({"result": "FAIL", "error": str(error)}))
        return 1


if __name__ == "__main__":
    raise SystemExit(main())

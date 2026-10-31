"""Export source pins and the exact skill metadata for C05's G0 review."""
from __future__ import annotations

import hashlib
import json
from pathlib import Path
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parents[3]
OUTPUT = Path(__file__).resolve().parent
INTAKE = "83a0baa8a4486562c5c67144324cede402f29cf7"


def read_blob(path: str) -> bytes:
    return subprocess.check_output(["git", "show", f"{INTAKE}:{path}"], cwd=ROOT)


def write_json(name: str, value: object) -> None:
    (OUTPUT / name).write_text(json.dumps(value, indent=2) + "\n",
                               encoding="utf-8", newline="\n")


def main() -> int:
    prefix = "reference/js-v0.5.10/"
    sources = ["prototype/engine.js", "prototype/app.js", "SKILL_CATALOGUE.md",
               "tests/pawn_workers_v0510.cjs", "tests/skills_v0510.cjs",
               "tests/regression_v0510.cjs", "tests/organization_v0510.cjs",
               "tests/fixtures/engine_v056.cjs", "tests/fixtures/engine_v058.cjs",
               "tests/fixtures/engine_v059.cjs", "tools/build_standalone.py"]
    provenance = json.loads(read_blob("docs/PROVENANCE.json"))
    expected = {item["path"]: item for item in provenance["reference_included"]}
    pins = []
    for name in sources:
        data = read_blob(prefix + name)
        digest = hashlib.sha256(data).hexdigest()
        pins.append({"path": prefix + name, "sha256": digest, "bytes": len(data),
                     "matches_provenance": digest == expected[name]["sha256"]
                     and len(data) == expected[name]["size_bytes"]})
    with tempfile.TemporaryDirectory(prefix="sm-c05-metadata-") as temporary:
        engine = Path(temporary) / "engine.cjs"
        engine.write_bytes(read_blob(prefix + "prototype/engine.js"))
        program = (
            "const E=require(process.argv[1]);"
            "console.log(JSON.stringify({routes:E.PAWN_ROUTES,"
            "skills:Object.values(E.PAWN_SKILLS),"
            "workProjects:E.WORK_PROJECTS,pawnWorkLevels:E.PAWN_WORK_LEVELS,"
            "workXp:E.WORK_XP,trainingXp:E.TRAIN_XP,trainingTurns:E.TRAIN_TURNS,"
            "skillSlots:E.SKILL_SLOTS,militaryCap:E.MILITARY_CAP}));"
        )
        raw = subprocess.check_output(["node", "-e", program, str(engine)], cwd=ROOT)
        metadata = json.loads(raw)
    counts = {family: sum(skill["family"] == family for skill in metadata["skills"])
              for family in metadata["routes"]}
    if len(metadata["skills"]) != 36 or any(count != 12 for count in counts.values()):
        raise ValueError("Unexpected catalogue inventory; no completeness claim")
    if not all(pin["matches_provenance"] for pin in pins):
        raise ValueError("Source identity mismatch")
    write_json("SOURCE_PINS.json", {"intake_sha": INTAKE, "sources": pins,
                                  "method": "Read exact Git blobs; no working files modified"})
    write_json("skill-catalogue.json", {"intake_sha": INTAKE,
               "source_engine_sha256": pins[0]["sha256"],
               "scope": "Metadata inventory only; no new skill authority or runtime implementation",
               "counts": counts, **metadata})
    print(json.dumps({"intake_sha": INTAKE, "source_pins": len(pins),
                      "skills": len(metadata["skills"]), "families": counts,
                      "generated": ["SOURCE_PINS.json", "skill-catalogue.json"]}))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

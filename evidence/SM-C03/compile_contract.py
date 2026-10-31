"""Compile only G0 data carriers, without shared project edits or Unity references."""
from __future__ import annotations

import hashlib
import json
import os
from pathlib import Path
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parents[2]


def main() -> int:
    dotnet_root = Path(os.environ.get("ProgramFiles", "C:/Program Files")) / "dotnet"
    compiler = dotnet_root / "sdk/5.0.408/Roslyn/bincore/csc.dll"
    reference_pack = dotnet_root / "packs/Microsoft.NETCore.App.Ref/5.0.0/ref/net5.0"
    if not compiler.is_file() or not reference_pack.is_dir():
        raise SystemExit("Expected inventoried SDK/reference pack absent; no compile claimed")
    sources = sorted((ROOT / "unity/Assets/Scripts/Core").glob("Candidate*.cs"))
    if len(sources) != 2:
        raise SystemExit("Review unexpected candidate source inventory")
    with tempfile.TemporaryDirectory(prefix="sm-c03-compile-") as temporary:
        work = Path(temporary)
        output = work / "StaleMate.ContractCandidate.dll"
        response = work / "compile.rsp"
        options = ["/nologo", "/nostdlib+", "/target:library", "/langversion:7.3",
                   "/checked+", "/warnaserror+", f'/out:"{output}"']
        options += [f'/reference:"{reference}"' for reference in sorted(reference_pack.glob("*.dll"))]
        options += [f'"{source}"' for source in sources]
        response.write_text("\n".join(options) + "\n", encoding="utf-8")
        command = [str(dotnet_root / "dotnet.exe"), str(compiler), "/noconfig", "@" + str(response)]
        environment = dict(os.environ, DOTNET_CLI_TELEMETRY_OPTOUT="1",
                           DOTNET_SKIP_FIRST_TIME_EXPERIENCE="1")
        result = subprocess.run(command, cwd=ROOT, env=environment, capture_output=True,
                                encoding="utf-8", errors="replace")
        evidence = ROOT / "evidence/SM-C03/g0-contract"
        (evidence / "compile.log").write_text(result.stdout + result.stderr, encoding="utf-8")
        receipt = {
            "runner": "SM-C03", "intake_sha": "83a0baa8a4486562c5c67144324cede402f29cf7",
            "contract_sha": "NOT FROZEN", "sdk": "5.0.408", "reference_pack": "net5.0 / 5.0.0",
            "command": "dotnet <SDK-5.0.408>/Roslyn/bincore/csc.dll /noconfig @compile.rsp",
            "compiler_options": ["/noconfig", "/nologo", "/nostdlib+", "/target:library", "/langversion:7.3",
                                 "/checked+", "/warnaserror+"],
            "source_sha256": {str(p.relative_to(ROOT)).replace("\\", "/"):
                              hashlib.sha256(p.read_bytes()).hexdigest() for p in sources},
            "exit_code": result.returncode,
            "dll_produced": output.is_file(),
            "scope": "Data-carrier C# compilation only; no UnityEngine reference, no rules/serializer/RNG implementation, no Unity or gameplay parity claim",
        }
        (evidence / "compile-receipt.json").write_text(json.dumps(receipt, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(receipt, indent=2))
    if result.returncode:
        print(result.stdout + result.stderr)
    return result.returncode


if __name__ == "__main__":
    raise SystemExit(main())

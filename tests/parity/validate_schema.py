"""Validate the proposed replay schema and committed goldens, without generation."""
from pathlib import Path
import importlib.metadata
import json
from jsonschema import Draft202012Validator

root = Path(__file__).resolve().parents[2]
schema = json.loads((root / 'tests/parity/replay.schema.json').read_text(encoding='utf-8'))
fixture = json.loads((root / 'tests/parity/baseline-v0510.json').read_text(encoding='utf-8'))
Draft202012Validator.check_schema(schema)
Draft202012Validator(schema).validate(fixture)
print(json.dumps({'result': 'PASS replay JSON schema', 'cases': len(fixture['cases']),
    'validator': importlib.metadata.version('jsonschema'), 'contract': 'NOT FROZEN'}))

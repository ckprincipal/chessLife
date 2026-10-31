"""Actual browser sacrifice controls from a legally progressed, replayable save.

Run: uv run --with playwright==1.64.1 python tests/triage/ordinary_ui.py
CHROMIUM_PATH may select the installed Chrome. No reference file is written.
"""
from pathlib import Path
import hashlib
import json
import os
import subprocess
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[2]
TRACE = ROOT / 'tests/triage/ordinary-v0510.json'
OUT = ROOT / 'evidence/SM-C02/bug001-ordinary-20261031'
OUT.mkdir(parents=True, exist_ok=True)
trace = json.loads(TRACE.read_text(encoding='utf-8'))
subprocess.run(['node', 'tools/parity/ordinary-path.cjs', 'check'], cwd=ROOT, check=True)
html = ROOT / 'reference/js-v0.5.10/Stale-Mate_v0.5.10_Play.html'
assert hashlib.sha256(html.read_bytes()).hexdigest() == 'f0124c3798def328136093afa471a5eff4e2a5c68578809f21c5b0ab7e079297'
errors, dialogs, checks = [], [], []
decisions = []


def record(name, condition):
    checks.append({'name': name, 'pass': bool(condition)})
    assert condition, name


def save(name, state):
    # Game saves keep their original complete data with compact arrays. Human
    # receipts remain indented; neither format drops or reorders state fields.
    text = json.dumps(state, separators=(',', ':')) if 'units' in state else json.dumps(state, indent=2)
    (OUT / f'{name}.json').write_bytes((text + '\n').encode('utf-8'))


with sync_playwright() as pw:
    browser = pw.chromium.launch(headless=True, executable_path=os.environ.get('CHROMIUM_PATH') or
        'C:/Program Files/Google/Chrome/Application/chrome.exe')
    page = browser.new_page(viewport={'width': 1480, 'height': 1050}, accept_downloads=True)
    page.on('pageerror', lambda error: errors.append(str(error)))

    def dialog(d):
        accepted = decisions.pop(0) if decisions else True
        dialogs.append({'type': d.type, 'message': d.message, 'accepted': accepted})
        d.accept() if accepted else d.dismiss()

    page.on('dialog', dialog)
    page.set_content(html.read_text(encoding='utf-8'), wait_until='load')
    # Independently replay the entire legal progression in the browser JS engine.
    browser_progression = page.evaluate('''trace => {
      const E=window.StaleMateEngine,g=E.create(trace.config);
      for(let i=0;i<trace.steps.length;i++){
        const s=trace.steps[i],r=s.op==='aiChoice'?E.aiChoice(g):E.action(g,s.action);
        if(JSON.stringify(r)!==JSON.stringify(s.result))throw Error('Replay differs at '+i);
      }
      return JSON.parse(E.dump(g));
    }''', trace)
    record('all ordinary progression actions and actual AI choices replay identically in Chrome',
           browser_progression == trace['preSacrifice'])

    def load(state):
        page.locator('#savefile').set_input_files({'name': 'ordinary-seed1.json',
            'mimeType': 'application/json', 'buffer': json.dumps(state).encode('utf-8')})
        page.wait_for_timeout(80)

    def exported():
        with page.expect_download() as download:
            page.locator('#save').click()
        return json.loads(Path(download.value.path()).read_text(encoding='utf-8'))

    def select_operator():
        for _ in range(len(trace['preSacrifice']['units']) + 1):
            page.locator('#pawns').click()
            if f"#{trace['operatorId']}" in page.locator('#selectedPanel').inner_text():
                return
        raise AssertionError('Ordinary operator not selectable')

    load(browser_progression)
    select_operator()
    before = exported()
    operator = next(u for u in before['units'] if u['id'] == trace['operatorId'])
    camp_pos = operator['pos']
    record('operator reached Lv4 naturally and can operate its constructed camp',
           operator['level'] >= 4 and operator['alive'] and operator['project'] is None)
    button = page.get_by_role('button', name='Sacrifice pawn → 2 Pawns · 2 turns', exact=True)
    record('actual sacrifice button is enabled in the ordinary progressed save', button.is_enabled())
    save('before', before)
    page.screenshot(path=str(OUT / 'before.png'), full_page=True)

    decisions.append(False)
    button.click()
    canceled = exported()
    record('canceling real confirmation leaves authoritative state unchanged', canceled == before)
    save('cancelled', canceled)

    decisions.append(True)
    button.click()
    after = exported()
    queue = next(c['queue'] for c in after['camps'] if c['pos'] == camp_pos)
    record('confirmed UI action immediately sacrifices the ordinary operator',
           not next(u for u in after['units'] if u['id'] == trace['operatorId'])['alive'])
    record('confirmed UI action creates exactly two pawns for two friendly ticks',
           queue['type'] == 'P' and queue['count'] == 2 and queue['remaining'] == 2 and queue['mode'] == 'sacrifice')
    record('confirmed UI action consumes one CP and preserves King unspent XP',
           after['ap'] == before['ap'] - 1 and
           next(u['xp'] for u in after['units'] if u['side'] == 'w' and u['type'] == 'K') ==
           next(u['xp'] for u in before['units'] if u['side'] == 'w' and u['type'] == 'K'))
    record('queue remains visible after the sacrificed piece disappears',
           '2 friendly work turns left' in page.locator('#economy').inner_text())
    save('confirmed', after)
    page.screenshot(path=str(OUT / 'confirmed.png'), full_page=True)

    load(after)
    restored = exported()
    restored_queue = next(c['queue'] for c in restored['camps'] if c['pos'] == camp_pos)
    record('midqueue UI save/load preserves exact count and remaining ticks', restored_queue == queue)
    states = []
    for tick in [1, 2]:
        page.locator('#endTurn').click()
        page.wait_for_function("!document.querySelector('#endTurn').disabled", timeout=15000)
        state = exported()
        save(f'friendly-tick-{tick}', state)
        states.append(state)
    graduated = states[-1]
    camp = next(c for c in graduated['camps'] if c['pos'] == camp_pos)
    new_pawns = [u for u in graduated['units'] if u['id'] >= after['nextId'] and u['side'] == 'w' and u['type'] == 'P']
    record('two actual friendly end turns complete the queue despite intervening reference AI play',
           camp['queue'] is None and len(new_pawns) == 2)
    record('graduates are level one rather than copies of the veteran',
           all(u['level'] == 1 and u['totalXp'] == 0 for u in new_pawns))
    page.screenshot(path=str(OUT / 'graduated.png'), full_page=True)
    record('no browser JavaScript page errors', not errors)
    summary = {'result': 'Ordinary-path positive control; original user symptom NOT REPRODUCED',
        'bug001_status': 'OPEN / UNREPRODUCED', 'seed': trace['config']['seed'],
        'organization': trace['config']['armyW'], 'map': trace['config']['size'],
        'operatorId': trace['operatorId'], 'roundAtSacrifice': before['round'],
        'legalProgressionOperations': len(trace['steps']), 'browser': browser.version,
        'checks': checks, 'dialogs': dialogs, 'pageErrors': errors,
        'limitations': ['One ordinary seed/Traditional path, not the user original save',
            'Full UI interactions cover sacrifice and queue; earlier progression replays legal engine actions',
            'Blocked exits/capacity/wrong-owner/rapid clicks need separate scenarios',
            'No bug fix, C# parity or Unity claim']}
    save('result', summary)
    print(json.dumps({k: v for k, v in summary.items() if k not in ['dialogs', 'limitations']}, ensure_ascii=True))
    browser.close()

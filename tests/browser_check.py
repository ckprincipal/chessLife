"""Browser smoke: ChessLife v0.4 standalone, economy, new match, AI, save/load and mobile."""
from pathlib import Path
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
html=(root.parent/'ChessLife_v0.4_Play.html').read_text(encoding='utf-8')
with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True, executable_path='/usr/bin/chromium', args=['--no-sandbox'])
    page=browser.new_page(viewport={'width':1536,'height':1050},accept_downloads=True)
    errs=[]
    page.on('pageerror',lambda e:errs.append('pageerror '+str(e)))
    page.on('console',lambda m:errs.append('console '+m.text) if m.type=='error' else None)
    page.on('dialog',lambda d:d.accept())
    page.set_content(html,wait_until='load');page.wait_for_timeout(300)
    assert 'v0.4' in page.title();assert '50×50' in page.locator('#stats').inner_text()
    assert '3 villagers' in page.locator('#stats').inner_text()
    assert all(x in page.locator('#economy').inner_text() for x in ('Food','Gold','Wood'))
    page.screenshot(path=str(root/'tests/screenshot_v04.png'),full_page=True)
    page.locator('#size').select_option('70');page.locator('#routeW').select_option('choice')
    page.locator('#hpMode').select_option('off');page.locator('#new').click()
    assert '70×70' in page.locator('#stats').inner_text();assert 'one-hit captures' in page.locator('#map-note').inner_text()
    page.locator('#endTurn').click();page.wait_for_timeout(1600)
    assert 'Round 2' in page.locator('#stats').inner_text()
    with page.expect_download() as ev:page.locator('#save').click()
    dl=ev.value;save=root/'tests/smoke_saved_match.json';dl.save_as(str(save))
    page.locator('#savefile').set_input_files(str(save));page.wait_for_timeout(200)
    assert 'Save file loaded successfully' in page.locator('#log').inner_text()
    page.set_viewport_size({'width':420,'height':860});page.wait_for_timeout(200)
    page.screenshot(path=str(root/'tests/screenshot_v04_mobile.png'),full_page=True)
    assert not errs,errs
    print('ChessLife v0.4 browser smoke PASSED: 70×70 setup, AI, resources, save/load, mobile. Errors:',errs)
    browser.close()
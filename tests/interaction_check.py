"""Browser interaction: worker orders and Choice Queen loadout swap."""
from pathlib import Path
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
html=(root.parent/'ChessLife_v0.4_Play.html').read_text(encoding='utf-8')
with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
    page=browser.new_page(viewport={'width':1536,'height':1050});errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)));page.on('dialog',lambda d:d.accept())
    page.set_content(html,wait_until='load')
    page.locator('#routeW').select_option('choice');page.locator('#new').click()
    box=page.locator('#board').bounding_box()
    def click(r,c):
        x=box['x']+box['width']/2+(c+.5-25)*25
        y=box['y']+box['height']/2+(r+.5-32)*25
        page.mouse.click(x,y)
    click(34,24)
    text=page.locator('#selectedPanel').inner_text()
    assert 'Choice Queen' in text and '3/3 slots' in text,text
    page.get_by_role('button',name='sacrifice → surge').click()
    text=page.locator('#selectedPanel').inner_text();assert 'surge' in text and 'sacrifice → surge' not in text
    click(37,30)
    text=page.locator('#selectedPanel').inner_text();assert 'Civilian production' in text,text
    page.get_by_role('button',name='Hunt 🐊').click()
    text=page.locator('#selectedPanel').inner_text();assert 'Hunter (gator)' in text,text
    assert not errors,errors
    page.screenshot(path=str(root/'tests/screenshot_v04_interaction.png'),full_page=True)
    print('ChessLife v0.4 interactions PASSED: Queen Choice swapped a learned skill; villager hunting reassigned.')
    browser.close()
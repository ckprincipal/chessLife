"""Actual Chromium checks for v0.5.10 Organizational Flatness integration."""
from pathlib import Path
import json,shutil,os
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
count=0

def check(cond,desc):
 global count
 assert cond,desc
 count+=1
 print('PASS org browser',count,desc)

with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path=os.environ.get('CHROMIUM_PATH') or shutil.which('chromium') or shutil.which('google-chrome'),args=['--no-sandbox','--disable-dev-shm-usage'])
 page=browser.new_page(viewport={'width':1540,'height':1080},device_scale_factor=1,accept_downloads=True)
 errors=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.on('dialog',lambda d:d.accept())
 page.set_content((ROOT/'Stale-Mate_v0.5.10_Play.html').read_text(),wait_until='load')
 check('v0.5.10' in page.title(),'standalone loads v0.5.10 without server')
 check(page.locator('#armyW').input_value()=='traditional','Traditional default selected')
 check(page.locator('#armyB').input_value()=='mirror','opponent mirrored by default')
 check('deputy' in page.locator('#orgPreview').inner_text(),'traditional explanation visible')
 check('10 vs 10 units' in page.locator('#stats').inner_text(),'actual default game shows 8 vs 8')
 check(not page.locator('#routeW').is_disabled(),'Queen route enabled when there is a Queen')
 check(page.locator('#orgPreview').count()==1,'selector has exactly one organizational explanation')
 check('No independent engineer' in page.locator('.setup').inner_text(),'old separate engineer is absent from game rules')
 check('Executing royal plans' in page.locator('#orgPreview').inner_text(),'royal-plans theme embedded')
 def snap():
  with page.expect_download() as handle:page.locator('#save').click()
  path=ROOT/'tests'/'__org_temp.json'
  handle.value.save_as(path)
  state=json.loads(path.read_text());path.unlink(missing_ok=True)
  return state
 def counts(s,side):
  out={}
  for u in s['units']:
   if u['alive'] and u['side']==side:out[u['type']]=out.get(u['type'],0)+1
  return out
 state=snap()
 check(state['version']==15 and state['armyW']==state['armyB']=='traditional','saved default mode persists both sides')
 check(counts(state,'w')=={'R':2,'N':2,'B':2,'Q':1,'K':1,'P':2},'Traditional exact opening unit counts')
 check(len(state['camps'])==0 and state['startingCamp']=='none','default match starts WITHOUT camps')
 check(not [u for u in state['units'] if u['alive'] and u['type']=='V'],'no engineer in actual saved state')
 check(page.locator('#startingCamp').input_value()=='none','no camp is the setup default')
 # Optional Quick Start should not change the default or create a hidden camp limit.
 page.locator('#startingCamp').select_option('ready');page.locator('#new').click();quick=snap()
 check(quick['startingCamp']=='ready' and len(quick['camps'])==2,'optional Quick Start creates exactly one camp per side')
 check(quick['armyW']=='traditional' and counts(quick,'w').get('R')==2,'Quick Start preserves Traditional rooks')
 page.locator('#startingCamp').select_option('none');page.locator('#new').click()
 check(len(snap()['camps'])==0,'returning to default removes prebuilt camps on a NEW match')

 # Choose Middle: both sides should change as a single flatness-mode selection.
 page.locator('#armyW').select_option('middle')
 check('team-led' in page.locator('#orgPreview').inner_text(),'Middle explanations update without starting match')
 check(page.locator('#routeW').is_disabled(),'Queen route disabled for no-Queen starting lineup')
 page.locator('#new').click()
 state=snap()
 check(state['armyW']==state['armyB']=='middle','Middle actually used by both sides with mirror')
 check(counts(state,'w')=={'N':2,'K':1,'P':6},'Middle exact K+2N+6P')
 check(counts(state,'b')=={'N':2,'K':1,'P':6},'Middle opponent exact roster')
 # Flat + Traditional cross-mode, no hidden CP bonus.
 page.locator('#armyW').select_option('flat')
 check('Direct' in page.locator('#orgPreview').inner_text() or 'direct' in page.locator('#orgPreview').inner_text(),'Flatten description updates')
 page.locator('#armyB').select_option('traditional')
 check('Traditional' in page.locator('#orgPreview').inner_text(),'opponent override is reflected in preview')
 page.locator('#new').click()
 state=snap()
 check(state['armyW']=='flat' and state['armyB']=='traditional','asymmetric Flat vs Traditional matchup saved')
 check(counts(state,'w')=={'K':1,'P':9},'Flatten starts King and nine Pawn-workers')
 check(counts(state,'b')=={'R':2,'N':2,'B':2,'Q':1,'K':1,'P':2},'opponent independent Traditional roster')
 check(state['ap']==3 and state['commandMode']=='roomy','flat management does not grant free CP')
 check('10 vs 10 units' in page.locator('#stats').inner_text(),'actual scoreboard reflects asymmetric rosters')
 # Save import should restore selected choices and no Queen route.
 page.locator('#armyW').select_option('middle')
 page.locator('#armyB').select_option('mirror')
 page.locator('#savefile').set_input_files({'name':'flat-traditional.json','mimeType':'application/json','buffer':json.dumps(state).encode()})
 page.wait_for_timeout(50)
 check(page.locator('#armyW').input_value()=='flat','loading save restores player organizational selection')
 check(page.locator('#armyB').input_value()=='traditional','loading save restores opponent override')
 check(page.locator('#routeW').is_disabled(),'loaded no-Queen structure disables route control')
 check('10 vs 10 units' in page.locator('#stats').inner_text(),'loaded game remains playable')
 # v0.5.7 historical formation save (version 12).
 older=page.evaluate('''()=>{const E=window.StaleMateEngine;const g=E.create({armyW:'balanced',armyB:'bastion'});g.version=12;g.build='Stale-Mate v0.5.7';g.ap=1;return g;}''')
 page.locator('#savefile').set_input_files({'name':'old_version12.json','mimeType':'application/json','buffer':json.dumps(older).encode()})
 page.wait_for_timeout(60)
 check(page.locator('#armyW').input_value()=='balanced','legacy Balanced army restored from v0.5.7 save')
 check(page.locator('#armyB').input_value()=='bastion','legacy Fortress enemy restored')
 check('1 / 3 military CP' in page.locator('#stats').inner_text(),'preserves saved remaining CP instead of resetting')
 check('9 vs 9 units' in page.locator('#stats').inner_text(),'does not overwrite old pieces with new structures')
 # Screenshot of the new UI with selected Flat mode
 page.locator('#armyW').select_option('flat');page.locator('#armyB').select_option('mirror');page.locator('#new').click()
 if not (ROOT/'tests'/'browser_org_v0510_screenshot.png').exists():
     page.screenshot(path=str(ROOT/'tests'/'browser_org_v0510_screenshot.png'),full_page=True)
 check(not errors,'no Chromium JavaScript errors: '+str(errors))
 browser.close()
print('ORG BROWSER v0.5.10:',count,'checks passed')

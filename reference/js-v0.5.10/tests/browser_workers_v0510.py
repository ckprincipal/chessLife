"""Real Chromium interactions for pawn-worker v0.5.10 UI; fixture levels are not playtest results."""
from pathlib import Path
import json, os, shutil
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
passed=0

def check(cond,why):
    global passed
    assert cond,why
    passed+=1
    print(f'PASS worker browser {passed}: {why}')

with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True,executable_path=os.environ.get('CHROMIUM_PATH') or shutil.which('chromium') or shutil.which('google-chrome'),args=['--no-sandbox','--disable-dev-shm-usage'])
    page=browser.new_page(viewport={'width':1480,'height':1050},device_scale_factor=1,accept_downloads=True)
    errors=[];decisions=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.on('dialog',lambda d:d.dismiss() if decisions and not decisions.pop(0) else d.accept())
    page.set_content((ROOT/'Stale-Mate_v0.5.10_Play.html').read_text(),wait_until='load')
    page.wait_for_timeout(100)
    def fixture(level=1,terrain=0,camp=False,type_='P'):
        return page.evaluate('''({level,terrain,camp,type})=>{
          const E=window.StaleMateEngine,g=E.create({size:50,seed:43971}),p=E.withSide(g,'w').find(u=>u.type==='P'),wk=E.king(g,'w'),bk=E.king(g,'b');
          for(const u of g.units)if(![p,wk,bk].includes(u))u.alive=false;
          g.terrain.fill(E.T.PLAIN);g.camps=[];g.towers=[];g.beacons=[];g.decoys=[];g.battleEcho=[];g.shrines=[];
          p.type=type;p.level=level;p.pos=32*50+25;p.xp=0;p.totalXp=0;p.project=null;p.acted=-1;
          wk.pos=51;bk.pos=48*50+48;g.side='w';g.ap=3;
          for(const bank of Object.values(g.players)){bank.seen.fill(0);bank.sight.fill(0);bank.terrainMemory.fill(-1);bank.lastSeen={};bank.firstSeenUnits={};}
          g.terrain[p.pos]=terrain;
          if(camp){g.terrain[p.pos]=E.T.CAMP;g.camps.push({side:'w',pos:p.pos,queue:null,trained:{P:0,N:0,B:0}});}
          E.refreshBoth(g);return {g,id:p.id,pos:p.pos};
        }''',dict(level=level,terrain=terrain,camp=camp,type=type_))
    def load(snap):
        page.locator('#savefile').set_input_files({'name':'worker_fixture.json','mimeType':'application/json','buffer':json.dumps(snap['g']).encode()})
        page.wait_for_timeout(60)
        check('Save file loaded successfully' in page.locator('#selectedPanel').inner_text() or 'Cannot load' not in page.locator('body').inner_text(),'fixture loads without error')
    def click_square(pos):
        r,c=divmod(pos,50);box=page.locator('#board').bounding_box()
        page.locator('#board').click(position={'x':box['width']/2+(c-25+0.5)*25,'y':box['height']/2+(r-32+0.5)*25})
    def select(snap):
        click_square(snap['pos']);page.wait_for_timeout(25)
    def exported():
        with page.expect_download() as dl:page.locator('#save').click()
        p=ROOT/'tests'/'worker_ui_temp.json';dl.value.save_as(p)
        state=json.loads(p.read_text());p.unlink();return state
    def unit(state,id):
        return next(u for u in state['units'] if u['id']==id)

    f=fixture(1,terrain=1);load(f);select(f)
    text=page.locator('#selectedPanel').inner_text()
    check('forward-left, forward, forward-right' in text and 'Capture only forward-left/right' in text,'movement versus capture distinction is visible')
    check('L1: clear forest. L2: bridge water and build watchtowers. L3: excavate mountains. L4:' in text,'correct level 1–4 ladder shown')
    check(page.get_by_role('button',name='Clear forest · Lv1 · 2 turns',exact=True).is_enabled(),'L1 forest button available')
    check(page.get_by_role('button',name='Build watchtower · Lv2 · 2 turns',exact=True).is_disabled(),'L1 tower button locked')
    check(page.get_by_role('button',name='Build training camp · Lv4 · 3 turns',exact=True).is_disabled(),'L1 camp button locked')
    page.get_by_role('button',name='Clear forest · Lv1 · 2 turns',exact=True).click();state=exported()
    check(state['ap']==2 and unit(state,f['id'])['project']['kind']=='clear_forest','UI forest action spends one CP and records work')
    check('BUSY:' in page.locator('#selectedPanel').inner_text(),'busy pawn has visible lock status')

    f=fixture();load(f);select(f);click_square(f['pos']-51);state=exported()
    check(unit(state,f['id'])['pos']==f['pos']-51 and state['ap']==2,'actual board click moves pawn to an empty forward diagonal')
    f=fixture();enemy=next(u for u in f['g']['units'] if u['side']=='b' and u['type']=='N');enemy.update(alive=True,pos=f['pos']-50);load(f);select(f);click_square(enemy['pos']);state=exported()
    check(unit(state,f['id'])['pos']==f['pos'] and unit(state,enemy['id'])['alive'] and state['ap']==3,'board cannot capture an enemy directly forward')

    f=fixture(2);f['g']['terrain'][f['pos']-50]=2;load(f);select(f)
    page.get_by_role('button',name='Bridge water · Lv2 · 2 turns',exact=True).click()
    check('highlighted worksite' in page.locator('#selectedPanel').inner_text(),'bridge uses visible worksite targeting')
    click_square(f['pos']-50);state=exported();u=unit(state,f['id'])
    check(u['pos']==f['pos'] and u['project']['pos']==f['pos']-50 and state['ap']==2,'bridge order leaves pawn safely on shore')

    f=fixture(2);load(f);select(f)
    page.get_by_role('button',name='Build watchtower · Lv2 · 2 turns',exact=True).click();state=exported()
    check(unit(state,f['id'])['project']['kind']=='tower' and unit(state,f['id'])['project']['remaining']==2,'watchtower is a real two-turn construction order')
    f=fixture(3);f['g']['terrain'][f['pos']-50]=3;load(f);select(f)
    check(page.get_by_role('button',name='Clear mountain · Lv3 · 3 turns',exact=True).is_enabled(),'L3 mountain clearing available from adjacent land')
    check(page.get_by_role('button',name='Build training camp · Lv4 · 3 turns',exact=True).is_disabled(),'L3 camp remains locked')

    f=fixture(4);load(f);select(f)
    page.get_by_role('button',name='Build training camp · Lv4 · 3 turns',exact=True).click();state=exported()
    check(unit(state,f['id'])['project']['kind']=='camp' and unit(state,f['id'])['project']['remaining']==3,'L4 builds a camp, not before that level')

    f=fixture(4,camp=True);load(f);select(f)
    check('No King XP charge' in page.locator('#selectedPanel').inner_text(),'new pawn production price is explicit')
    for label in ['Keep pawn → 2 Pawns · 5 turns','Sacrifice pawn → 2 Pawns · 2 turns','Keep pawn → 1 Knight · 5 turns','Sacrifice pawn → 1 Knight · 2 turns','Keep pawn → 1 Bishop · 5 turns','Sacrifice pawn → 1 Bishop · 2 turns']:
        check(page.get_by_role('button',name=label,exact=True).is_enabled(),label+' available')
    if not (ROOT/'tests'/'browser_workers_v0510_screenshot.png').exists():
        page.screenshot(path=str(ROOT/'tests'/'browser_workers_v0510_screenshot.png'),full_page=True)
    decisions.append(False);page.get_by_role('button',name='Sacrifice pawn → 2 Pawns · 2 turns',exact=True).click();state=exported()
    check(unit(state,f['id'])['alive'] and state['camps'][0]['queue'] is None and state['ap']==3,'declining sacrifice confirmation leaves state unchanged')
    page.get_by_role('button',name='Sacrifice pawn → 2 Pawns · 2 turns',exact=True).click();state=exported();q=state['camps'][0]['queue']
    check(not unit(state,f['id'])['alive'] and q['type']=='P' and q['count']==2 and q['remaining']==2,'confirmed sacrifice consumes pawn and creates the exact fast batch')
    check(state['ap']==2 and next(u for u in state['units'] if u['type']=='K' and u['side']=='w')['xp']==3,'pawn batch costs one activation but no King XP')
    check('2 Pawn' in page.locator('#economy').inner_text() and '2 friendly work turns left' in page.locator('#economy').inner_text(),'fast queue stays visible after its pawn disappears')
    check(state['players']['w']['sight'][f['pos']+100]==0,'sacrifice removes camp outer-ring sight')

    f=fixture(4,camp=True);load(f);select(f)
    page.get_by_role('button',name='Keep pawn → 1 Knight · 5 turns',exact=True).click();state=exported();u=unit(state,f['id']);q=state['camps'][0]['queue']
    check(u['alive'] and u['project']['kind']=='training' and q['type']=='N' and q['remaining']==5,'keep mode locks the living pawn for the five-turn knight queue')
    check(state['players']['w']['sight'][f['pos']+100]==1,'stationed pawn retains outer camp sight')
    old=state['ap'];click_square(f['pos']-50);check(exported()['ap']==old,'busy pawn cannot move for a free activation')

    f=fixture(4,camp=True);load(f);select(f)
    page.get_by_role('button',name='Keep pawn → 1 Bishop · 5 turns',exact=True).click();state=exported()
    check(state['camps'][0]['queue']['type']=='B' and state['camps'][0]['queue']['count']==1,'bishop production is one bishop, not a pawn pair')
    for type_,cost in [('R',2),('B',1)]:
        f=fixture(type_=type_);load(f);select(f);click_square(f['pos']-50 if type_=='R' else f['pos']-51);state=exported()
        check(state['ap']==3-cost,f'{type_} actual UI move deducts {cost} CP')
    check(not errors,'no JavaScript page errors: '+repr(errors))
    browser.close()
print(f'WORKER BROWSER v0.5.10: {passed}/{passed} passed')

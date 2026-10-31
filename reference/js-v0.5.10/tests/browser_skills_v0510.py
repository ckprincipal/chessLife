"""Real Chromium UI checks. Levels/skills in fixtures are staged, not human playtest data."""
from pathlib import Path
import json, os, shutil
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
passed=0

def check(ok, label):
    global passed
    assert ok, label
    passed+=1
    print(f'PASS skill browser {passed}: {label}')

with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True,executable_path=os.environ.get('CHROMIUM_PATH') or shutil.which('chromium') or shutil.which('google-chrome'),args=['--no-sandbox','--disable-dev-shm-usage'])
    page=browser.new_page(viewport={'width':1480,'height':1050},device_scale_factor=1,accept_downloads=True)
    errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.on('dialog',lambda d:d.accept())
    page.set_content((ROOT/'Stale-Mate_v0.5.10_Play.html').read_text(),wait_until='load')
    check('v0.5.10' in page.title(),'correct release loaded')
    check('0/1/1/2/3/2' in page.locator('body').inner_text(),'new slot contract visible in setup')
    check(page.locator('#skillReady').is_disabled(),'fresh level-1 army has no unearned choices')
    caps=page.evaluate("['P','N','B','R','Q','K'].map(type=>window.StaleMateEngine.skillCapacity({type,level:1}))")
    check(caps==[0,1,1,2,3,2],'browser engine has exact six base capacities')

    def fixture(level=3,terrain=0,skills=None,choices=None,disclosure='effects',ally=False,known=False):
        out=page.evaluate('''({level,terrain,skills,choices,disclosure,ally,known})=>{
          const E=window.StaleMateEngine,g=E.create({size:50,seed:43971,routeDisclosure:disclosure}),p=E.withSide(g,'w').find(u=>u.type==='P'),wk=E.king(g,'w'),bk=E.king(g,'b'),friend=E.withSide(g,'w').find(u=>u.type==='N');
          for(const u of g.units)if(![p,wk,bk].includes(u))u.alive=false;
          g.terrain.fill(E.T.PLAIN);g.camps=[];g.towers=[];g.beacons=[];g.decoys=[];g.battleEcho=[];g.shrines=[];
          p.level=level;p.pos=32*50+25;p.xp=0;p.totalXp=0;p.project=null;p.acted=-1;p.job=null;
          p.learnedSkills=skills||[];p.equippedSkills=skills||[];p.skillChoices=choices||[];p.skillCooldowns={};
          wk.pos=51;bk.pos=48*50+48;g.side='w';g.ap=3;g.terrain[p.pos]=terrain;
          if(ally){friend.alive=true;friend.pos=p.pos+1;friend.acted=-1;}
          for(const bank of Object.values(g.players)){bank.seen.fill(known?1:0);bank.sight.fill(0);bank.terrainMemory=known?[...g.terrain]:Array(2500).fill(-1);bank.lastSeen={};bank.firstSeenUnits={};}
          E.prepareSkills(p);E.refreshBoth(g);return {g,id:p.id,pos:p.pos,friend:ally?friend.id:null};
        }''',dict(level=level,terrain=terrain,skills=skills,choices=choices,disclosure=disclosure,ally=ally,known=known))
        return out

    def load(f):
        page.locator('#savefile').set_input_files({'name':'skills_fixture.json','mimeType':'application/json','buffer':json.dumps(f['g']).encode()})
        page.wait_for_timeout(50)
        assert 'Cannot load match' not in page.locator('body').inner_text()

    def click_square(pos):
        r,c=divmod(pos,50)
        box=page.locator('#board').bounding_box()
        page.locator('#board').click(position={'x':box['width']/2+(c-25+.5)*25,'y':box['height']/2+(r-32+.5)*25})

    def select(f):
        click_square(f['pos'])
        page.wait_for_timeout(20)

    def exported():
        with page.expect_download() as dl:page.locator('#save').click()
        path=ROOT/'tests'/'skill_ui_temp.json'
        dl.value.save_as(path)
        obj=json.loads(path.read_text());path.unlink()
        return obj

    def pawn(obj,f):
        return next(u for u in obj['units'] if u['id']==f['id'])

    f=fixture(1);load(f);select(f)
    check('0/0 slots' in page.locator('#selectedPanel').inner_text(),'level-1 pawn has zero skill slots')
    check('level 3' in page.locator('#selectedPanel').inner_text(),'first skill milestone announced')
    check(page.locator('[data-skill-choice]').count()==0,'no fake level-1 skills')
    check('Profession · choose one path' not in page.locator('#selectedPanel').inner_text(),'old separate profession menu removed for new pawns')

    f=fixture(3);load(f);select(f)
    check(page.locator('#skillReady').is_enabled(),'skill-ready navigation activates at the correct milestone')
    check(page.locator('[data-skill-choice]').count()==3,'exactly three choices shown at level 3')
    labels=page.locator('[data-skill-choice]').all_text_contents()
    check(labels==['Learn Trailcraft','Learn Woodsman','Learn Cover'],'first draft uses the actual three candidate skills')
    text=page.locator('#selectedPanel').inner_text()
    check('one friendly work turn instead of two' in text and 'No king/queen targets' in text,'exact construction and protection effects are disclosed before selection')
    check(all(x not in text for x in ['Route score:','Tendency:','Developing route:']),'effects-only default hides route labels and scores')
    page.locator('[data-skill-choice="woodsman"]').click()
    state=exported();p=pawn(state,f)
    check(p['skillChoices']==[{'level':3,'skill':'woodsman'}],'actual click records permanent level-3 skill selection')
    check(p['equippedSkills']==['woodsman'],'chosen skill is equipped into its free slot')
    check(state['ap']==3 and p['acted']==-1,'learning spends no CP or activation')
    check(page.locator('[data-skill-choice]').count()==0,'single choice consumes the milestone rather than allowing all three')
    check('level 6' in page.locator('#selectedPanel').inner_text(),'next milestone is level 6')

    f=fixture(6);load(f);select(f)
    page.locator('[data-skill-choice="trailcraft"]').click()
    check(page.locator('[data-skill-choice]').count()==3,'catch-up second milestone has three choices')
    check('Learn Flank Watch' in page.locator('#selectedPanel').inner_text(),'selected family advances to its next skill, not a repeated offer')
    page.locator('[data-skill-choice="woodsman"]').click()
    state=exported();p=pawn(state,f)
    check(len(p['skillChoices'])==2 and len(p['equippedSkills'])==2,'two crossed milestones become two distinct choices and slots')
    check('level 9' in page.locator('#selectedPanel').inner_text(),'third milestone is level 9')

    f=fixture(3);p=pawn(f['g'],f);p['acted']=f['g']['serial'];f['g']['ap']=0;load(f);select(f)
    check(page.locator('[data-skill-choice="cover"]').is_enabled(),'choice may be made after the pawn already acted at zero CP')
    page.locator('[data-skill-choice="cover"]').click();state=exported()
    check(state['ap']==0 and pawn(state,f)['acted']==state['serial'],'learning cannot reset an exhausted activation')
    check(page.get_by_role('button',name='Use Cover',exact=True).is_disabled(),'newly learned active skill cannot bypass exhaustion')

    for mode in ['hints','full']:
        f=fixture(3,disclosure=mode);load(f);select(f);text=page.locator('#selectedPanel').inner_text()
        check(('Tendency:' in text) if mode=='hints' else ('Route score: +1' in text),f'{mode} preview exposes only its specified route information')
        check(page.locator('[data-skill-choice]').all_text_contents()==labels,f'{mode} changes presentation, not offered mechanics')
        state=exported();check(state['routeDisclosure']==mode,f'{mode} presentation setting survives export')

    f=fixture(3,terrain=1);load(f);select(f);page.locator('[data-skill-choice="woodsman"]').click()
    check(page.get_by_role('button',name='Clear forest · Lv1 · 1 turn',exact=True).is_enabled(),'skill-adjusted work duration is visible on the real action button')
    page.get_by_role('button',name='Clear forest · Lv1 · 1 turn',exact=True).click();state=exported()
    check(pawn(state,f)['project']['total']==1 and state['ap']==2,'real work action uses one-turn project and costs one CP')
    page.locator('#endTurn').click();page.wait_for_function("document.getElementById('phase').textContent==='Your command phase'",timeout=8000)
    state=exported();check(pawn(state,f)['project'] is None and state['terrain'][f['pos']]==0,'actual turn cycle completes the improved forest project')

    f=fixture(3,skills=['cover'],choices=[{'level':3,'skill':'cover'}],ally=True);load(f);select(f)
    check(page.get_by_role('button',name='Use Cover',exact=True).is_enabled(),'equipped Cover can target an adjacent military ally')
    page.get_by_role('button',name='Use Cover',exact=True).click()
    check('choose a highlighted target' in page.locator('#selectedPanel').inner_text(),'Cover enters map-targeting mode')
    click_square(f['pos']+1);state=exported();ally=next(u for u in state['units'] if u['id']==f['friend'])
    check(ally['skillWard']['source']==f['id'] and ally['skillWard']['until']==state['serial']+1,'actual board click grants one-response protection to the chosen ally')
    check(state['ap']==2 and pawn(state,f)['acted']==state['serial'],'Cover consumes CP and activation')
    check(pawn(state,f)['skillCooldowns']['guard']==state['serial']+6,'Cover shared cooldown is saved')

    f=fixture(6,skills=['cover','sidestep'],choices=[{'level':3,'skill':'cover'},{'level':6,'skill':'sidestep'}],known=True);load(f);select(f)
    page.get_by_role('button',name='Use Sidestep',exact=True).click();click_square(f['pos']+1);state=exported()
    check(pawn(state,f)['pos']==f['pos']+1 and state['ap']==2,'skill-specific side move is executed through the real board UI')
    check(pawn(state,f)['skillCooldowns']['maneuver']==state['serial']+4,'maneuver cooldown is saved and shared')

    f=fixture(3,skills=['legacy_skill']);f['g']['version']=10
    wk=next(u for u in f['g']['units'] if u['type']=='K' and u['side']=='w');wk['pos']=f['pos']-1
    load(f);select(f);page.locator('[data-skill-choice="woodsman"]').click();state=exported()
    check(pawn(state,f)['equippedSkills']==['legacy_skill'] and 'woodsman' in pawn(state,f)['learnedSkills'],'legacy full slot does not silently delete or replace a skill')
    page.get_by_role('button',name='legacy skill → Woodsman',exact=True).click();state=exported()
    check(pawn(state,f)['equippedSkills']==['woodsman'] and state['ap']==2,'explicit legacy skill replacement uses normal equip cost')
    check(state['version']==15 and state['routeDisclosure']=='effects','older save migrates to the new schema with conservative disclosure')

    # The king's panel must answer the original XP question clearly.
    king=next(u for u in state['units'] if u['side']=='w' and u['type']=='K')
    click_square(king['pos'])
    check('No idle/time XP.' in page.locator('#selectedPanel').inner_text(),'King panel explicitly distinguishes idle time from achievement XP')
    check('0.30 royal XP per 1 base XP' in page.locator('#selectedPanel').inner_text(),'King panel displays the actual leadership multiplier')

    f=fixture(3);load(f)
    page.locator('#skillReady').click()
    check(page.locator('[data-skill-choice]').count()==3,'Skills ready button locates, centers and selects the pending pawn')
    if not (ROOT/'tests'/'skills_choice_panel.png').exists():
        page.locator('#selectedPanel').screenshot(path=str(ROOT/'tests'/'skills_choice_panel.png'))
    if not (ROOT/'tests'/'browser_skills_v0510_screenshot.png').exists():
        page.screenshot(path=str(ROOT/'tests'/'browser_skills_v0510_screenshot.png'),full_page=True)
    check(not errors,'no JavaScript page errors: '+str(errors))
    browser.close()
print(f'SKILL BROWSER v0.5.10: {passed}/{passed} checks passed.')

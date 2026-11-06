import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { chromium } from 'playwright';

const dir='docs/v4/evidence/stage-14';
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--use-angle=metal','--ignore-gpu-blocklist']});
const rows=[];
try{
 for(const viewport of [{width:1600,height:900},{width:390,height:844},{width:320,height:680}]){
  const mobile=viewport.width<860;
  const context=await browser.newContext({viewport,isMobile:mobile,hasTouch:mobile,reducedMotion:'reduce',recordVideo:{dir:'test-results/v4',size:viewport}});
  const page=await context.newPage();let requests=0;const errors=[];
  page.on('request',r=>{if(r.url().endsWith('.glb'))requests++;});
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:5177/');
  await page.locator('.site-head').waitFor({timeout:120000});
  await page.waitForFunction(()=>!document.documentElement.classList.contains('is-locked'));
  async function go(t){await page.evaluate(t=>scrollTo({top:(document.documentElement.scrollHeight-innerHeight)*t,behavior:'instant'}),t);await page.waitForFunction(t=>Math.abs(window.__S90Shot().progress-t)<.0005,t);await page.waitForTimeout(250);}
  let swipeScrolled=null;
  if(mobile){
    const cdp=await context.newCDPSession(page);
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:viewport.width/2,y:600}]});
    for(let y=570;y>=240;y-=30){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:viewport.width/2,y}]});await page.waitForTimeout(20);}
    await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForTimeout(500);
    swipeScrolled=await page.evaluate(()=>scrollY);assert.ok(swipeScrolled>100);
    await cdp.detach();
  }
  await go(.97);await page.locator('.explore').waitFor();
  assert.equal(await page.evaluate(()=>Number(getComputedStyle(document.querySelector('.sketch-world')).opacity)),0);
  const identity=await page.evaluate(()=>window.__S90Ready.modelId);
  const before=await page.evaluate(()=>window.__S90Shot().position);
  await page.getByRole('button',{name:'拉近',exact:true}).click();await page.waitForTimeout(900);
  assert.notDeepEqual(await page.evaluate(()=>window.__S90Shot().position),before);
  await page.getByRole('button',{name:'拉远',exact:true}).click();await page.waitForTimeout(900);
  await page.getByRole('button',{name:'重置视角',exact:true}).click();await page.waitForTimeout(1250);
  for(const name of ['曜石黑','水晶白','峡湾蓝','暖铜棕']){
    const paint=page.getByRole('button',{name,exact:true});await paint.click();assert.equal(await paint.getAttribute('aria-pressed'),'true');
  }
  const start=await page.evaluate(()=>window.__S90Shot().position);
  if(mobile){
    const cdp=await context.newCDPSession(page);
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:100,y:400}]});
    for(let x=115;x<250;x+=15){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:410}]});await page.waitForTimeout(20);}
    await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await cdp.detach();
  }else{
    await page.mouse.move(700,500);await page.mouse.down();await page.mouse.move(980,510,{steps:18});await page.mouse.up();
  }
  await page.waitForTimeout(400);
  const scrollBeforeWheel=await page.evaluate(()=>scrollY);
  await page.mouse.move(viewport.width/2,viewport.height/2);
  await page.mouse.wheel(0,-350);await page.waitForTimeout(200);
  assert.equal(await page.evaluate(()=>scrollY),scrollBeforeWheel);
  assert.notDeepEqual(await page.evaluate(()=>window.__S90Shot().position),start);
  const spot=page.locator('.hotspot[data-visible="true"]').first();
  if(await spot.count()){await spot.focus();await page.keyboard.press('Enter');await page.waitForTimeout(1250);}
  await page.screenshot({path:`${dir}/explore-${viewport.width}.png`});
  await page.getByRole('button',{name:'返回主线',exact:true}).click();
  await page.locator('.explore').waitFor({state:'detached'});await page.waitForFunction(()=>window.__S90Shot().owner==='story');
  assert.equal(await page.evaluate(()=>window.__S90Shot().owner),'story');
  await go(.97);await page.locator('.explore').waitFor();
  assert.equal(await page.evaluate(()=>window.__S90Ready.modelId),identity);
  await page.getByRole('button',{name:'返回主线',exact:true}).click();await page.waitForTimeout(1000);await go(.8);
  assert.ok(await page.evaluate(()=>Number(getComputedStyle(document.querySelector('.sketch-world')).opacity))>.99);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth),0);
  assert.equal(requests,1);assert.deepEqual(errors,[]);
  rows.push({viewport,swipeScrolled,requests,errors,reentered:true,modelId:identity});
  await context.close();await fs.copyFile(await page.video().path(),`${dir}/explore-${viewport.width}.webm`);
 }
 await fs.writeFile(`${dir}/explore.json`,JSON.stringify(rows,null,2)+'\n');
}finally{await browser.close();}

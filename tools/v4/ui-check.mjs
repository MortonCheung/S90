import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { chromium } from 'playwright';
import { ACTS } from '../../src/journey/acts.js';
import { CHAPTERS } from '../../src/story/story.js';
const dir='docs/v4/evidence/stage-19';await fs.mkdir(dir,{recursive:true});
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--use-angle=metal','--ignore-gpu-blocklist']});const results=[];
try{for(const viewport of [{width:1600,height:900},{width:320,height:680}]){
 const context=await browser.newContext({viewport,reducedMotion:'reduce',recordVideo:{dir:'test-results/v4',size:viewport}});
 const page=await context.newPage();let requests=0;const errors=[];page.on('request',r=>{if(r.url().endsWith('.glb'))requests++;});page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:5177/');await page.locator('.site-head').waitFor({timeout:120000});
 const id=await page.evaluate(()=>window.__S90Ready.modelId);
 const menu=page.locator('summary').filter({hasText:'行程'}),about=page.locator('summary').filter({hasText:'关于'});
 async function visiblePopover(){
  const box=await page.locator('.head-menu[open] .head-popover').boundingBox();
  assert.ok(box.x>=0&&box.y>=0&&box.x+box.width<=viewport.width&&box.y+box.height<=viewport.height,JSON.stringify(box));
 }
 await menu.click();await page.screenshot({path:`${dir}/menu-${viewport.width}.png`});
 await visiblePopover();
 assert.equal(await page.locator('.journey-link').count(),4);assert.equal(await page.locator('.journey-link__features button').count(),6);
 await page.keyboard.press('Escape');assert.equal(await page.locator('.head-menu').first().getAttribute('open'),null);
 for(const item of [...ACTS.map(act=>({label:act.label,at:act.range[0]})),...CHAPTERS]){
  await menu.click();await page.getByRole('navigation',{name:'四幕行程导航'}).getByRole('button',{name:item.label,exact:true}).click();
  await page.waitForFunction(t=>Math.abs(window.__S90Shot().progress-t)<.0005,item.at);await page.waitForTimeout(180);
  assert.equal(await page.locator('.explore').count(),0);
  if(item.at===.59||item.at===.46)await page.screenshot({path:`${dir}/${item.id}-${viewport.width}.png`});
 }
 await about.click();await page.screenshot({path:`${dir}/about-${viewport.width}.png`});
 await visiblePopover();
 assert.equal(await page.locator('.head-popover--about a').count(),2);await page.keyboard.press('Escape');
 await menu.click();await page.getByRole('navigation').getByRole('button',{name:'自由探索',exact:true}).click();
 await page.locator('.explore').waitFor();await page.waitForTimeout(1000);await page.screenshot({path:`${dir}/explore-${viewport.width}.png`});
 assert.equal(await page.getByRole('button',{name:'拉近',exact:true}).isVisible(),true);
 assert.equal(await page.getByRole('button',{name:'拉远',exact:true}).isVisible(),true);
 await page.getByRole('button',{name:'返回主线',exact:true}).click();await page.locator('.explore').waitFor({state:'detached'});
 await page.getByRole('button',{name:'回到展厅开场'}).click();await page.waitForFunction(()=>window.__S90Shot().progress<.0005);
 assert.equal(await page.evaluate(()=>window.__S90Ready.modelId),id);assert.equal(requests,1);assert.deepEqual(errors,[]);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth),0);
 results.push({viewport,requests,modelId:id,errors,actAndFeatureLinks:10,allTargetsVerified:true});
 await context.close();await fs.copyFile(await page.video().path(),`${dir}/ui-${viewport.width}.webm`);
}await fs.writeFile(`${dir}/ui.json`,JSON.stringify(results,null,2)+'\n');}finally{await browser.close();}

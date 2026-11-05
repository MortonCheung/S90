import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { chromium } from 'playwright';

const dir='docs/v4/evidence/stage-06';
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--use-angle=metal','--ignore-gpu-blocklist']});
const page=await browser.newPage({viewport:{width:1600,height:900},reducedMotion:'reduce'});
await fs.mkdir(dir,{recursive:true});
const samples=[];
try {
  await page.goto('http://127.0.0.1:5177/');
  await page.locator('.site-head').waitFor({timeout:120000});
  await page.evaluate(()=>scrollTo({top:(document.documentElement.scrollHeight-innerHeight)*.075,behavior:'instant'}));
  await page.waitForFunction(()=>Math.abs(window.__S90Shot().progress-.075)<.0005);
  for(const [scene,tone] of [['residence','morning'],['city','day'],['arrival','afternoon'],['road','dusk']]) {
    const markup=await fs.readFile(`src/sketch/scenes/${scene}.svg`,'utf8');
    assert.ok(!/<image|<filter|<linearGradient|<radialGradient|(?:href|src)=/i.test(markup));
    await page.evaluate(({markup,tone})=>{
      document.querySelector('.sketch-study')?.remove();
      const layer=document.createElement('div');layer.className='sketch-study';layer.innerHTML=markup;
      document.querySelector('.stage').prepend(layer);
      document.documentElement.dataset.sketchTone=tone;
    },{markup,tone});
    await page.waitForTimeout(200);
    await page.screenshot({path:`${dir}/car-${scene}.png`});
    samples.push(await page.evaluate(scene=>({scene,canvas:document.querySelectorAll('canvas').length,modelId:window.__S90Ready.modelId,shot:window.__S90Shot()}),scene));
  }
  assert.ok(samples.every(s=>s.canvas===1 && s.modelId===samples[0].modelId));
  await fs.writeFile(`${dir}/car-check.json`,JSON.stringify(samples,null,2)+'\n');
} finally {await browser.close();}

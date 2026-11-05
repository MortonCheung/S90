import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { chromium } from 'playwright';

const dir='docs/v4/evidence/stage-08';
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--use-angle=metal','--ignore-gpu-blocklist']});
const page=await browser.newPage({viewport:{width:1600,height:900},reducedMotion:'reduce'});
const samples=[];
async function sample(t){
  await page.evaluate(value=>scrollTo({top:(document.documentElement.scrollHeight-innerHeight)*value,behavior:'instant'}),t);
  await page.waitForFunction(value=>Math.abs(window.__S90Scenes()?.progress-value)<.0005,t);
  await page.waitForTimeout(150);
  return page.evaluate(()=>window.__S90Scenes());
}
try{
  await page.goto('http://127.0.0.1:5177/');
  await page.locator('.site-head').waitFor({timeout:120000});
  for(const t of [.27,.8,.2,.8,.27])samples.push(await sample(t));
  assert.deepEqual(samples[1],samples[3]);
  assert.deepEqual(samples[0],samples[4]);
  await page.reload();
  await page.locator('.site-head').waitFor({timeout:120000});
  const refreshed=await sample(.8);
  assert.deepEqual(refreshed,samples[1]);
  await fs.writeFile(`${dir}/scene-browser.json`,JSON.stringify({samples,refreshed},null,2)+'\n');
}finally{await browser.close();}

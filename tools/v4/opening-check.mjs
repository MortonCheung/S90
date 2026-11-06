import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { chromium } from 'playwright';

const dir='docs/v4/evidence/stage-15';
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--use-angle=metal','--ignore-gpu-blocklist']});
const report=[];
try{
 for(const viewport of [{width:1600,height:900},{width:390,height:844}]){
  const context=await browser.newContext({viewport,recordVideo:{dir:'test-results/v4',size:viewport}});
  const page=await context.newPage();let requests=0;const errors=[];
  page.on('request',r=>{if(r.url().endsWith('.glb'))requests++;});page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*.glb',async route=>{await new Promise(resolve=>setTimeout(resolve,8000));await route.continue();});
  await page.goto('http://127.0.0.1:5177/',{waitUntil:'domcontentloaded'});
  const samples=[];
  for(const value of [0,.25,.5,.75,1]){
   await page.waitForFunction(t=>Number(document.querySelector('.opening')?.dataset.drawProgress)>=t,value,{timeout:30000});
   const data=await page.evaluate(()=>{
    const root=document.querySelector('.opening svg');
    const paths=[...root.querySelectorAll('path')];
    return {progress:Number(document.querySelector('.opening').dataset.drawProgress),
      paths:paths.length,visible:paths.filter(p=>p.style.visibility==='visible').length,
      visibleLength:paths.reduce((sum,p)=>sum+p.getTotalLength()-Math.abs(Number(p.style.strokeDashoffset)),0)};
   });
   samples.push(data);
   await page.screenshot({path:`${dir}/${viewport.width}-${value*100}.png`});
  }
  assert.equal(samples[0].paths,72);
  for(let i=1;i<samples.length;i++) assert.ok(samples[i].visibleLength>samples[i-1].visibleLength);
  assert.ok(samples[1].visible<samples.at(-1).visible);
  await page.locator('.site-head').waitFor({timeout:120000});
  await page.screenshot({path:`${dir}/${viewport.width}-revealed.png`});
  assert.equal(requests,1);assert.deepEqual(errors,[]);
  report.push({viewport,samples,requests,errors,note:'GLB request intentionally held for 8s in this test only'});
  await context.close();await fs.copyFile(await page.video().path(),`${dir}/opening-${viewport.width}.webm`);
 }
 await fs.writeFile(`${dir}/opening.json`,JSON.stringify(report,null,2)+'\n');
}finally{await browser.close();}

import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { chromium } from 'playwright';
const dir='docs/v4/evidence/stage-17';
const models=[['original','/source_assets/volvo_s90_recharge_free.glb'],['current','/assets/model/candidates/s90-quality-v3.glb'],['conservative','/test-results/v4/s90-conservative.glb']];
await fs.mkdir(dir,{recursive:true});
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--use-angle=metal','--ignore-gpu-blocklist']});
const results=[];
try {
 for(const [tag,path] of models){
  const page=await browser.newPage({viewport:{width:1600,height:900},deviceScaleFactor:1});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const started=Date.now();
  await page.goto('http://127.0.0.1:5177/tools/model/compare.html?model='+encodeURIComponent(path));
  await page.waitForFunction(()=>window.ready,{timeout:180000});
  const loadMs=Date.now()-started;
  const shots={};
  for(const shot of ['side','front','wheel','light','cabin']){
   shots[shot]=await page.evaluate(name=>window.shot(name),shot);
   await page.screenshot({path:`${dir}/${tag}-${shot}.png`});
  }
  const measured=await page.evaluate(()=>new Promise(resolve=>{
   const begin=performance.now(),times=[];let previous=begin;
   const frame=time=>{window.shot('front');times.push(time-previous);previous=time;
    if(time-begin<3000)return requestAnimationFrame(frame);
    times.sort((a,b)=>a-b);resolve({fps:times.length/((time-begin)/1000),p95Ms:times[Math.floor(times.length*.95)],bounds:window.bounds,
     requests:performance.getEntriesByType('resource').filter(r=>r.name.includes('.glb')).map(r=>({bytes:r.encodedBodySize,duration:r.duration}))});};
   requestAnimationFrame(frame);
  }));
  assert.deepEqual(errors,[]);
  results.push({tag,path,loadMs,shots,...measured,errors});
  console.log(tag,loadMs,measured.fps);
  await page.close();
 }
 assert.deepEqual(results[1].bounds,results[2].bounds);
 await fs.writeFile(`${dir}/browser-comparison.json`,JSON.stringify({browser:browser.version(),results},null,2)+'\n');
}finally{await browser.close();}

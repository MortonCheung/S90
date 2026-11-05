import { chromium } from 'playwright';
import fs from 'node:fs';

const browser = await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--use-angle=metal','--ignore-gpu-blocklist']});
const output = [];
try {
  for(const [build, url] of [['baseline','http://127.0.0.1:5189'], ['v3','http://127.0.0.1:5177']]) {
    const page = await browser.newPage({viewport:{width:1600,height:900},reducedMotion:'reduce'});
    const start = Date.now();
    await page.goto(url,{waitUntil:'domcontentloaded'});
    if (build === 'baseline') await page.waitForSelector('.site-head[data-dim="false"]',{timeout:90000});
    else await page.waitForSelector('.site-head',{timeout:90000});
    const visibleMs = Date.now() - start;
    await page.evaluate(()=>scrollTo(0,(document.documentElement.scrollHeight-innerHeight)*.2));
    await page.waitForTimeout(650);
    const perf = await page.evaluate(()=>new Promise(resolve=>{
      const model = performance.getEntriesByType('resource').find(r=>r.name.endsWith('.glb'));
      const begin=performance.now();
      let frames=0;
      const tick=(time)=>{
        frames++;
        if(time-begin<3000) requestAnimationFrame(tick);
        else resolve({fps:frames/((time-begin)/1000),modelBytes:model?.encodedBodySize,transferSize:model?.transferSize,downloadMs:model?.duration});
      };
      requestAnimationFrame(tick);
    }));
    output.push({build,visibleMs,...perf});
    await page.close();
  }
} finally { await browser.close(); }
fs.writeFileSync('docs/rework/evidence/stage-11/baseline-performance.json',JSON.stringify(output,null,2));
console.log(output);

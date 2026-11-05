import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { chromium } from 'playwright';

const dir='docs/v4/evidence/stage-07';
await fs.mkdir(dir,{recursive:true});
await fs.mkdir('test-results/v4',{recursive:true});
await fs.writeFile('test-results/v4/line-fixture.html',`<!doctype html><html><head><style>html,body{margin:0;background:#f3f2ec;width:100%;height:100%;overflow:hidden}svg{width:100%;height:100%;display:block}path[data-wash]:not([data-wash=paper]){display:none}</style></head><body><main></main><script type="module">import * as engine from '/src/sketch/lineGrowth.js';window.engine=engine;</script></body></html>`);
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--use-angle=metal','--ignore-gpu-blocklist']});
const context=await browser.newContext({viewport:{width:1600,height:900},recordVideo:{dir:'test-results/v4',size:{width:1600,height:900}}});
const page=await context.newPage();
const report={browser:browser.version(),date:new Date().toISOString(),scenes:[]};
const errors=[];page.on('pageerror',error=>errors.push(error.message));
try {
  await page.goto('http://127.0.0.1:5177/test-results/v4/line-fixture.html');
  await page.waitForFunction(()=>window.engine);
  for(const scene of ['residence','city','arrival','road']) {
    const markup=await fs.readFile(`src/sketch/scenes/${scene}.svg`,'utf8');
    await page.evaluate(markup=>{
      document.querySelector('main').innerHTML=markup;
      window.plan=engine.schedulePaths(engine.measurePaths(document.querySelector('svg')));
    },markup);
    const data=await page.evaluate(()=>{
      const samples=[];
      for(let step=0;step<=1000;step++){
        const t=step/1000;
        samples.push({t,...engine.renderPaths(plan,t)});
      }
      const offsets=progress=>{
        engine.renderPaths(plan,progress);
        return plan.map(item=>item.element.style.strokeDashoffset);
      };
      const anchor=offsets(.25);
      for(const t of [.97,.03,.6,.1,.8,.25]) offsets(t);
      const restored=offsets(.25);
      const derivative=[];
      for(let i=1;i<1000;i++) derivative.push((engine.mapProgress(i/1000+.00001)-engine.mapProgress(i/1000-.00001))/.00002);
      return {samples,restored:JSON.stringify(anchor)===JSON.stringify(restored),minDerivative:Math.min(...derivative),maxDerivative:Math.max(...derivative),paths:plan.map(({element,...data})=>({id:element.id,...data}))};
    });
    assert.equal(data.restored,true);
    assert.ok(data.minDerivative>.64);
    assert.equal(data.samples[0].visibleLength,0);
    for(let i=1;i<data.samples.length;i++) assert.ok(data.samples[i].visibleLength>data.samples[i-1].visibleLength,scene+' paused at '+data.samples[i].t);
    for(const progress of [0,.25,.5,.75,1]){
      await page.evaluate(t=>engine.renderPaths(plan,t),progress);
      await page.screenshot({path:`${dir}/${scene}-${progress*100}.png`});
    }
    await page.evaluate(()=>new Promise(resolve=>{
      const begin=performance.now();
      function draw(time){const progress=Math.min(1,(time-begin)/3500);engine.renderPaths(plan,progress);if(progress<1)requestAnimationFrame(draw);else resolve();}
      requestAnimationFrame(draw);
    }));
    await page.evaluate(()=>new Promise(resolve=>{
      const begin=performance.now();
      function draw(time){const progress=Math.max(0,1-(time-begin)/2000);engine.renderPaths(plan,progress);if(progress>0)requestAnimationFrame(draw);else resolve();}
      requestAnimationFrame(draw);
    }));
    report.scenes.push({scene,...data});
  }
  const reversed=await page.evaluate(()=>{
    document.querySelector('main').innerHTML='<svg viewBox="0 0 1600 900"><path id="reversed-probe" data-ink="structure" d="M1500 450H100" stroke="#252b27" stroke-width="4" fill="none"/></svg>';
    const plan=engine.schedulePaths(engine.measurePaths(document.querySelector('svg')));
    engine.renderPaths(plan,.25);
    return {reverse:plan[0].reverse,offset:Number(plan[0].element.style.strokeDashoffset)};
  });
  assert.equal(reversed.reverse,true);
  assert.ok(reversed.offset<0);
  await page.screenshot({path:`${dir}/reverse-direction.png`});
  report.reversedProbe=reversed;
  assert.deepEqual(errors,[]);
  await fs.writeFile(`${dir}/line-engine.json`,JSON.stringify({...report,errors},null,2)+'\n');
} finally {await context.close();await browser.close();}
await fs.copyFile(await page.video().path(),`${dir}/line-growth.webm`);
console.log('Four scenes: 1001 strictly growing samples, deterministic reverse, forward/reverse video passed');

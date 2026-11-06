import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { chromium } from 'playwright';
const dir='docs/v4/evidence/stage-20';await fs.mkdir(dir,{recursive:true});
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--use-angle=metal','--ignore-gpu-blocklist']});
const result={date:new Date().toISOString(),browser:browser.version(),viewports:[],failures:[],lifecycle:[]};
async function ready(page){await page.locator('.site-head').waitFor({timeout:120000});}
async function go(page,t){const prior=await page.evaluate(()=>window.__S90Shot().owner);await page.evaluate(t=>scrollTo({top:(document.documentElement.scrollHeight-innerHeight)*t,behavior:'instant'}),t);await page.waitForFunction(t=>Math.abs(window.__S90Shot().progress-t)<.0005,t);await page.waitForTimeout(prior==='orbit'&&t<.9?1100:150);}
try {
 for(const viewport of [{width:1024,height:768},{width:844,height:390},{width:320,height:680}]){
  const page=await browser.newPage({viewport,reducedMotion:'reduce'});const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{window.longTasks=[];new PerformanceObserver(list=>window.longTasks.push(...list.getEntries().map(e=>({start:e.startTime,duration:e.duration})))).observe({type:'longtask',buffered:true});});
  await page.goto('http://127.0.0.1:5177/');await ready(page);
  for(const t of [.075,.33,.46,.59,.715,.97,.59,.2]){
   await go(page,t);if(t===.97)await page.waitForTimeout(900);
   assert.equal(await page.evaluate(()=>document.querySelectorAll('canvas').length),1);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth),0);
   await page.screenshot({path:`${dir}/${viewport.width}-${t}.png`});
  }
  const perf=await page.evaluate(()=>new Promise(resolve=>{
   const start=performance.now(),frames=[];let prev=start;
   const tick=time=>{frames.push(time-prev);prev=time;const p=Math.min(1,(time-start)/5000);
    scrollTo({top:(document.documentElement.scrollHeight-innerHeight)*(.1+.75*Math.sin(p*Math.PI)),behavior:'instant'});
    if(p<1)return requestAnimationFrame(tick);
    const sorted=[...frames].sort((a,b)=>a-b),gl=window.__S90Renderer.getContext(),d=gl.getExtension('WEBGL_debug_renderer_info');
    resolve({frames,p50:sorted[Math.floor(sorted.length*.5)],p95:sorted[Math.floor(sorted.length*.95)],p99:sorted[Math.floor(sorted.length*.99)],max:sorted.at(-1),fps:frames.length/((time-start)/1000),gpu:d?gl.getParameter(d.UNMASKED_RENDERER_WEBGL):null,longTasks:window.longTasks,memory:window.__S90Renderer.info.memory,resources:performance.getEntriesByType('resource').filter(r=>r.name.endsWith('.glb')).map(r=>({bytes:r.encodedBodySize,duration:r.duration}))});
   };requestAnimationFrame(tick);
  }));assert.deepEqual(errors,[]);result.viewports.push({viewport,perf,errors});await page.close();
 }
 // Missing or invalid SVG must not leave an endless curtain; ready 3D is the fallback.
 for(const failure of ['svg404','svgMalformed','corruptGLB']){
  const page=await browser.newPage({reducedMotion:'reduce'});
  const pattern=failure==='corruptGLB'?'**/*.glb':'**/s90-draw.svg';
  await page.route(pattern,r=>r.fulfill({status:failure==='svg404'?404:200,contentType:failure==='corruptGLB'?'model/gltf-binary':'image/svg+xml',body:failure==='corruptGLB'?'not a glb':'<svg/>'}));
  await page.goto('http://127.0.0.1:5177/');
  if(failure==='corruptGLB'){
   await page.locator('.opening__error').waitFor();await page.screenshot({path:`${dir}/${failure}.png`});await page.unroute(pattern);await page.getByRole('button',{name:'重新载入',exact:true}).click();
  }
  await ready(page);await page.screenshot({path:`${dir}/${failure}-recovered.png`});result.failures.push({failure,recovered:true});await page.close();
 }
 const page=await browser.newPage({reducedMotion:'reduce'});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:5177/?lifecycle');await ready(page);const cdp=await page.context().newCDPSession(page);
 for(let cycle=0;cycle<3;cycle++){
  await go(page,.59);await go(page,.97);await page.waitForTimeout(900);await page.getByRole('button',{name:'返回主线',exact:true}).click();await page.waitForTimeout(1000);await go(page,.2);
  await cdp.send('HeapProfiler.collectGarbage');
  const before=await page.evaluate(()=>({gpu:{...window.__S90Renderer.info.memory},heap:performance.memory?.usedJSHeapSize,disposed:window.__S90Disposals?.length??0}));
  await page.evaluate(()=>window.__S90TestRoot.unmount());await page.waitForFunction(()=>document.querySelectorAll('canvas').length===0);await page.waitForTimeout(300);
  const disposal=await page.evaluate(()=>window.__S90Disposals.at(-1));assert.ok(disposal.geometries>0&&disposal.materials>0&&disposal.textures>0);
  result.lifecycle.push({cycle,before,disposal});await page.evaluate(()=>window.__S90TestRoot.mount());await ready(page);
 }
 await go(page,.2);const progress=await page.evaluate(()=>window.__S90Shot().progress);
 await page.evaluate(()=>window.__S90Renderer.getContext().getExtension('WEBGL_lose_context').loseContext());await page.locator('.context-lost').waitFor();
 await page.evaluate(()=>scrollTo(0,9000));await page.waitForTimeout(300);assert.equal(await page.evaluate(()=>window.__S90Shot().progress),progress);
 result.contextPause=true;assert.deepEqual(errors,[]);result.lifecycleErrors=errors;await page.close();
 await fs.writeFile(`${dir}/compat.json`,JSON.stringify(result,null,2)+'\n');
} finally {await browser.close();}

import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import { chromium } from 'playwright';

const dir = 'docs/rework/evidence/stage-11';
const host = 'http://127.0.0.1:5177';
const launch = { executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--use-angle=metal','--ignore-gpu-blocklist'] };
const model = 'public/assets/model/candidates/s90-quality-v3.glb';
const total = fs.statSync(model).size;
fs.mkdirSync(dir,{recursive:true});
const browser = await chromium.launch(launch);
const result = { browser:browser.version(), date:new Date().toISOString(), viewports:[], network:[] };
const ready = (page) => page.waitForSelector('.site-head', {timeout:120000});
async function go(page, p) {
  await page.evaluate((t)=>scrollTo({top:(document.documentElement.scrollHeight-innerHeight)*t,behavior:'instant'}),p);
  await page.waitForFunction(t=>Math.abs(window.__S90Shot().progress-t)<.0005,p);
  await page.waitForTimeout(120);
}
async function sampleFrames(page) {
  return page.evaluate(()=>new Promise(resolve=>{
    const begin=performance.now();
    let previous=begin;
    const values=[];
    const sample=(time)=>{
      values.push(time-previous);
      previous=time;
      if(time-begin<3000) return requestAnimationFrame(sample);
      const gl=window.__S90Renderer.getContext();
      const debug=gl.getExtension('WEBGL_debug_renderer_info');
      const sorted=values.sort((a,b)=>a-b);
      resolve({fps:values.length/((time-begin)/1000),p95Ms:sorted[Math.floor(sorted.length*.95)],maxMs:sorted.at(-1),gpu:debug?gl.getParameter(debug.UNMASKED_RENDERER_WEBGL):null});
    };
    requestAnimationFrame(sample);
  }));
}

try {
  for (const viewport of [{width:1600,height:900},{width:1440,height:900},{width:390,height:844}]) {
    const desktop=viewport.width>860;
    const video=viewport.width===1600;
    const context=await browser.newContext({viewport,deviceScaleFactor:desktop?1:2.5,hasTouch:!desktop,isMobile:!desktop,
      reducedMotion:video?'no-preference':'reduce',recordVideo:video?{dir,size:viewport}:undefined});
    const page=await context.newPage();
    const errors=[];
    let requests=0;
    page.on('pageerror',e=>errors.push(e.message));
    page.on('request',r=>{if(r.url().endsWith('.glb'))requests++;});
    const start=Date.now();
    await page.goto(host,{waitUntil:'domcontentloaded'});
    if(video) {
      for(const fraction of [0,.2,.4,.6,.8,1]) {
        await page.waitForFunction(t=>Number(document.querySelector('.opening')?.dataset.drawProgress)>=t,fraction,{timeout:30000});
        await page.screenshot({path:`${dir}/draw-${fraction}.png`});
      }
      await page.waitForSelector('.opening[data-revealing=true]',{timeout:120000});
      for (let i=0;i<8;i++) {
        await page.screenshot({path:`${dir}/reveal-${i}.png`});
        await page.waitForTimeout(120);
      }
    }
    await ready(page);
    const openingMs=Date.now()-start;
    const modelTiming=await page.evaluate(()=>performance.getEntriesByType('resource').filter(r=>r.name.endsWith('.glb')).map(r=>({duration:r.duration,bytes:r.encodedBodySize,transfer:r.transferSize})));
    const identity=await page.evaluate(()=>{window.__testedCanvas=document.querySelector('canvas');return window.__S90Ready.modelId;});
    const stable=[];
    for(const t of [0,.075,.18,.2,.267,.33,.46,.59,.615,.715,.46,.2]) {
      await go(page,t);
      const data=await page.evaluate(()=>({position:window.__S90Shot().position,owner:window.__S90Shot().owner,
        content:document.querySelector('.detail').dataset.content||null,stageWidth:document.querySelector('.stage').clientWidth,
        stageHeight:document.querySelector('.stage').clientHeight,canvas:document.querySelectorAll('canvas').length,
        overflow:document.documentElement.scrollWidth-innerWidth}));
      assert.equal(data.canvas,1);
      assert.equal(data.overflow,0);
      if([0,.075,.18,.2,.267,.33,.46,.59,.615,.715,.97].includes(t)) await page.screenshot({path:`${dir}/${viewport.width}-${t}.png`});
      stable.push({t,...data});
    }
    assert.deepEqual(stable[3].position,stable.at(-1).position);
    const hold = await page.evaluate(()=>window.__S90Shot().position);
    await page.waitForTimeout(250);
    assert.deepEqual(await page.evaluate(()=>window.__S90Shot().position),hold);
    const frames = await sampleFrames(page);
    await go(page,.97);
    await page.locator('.explore').waitFor();
    await page.screenshot({path:`${dir}/${viewport.width}-0.97.png`});
    const orbitBefore=await page.evaluate(()=>window.__S90Shot().position);
    if(desktop) {
      await page.mouse.move(viewport.width*.46,viewport.height*.61);
      await page.mouse.down();
      await page.mouse.move(viewport.width*.65,viewport.height*.63,{steps:16});
      await page.mouse.up();
      await page.waitForTimeout(350);
      assert.notDeepEqual(await page.evaluate(()=>window.__S90Shot().position),orbitBefore);
    }
    for (const name of ['曜石黑','水晶白','峡湾蓝','暖铜棕']) {
      const button=page.getByRole('button',{name,exact:true});
      await button.click();
      await page.waitForTimeout(950);
      assert.equal(await button.getAttribute('aria-pressed'),'true');
      if (video) await page.screenshot({path:`${dir}/paint-${name}.png`});
    }
    await page.getByRole('button',{name:'返回主线'}).click();
    await page.waitForFunction(()=>!document.querySelector('.explore'));
    const heapBefore=await page.evaluate(()=>performance.memory?.usedJSHeapSize??null);
    for(let i=0;i<3;i++) for(const t of [.2,.59,.97,.715]) await go(page,t);
    const reused=await page.evaluate(id=>window.__S90Ready.modelId===id && document.querySelector('canvas')===window.__testedCanvas,identity);
    const heapAfter=await page.evaluate(()=>performance.memory?.usedJSHeapSize??null);
    assert.equal(reused,true);
    assert.equal(requests,1);
    assert.deepEqual(errors,[]);
    result.viewports.push({viewport,devicePixelRatio:desktop?1:2.5,openingMs,modelTiming,frames,stable,requests,reused,heapBefore,heapAfter,errors});
    if(video) {
      // A native wheel pass supplies footage of the real transitions, beyond discrete poses.
      await go(page,0);
      for (let i=0;i<53;i++) { await page.mouse.wheel(0,130); await page.waitForTimeout(45); }
      for (let i=0;i<53;i++) { await page.mouse.wheel(0,-130); await page.waitForTimeout(45); }
    }
    await context.close();
    fs.writeFileSync(`${dir}/regression.json`,JSON.stringify(result,null,2));
    console.log('Viewport checked',viewport,frames);
  }

  for (const mode of ['known','unknown']) {
    let release = () => {};
    const proxy = http.createServer((req,res)=>{
      if(req.url.endsWith('.glb')) {
        const headers={'Content-Type':'model/gltf-binary'};
        if(mode==='known') headers['Content-Length']=total;
        res.writeHead(200,headers);
        const first=fs.createReadStream(model,{start:0,end:1048575});
        first.pipe(res,{end:false});
        first.on('end',()=>{release=()=>fs.createReadStream(model,{start:1048576}).pipe(res);});
      } else {
        http.get(host+req.url,upstream=>{res.writeHead(upstream.statusCode,upstream.headers);upstream.pipe(res);});
      }
    });
    await new Promise(resolve=>proxy.listen(0,'127.0.0.1',resolve));
    const page=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});
    try {
      await page.goto(`http://127.0.0.1:${proxy.address().port}`,{waitUntil:'domcontentloaded'});
      await page.waitForSelector(`.opening__line[data-state="${mode==='known'?'loading':'indeterminate'}"]`);
      await page.waitForTimeout(550);
      const sample=await page.evaluate(()=>{
        const line=document.querySelector('.opening__line');
        return {state:line.dataset.state,percent:line.getAttribute('aria-valuenow'),bars:document.querySelectorAll('[role="progressbar"]').length};
      });
      assert.equal(sample.bars,1);
      assert.equal(sample.percent,mode==='known'?String(Math.round(1048576/total*100)):null);
      await page.screenshot({path:`${dir}/network-${mode}.png`});
      release();
      await ready(page);
      result.network.push({mode,...sample,recovered:true});
    } finally { await page.close(); proxy.closeAllConnections(); proxy.close(); }
  }

  const page=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});
  await page.route('**/*.glb',r=>r.fulfill({status:404,body:'QA model missing'}));
  await page.goto(host);
  await page.locator('.opening__error').waitFor();
  await page.screenshot({path:`${dir}/network-error.png`});
  await page.unroute('**/*.glb');
  await page.getByRole('button',{name:'重新载入',exact:true}).click();
  await ready(page);
  result.network.push({mode:'404',recovered:true});
  await page.evaluate(()=>window.__S90Renderer.getContext().getExtension('WEBGL_lose_context').loseContext());
  await page.locator('.context-lost').waitFor();
  await page.screenshot({path:`${dir}/context-lost.png`});
  await page.getByRole('button',{name:'重新载入',exact:true}).click();
  await ready(page);
  result.network.push({mode:'context-lost',recovered:true});
  await page.close();

  const fallbackBrowser=await chromium.launch({...launch,args:[...launch.args,'--disable-webgl']});
  try {
    const fallback=await fallbackBrowser.newPage();
    await fallback.goto(host);
    await fallback.locator('.fallback').waitFor();
    await fallback.screenshot({path:`${dir}/no-webgl.png`});
    result.network.push({mode:'no-webgl2',fallback:true});
  } finally { await fallbackBrowser.close(); }
  fs.writeFileSync(`${dir}/regression.json`,JSON.stringify(result,null,2));
} finally { await browser.close(); }

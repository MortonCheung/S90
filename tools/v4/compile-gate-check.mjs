import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { chromium } from 'playwright';
import { getOpeningPhase as phase, getLoadingVisual } from '../../src/opening/loading-state.js';

const states=[
 [{status:'loading'},'loading-model'],[{status:'ready'},'compiling'],
 [{status:'ready',firstFrameReady:true},'line-drawing'],
 [{status:'ready',firstFrameReady:true,drawn:true},'ready'],
 [{status:'ready',revealing:true},'revealing'],
 [{status:'ready',opened:true},'opened'],[{status:'error'},'error'],
];
for(const [input,expected]of states)assert.equal(phase(input),expected);
assert.equal(getLoadingVisual({status:'ready',firstFrameReady:false}).fraction,null);
const dir='docs/v4/evidence/stage-16';
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--use-angle=metal','--ignore-gpu-blocklist']});
const page=await browser.newPage({viewport:{width:1600,height:900},reducedMotion:'reduce'});
let release;
const held=new Promise(resolve=>{release=resolve;});
try{
 await page.route('**/*.glb',async route=>{await held;await route.continue();});
 await page.goto('http://127.0.0.1:5177/',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.__S90Renderer);
 await page.evaluate(()=>{
  const renderer=window.__S90Renderer;
  const original=renderer.compileAsync.bind(renderer);
  renderer.compileAsync=async(...args)=>{
   await original(...args);
   await new Promise(resolve=>{window.__releaseCompile=resolve;});
  };
 });
 release();
 await page.waitForFunction(()=>window.__releaseCompile,null,{timeout:120000});
 const sample=await page.evaluate(()=>({
  phase:document.querySelector('.opening').dataset.phase,
  progress:document.querySelector('[role=progressbar]').getAttribute('aria-valuenow'),
  firstFrame:window.__S90Ready?.firstFrameReady??false,
  canvas:document.querySelectorAll('canvas').length,
 }));
 assert.equal(sample.phase,'compiling');assert.equal(sample.progress,null);assert.equal(sample.firstFrame,false);assert.equal(sample.canvas,1);
 await page.screenshot({path:`${dir}/compiling.png`});
 await page.evaluate(()=>window.__releaseCompile());
 await page.locator('.site-head').waitFor({timeout:120000});
 await fs.writeFile(`${dir}/compile-gate.json`,JSON.stringify({states,sample,recovered:true,note:'Test delays completion of the real compile promise; production has no artificial delay'},null,2)+'\n');
}finally{release();await browser.close();}

import { chromium } from 'playwright';
import fs from 'node:fs';
const name=process.argv[2]||'baseline';
const dir=`docs/rework/evidence/${name}`;fs.mkdirSync(dir,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--use-angle=metal','--ignore-gpu-blocklist']});
const context=await browser.newContext({viewport:{width:1600,height:900},recordVideo:process.env.VIDEO?{dir,size:{width:1600,height:900}}:undefined});
const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));let requests=0;page.on('request',r=>{if(r.url().endsWith('.glb'))requests++});
await page.goto('http://127.0.0.1:5177/',{waitUntil:'domcontentloaded'});
const t0=Date.now();const samples=[];
for(const at of [500,1300,2300,3300,4300,5500,6800,8200]){await page.waitForTimeout(Math.max(0,at-(Date.now()-t0)));samples.push(await page.evaluate(()=>({t:performance.now(),ready:document.querySelector('.opening')?.dataset.ready,strokes:[...document.querySelectorAll('.sheet--top svg path')].slice(0,4).map(p=>getComputedStyle(p).strokeDashoffset)})));await page.screenshot({path:`${dir}/opening-${at}.png`,timeout:30000});}
await page.waitForFunction(()=>!document.querySelector('.opening'),null,{timeout:90000});
const states=[];if(!process.env.OPENING_ONLY)for(const p of [0,.075,.2,.33,.46,.59,.715,.84,.97,.715,.59,.46,.33,.2,0]){await page.evaluate(p=>window.scrollTo(0,(document.documentElement.scrollHeight-innerHeight)*p),p);await page.waitForTimeout(900);await page.screenshot({path:`${dir}/story-${p}-${states.length}.png`});states.push(await page.evaluate(p=>({p,canvas:document.querySelectorAll('canvas').length,detail:document.querySelector('.detail')?.dataset.open,stage:document.querySelector('.stage')?.getBoundingClientRect().toJSON(),text:document.querySelector('.detail')?.innerText.slice(0,100)}),p));}
if(!process.env.OPENING_ONLY)await page.setViewportSize({width:390,height:844});if(!process.env.OPENING_ONLY)for(const p of [0,.2,.59,.97]){await page.evaluate(p=>window.scrollTo(0,(document.documentElement.scrollHeight-innerHeight)*p),p);await page.waitForTimeout(1000);await page.screenshot({path:`${dir}/mobile-${p}.png`});}
fs.writeFileSync(`${dir}/result.json`,JSON.stringify({name,errors,requests,samples,states},null,2));await context.close();await browser.close();console.log(JSON.stringify({name,errors,requests,states:states.length}));

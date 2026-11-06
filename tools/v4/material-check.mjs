import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { chromium } from 'playwright';
const dir='docs/v4/evidence/stage-18';
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--use-angle=metal','--ignore-gpu-blocklist']});
try{
 const page=await browser.newPage({viewport:{width:1600,height:900},reducedMotion:'reduce'});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:5177/');await page.locator('.site-head').waitFor({timeout:120000});
 const samples=[];
 async function go(t){await page.evaluate(t=>scrollTo({top:(document.documentElement.scrollHeight-innerHeight)*t,behavior:'instant'}),t);await page.waitForFunction(t=>Math.abs(window.__S90Shot().progress-t)<.0005,t);await page.waitForTimeout(200);}
 const lights=()=>page.evaluate(()=>window.__scene.children.filter(o=>o.isDirectionalLight).map(l=>[l.color.toArray(),l.intensity]));
 await go(.2);const first=await lights();await go(.8);await go(.2);assert.deepEqual(await lights(),first);
 await go(.97);await page.locator('.explore').waitFor();await page.waitForTimeout(1100);
 for(const name of ['曜石黑','水晶白','峡湾蓝','暖铜棕']){
  await page.getByRole('button',{name,exact:true}).click();await page.waitForTimeout(1000);
  const properties=await page.evaluate(()=>{
   const mats=new Map();window.__scene.traverse(o=>{if(o.isMesh)for(const m of(Array.isArray(o.material)?o.material:[o.material])){
    if(m.userData.s90Profile)mats.set(m.uuid,{name:m.name,profile:m.userData.s90Profile,color:m.color.getHexString(),metalness:m.metalness,roughness:m.roughness,clearcoat:m.clearcoat,clearcoatRoughness:m.clearcoatRoughness,original:m.userData.s90Original});
   }});return [...mats.values()];
  });
  const paint=properties.find(m=>m.profile==='paint');assert.equal(paint.clearcoat,1);assert.equal(paint.roughness,.23);
  assert.ok(properties.some(m=>m.profile==='rubber'&&m.roughness===.88));
  assert.ok(properties.every(m=>m.original));samples.push({name,properties});
  await page.screenshot({path:`${dir}/paint-${name}.png`});
 }
 assert.deepEqual(errors,[]);
 await fs.writeFile(`${dir}/materials.json`,JSON.stringify({samples,reverseLights:true,errors},null,2)+'\n');
}finally{await browser.close();}

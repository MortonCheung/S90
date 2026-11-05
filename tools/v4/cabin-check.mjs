import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { chromium } from 'playwright';

const dir='docs/v4/evidence/stage-13';
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--use-angle=metal','--ignore-gpu-blocklist']});
const report=[];
try{
  for(const viewport of [{width:1600,height:900},{width:390,height:844}]){
    const context=await browser.newContext({viewport,reducedMotion:'reduce',recordVideo:{dir:'test-results/v4',size:viewport}});
    const page=await context.newPage();let requests=0;
    page.on('request',r=>{if(r.url().endsWith('.glb'))requests++;});
    await page.goto('http://127.0.0.1:5177/');
    await page.locator('.site-head').waitFor({timeout:120000});
    const samples=[];
    async function go(t){
      await page.evaluate(t=>scrollTo({top:(document.documentElement.scrollHeight-innerHeight)*t,behavior:'smooth'}),t);
      await page.waitForFunction(t=>Math.abs(window.__S90Shot().progress-t)<.0005,t);
      await page.waitForTimeout(180);
    }
    for(const t of [.54,.552,.562,.573,.59,.62,.65,.674,.715,.674,.65,.62,.59,.573,.562,.552,.54]){
      await go(t);
      const sample=await page.evaluate(()=>{
        const model=window.__scene.getObjectByProperty('uuid',window.__S90Ready.modelId);
        const glass=model.getObjectByName('RearDoorGlass__Glass_0');
        return {shot:window.__S90Shot(),exterior:window.__S90Scenes().exteriorWeight,
          glass:{visible:glass.visible,opacity:glass.material.opacity,material:glass.material.uuid},
          modelId:model.uuid,canvas:document.querySelectorAll('canvas').length};
      });
      samples.push({t,...sample});
      if([.54,.59,.62,.715].includes(t))await page.screenshot({path:`${dir}/${viewport.width}-${samples.length}-${t}.png`});
    }
    for(const t of [.54,.552,.562,.573,.59,.62,.65,.674]){
      const pair=samples.filter(s=>s.t===t);assert.deepEqual(pair[0],pair[1]);
    }
    assert.ok(samples.every(s=>s.canvas===1&&s.modelId===samples[0].modelId));
    await go(.59);
    await page.getByRole('button',{name:'内饰概念配色：暖棕',exact:true}).click();
    await page.waitForTimeout(800);
    await page.screenshot({path:`${dir}/${viewport.width}-warm.png`});
    await go(.715);await go(.59);
    assert.equal(await page.getByRole('button',{name:'内饰概念配色：暖棕',exact:true}).getAttribute('aria-pressed'),'true');
    assert.equal(requests,1);
    report.push({viewport,samples,requests,warmThemePreserved:true});
    await context.close();await fs.copyFile(await page.video().path(),`${dir}/cabin-${viewport.width}.webm`);
  }
  await fs.writeFile(`${dir}/cabin.json`,JSON.stringify(report,null,2)+'\n');
}finally{await browser.close();}

import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { chromium } from 'playwright';

const dir='docs/v4/evidence/stage-11';
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--use-angle=metal','--ignore-gpu-blocklist']});
const rows=[];
try{
  for(const viewport of [{width:1600,height:900},{width:390,height:844}]){
    const page=await browser.newPage({viewport,reducedMotion:'reduce'});
    await page.goto('http://127.0.0.1:5177/');
    await page.locator('.site-head').waitFor({timeout:120000});
    const samples=[];
    for(const t of [.075,.46,.715,.46]){
      await page.evaluate(t=>scrollTo({top:(document.documentElement.scrollHeight-innerHeight)*t,behavior:'instant'}),t);
      await page.waitForFunction(t=>Math.abs(window.__S90Shot().progress-t)<.0005,t);
      await page.waitForTimeout(250);
      const data=await page.evaluate(()=>{
        const model=window.__scene.getObjectByProperty('uuid',window.__S90Ready.modelId);
        const tires=[];
        model.traverse(object=>{
          if(object.isMesh&&/^Tire/.test(object.name)){
            object.geometry.computeBoundingBox();
            const box=object.geometry.boundingBox.clone().applyMatrix4(object.matrixWorld);
            tires.push({name:object.name,min:box.min.toArray(),max:box.max.toArray()});
          }
        });
        return {registration:window.__S90Registration(),tires,canvas:document.querySelectorAll('canvas').length,
          modelPosition:model.position.toArray(),far:document.querySelector('.sketch-layer [data-layer="background"]').getAttribute('transform'),
          near:document.querySelector('.sketch-layer [data-layer="foreground"]').getAttribute('transform')};
      });
      assert.equal(data.canvas,1);
      assert.equal(data.tires.length,4);
      assert.ok(data.registration.scale>=.65&&data.registration.scale<=1.8);
      samples.push({t,...data});
      await page.screenshot({path:`${dir}/registered-${viewport.width}-${t}.png`});
    }
    assert.deepEqual(samples[1].registration,samples[3].registration);
    rows.push({viewport,samples});await page.close();
  }
  await fs.writeFile(`${dir}/spatial-check.json`,JSON.stringify(rows,null,2)+'\n');
}finally{await browser.close();}

import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { chromium } from 'playwright';

const dir='docs/v4/evidence/stage-12';
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--use-angle=metal','--ignore-gpu-blocklist']});
const rows=[];
try{
  for(const viewport of [{width:1600,height:900},{width:390,height:844}]){
    const context=await browser.newContext({viewport,reducedMotion:'reduce',recordVideo:{dir:'test-results/v4',size:viewport}});
    const page=await context.newPage();let requests=0;const errors=[];
    page.on('request',r=>{if(r.url().endsWith('.glb'))requests++;});
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto('http://127.0.0.1:5177/');
    await page.locator('.site-head').waitFor({timeout:120000});
    for(const [index,t]of[.15,.17,.18,.2,.249,.267,.285,.33,.376,.4,.46,.59,.715,.59,.46,.33,.267,.2,.15].entries()){
      await page.evaluate(t=>scrollTo({top:(document.documentElement.scrollHeight-innerHeight)*t,behavior:'instant'}),t);
      await page.waitForFunction(t=>Math.abs(window.__S90Shot().progress-t)<.0005,t);
      await page.waitForTimeout(180);
      const data=await page.evaluate(()=>{
        const box=selector=>document.querySelector(selector).getBoundingClientRect().toJSON();
        return {stage:box('.stage'),canvas:box('canvas'),art:box('.sketch-world'),panel:box('.detail'),
          aspect:window.__S90Shot().aspect,model:window.__S90Ready.modelId,canvasCount:document.querySelectorAll('canvas').length,
          overflow:document.documentElement.scrollWidth-innerWidth,
          opacity:[...document.querySelectorAll('.detail__inner')].map(e=>({id:e.dataset.contentId,value:Number(getComputedStyle(e).opacity)}))};
      });
      assert.equal(data.canvasCount,1);assert.equal(data.overflow,0);
      assert.ok(Math.abs(data.canvas.width-data.stage.width)<1);
      assert.ok(Math.abs(data.art.width-data.stage.width)<1);
      assert.ok(Math.abs(data.aspect-data.stage.width/data.stage.height)<.005);
      assert.ok(Math.abs(viewport.width>860?data.stage.right-data.panel.left:data.stage.bottom-data.panel.top)<1);
      if([.2,.33,.46,.59,.715].includes(t)) await page.screenshot({path:`${dir}/${viewport.width}-${index}-${t}.png`});
      rows.push({viewport,t,...data});
    }
    assert.equal(requests,1);assert.deepEqual(errors,[]);
    const pairs=rows.filter(row=>row.viewport.width===viewport.width&&row.t===.267);
    assert.equal(pairs[0].stage.width,pairs[1].stage.width);
    assert.deepEqual(pairs[0].opacity,pairs[1].opacity);
    await context.close();
    await fs.copyFile(await page.video().path(),`${dir}/layout-${viewport.width}.webm`);
  }
  await fs.writeFile(`${dir}/layout.json`,JSON.stringify(rows,null,2)+'\n');
}finally{await browser.close();}

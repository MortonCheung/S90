import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { chromium } from 'playwright';

const stage = process.env.STAGE;
if (!stage) throw new Error('STAGE is required');
const dir = `docs/v4/evidence/stage-${stage}`;
const width = Number(process.env.WIDTH ?? 1600);
const height = Number(process.env.HEIGHT ?? 900);
const points = (process.env.POINTS ?? '0,.075,.2,.33,.46,.59,.615,.715,.97,.59,.2,0').split(',').map(Number);
const viewport = { width, height };
const browser = await chromium.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  args: ['--use-angle=metal','--ignore-gpu-blocklist'],
});
await fs.mkdir(dir, {recursive:true});
const context = await browser.newContext({viewport, reducedMotion:process.env.MOTION === 'full' ? 'no-preference' : 'reduce',
  recordVideo:{dir:'test-results/v4',size:viewport},deviceScaleFactor:1});
const page = await context.newPage();
const errors = [];
const responses = [];
const failed = [];
const samples = [];
page.on('pageerror', e => errors.push(e.message));
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
page.on('requestfailed', r => failed.push({url:r.url(),error:r.failure()?.errorText}));
page.on('response', r => {
  if(r.status()>=400 || r.url().endsWith('.glb')) responses.push({url:r.url(),status:r.status()});
});
try {
  await page.goto('http://127.0.0.1:5177/',{waitUntil:'domcontentloaded'});
  await page.locator('.site-head').waitFor({timeout:120000});
  const id=await page.evaluate(()=>window.__S90Ready.modelId);
  for (const [index,t] of points.entries()) {
    await page.evaluate(value=>scrollTo({top:(document.documentElement.scrollHeight-innerHeight)*value,behavior:'instant'}),t);
    await page.waitForFunction(value=>Math.abs(window.__S90Shot().progress-value)<.0005,t);
    await page.waitForTimeout(200);
    const sample=await page.evaluate(()=>({
      shot:window.__S90Shot(),journey:window.__S90Journey?.() ?? null,
      canvas:document.querySelectorAll('canvas').length,
      stage:document.querySelector('.stage').getBoundingClientRect().toJSON(),
      overflow:document.documentElement.scrollWidth-innerWidth,
      modelId:window.__S90Ready.modelId,
    }));
    assert.equal(sample.canvas,1);
    assert.equal(sample.modelId,id);
    assert.equal(sample.overflow,0);
    samples.push({t,...sample});
    await page.screenshot({path:`${dir}/${width}-${index}-${t}.png`});
  }
  assert.deepEqual(errors,[]);
  assert.deepEqual(failed,[]);
  assert.ok(responses.every(r=>r.status===200),JSON.stringify(responses));
  await fs.writeFile(`${dir}/capture-${width}.json`,JSON.stringify({viewport,browser:browser.version(),samples,errors,failed,responses},null,2)+'\n');
} finally {
  await context.close();
  await browser.close();
}
await fs.copyFile(await page.video().path(),`${dir}/capture-${width}.webm`);

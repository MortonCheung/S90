import { chromium } from 'playwright';
import fs from 'node:fs';
import assert from 'node:assert/strict';

const dir = 'docs/rework/evidence/stage-08';
fs.mkdirSync(dir, { recursive: true });
const browser = await chromium.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  args: ['--use-angle=metal'],
});
const context = await browser.newContext({viewport:{width:1600,height:900}, reducedMotion:'reduce', recordVideo:process.env.VIDEO ? {dir,size:{width:1600,height:900}} : undefined});
const page = await context.newPage();
await page.goto('http://127.0.0.1:5177/');
await page.waitForFunction(() => !document.querySelector('.opening'), null, {timeout:90000});
const rows = [];
for (const progress of [.15,.20,.25,.259,.267,.277,.29,.33,.4,.46,.4,.33,.29,.277,.267,.259,.25,.20,.15]) {
  await page.evaluate((t) => scrollTo(0, (document.documentElement.scrollHeight - innerHeight) * t), progress);
  await page.waitForTimeout(90);
  const row = await page.evaluate(() => ({
    width: document.querySelector('.detail').getBoundingClientRect().width,
    active: document.querySelector('.detail').dataset.content || null,
    opacity: ['light','wheel'].map(id => Number(getComputedStyle(document.querySelector(`[data-content-id="${id}"]`)).opacity)),
  }));
  if (progress >= .20 && progress <= .33) {
    assert.equal(row.width, 520);
    assert.ok(Math.abs(row.opacity[0] + row.opacity[1] - 1) < .001);
  }
  if ([.15,.2,.267,.33,.46].includes(progress)) await page.screenshot({path:`${dir}/${rows.length}-${progress}.png`});
  rows.push({progress,...row});
}
for (let i = 0; i < 9; i++) assert.deepEqual(rows[i], rows[18-i]);
await page.evaluate(() => scrollTo(0,(document.documentElement.scrollHeight-innerHeight)*.59));
await page.waitForSelector('.detail[data-content="cabin"]');
await page.locator('.cabin-option').first().focus();
await page.evaluate(() => scrollTo(0,0));
await page.waitForTimeout(100);
assert.equal(await page.evaluate(() => document.activeElement.className), 'brand');
fs.writeFileSync(`${dir}/metrics.json`,JSON.stringify({rows,focusRestored:true},null,2));
await context.close();
await browser.close();
console.log('Continuous detail group and reversible weights verified');

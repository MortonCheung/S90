import { chromium } from 'playwright';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const dir = 'docs/rework/evidence/stage-10';
fs.mkdirSync(dir,{recursive:true});
const browser = await chromium.launch({ executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--use-angle=metal'] });
const checks = [];
for (const viewport of [{width:1600,height:900},{width:390,height:844},{width:320,height:680},{width:844,height:390}]) {
  if (process.env.VIEWPORT && String(viewport.width)!==process.env.VIEWPORT) continue;
  const touch = viewport.width < 900;
  const context = await browser.newContext({viewport, hasTouch:touch, isMobile:touch, reducedMotion:'reduce'});
  const page = await context.newPage();
  const activate = (selector) => touch ? selector.tap() : selector.click();
  const errors = [];
  page.on('pageerror', e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:5177/');
  await page.waitForFunction(() => !document.querySelector('.opening'),null,{timeout:90000});
  await page.screenshot({path:`${dir}/${viewport.width}-hero.png`});
  const about=page.locator('summary').filter({hasText:'关于'});
  if (touch) await about.tap(); else await about.press('Enter');
  await page.getByRole('link',{name:'CC BY 4.0'}).waitFor();
  if (touch) await about.tap(); else await about.press('Escape');
  const chapters=page.locator('summary').filter({hasText:'章节'});
  await activate(chapters);
  await activate(page.getByRole('button',{name:'轮毂',exact:true}));
  await page.locator('.detail[data-content="wheel"]').waitFor();
  await page.screenshot({path:`${dir}/${viewport.width}-wheel.png`});
  await activate(chapters);
  await activate(page.getByRole('button',{name:'座舱',exact:true}));
  await page.locator('.detail[data-content="cabin"]').waitFor();
  await activate(page.getByRole('button',{name:'内饰概念配色：暖棕'}));
  assert.equal(await page.getByRole('button',{name:'内饰概念配色：暖棕'}).getAttribute('data-active'),'true');
  await page.waitForTimeout(450);
  await page.screenshot({path:`${dir}/${viewport.width}-cabin.png`});
  await activate(chapters);
  await activate(page.getByRole('button',{name:'自由探索',exact:true}));
  await page.locator('.explore').waitFor();
  for (const name of ['水晶白','峡湾蓝','暖铜棕','曜石黑']) {
    const button=page.getByRole('button',{name,exact:true});
    await activate(button);
    assert.equal(await button.getAttribute('aria-pressed'),'true');
  }
  if (!touch) {
    const origin=await page.evaluate(()=>window.__S90Shot().position);
    await page.getByRole('button',{name:'拉近'}).click();
    await page.waitForTimeout(850);
    assert.notDeepEqual(await page.evaluate(()=>window.__S90Shot().position),origin);
    await page.getByRole('button',{name:'拉远'}).click();
    await page.waitForTimeout(850);
    const visible = page.locator('.hotspot[data-visible="true"]').first();
    await visible.click();
    await page.waitForTimeout(1300);
  }
  await activate(page.getByRole('button',{name:'重置视角'}));
  await page.waitForTimeout(1250);
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
  assert.equal(overflow,0);
  await page.screenshot({path:`${dir}/${viewport.width}-explore.png`});
  if (touch) await activate(page.getByRole('button',{name:'返回主线'})); else await page.keyboard.press('Escape');
  await page.locator('.explore').waitFor({state:'detached'});
  await activate(page.getByRole('button',{name:'回到展厅开场'}));
  await page.waitForFunction(()=>scrollY===0);
  assert.deepEqual(errors,[]);
  checks.push({viewport,touch,overflow,about:true,navigation:true,cabinPaint:true,paint:true,reset:true,back:true,errors});
  await context.close();
}
fs.writeFileSync(`${dir}/${process.env.VIEWPORT ? `controls-${process.env.VIEWPORT}` : "controls"}.json`,JSON.stringify(checks,null,2));
await browser.close();
console.log('UI modes, keyboard and simulated touch passed on four viewports');

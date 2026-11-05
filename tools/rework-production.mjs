import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { chromium } from 'playwright';

const dir = 'docs/rework/evidence/stage-13';
const host = process.env.S90_PREVIEW_URL ?? 'http://127.0.0.1:4177/';
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  args: ['--use-angle=metal', '--ignore-gpu-blocklist'],
});
await fs.mkdir(dir, { recursive: true });
const report = { host, browser: browser.version(), runs: [] };
try {
  for (const viewport of [{ width: 1600, height: 900 }, { width: 390, height: 844 }]) {
    const mobile = viewport.width < 860;
    const context = await browser.newContext({ viewport, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: mobile ? 2.5 : 1 });
    const page = await context.newPage();
    const errors = [];
    const modelResponses = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => {
      if (response.url().endsWith('.glb')) modelResponses.push({ path: new URL(response.url()).pathname, status: response.status() });
    });
    await page.goto(host, { waitUntil: 'domcontentloaded' });
    await page.locator('.site-head').waitFor({ timeout: 120000 });
    const canvas = await page.locator('canvas').elementHandle();
    const full = await page.locator('.stage').boundingBox();
    assert.equal(await page.evaluate(() => typeof window.__S90Shot), 'undefined');
    await page.screenshot({ path: `${dir}/preview-${viewport.width}-opening.png` });

    const go = progress => page.evaluate(value => scrollTo({
      top: (document.documentElement.scrollHeight - innerHeight) * value, behavior: 'instant',
    }), progress);
    await go(.59);
    await page.locator('.detail[data-content="cabin"]').waitFor();
    await page.waitForTimeout(400);
    const split = await page.locator('.stage').boundingBox();
    assert.ok(mobile ? split.height < full.height : split.width < full.width);
    await page.screenshot({ path: `${dir}/preview-${viewport.width}-cabin.png` });

    await go(.97);
    await page.locator('.explore').waitFor();
    const paint = page.getByRole('button', { name: '峡湾蓝', exact: true });
    await paint.click();
    assert.equal(await paint.getAttribute('aria-pressed'), 'true');
    await page.getByRole('button', { name: '返回主线', exact: true }).click();
    await page.locator('.explore').waitFor({ state: 'detached' });
    await go(.59);
    await page.locator('.detail[data-content="cabin"]').waitFor();
    assert.equal(await canvas.evaluate(element => element === document.querySelector('canvas')), true);
    assert.equal(await page.locator('canvas').count(), 1);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth), 0);
    assert.deepEqual(modelResponses, [{ path: '/assets/model/candidates/s90-quality-v3.glb', status: 200 }]);
    assert.deepEqual(errors, []);
    report.runs.push({ viewport, full, split, modelResponses, errors });
    await context.close();
  }
  await fs.writeFile(`${dir}/production-smoke.json`, JSON.stringify(report, null, 2) + '\n');
} finally {
  await browser.close();
}

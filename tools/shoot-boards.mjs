import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('/Users/morton_cheung/Desktop/比赛/iTeach/node_modules/playwright');
const browser = await chromium.launch({ headless: true, args: ['--use-angle=metal','--ignore-gpu-blocklist','--enable-gpu'] });
const page = await browser.newPage({ viewport: { width: 4961, height: 3508 }, deviceScaleFactor: 1 });
for (const n of ['01','02','03']) {
  const file = path.resolve(`deliverables/boards/board-${n}.html`);
  await page.goto('file://' + file, { waitUntil: 'load' });
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(Array.from(document.images).map((im) => (im.complete ? null : new Promise((r) => { im.onload = r; im.onerror = r; }))));
  });
  await page.waitForTimeout(400);
  const overflow = await page.evaluate(() => ({ h: document.querySelector('.board').scrollHeight, w: document.querySelector('.board').scrollWidth }));
  await page.screenshot({ path: `deliverables/boards/board-${n}.png` });
  console.log(n, overflow);
}
await browser.close();

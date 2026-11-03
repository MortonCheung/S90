import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('/Users/morton_cheung/Desktop/比赛/iTeach/node_modules/playwright');
const browser = await chromium.launch({ headless: true, args: ['--use-angle=metal','--ignore-gpu-blocklist','--enable-gpu'] });
const context = await browser.newContext({
  viewport: { width: 1440, height: 810 },
  recordVideo: { dir: 'deliverables/media/raw', size: { width: 1440, height: 810 } },
});
const page = await context.newPage();
await page.goto('http://127.0.0.1:5177/', { waitUntil: 'networkidle' });
await page.waitForTimeout(6500);
await page.waitForFunction(() => !document.querySelector('.opening'), null, { timeout: 45000 }).catch(() => {});
await page.waitForTimeout(1200);
const max = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
const go = async (t, wait = 1900) => {
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'smooth' }), Math.round(max * t));
  await page.waitForTimeout(wait);
};
for (const t of [0.12, 0.2, 0.33, 0.46]) await go(t);
await go(0.59, 2200);
// concept cabin colourway, inside the cabin detail panel
const cabin = await page.evaluate(() => {
  const el = document.querySelectorAll('.cabin-option')[1];
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
});
if (cabin) {
  await page.mouse.click(cabin.x, cabin.y);
  await page.waitForTimeout(1500);
}
await page.screenshot({ path: 'docs/reports/demo-cabin.png' });
for (const t of [0.715, 0.86]) await go(t);
await go(0.97, 2000);
const pt = await page.evaluate(() => { const el = document.querySelectorAll('.paint')[1]; const r = el.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; });
await page.mouse.click(pt.x, pt.y);
await page.waitForTimeout(1600);
await page.screenshot({ path: 'docs/reports/demo-paint.png' });
await page.mouse.move(900, 420);
await page.mouse.down();
await page.mouse.move(1120, 380, { steps: 24 });
await page.mouse.up();
await page.waitForTimeout(1600);
const back = await page.evaluate(() => { const b = Array.from(document.querySelectorAll('button')).find((x) => x.textContent.includes('返回主线')); const r = b.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; });
await page.mouse.click(back.x, back.y);
await page.waitForTimeout(2400);
await context.close();
await browser.close();
console.log('recorded with cabin');

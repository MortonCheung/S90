import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('/Users/morton_cheung/Desktop/比赛/iTeach/node_modules/playwright');
const browser = await chromium.launch({ headless: true, args: ['--use-angle=metal','--ignore-gpu-blocklist','--enable-gpu'] });
const page = await browser.newPage({ viewport: { width: 2400, height: 1350 }, deviceScaleFactor: 1 });
await page.goto('http://127.0.0.1:5177/', { waitUntil: 'networkidle' });
await page.waitForTimeout(6000);
// opening mid-draw
await page.waitForTimeout(1200);
await page.screenshot({ path: 'deliverables/source_board_files/plate_lineart.png' });
await page.waitForFunction(() => !document.querySelector('.opening'), null, { timeout: 45000 }).catch(() => {});
await page.waitForTimeout(600);
const max = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
const hide = async () => page.evaluate(() => {
  for (const sel of ['.site-head', '.rail', '.chapter-card', '.scroll-hint', '.credit']) {
    document.querySelectorAll(sel).forEach((el) => { el.style.visibility = 'hidden'; });
  }
});
await hide();
await page.screenshot({ path: 'deliverables/source_board_files/plate_hero.png' });
const shots = [['light', 0.2], ['wheel', 0.33], ['profile', 0.46], ['cabin', 0.59], ['rear', 0.715]];
for (const [name, t] of shots) {
  await page.evaluate((y) => window.scrollTo(0, y), Math.round(max * t));
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `deliverables/source_board_files/plate_${name}.png` });
}
await page.evaluate((y) => window.scrollTo(0, y), Math.round(max * 0.62));
await page.waitForTimeout(1500);
await page.screenshot({ path: 'deliverables/source_board_files/plate_between.png' });
await page.evaluate((y) => window.scrollTo(0, Math.round(y)), max * 0.97);
await page.waitForTimeout(1800);
await page.screenshot({ path: 'deliverables/source_board_files/plate_explore.png' });
// paint white
const pt = await page.evaluate(() => { const el = document.querySelectorAll('.paint')[1]; const r = el.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; });
await page.mouse.click(pt.x, pt.y);
await page.waitForTimeout(1400);
await page.screenshot({ path: 'deliverables/source_board_files/plate_paint.png' });
await browser.close();
console.log('plates done');

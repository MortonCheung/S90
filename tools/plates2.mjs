import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true, args: ['--use-angle=metal','--ignore-gpu-blocklist','--enable-gpu'] });
const page = await browser.newPage({ viewport: { width: 3200, height: 1800 }, deviceScaleFactor: 1 });
await page.goto('http://127.0.0.1:5177/', { waitUntil: 'networkidle' });
// true opening frame: wait for the opening overlay and a partially drawn state
await page.waitForTimeout(1800);
const paths = await page.evaluate(() => document.querySelectorAll('.opening svg path').length);
await page.screenshot({ path: 'deliverables/source_board_files/plate_lineart.png' });
console.log('lineart paths in dom', paths);
await page.waitForFunction(() => !document.querySelector('.opening'), null, { timeout: 45000 });
await page.waitForTimeout(500);
const hide = () => page.evaluate(() => { for (const s of ['.site-head','.rail','.chapter-card','.scroll-hint','.credit']) document.querySelectorAll(s).forEach((el) => { el.style.visibility = 'hidden'; }); });
await hide();
await page.screenshot({ path: 'deliverables/source_board_files/plate_hero.png' });
const max = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
for (const [name, t] of [['light',0.2],['wheel',0.33],['profile',0.46],['cabin',0.59],['rear',0.715]]) {
  await page.evaluate((y) => window.scrollTo(0, y), Math.round(max * t));
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `deliverables/source_board_files/plate_${name}.png` });
}
await page.evaluate((y) => window.scrollTo(0, y), Math.round(max * 0.62));
await page.waitForTimeout(1500);
await page.screenshot({ path: 'deliverables/source_board_files/plate_between.png' });
await page.evaluate((y) => window.scrollTo(0, y), Math.round(max * 0.97));
await page.waitForTimeout(1800);
await page.screenshot({ path: 'deliverables/source_board_files/plate_explore.png' });
const pt = await page.evaluate(() => { const el = document.querySelectorAll('.paint')[1]; const r = el.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; });
await page.mouse.click(pt.x, pt.y);
await page.waitForTimeout(1400);
await page.screenshot({ path: 'deliverables/source_board_files/plate_paint.png' });
await browser.close();
console.log('plates 3200 done');

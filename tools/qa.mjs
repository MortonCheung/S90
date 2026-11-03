import fs from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('/Users/morton_cheung/Desktop/比赛/iTeach/node_modules/playwright');

const URL = process.argv[2] || 'http://127.0.0.1:5177/';
const browser = await chromium.launch({ headless: true, args: ['--use-angle=metal','--ignore-gpu-blocklist','--enable-gpu'] });
const result = { url: URL, started: new Date().toISOString(), desktop: {}, mobile: {}, errors: [] };

async function openPage(width, height) {
  const page = await browser.newPage({ viewport: { width, height } });
  page.on('console', (m) => { if (m.type() === 'error') result.errors.push(`[${width}x${height}] ${m.text()}`); });
  page.on('pageerror', (e) => result.errors.push(`[${width}x${height}] pageerror ${e.message}`));
  const t0 = Date.now();
  await page.goto(URL, { waitUntil: 'networkidle' });
  const hadOpening = await page.evaluate(() => Boolean(document.querySelector('.opening')));
  await page.waitForFunction(() => !document.querySelector('.opening'), null, { timeout: 60000 });
  await page.waitForTimeout(500);
  return { page, revealMs: Date.now() - t0, hadOpening };
}

// ---------------- desktop
{
  const { page, revealMs, hadOpening } = await openPage(1600, 900);
  const max = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
  const states = [];
  for (const t of [0.05, 0.2, 0.33, 0.46, 0.59, 0.715, 0.84, 0.97, 0.46]) {
    await page.evaluate((y) => window.scrollTo(0, y), Math.round(max * t));
    await page.waitForTimeout(1200);
    states.push(await page.evaluate((tt) => ({
      t: tt,
      detail: document.querySelector('.detail')?.getAttribute('data-open'),
      explore: document.querySelector('.explore')?.getAttribute('data-active'),
      chapter: document.querySelector('.rail__item[data-active="true"]')?.textContent?.trim() || null,
    }), t));
  }
  const fps = await page.evaluate(() => new Promise((resolve) => {
    let n = 0; const start = performance.now();
    const tick = () => { n += 1; if (performance.now() - start < 2000) requestAnimationFrame(tick); else resolve(Math.round(n / 2)); };
    requestAnimationFrame(tick);
  }));
  // explore interactions
  await page.evaluate((y) => window.scrollTo(0, y), Math.round(max * 0.97));
  await page.waitForTimeout(1800);
  const paint = await page.evaluate(() => { const el = document.querySelectorAll('.paint')[1]; const r = el.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; });
  await page.mouse.click(paint.x, paint.y);
  await page.waitForTimeout(1200);
  const paintActive = await page.evaluate(() => document.querySelector('.paint[data-active="true"]')?.getAttribute('aria-label'));
  await page.screenshot({ path: 'docs/reports/final-explore.png' });
  const hotspot = await page.evaluate(() => { const el = document.querySelector('.hotspot[data-visible="true"]'); if (!el) return null; const r = el.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; });
  if (hotspot) {
    await page.mouse.click(hotspot.x, hotspot.y);
    await page.waitForTimeout(1600);
    await page.screenshot({ path: 'docs/reports/final-hotspot-focus.png' });
  }
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1500);
  const afterEsc = await page.evaluate(() => document.querySelector('.explore')?.getAttribute('data-active'));
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  const canvas = await page.evaluate(() => document.querySelectorAll('canvas').length);
  result.desktop = { revealMs, hadOpening, states, fps, paintActive, hotspotFound: Boolean(hotspot), afterEsc, overflow, canvas };
  await page.close();
}

// ---------------- mobile
{
  const { page, revealMs } = await openPage(390, 844);
  const max = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
  await page.screenshot({ path: 'docs/reports/final-mobile-opening.png' });
  await page.evaluate((y) => window.scrollTo(0, y), Math.round(max * 0.59));
  await page.waitForTimeout(1600);
  await page.screenshot({ path: 'docs/reports/final-mobile-cabin.png' });
  const cabinVisible = await page.evaluate(() => Boolean(document.querySelector('.detail__cabin')));
  const cabinClick = await page.evaluate(() => { const el = document.querySelectorAll('.cabin-option')[1]; if (!el) return null; const r = el.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; });
  if (cabinClick) { await page.mouse.click(cabinClick.x, cabinClick.y); await page.waitForTimeout(1000); }
  await page.evaluate((y) => window.scrollTo(0, y), Math.round(max * 0.97));
  await page.waitForTimeout(1800);
  await page.screenshot({ path: 'docs/reports/final-mobile-explore.png' });
  const mobile = await page.evaluate(() => ({
    overflowX: document.documentElement.scrollWidth - window.innerWidth,
    barRect: (() => { const b = document.querySelector('.explore__bar'); if (!b) return null; const r = b.getBoundingClientRect(); return { x: Math.round(r.x), w: Math.round(r.width), vw: window.innerWidth }; })(),
    explore: document.querySelector('.explore')?.getAttribute('data-active'),
    canvas: document.querySelectorAll('canvas').length,
  }));
  result.mobile = { revealMs, cabinVisible, ...mobile };
  await page.close();
}

await browser.close();
fs.writeFileSync('/tmp/qa-result.json', JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));

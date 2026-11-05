import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true, args: ['--use-angle=metal','--ignore-gpu-blocklist','--enable-gpu'] });
const results = {};

// A. normal session: console errors + reveal + detail + reverse + explore + back
{
  const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push('pageerror ' + e.message));
  await page.goto('http://127.0.0.1:5177/', { waitUntil: 'networkidle' });
  const t0 = Date.now();
  await page.waitForFunction(() => !document.querySelector('.opening'), null, { timeout: 40000 });
  results.revealMs = Date.now() - t0;
  const max = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
  results.maxScroll = max;
  await page.evaluate((y) => window.scrollTo(0, y), Math.round(max * 0.2));
  await page.waitForTimeout(1200);
  results.detailOpenAt20 = await page.evaluate(() => document.querySelector('.detail')?.getAttribute('data-open'));
  await page.evaluate((y) => window.scrollTo(0, y), Math.round(max * 0.22));
  await page.waitForTimeout(900);
  await page.evaluate((y) => window.scrollTo(0, Math.round(y)), max * 0.19);
  await page.waitForTimeout(900);
  results.detailAfterReverse = await page.evaluate(() => document.querySelector('.detail')?.getAttribute('data-open'));
  await page.evaluate((y) => window.scrollTo(0, y), Math.round(max * 0.97));
  await page.waitForTimeout(1500);
  results.explore = await page.evaluate(() => document.querySelector('.explore')?.getAttribute('data-active'));
  const back = await page.evaluate(() => { const b = Array.from(document.querySelectorAll('button')).find(x => x.textContent.includes('返回主线')); const r = b.getBoundingClientRect(); return { x: r.x + r.width/2, y: r.y + r.height/2 }; });
  await page.mouse.click(back.x, back.y);
  await page.waitForTimeout(1600);
  results.afterBack = await page.evaluate(() => ({ y: Math.round(window.scrollY / (document.documentElement.scrollHeight - window.innerHeight) * 100) / 100, explore: document.querySelector('.explore')?.getAttribute('data-active') }));
  results.consoleErrors = errors;
  await page.close();
}

// B. model 404 -> error UI -> retry succeeds
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  let block = true;
  await page.route('**/s90-opt.glb', (route) => (block ? route.abort('failed') : route.continue()));
  await page.goto('http://127.0.0.1:5177/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);
  results.errorPanel = await page.evaluate(() => { const el = document.querySelector('.opening__error, [data-error], .opening__status'); return el ? el.textContent.trim().slice(0, 120) : null; });
  results.retryButton = await page.evaluate(() => Boolean(Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('重新载入'))));
  block = false;
  const btn = await page.evaluate(() => { const b = Array.from(document.querySelectorAll('button')).find(x => x.textContent.includes('重新载入')); if (!b) return null; const r = b.getBoundingClientRect(); return { x: r.x + r.width/2, y: r.y + r.height/2 }; });
  if (btn) { await page.mouse.click(btn.x, btn.y); await page.waitForFunction(() => !document.querySelector('.opening'), null, { timeout: 40000 }).catch(() => {}); }
  results.retryRevealed = await page.evaluate(() => !document.querySelector('.opening'));
  await page.screenshot({ path: 'docs/reports/error-retry.png' });
  await page.close();
}

// C. reduced motion
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' });
  await page.goto('http://127.0.0.1:5177/', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => !document.querySelector('.opening'), null, { timeout: 40000 }).catch(() => {});
  results.reducedMotionRevealed = await page.evaluate(() => !document.querySelector('.opening'));
  await page.close();
}

// D. mobile viewport
{
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await page.goto('http://127.0.0.1:5177/', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => !document.querySelector('.opening'), null, { timeout: 40000 }).catch(() => {});
  results.mobileRevealed = await page.evaluate(() => !document.querySelector('.opening'));
  results.mobileOverflowX = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  await page.close();
}

console.log(JSON.stringify(results, null, 2));
await browser.close();

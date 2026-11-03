import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('/Users/morton_cheung/Desktop/比赛/iTeach/node_modules/playwright');

const SITES = [
  { id: 'heron', url: 'https://heronaiapp.com', shots: [1200, 3200, 7000] },
  { id: 'spyker', url: 'https://spykercars.com/c8-preliator', shots: [1200, 3200, 7000], scroll: true },
  { id: 'illoca', url: 'https://illoca.unseen.co', shots: [1200, 3200, 7000], scroll: true },
  { id: 'demo', url: 'https://demo.morton.xin', shots: [2500] },
];

const root = path.resolve('reference/audit');
const browser = await chromium.launch({
  headless: true,
  args: ['--use-angle=metal', '--ignore-gpu-blocklist', '--enable-gpu'],
});

for (const site of SITES) {
  const dir = path.join(root, site.id);
  fs.mkdirSync(dir, { recursive: true });
  const evidence = { id: site.id, url: site.url, started: new Date().toISOString(), steps: [] };
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const consoleLines = [];
  const requests = [];
  page.on('console', (m) => { if (consoleLines.length < 80) consoleLines.push(`[${m.type()}] ${m.text()}`); });
  page.on('request', (r) => { if (requests.length < 400) requests.push(`${r.resourceType()} ${r.url()}`); });
  page.on('pageerror', (e) => consoleLines.push(`[pageerror] ${e.message}`));
  try {
    await page.goto(site.url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(3500);
    const meta = await page.evaluate(() => {
      const videos = Array.from(document.querySelectorAll('video')).map((v) => ({ src: v.currentSrc || v.src, poster: v.poster, autoplay: v.autoplay, loop: v.loop, duration: v.duration || null }));
      const canvases = Array.from(document.querySelectorAll('canvas')).map((c) => ({ w: c.width, h: c.height, cls: c.className }));
      const imgs = Array.from(document.images).slice(0, 30).map((i) => ({ src: i.currentSrc || i.src, w: i.naturalWidth, h: i.naturalHeight }));
      return {
        title: document.title,
        height: document.documentElement.scrollHeight,
        videos, canvases,
        images: imgs,
        hasGSAP: Boolean(window.gsap), hasThree: Boolean(window.THREE),
        bodyBg: getComputedStyle(document.body).backgroundColor,
        text: document.body.innerText.slice(0, 1200),
      };
    });
    evidence.meta = meta;
    await page.screenshot({ path: path.join(dir, 'top.png') });
    if (site.scroll) {
      const h = Math.max(meta.height, 900);
      for (const y of [0.25, 0.5, 0.75, 0.95]) {
        await page.evaluate((yy) => window.scrollTo({ top: yy, behavior: 'instant' }), Math.round((h - 900) * y));
        await page.waitForTimeout(1600);
        await page.screenshot({ path: path.join(dir, `scroll-${String(y).replace('.', '')}.png`) });
        evidence.steps.push({ scroll: y, y: await page.evaluate(() => window.scrollY), height: await page.evaluate(() => document.documentElement.scrollHeight) });
      }
    } else {
      for (const waitMs of site.shots) {
        await page.waitForTimeout(waitMs);
        await page.screenshot({ path: path.join(dir, `t-${waitMs}.png`) });
      }
    }
    evidence.resources = requests.filter((r) => /\.(mp4|webm|m3u8|jpe?g|webp|png|glb|gltf|js)(\?|$)/i.test(r)).slice(0, 120);
    evidence.console = consoleLines;
  } catch (error) {
    evidence.error = String(error && error.message ? error.message : error);
    try { await page.screenshot({ path: path.join(dir, 'error.png') }); } catch {}
  }
  fs.writeFileSync(path.join(dir, 'evidence.json'), JSON.stringify(evidence, null, 2));
  fs.writeFileSync(path.join(dir, 'requests.txt'), requests.join('\n'));
  console.log(site.id, evidence.error ? 'ERROR ' + evidence.error : 'OK', evidence.meta ? `h=${evidence.meta.height} video=${evidence.meta.videos.length} canvas=${evidence.meta.canvases.length}` : '');
  await page.close();
}
await browser.close();

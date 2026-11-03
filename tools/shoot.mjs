import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('/Users/morton_cheung/Desktop/比赛/iTeach/node_modules/playwright');

const url = process.argv[2] || 'http://127.0.0.1:5177/';
const out = process.argv[3] || 'docs/reports/shot.png';
const width = Number(process.argv[4] || 1600);
const height = Number(process.argv[5] || 900);
const wait = Number(process.argv[6] || 5000);
const scroll = Number(process.argv[7] || 0);

const browser = await chromium.launch({ headless: true, args: ['--use-angle=metal', '--ignore-gpu-blocklist', '--enable-gpu'] });
const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
const errors = [];
page.on('console', (message) => {
  if (message.type() === 'error' || message.type() === 'warning') errors.push(`[${message.type()}] ${message.text()}`);
});
page.on('pageerror', (error) => errors.push(`[pageerror] ${error.message}`));

await page.goto(url, { waitUntil: 'networkidle', timeout: 120000 });
await page.waitForTimeout(wait);
await page.waitForFunction(() => !document.querySelector('.opening'), null, { timeout: 45000 }).catch(() => {});
await page.waitForTimeout(400);
if (scroll > 0) {
  await page.evaluate((value) => window.scrollTo(0, value), scroll);
  await page.waitForTimeout(1400);
}
await page.screenshot({ path: out });
const state = await page.evaluate(() => ({
  scrollY: window.scrollY,
  scrollHeight: document.documentElement.scrollHeight,
  innerHeight: window.innerHeight,
  opening: Boolean(document.querySelector('.opening')),
  detailOpen: document.querySelector('.detail')?.getAttribute('data-open'),
  explore: document.querySelector('.explore')?.getAttribute('data-active'),
  hotspotCount: document.querySelectorAll('.hotspot').length,
  canvas: Boolean(document.querySelector('canvas')),
  lineartPaths: document.querySelectorAll('.opening svg path').length,
}));
console.log(JSON.stringify({ out, ...state }, null, 2));
if (errors.length) console.log(errors.slice(0, 12).join('\n'));
await browser.close();

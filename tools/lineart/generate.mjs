import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require('/Users/morton_cheung/Desktop/比赛/iTeach/node_modules/playwright');

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const outSvg = path.join(root, 'public/assets/lineart/s90-side.svg');
const outShot = path.join(root, 'docs/reports/lineart-preview.png');

const server = spawn(process.execPath, [path.join(here, 'serve.mjs')], {
  cwd: root,
  stdio: 'inherit',
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

try {
  await sleep(700);
  const browser = await chromium.launch({
    headless: true,
    args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
  });
  const page = await browser.newPage({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1 });
  page.on('console', (message) => console.log('[page]', message.text()));
  page.on('pageerror', (error) => console.error('[pageerror]', error.message));

  await page.goto('http://127.0.0.1:5199/tools/lineart/page.html', { waitUntil: 'load' });
  await page.waitForFunction(() => window.__done || window.__error, null, { timeout: 600000 });

  const result = await page.evaluate(() => window.__result || { error: window.__error });
  if (!result || result.error) {
    console.error('generation failed:', result?.error);
    process.exitCode = 1;
  } else {
    fs.mkdirSync(path.dirname(outSvg), { recursive: true });
    fs.mkdirSync(path.dirname(outShot), { recursive: true });
    fs.writeFileSync(outSvg, result.svg);
    console.log('stats', JSON.stringify({ ...result, svg: undefined }, null, 2));

    const previewHtml = path.join(root, 'docs/reports/lineart-preview.html');
    fs.writeFileSync(
      previewHtml,
      `<!doctype html><html><head><style>html,body{margin:0;background:#f3f0e9}svg{width:1200px;height:675px;display:block}</style></head><body>${result.svg}</body></html>`,
    );
    const preview = await browser.newPage({ viewport: { width: 1200, height: 675 }, deviceScaleFactor: 1 });
    await preview.goto(`file://${previewHtml.replace(/ /g, '%20')}`, { waitUntil: 'load' });
    await preview.screenshot({ path: outShot });
    console.log('wrote', path.relative(root, outSvg), 'and', path.relative(root, outShot));
  }
  await browser.close();
} finally {
  server.kill('SIGTERM');
}

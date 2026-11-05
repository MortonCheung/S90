import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { chromium } from 'playwright';

const viewport = { width: 1600, height: 900 };
const dir = 'test-results/stage-12';
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  args: ['--use-angle=metal', '--ignore-gpu-blocklist'],
});
const context = await browser.newContext({ viewport, recordVideo: { dir, size: viewport } });
const page = await context.newPage();
const errors = [];
page.on('pageerror', error => errors.push(error.message));
const chapters = [];
const started = Date.now();

async function scrollTo(progress, hold) {
  await page.evaluate(value => window.scrollTo({
    top: (document.documentElement.scrollHeight - innerHeight) * value,
    behavior: 'smooth',
  }), progress);
  await page.waitForFunction(value => Math.abs(window.__S90Shot().progress - value) < .0005, progress);
  chapters.push({ progress, seconds: (Date.now() - started) / 1000 });
  await page.waitForTimeout(hold);
}

try {
  await page.goto(process.env.S90_URL ?? 'http://127.0.0.1:5177/', { waitUntil: 'domcontentloaded' });
  await page.locator('.site-head').waitFor({ timeout: 120000 });
  await page.waitForTimeout(1600);
  for (const [progress, hold] of [[.075,1600],[.2,1700],[.33,1700],[.46,1600],[.59,2400],[.615,2000],[.715,1600],[.83,1100],[.97,1500]]) {
    await scrollTo(progress, hold);
  }
  for (const name of ['水晶白', '峡湾蓝', '暖铜棕']) {
    await page.getByRole('button', { name, exact: true }).click();
    await page.waitForTimeout(1300);
  }
  await page.mouse.move(736, 549);
  await page.mouse.down();
  await page.mouse.move(1030, 564, { steps: 42 });
  await page.mouse.up();
  await page.waitForTimeout(1500);
  await page.getByRole('button', { name: '返回主线' }).click();
  await page.waitForFunction(() => !document.querySelector('.explore'));
  for (const progress of [.715,.615,.59,.46]) await scrollTo(progress, 950);
  assert.deepEqual(errors, []);
} finally {
  await context.close();
  await browser.close();
}
const path = await page.video().path();
execFileSync('ffmpeg', ['-hide_banner','-loglevel','error','-y','-i',path,'-an','-c:v','libx264','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart','deliverables/v3/s90_demo.mp4']);
await fs.writeFile('docs/rework/evidence/stage-12/demo-timeline.json', JSON.stringify({ viewport, chapters, errors }, null, 2) + '\n');

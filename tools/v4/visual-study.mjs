import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { chromium } from 'playwright';

// Temporary DOM injection for fixed-shot design review. No scene is mounted by App.
const dir = 'docs/v4/evidence/stage-04';
await fs.mkdir(dir, { recursive: true });
const studies = [
  ['a-residence', 'docs/v4/design-study/01-horizontal-residence.svg'],
  ['b-courtyard', 'docs/v4/design-study/02-framed-courtyard.svg'],
];
const browser = await chromium.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  args: ['--use-angle=metal', '--ignore-gpu-blocklist'],
});
const context = await browser.newContext({ viewport: { width: 1600, height: 900 }, reducedMotion: 'reduce' });
const page = await context.newPage();
const errors = [], failed = [], responses = [], samples = [];
page.on('pageerror', e => errors.push(e.message));
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
page.on('requestfailed', r => failed.push({ url: r.url(), error: r.failure()?.errorText }));
page.on('response', r => {
  if (r.status() >= 400 || r.url().endsWith('.glb')) responses.push({ url: r.url(), status: r.status() });
});

async function capture(name) {
  await page.waitForTimeout(150);
  const state = await page.evaluate(() => {
    const root = getComputedStyle(document.documentElement);
    return {
      shot: window.__S90Shot(), modelId: window.__S90Ready.modelId,
      canvasCount: document.querySelectorAll('canvas').length,
      canvasSame: document.querySelector('canvas') === window.__studyCanvas,
      overflow: document.documentElement.scrollWidth - innerWidth,
      paper: root.getPropertyValue('--sketch-paper').trim(),
      ground: root.getPropertyValue('--sketch-ground').trim(),
      stageBackground: getComputedStyle(document.querySelector('.stage')).backgroundImage,
      vignette: getComputedStyle(document.querySelector('.stage__vignette')).backgroundImage,
    };
  });
  assert.equal(state.canvasCount, 1);
  assert.equal(state.canvasSame, true);
  assert.equal(state.overflow, 0);
  assert.equal(state.stageBackground, 'none');
  assert.equal(state.vignette, 'none');
  await page.screenshot({ path: `${dir}/${name}.png` });
  samples.push({ name, ...state });
}

try {
  await page.goto(process.env.S90_URL ?? 'http://127.0.0.1:5177/', { waitUntil: 'domcontentloaded' });
  await page.locator('.site-head').waitFor({ timeout: 120000 });
  await page.evaluate(() => {
    window.__studyCanvas = document.querySelector('canvas');
    scrollTo({ top: (document.documentElement.scrollHeight - innerHeight) * .075, behavior: 'instant' });
  });
  await page.waitForFunction(() => Math.abs(window.__S90Shot().progress - .075) < .0005);
  await capture('00-pure-stage');
  for (const [name, path] of studies) {
    const markup = await fs.readFile(path, 'utf8');
    await page.evaluate(markup => {
      document.querySelector('.sketch-study')?.remove();
      const layer = document.createElement('div');
      layer.className = 'sketch-study';
      layer.setAttribute('aria-hidden', 'true');
      layer.innerHTML = markup;
      document.querySelector('.stage').prepend(layer);
    }, markup);
    await capture(`study-${name}`);
  }
  const selected = await fs.readFile(studies[0][1], 'utf8');
  await page.evaluate(markup => { document.querySelector('.sketch-study').innerHTML = markup; }, selected);
  for (const tone of ['morning', 'day', 'afternoon', 'dusk']) {
    await page.evaluate(tone => { document.documentElement.dataset.sketchTone = tone; }, tone);
    await capture(`palette-${tone}`);
  }
  await page.evaluate(() => {
    document.querySelector('.sketch-study')?.remove();
    delete document.documentElement.dataset.sketchTone;
  });
  await capture('99-clean-restored');
  assert.deepEqual(samples[0].shot.position, samples.at(-1).shot.position);
  assert.ok(samples.every(s => s.modelId === samples[0].modelId));
  assert.deepEqual(errors, []);
  assert.deepEqual(failed, []);
  assert.ok(responses.every(r => r.status === 200));
  await fs.writeFile(`${dir}/visual-study.json`, JSON.stringify({
    date: new Date().toISOString(), browser: browser.version(),
    viewport: { width: 1600, height: 900 },
    note: 'Static fixed-camera comparison; palette variants are colour studies, not four implemented acts.',
    samples, errors, failed, responses,
  }, null, 2) + '\n');
} finally {
  await context.close();
  await browser.close();
}

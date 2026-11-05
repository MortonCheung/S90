import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { chromium } from 'playwright';

const dir = 'docs/v4/evidence/stage-06';
const sceneIds = ['residence', 'city', 'arrival', 'road'];
const layers = ['background', 'architecture', 'road', 'detail', 'foreground'];
const levels = [0, .25, .5, .75, 1];
await fs.mkdir(dir, { recursive: true });
const sources = Object.fromEntries(await Promise.all(sceneIds.map(async id => [
  id, await fs.readFile(`src/sketch/scenes/${id}.svg`, 'utf8'),
])));
const browser = await chromium.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  args: ['--use-angle=metal', '--ignore-gpu-blocklist'],
});
const page = await browser.newPage({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1 });
const errors = [], requests = [];
page.on('pageerror', e => errors.push(e.message));
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
page.on('request', request => requests.push(request.url()));
const manifest = {
  date: new Date().toISOString(), browser: browser.version(), viewBox: [0, 0, 1600, 900],
  preview: {
    levels,
    method: 'Static left-to-right inspection frontier; no timer, easing or runtime scheduler.',
    washPolicy: 'Paper remains visible. Auxiliary fills appear only in the 100% inspection frame.',
    runtimeGrowthRange: null,
    note: 'Spatial xRange is measured geometry, not the stage-07 animation time range. Vertical paths are shown once the static frontier passes their x coordinate.',
  },
  scenes: [],
};

try {
  for (const id of sceneIds) {
    await page.setContent(`<!doctype html><html><head><meta charset="UTF-8"><style>
      html,body{margin:0;width:100%;height:100%;overflow:hidden}
      body>svg{display:block;width:100%;height:100%}
    </style></head><body>${sources[id]}</body></html>`);
    const data = await page.evaluate(() => {
      const root = document.querySelector('svg');
      const ink = [...root.querySelectorAll('path[data-ink]')];
      return {
        id: root.dataset.scene,
        viewBox: root.getAttribute('viewBox'),
        safeArea: root.dataset.safeArea.split(' ').map(Number),
        layers: [...root.querySelectorAll(':scope > g[data-layer]')].map(g => g.dataset.layer),
        forbidden: root.querySelectorAll('style,image,use,filter,linearGradient,radialGradient,script,foreignObject').length,
        hrefs: [...root.querySelectorAll('*')].filter(e => [...e.attributes].some(a => /href$/i.test(a.name))).length,
        unclassified: root.querySelectorAll('path:not([data-ink]):not([data-wash])').length,
        mixedFillAndInk: root.querySelectorAll('path[data-ink][data-wash]').length,
        washes: [...root.querySelectorAll('[data-wash]')].map(e => ({ name: e.dataset.wash, layer: e.closest('[data-layer]').dataset.layer })),
        paths: ink.map(path => {
          const length = path.getTotalLength();
          const box = path.getBBox();
          const points = Array.from({ length: 33 }, (_, i) => path.getPointAtLength(length * i / 32));
          const first = points[0], last = points.at(-1);
          const css = getComputedStyle(path);
          return {
            id: path.id, ink: path.dataset.ink,
            layer: path.closest('[data-layer]').dataset.layer,
            declaredDirection: path.dataset.direction,
            measuredDirection: Math.abs(last.x - first.x) < .01 ? 'vertical' : last.x > first.x ? 'ltr' : 'rtl',
            monotonicX: points.every((p, i) => !i || p.x >= points[i - 1].x - .01),
            subpaths: (path.getAttribute('d').match(/m/ig) ?? []).length,
            length, start: [first.x, first.y], end: [last.x, last.y],
            bbox: { x: box.x, y: box.y, width: box.width, height: box.height },
            xRange: [box.x / 1600, (box.x + box.width) / 1600],
            growthRange: null,
            stroke: css.stroke, strokeWidth: css.strokeWidth,
          };
        }),
      };
    });
    assert.equal(data.id, id);
    assert.equal(data.viewBox, '0 0 1600 900');
    assert.deepEqual(data.layers, layers);
    assert.equal(data.forbidden, 0);
    assert.equal(data.hrefs, 0);
    assert.equal(data.unclassified, 0);
    assert.equal(data.mixedFillAndInk, 0);
    assert.ok(data.paths.length > 0);
    assert.equal(new Set(data.paths.map(p => p.id)).size, data.paths.length);
    for (const path of data.paths) {
      assert.ok(path.id && path.length > 0 && Number.isFinite(path.length), JSON.stringify(path));
      assert.equal(path.subpaths, 1, path.id);
      assert.equal(path.declaredDirection, 'ltr', path.id);
      assert.equal(path.monotonicX, true, path.id);
      assert.notEqual(path.stroke, 'none', path.id);
    }
    for (const progress of levels) {
      await page.evaluate(progress => {
        for (const path of document.querySelectorAll('path[data-ink]')) {
          const box = path.getBBox(), length = path.getTotalLength();
          const fraction = progress === 0 ? 0 : progress === 1 ? 1 : box.width < .01
            ? Number(progress * 1600 >= box.x)
            : Math.max(0, Math.min(1, (progress * 1600 - box.x) / box.width));
          path.style.strokeDasharray = `${length} ${length}`;
          path.style.strokeDashoffset = String(length * (1 - fraction));
          path.style.visibility = fraction > 0 ? 'visible' : 'hidden';
        }
        for (const wash of document.querySelectorAll('[data-wash]')) {
          wash.style.visibility = wash.dataset.wash === 'paper' || progress === 1 ? 'visible' : 'hidden';
        }
      }, progress);
      const file = `${id}-${Math.round(progress * 100)}.png`;
      await page.screenshot({ path: `${dir}/${file}` });
    }
    manifest.scenes.push({ ...data, files: levels.map(p => `${id}-${Math.round(p * 100)}.png`) });
    console.log(`${id}: ${data.paths.length} independent paths, ${data.washes.length} washes`);
  }
  await page.setContent(`<!doctype html><html><head><meta charset="UTF-8"><style>
    html,body{margin:0;width:1600px;height:900px;overflow:hidden}
    main{display:grid;grid-template-columns:800px 800px;grid-template-rows:450px 450px}
    section{overflow:hidden}section>svg{display:block;width:800px;height:450px}
  </style></head><body><main>${sceneIds.map(id => `<section data-scene="${id}">${sources[id]}</section>`).join('')}</main></body></html>`);
  await page.screenshot({ path: `${dir}/contact.png` });
  assert.deepEqual(errors, []);
  assert.deepEqual(requests, []);
  manifest.errors = errors;
  manifest.externalRequests = requests;
  await fs.writeFile(`${dir}/manifest.json`, JSON.stringify(manifest, null, 2) + '\n');
} finally {
  await browser.close();
}

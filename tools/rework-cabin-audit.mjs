import { chromium } from 'playwright';
import fs from 'node:fs';

const browser = await chromium.launch({ executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--use-angle=metal'] });
const page = await browser.newPage({ viewport:{width:1600,height:900}, reducedMotion:'reduce' });
await page.goto('http://127.0.0.1:5177/');
await page.waitForFunction(() => window.__S90Ready?.firstFrameReady, null, {timeout:90000});
const bounds = await page.evaluate(async () => {
  const { Box3, Vector3 } = await import('/node_modules/.vite/deps/three.js');
  const rows = [];
  window.__scene.traverse((node) => {
    if (!node.isMesh || !/glass|window|roof|pillar|dashboard|steering|seat|console/i.test(node.name)) return;
    if (/light|wheelhub|taillight/i.test(node.name) && !/steering/i.test(node.name)) return;
    const box = new Box3().setFromObject(node);
    rows.push({ name:node.name, material:node.material?.name,min:box.min.toArray(),max:box.max.toArray(),center:box.getCenter(new Vector3()).toArray() });
  });
  return rows;
});
fs.writeFileSync('docs/rework/evidence/stage-09/parts.json',JSON.stringify(bounds,null,2));
console.log(bounds.map(({name, material, min, max}) => [name,material,min.map(n=>n.toFixed(3)),max.map(n=>n.toFixed(3))]));
await browser.close();

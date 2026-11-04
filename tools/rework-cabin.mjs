import { chromium } from 'playwright';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const dir = 'docs/rework/evidence/stage-09';
const browser = await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--use-angle=metal']});
const samples = [];
for (const viewport of [{width:1600,height:900},{width:390,height:844}]) {
  const context = await browser.newContext({viewport,reducedMotion:'reduce',recordVideo:process.env.VIDEO ? {dir,size:viewport} : undefined});
  const page = await context.newPage();
  let requests = 0;
  page.on('request', r => { if (r.url().endsWith('.glb')) requests++; });
  await page.goto('http://127.0.0.1:5177/');
  await page.waitForFunction(() => !document.querySelector('.opening'),null,{timeout:90000});
  await page.evaluate(async () => { window.__sampleCamera = (await import('/src/story/story.js')).sampleCamera; });
  const rows = [];
  for (const progress of [.53,.552,.562,.568,.573,.59,.62,.645,.65,.662,.674,.715,.674,.662,.65,.645,.62,.59,.573,.568,.562,.552,.53]) {
    await page.evaluate(t => scrollTo(0,(document.documentElement.scrollHeight-innerHeight)*t),progress);
    await page.waitForFunction((requested) => {
      const pose = window.__S90Shot();
      const stage = document.querySelector('.stage').getBoundingClientRect();
      const expected = window.__sampleCamera(pose.progress, stage.width / stage.height);
      return Math.abs(pose.progress-requested)<.0004 && Math.abs(pose.fov - expected.fov) < .05
        && pose.position.every((x,i) => Math.abs(x-expected.pos[i])<.001);
    }, progress);
    const row = await page.evaluate(() => {
      const mesh = window.__scene.getObjectByName('RearDoorGlass__Glass_0');
      return { pose:window.__S90Shot(), glass:{visible:mesh.visible,opacity:mesh.material.opacity,transparent:mesh.material.transparent} };
    });
    if ([.552,.568,.59,.62,.65,.715].includes(progress)) await page.screenshot({path:`${dir}/${viewport.width}-${rows.length}-${progress}.png`});
    if ([.59,.62].includes(progress)) {
      assert.ok(Math.abs(row.pose.position[0])<.65, JSON.stringify({progress, row}));
      assert.ok(row.pose.near < .025);
    }
    rows.push({progress,...row});
  }
  for (let i=0;i<11;i++) {
    assert.deepEqual(rows[i].glass,rows[22-i].glass);
    assert.deepEqual(rows[i].pose.position,rows[22-i].pose.position);
    assert.ok(Math.abs(rows[i].pose.fov-rows[22-i].pose.fov)<.06);
  }
  assert.equal(requests,1);
  const collisions = await page.evaluate(async () => {
    const { Raycaster, Vector3, DoubleSide } = await import('/node_modules/.vite/deps/three.js');
    const { sampleCamera } = await import('/src/story/story.js');
    const model = window.__scene.getObjectByName('RearDoorGlass__Glass_0');
    const meshes = [];
    window.__scene.traverse(o => { if(o.isMesh && o.name && !/glass/i.test(o.name)) meshes.push(o); });
    const materials = new Map();
    for (const mesh of meshes) for (const mat of [mesh.material].flat()) {
      if (!materials.has(mat)) materials.set(mat,mat.side);
      mat.side = DoubleSide;
    }
    const out=[];
    for (let i=0;i<80;i++) {
      const a=.549+i*(.675-.549)/80, b=.549+(i+1)*(.675-.549)/80;
      const point=new Vector3(...sampleCamera(a,1.2).pos);
      const step=new Vector3(...sampleCamera(b,1.2).pos).sub(point);
      if (step.length()<1e-6) continue;
      const ray=new Raycaster(point,step.clone().normalize(),0,step.length());
      for (const hit of ray.intersectObjects(meshes,false)) out.push({a,b,name:hit.object.name});
    }
    for (const [mat,side] of materials) mat.side=side;
    return {collisions:out,window:model.name};
  });
  samples.push({viewport,requests,rows,...collisions});
  console.log(viewport,collisions);
  await context.close();
}
fs.writeFileSync(`${dir}/poses.json`,JSON.stringify(samples,null,2));
await browser.close();
console.log(samples.map(({viewport,collisions})=>({viewport,collisions})));

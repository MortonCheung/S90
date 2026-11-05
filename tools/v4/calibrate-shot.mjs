import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import { SHOTS } from '../../src/journey/shots.js';

const supplied=process.argv[2];
const target=supplied?JSON.parse(await fs.readFile(supplied,'utf8')):{
  image:'docs/v4/evidence/stage-09/1600-0-0.075.png',
  viewport:[1600,900],shotId:'whole',phase:'display',origin:'project self-test, not a user reference',
};
await fs.access(target.image);
const shot=SHOTS.find(item=>item.id===target.shotId);
assert.ok(shot,'Unknown shotId');
const dir=process.env.CALIBRATION_OUTPUT??'docs/v4/evidence/stage-10';
await fs.mkdir(dir,{recursive:true});
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--use-angle=metal','--ignore-gpu-blocklist']});
const page=await browser.newPage({viewport:{width:target.viewport[0],height:target.viewport[1]},reducedMotion:'reduce'});
const candidates=[];
try {
  await page.goto('http://127.0.0.1:5177/');
  await page.locator('.site-head').waitFor({timeout:120000});
  const at=target.progress ?? (target.phase === 'entry' ? shot.from : target.phase === 'exit' ? shot.to : (shot.from+shot.to)/2);
  await page.evaluate(t=>scrollTo({top:(document.documentElement.scrollHeight-innerHeight)*t,behavior:'instant'}),at);
  await page.waitForFunction(t=>Math.abs(window.__S90Shot().progress-t)<.0005,at);
  await page.waitForTimeout(200);
  const measured=await page.evaluate(name=>window.__S90Calibration.measure(name),target.meshName);
  const expected=target.subjectBoundsNormalized??measured;
  const current=await page.evaluate(()=>window.__S90Shot());
  const seed=target.seed??{pos:current.position,target:current.target,fov:current.fov,near:current.near};
  const render=async(pose,label)=>{
    assert.ok([pose.pos,pose.target].every(vector=>vector.length===3&&vector.every(Number.isFinite)));
    assert.ok(Number.isFinite(pose.fov)&&pose.fov>1&&pose.fov<120);
    await page.evaluate(pose=>window.__S90Calibration.set(pose),pose);
    await page.waitForTimeout(120);
    const bounds=await page.evaluate(name=>window.__S90Calibration.measure(name),target.meshName);
    assert.ok(bounds.every(Number.isFinite),'Subject cannot be projected by this candidate');
    const error=Math.sqrt(bounds.reduce((sum,value,index)=>sum+(value-expected[index])**2,0)/4);
    const file=`${label}.png`;
    await page.screenshot({path:path.join(dir,file)});
    const entry={pose,bounds,error,file};
    candidates.push(entry);return entry;
  };
  for(const factor of [.94,1,1.06]) for(const angle of [-.03,0,.03]){
    const delta=seed.pos.map((value,index)=>(value-seed.target[index])*factor);
    const pos=[
      seed.target[0]+delta[0]*Math.cos(angle)-delta[2]*Math.sin(angle),
      seed.target[1]+delta[1],
      seed.target[2]+delta[0]*Math.sin(angle)+delta[2]*Math.cos(angle),
    ];
    await render({...seed,pos},`position-${factor}-${angle}`);
  }
  const coarse=[...candidates].sort((a,b)=>a.error-b.error)[0];
  for(const [axis,offset] of [[0,-.03],[0,.03],[1,-.03],[1,.03]]){
    const look=[...coarse.pose.target];look[axis]+=offset;
    await render({...coarse.pose,target:look},`target-${axis}-${offset}`);
  }
  const framed=[...candidates].sort((a,b)=>a.error-b.error)[0];
  for(const fov of [framed.pose.fov-1,framed.pose.fov+1]) await render({...framed.pose,fov},`fov-${fov}`);
  const best=[...candidates].sort((a,b)=>a.error-b.error)[0];
  await render(best.pose,'selected');
  await page.evaluate(()=>window.__S90Calibration.clear());
  await fs.writeFile(path.join(dir,'calibration.json'),JSON.stringify({target:{...target,subjectBoundsNormalized:expected},metric:'RMS normalized AABB error, not unique camera recovery',candidates,best},null,2)+'\n');
} finally {await browser.close();}

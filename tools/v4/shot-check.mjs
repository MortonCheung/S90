import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { sampleCamera } from '../../src/story/story.js';
import { SHOTS, SHOT_ANCHORS } from '../../src/journey/shots.js';
import { ACTS } from '../../src/journey/acts.js';

for(const act of ACTS) for(const id of act.cameraSequence) {
  assert.ok(SHOTS.some(shot=>shot.id===id&&shot.actId===act.id),id);
}
const report=[];
for(const anchor of SHOT_ANCHORS){
  const first=sampleCamera(anchor.at,1600/900);
  const again=sampleCamera(anchor.at,1600/900);
  assert.deepEqual(first,again);
  const shot=SHOTS.find(s=>s.id===anchor.id);
  if(shot.from!==shot.to) {
    assert.deepEqual(sampleCamera(shot.from+.00001,1600/900).pos,sampleCamera(shot.to-.00001,1600/900).pos);
  }
  report.push({...anchor,sampled:first});
}
let largestPositionStep=0;
let previous=sampleCamera(0,1600/900);
for(let i=1;i<=20000;i++){
  const pose=sampleCamera(i/20000,1600/900);
  largestPositionStep=Math.max(largestPositionStep,Math.hypot(...pose.pos.map((v,j)=>v-previous.pos[j])));
  previous=pose;
}
assert.ok(largestPositionStep<.04);
await fs.writeFile('docs/v4/evidence/stage-09/shots.json',JSON.stringify({anchors:report,largestPositionStep,samples:20001},null,2)+'\n');
console.log('All fixed holds and act links passed; largest 1/20000 camera step',largestPositionStep);

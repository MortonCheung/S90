import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { sampleScene } from '../../src/journey/SceneOrchestrator.js';

const states=[];
for(let step=0;step<=2000;step++){
  const t=step/2000;
  const state=sampleScene(t,{width:1600,height:900},true);
  const total=state.scenes.reduce((sum,s)=>sum+s.weight,0);
  assert.ok(Math.abs(total-1)<1e-9);
  assert.ok(state.scenes.filter(s=>s.weight>0).length<=2);
  assert.ok(state.scenes.every(s=>s.draw>=0&&s.draw<=1));
  states.push(state);
}
for(const state of [...states].reverse()){
  assert.deepEqual(sampleScene(state.progress,state.viewport,true),state);
}
await fs.writeFile('docs/v4/evidence/stage-08/state-check.json',JSON.stringify({
  samples:states.length,weightsSum:1,reversible:true,
  boundaries:[.245,.27,.295,.505,.53,.555,.65,.675,.7].map(t=>sampleScene(t,{width:1600,height:900},true)),
},null,2)+'\n');
console.log('2001 direct scene states, full coverage, at most two active SVG layers, reversible');

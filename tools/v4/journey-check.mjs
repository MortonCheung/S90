import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { ACTS, actAt } from '../../src/journey/acts.js';
import { CHAPTERS } from '../../src/story/story.js';

const ids = ACTS.flatMap(act => act.features);
assert.deepEqual([...ids].sort(),['form','light','wheel','profile','cabin','rear','explore'].sort());
for (const [index,act] of ACTS.entries()) {
  if(index>0) assert.equal(ACTS[index-1].range[1],act.range[0]);
  assert.ok(act.lineGrowthRange.length===2);
}
const forward=[];
for(let step=0;step<=1000;step++){
  const t=step/1000;
  const state=actAt(t);
  assert.ok(state.localProgress>=0 && state.localProgress<=1);
  forward.push({t,act:state.act.id,local:state.localProgress});
}
for(const sample of [...forward].reverse()) {
  const reverse=actAt(sample.t);
  assert.equal(reverse.act.id,sample.act);
  assert.equal(reverse.localProgress,sample.local);
}
for(const chapter of CHAPTERS){
  assert.ok(actAt(chapter.at).act.features.includes(chapter.id),chapter.id);
}
assert.equal(actAt(0).act.id,'morning');
assert.equal(actAt(1).act.id,'evening');
await fs.mkdir('docs/v4/evidence/stage-05',{recursive:true});
await fs.writeFile('docs/v4/evidence/stage-05/state-samples.json',JSON.stringify({acts:ACTS,boundaries:[0,.269,.27,.529,.53,.674,.675,1].map(t=>({t,...actAt(t)})),reversibleSamples:forward.length},null,2)+'\n');
console.log('Four contiguous acts, six feature anchors and 1001 reversible samples passed');

import { clamp, smoothstep } from '../lib/math.js';
import { ACTS, actAt } from './acts.js';

const TRANSITION = .025;
const PALETTES = [
  ['#f3f2ec','#faf9f4','#e6e9e2','#d3d9d0','#8b927c'],
  ['#efefea','#f8f8f3','#e0e3df','#cbd2cc','#7d8b83'],
  ['#f1eee7','#f9f6f0','#e5ded3','#d5c8b7','#9a856d'],
  ['#e6ded5','#f1eae2','#cfc7c0','#b9aca3','#947967'],
];
export const SCENE_COLORS = ['paper','surface','ground','shade','accent'];

const rgb = hex => [1,3,5].map(index => parseInt(hex.slice(index,index+2),16));
const COLORS = PALETTES.map(palette => palette.map(rgb));

export function sampleScene(progress, viewport, ready) {
  const t = Number.isFinite(progress) ? clamp(progress) : 0;
  const scenes = ACTS.map((act,index) => {
    const [from,to] = act.range;
    const enter = index === 0 ? 1 : smoothstep(from-TRANSITION,from+TRANSITION,t);
    const leave = index === ACTS.length-1 ? 1 : 1-smoothstep(to-TRANSITION,to+TRANSITION,t);
    const start = Math.max(0,act.lineGrowthRange[0] - (index === 0 ? 0 : TRANSITION));
    const end = act.lineGrowthRange[1];
    return {id:act.sceneId,actId:act.id,weight:enter*leave,draw:clamp((t-start)/(end-start))};
  });
  const colors = SCENE_COLORS.map((name,index) => {
    const channels = [0,1,2].map(channel => Math.round(scenes.reduce(
      (value,scene,i) => value+COLORS[i][index][channel]*scene.weight,0,
    )));
    return [`--sketch-${name}`,`rgb(${channels.join(' ')})`];
  });
  const endingWeight=1-smoothstep(.87,.945,t);
  const exteriorWeight=endingWeight*(1-smoothstep(.56,.585,t)*(1-smoothstep(.635,.67,t)));
  return { exteriorWeight, ...actAt(t), progress:t, viewport, visible:Boolean(ready), scenes, colors };
}

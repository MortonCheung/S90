import { clamp } from '../lib/math.js';

// Feature anchors retain the already verified camera and cabin timeline.
export const ACTS = [
  {
    id: 'morning', label: '清晨 · 出发', sceneId: 'residence',
    range: [0, .27], lineGrowthRange: [0, .27],
    cameraSequence: ['whole', 'lamp'], features: ['form', 'light'],
  },
  {
    id: 'day', label: '白天 · 穿行', sceneId: 'city',
    range: [.27, .53], lineGrowthRange: [.27, .53],
    cameraSequence: ['wheel', 'profile'], features: ['wheel', 'profile'],
  },
  {
    id: 'afternoon', label: '午后 · 停驻', sceneId: 'arrival',
    range: [.53, .675], lineGrowthRange: [.53, .675],
    cameraSequence: ['cabin-approach', 'cabin-window', 'cabin-dashboard', 'cabin-seats', 'cabin-return-window', 'cabin-exterior'], features: ['cabin'],
  },
  {
    id: 'evening', label: '黄昏 · 归途', sceneId: 'road',
    range: [.675, 1], lineGrowthRange: [.675, 1],
    cameraSequence: ['rear', 'explore'], features: ['rear', 'explore'],
  },
];

export const FEATURE_ACT = Object.fromEntries(
  ACTS.flatMap(act => act.features.map(feature => [feature, act.id])),
);

export function actAt(value) {
  const progress = Number.isFinite(value) ? clamp(value) : 0;
  const act = ACTS.find(item => progress < item.range[1]) ?? ACTS.at(-1);
  const localProgress = clamp((progress - act.range[0]) / (act.range[1] - act.range[0]));
  return { act, localProgress };
}

import { clamp, smoothstep } from '../lib/math.js';
import { SHOTS } from '../journey/shots.js';

/** Total scroll length, in viewport heights. */
export const SCROLL_VH = 12.4;

/** Framing rectangle the opening elevation must fit inside (metres). */
const FIT_W = 5.62;
const FIT_H = 2.1;
const FIT_MARGIN_X = 0.94;
const FIT_MARGIN_Y = 0.88;
const OPENING_FOV = 12;
const OPENING_PLANE_X = -1.0;

/**
 * Vertical world height (metres, measured on the near side plane) visible for a
 * given viewport aspect.  Chosen so the full car fits with a stable margin on
 * any screen, which also makes the projected opening pose a pure similarity
 * transform of the reference drawing for every aspect ratio.
 */
export function viewHeightFor(aspect) {
  const a = clamp(aspect || 16 / 9, 0.4, 3.2);
  return Math.max(FIT_H / FIT_MARGIN_Y, FIT_W / (FIT_MARGIN_X * a));
}

export function openingPose(aspect) {
  const vh = viewHeightFor(aspect);
  const d = (vh * 0.5) / Math.tan((OPENING_FOV * Math.PI) / 360);
  return {
    pos: [OPENING_PLANE_X - d, 0.74, 0.015],
    target: [0, 0.74, 0.015],
    fov: OPENING_FOV,
  };
}



const mix = (a,b,t) => a+(b-a)*t;
const vectorMix = (a,b,t) => a.map((v,i)=>mix(v,b[i],t));
function frameShot(shot, aspect) {
  if (shot.from === 0) return shot;
  if (shot.cabin) return {...shot, fov:shot.fov + (shot.near ? 9 * (1 - smoothstep(.72, 1.18, aspect)) : 0)};
  const scale = shot.whole ? Math.max(1, 1.36 / aspect) : Math.max(1, Math.pow(.8 / aspect, .5));
  return {...shot, pos:shot.pos.map((v,i)=>shot.target[i]+(v-shot.target[i])*scale)};
}

export function sampleCamera(progress, aspect) {
  const t = clamp(progress);
  let previous = {...openingPose(aspect), from:0, to:.012};
  for (const spec of SHOTS) {
    const shot = frameShot(spec, aspect);
    if (t <= previous.to) return previous;
    if (t < shot.from) {
      const e = smoothstep(previous.to, shot.from, t);
      const fov = mix(previous.fov,shot.fov,e);
      return {pos:vectorMix(previous.pos,shot.pos,e),target:vectorMix(previous.target,shot.target,e),fov,near:mix(previous.near ?? .05,shot.near ?? .05,e)};
    }
    previous = shot;
  }
  return previous;
}

// Both passes through the rear side window use the same scroll-derived fade.
export function cabinGlassOpacity(progress) {
  const entry = Math.min(smoothstep(.555,.563,progress), 1-smoothstep(.574,.586,progress));
  const exit = Math.min(smoothstep(.637,.647,progress), 1-smoothstep(.664,.674,progress));
  return 1 - Math.max(entry, exit);
}

export const CHAPTERS = [
  { id: 'form', num: '01', label: '整车造型', en: 'FORM', at: 0.075, from: 0, to: 0.15 },
  { id: 'light', num: '02', label: '灯组', en: 'LIGHT', at: 0.2, from: 0.15, to: 0.28 },
  { id: 'wheel', num: '03', label: '轮毂', en: 'WHEEL', at: 0.33, from: 0.28, to: 0.41 },
  { id: 'profile', num: '04', label: '侧面', en: 'PROFILE', at: 0.46, from: 0.41, to: 0.54 },
  { id: 'cabin', num: '05', label: '座舱', en: 'CABIN', at: 0.59, from: 0.54, to: 0.67 },
  { id: 'rear', num: '06', label: '车尾', en: 'REAR', at: 0.715, from: 0.67, to: 0.84 },
];

export const DETAILS = [
  {
    id: 'light',
    title: '前灯组',
    lede: 'T 形日行灯横贯灯腔。灯罩沿翼子板向后收窄，与引擎盖边缘接合。',
    hotspot: { pos: [-0.62, 0.76, 2.16], normal: [-0.7, 0.2, 0.7], label: '前灯组' },
  },
  {
    id: 'wheel',
    title: '轮毂',
    lede: '银色轮辐勾出轮毂的形状。深色内壁衬出轮辐之间的制动盘，也与哑光轮胎形成对比。',
    hotspot: { pos: [-0.9, 0.4, 1.6], normal: [-1, 0.1, 0.2], label: '前轮毂' },
  },
  {
    id: 'profile',
    title: '侧面比例',
    lede: '肩线从前翼子板延至尾灯。两只门把手沿线排列，车顶弧线在后窗处收向行李厢。',
    hotspot: { pos: [-1.0, 0.86, -0.5], normal: [-1, 0, 0], label: '侧面肩线' },
  },
  {
    id: 'cabin',
    title: '座舱',
    lede: '从后排望向前方，方向盘、仪表与竖向中控屏落在同一条水平饰板上。两张座椅之间留出中央扶手与操作区。',
    hotspot: { pos: [-0.86, 0.98, -0.05], normal: [-1, 0.25, 0.05], label: '座舱' },
  },
  {
    id: 'rear',
    title: '车尾',
    lede: 'C 形尾灯沿尾厢边缘折转。横向折线延伸至两侧，深色下护板收住车尾的下缘。',
    hotspot: { pos: [-0.55, 0.86, -2.42], normal: [-0.6, 0.3, -0.7], label: '尾灯' },
  },
];

// The front lighting and wheel chapters share one reading space.
// Exterior profile, cabin and tail each follow a deliberate full-width interval.
const DETAIL_GROUPS = [
  { from: 0.168, to: 0.376, content: 'light', next: 'wheel', changeFrom: 0.249, changeTo: 0.285 },
  { from: 0.428, to: 0.506, content: 'profile' },
  { from: 0.558, to: 0.636, content: 'cabin' },
  { from: 0.680, to: 0.758, content: 'rear' },
];
const NO_DETAIL = { id: null, factor: 0, content: null, next: null, mix: 0 };

export function detailState(progress) {
  const t = clamp(progress);
  const group = DETAIL_GROUPS.find(({from, to}) => t > from && t < to);
  if (!group) return NO_DETAIL;

  const factor = Math.min(
    smoothstep(group.from, group.from + 0.02, t),
    1 - smoothstep(group.to - 0.02, group.to, t),
  );
  const mix = group.next ? smoothstep(group.changeFrom, group.changeTo, t) : 0;
  return {
    id: mix >= 0.5 ? group.next : group.content,
    factor,
    content: group.content,
    next: group.next,
    mix,
  };
}

export function chapterAt(progress) {
  const t = clamp(progress);
  for (let i = CHAPTERS.length - 1; i >= 0; i -= 1) {
    if (t >= CHAPTERS[i].from) return CHAPTERS[i];
  }
  return CHAPTERS[0];
}

export const EXPLORE_ENTER = 0.96;
export const EXPLORE_EXIT = 0.9;

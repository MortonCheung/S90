import { clamp, smoothstep } from '../lib/math.js';

/** Total scroll length, in viewport heights. */
export const SCROLL_VH = 8.6;

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

const SHOTS = [
  { from:.069, to:.145, pos:[-4.8,1.65,5.7], target:[0,.69,.14], fov:31, whole:true },
  { from:.187, to:.228, pos:[-2.72,1.13,4.28], target:[-.63,.74,2.19], fov:29 },
  { from:.318, to:.358, pos:[-2.81,.73,2.43], target:[-.91,.40,1.58], fov:31 },
  { from:.448, to:.488, pos:[-8.5,.89,.05], target:[0,.71,.05], fov:29, whole:true },
  { from:.549, to:.553, pos:[-2.50,1.22,-.40], target:[-.65,1.19,-.40], fov:34, cabin:true },
  { from:.573, to:.573, pos:[-.65,1.18,-.40], target:[-.05,1.05,.30], fov:52, near:.018, cabin:true },
  { from:.588, to:.607, pos:[-.23,1.18,-.65], target:[.06,.96,.87], fov:63, near:.018, cabin:true },
  { from:.618, to:.626, pos:[-.03,1.13,-.56], target:[.08,.78,.76], fov:65, near:.018, cabin:true },
  { from:.650, to:.650, pos:[-.65,1.18,-.40], target:[-.05,1.05,.30], fov:52, near:.018, cabin:true },
  { from:.675, to:.675, pos:[-2.50,1.22,-.40], target:[-.65,1.19,-.40], fov:34, cabin:true },
  { from:.703, to:.738, pos:[-3.28,1.42,-4.85], target:[-.42,.73,-1.93], fov:32 },
  { from:.91, to:1, pos:[-6.2,2.08,-5.45], target:[0,.68,0], fov:31, whole:true },
];

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
    chapter: '02',
    eyebrow: '灯组 / LIGHT',
    title: '一道光的签名',
    lede: '雷神之锤日间行车灯横贯灯腔，T 形光带把车头的视觉重心压低。',
    body: '灯罩与翼子板之间的接缝被收窄到近乎一条刻线。光带在转折处收笔，没有多余的镀铬去解释它。',
    specs: [
      ['灯组', 'T 形日间行车灯'],
      ['结构', '分层灯腔'],
      ['边界', '无边框灯罩过渡'],
    ],
    hotspot: { pos: [-0.62, 0.76, 2.16], normal: [-0.7, 0.2, 0.7], label: '前灯组' },
  },
  {
    id: 'wheel',
    chapter: '03',
    eyebrow: '轮毂 / WHEEL',
    title: '接地的那一笔',
    lede: '双色切削轮毂收束到中心，轮拱圆弧与肩线在同一高度结束。',
    body: '轮胎与轮眉之间保留了一道很窄的阴影。它让车身看起来是压在地面上，而不是浮在上面。',
    specs: [
      ['工艺', '双色切削'],
      ['比例', '轮拱与肩线同高'],
      ['细节', '中心盖与轮辐齐平'],
    ],
    hotspot: { pos: [-0.9, 0.4, 1.6], normal: [-1, 0.1, 0.2], label: '前轮毂' },
  },
  {
    id: 'profile',
    chapter: '04',
    eyebrow: '侧面 / PROFILE',
    title: '五米的克制',
    lede: '一条肩线从翼子板一直贯穿到尾灯，门把手落在同一条水平线上。',
    body: '短前悬与长轴距把座舱向后推，侧窗的下沿压得很低。整台车没有一处多余的折线，安静，但不单薄。',
    specs: [
      ['线条', '贯穿式肩线'],
      ['比例', '长轴距 / 短前悬'],
      ['表面', '单曲面过渡'],
    ],
    hotspot: { pos: [-1.0, 0.86, -0.5], normal: [-1, 0, 0], label: '侧面肩线' },
  },
  {
    id: 'cabin',
    chapter: '05',
    eyebrow: '座舱 / CABIN',
    title: '水平的秩序',
    lede: '仪表台以一条水平线展开，实木饰板与哑光金属把功能收进同一条秩序里。',
    body: '坐进车内，最先感到的是安静，而不是屏幕。材质的分缝顺着视线走，触手可及的地方都是软的。',
    specs: [
      ['布局', '水平仪表台'],
      ['材质', '实木饰板 / 哑光金属'],
      ['座椅', '人体工学轮廓'],
    ],
    hotspot: { pos: [-0.86, 0.98, -0.05], normal: [-1, 0.25, 0.05], label: '座舱' },
  },
  {
    id: 'rear',
    chapter: '06',
    eyebrow: '车尾 / REAR',
    title: '收尾的分量',
    lede: 'C 形尾灯把车尾横向拉开，行李厢盖的折线在灯组下沿收束。',
    body: '没有多余的镀铬，只有一条干净的水平切口。下护板把视觉重心压低，让车尾看起来比实际更宽。',
    specs: [
      ['灯组', 'C 形尾灯'],
      ['型面', '横向折线'],
      ['下部', '深色下护板'],
    ],
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

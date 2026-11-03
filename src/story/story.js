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

/** Pull the story camera back on narrow screens so the car is never cropped. */
export function distanceScale(aspect) {
  return clamp(Math.pow(1.62 / (aspect || 16 / 9), 0.6), 1, 1.85);
}

/**
 * Camera keyframes.  `t` is scroll progress, positions are metres in car space
 * (front +Z, right side -X, floor y=0).
 */
export const CAMERA_KEYS = [
  { t: 0.0, pos: null, target: [0, 0.74, 0.015], fov: OPENING_FOV },
  { t: 0.075, pos: [-6.6, 1.55, 6.9], target: [0, 0.62, 0.1], fov: 31 },
  { t: 0.2, pos: [-4.5, 1.12, 5.7], target: [-0.3, 0.66, 2.05], fov: 26 },
  { t: 0.33, pos: [-4.1, 0.72, 3.55], target: [-0.95, 0.42, 1.55], fov: 25 },
  { t: 0.46, pos: [-11.8, 0.98, 0.2], target: [0, 0.68, -0.05], fov: 24 },
  { t: 0.59, pos: [-3.9, 1.2, 1.1], target: [-0.2, 0.95, 0.4], fov: 28 },
  { t: 0.715, pos: [-5.6, 1.42, -5.9], target: [0, 0.72, -1.9], fov: 30 },
  { t: 0.84, pos: [-7.9, 2.55, -6.7], target: [0, 0.66, 0], fov: 31 },
  { t: 0.93, pos: [-7.3, 2.35, -6.15], target: [0, 0.68, 0], fov: 30 },
  { t: 1.0, pos: [-7.3, 2.35, -6.15], target: [0, 0.68, 0], fov: 30 },
];


function hermiteScalar(p0, p1, m0, m1, h, u) {
  const u2 = u * u;
  const u3 = u2 * u;
  return (
    (2 * u3 - 3 * u2 + 1) * p0 +
    (u3 - 2 * u2 + u) * h * m0 +
    (-2 * u3 + 3 * u2) * p1 +
    (u3 - u2) * h * m1
  );
}

const TARGET_VALUES = CAMERA_KEYS.map((k) => k.target);
const FOV_VALUES = CAMERA_KEYS.map((k) => [k.fov]);
const POS_VALUES = CAMERA_KEYS.map((k) => k.pos);

function posSeries(openingPos) {
  const values = POS_VALUES.slice();
  values[0] = openingPos;
  return values;
}

function sampleSeries(values, t) {
  const n = CAMERA_KEYS.length;
  if (t <= CAMERA_KEYS[0].t) return values[0].slice();
  if (t >= CAMERA_KEYS[n - 1].t) return values[n - 1].slice();

  let i = 0;
  while (i < n - 2 && t > CAMERA_KEYS[i + 1].t) i += 1;

  const t0 = CAMERA_KEYS[i].t;
  const t1 = CAMERA_KEYS[i + 1].t;
  const h = t1 - t0;
  const u = clamp((t - t0) / h);

  const p0 = values[i];
  const p1 = values[i + 1];
  const prev = i > 0 ? values[i - 1] : p0;
  const next = i + 2 < n ? values[i + 2] : p1;

  const tPrev = i > 0 ? CAMERA_KEYS[i - 1].t : t0;
  const tNext = i + 2 < n ? CAMERA_KEYS[i + 2].t : t1;

  const span0 = t1 - tPrev || h;
  const span1 = tNext - t0 || h;

  return [0, 1, 2].map((c) => {
    const m0 = (p1[c] - prev[c]) / span0;
    const m1 = (next[c] - p0[c]) / span1;
    return hermiteScalar(p0[c], p1[c], m0, m1, h, u);
  });
}

export function sampleCamera(progress, aspect) {
  const t = clamp(progress);
  const open = openingPose(aspect);
  const pos = sampleSeries(posSeries(open.pos), t);
  const target = sampleSeries(TARGET_VALUES, t);

  // Keep the camera fully responsive on portrait / narrow screens.
  const scale = 1 + (distanceScale(aspect) - 1) * smoothstep(0.02, 0.11, t);
  for (let c = 0; c < 3; c += 1) {
    pos[c] = target[c] + (pos[c] - target[c]) * scale;
  }

  const fov = sampleSeries(FOV_VALUES, t)[0];

  // Phones crop a wide car at the same field of view; ease the last shot (and
  // the orbit hand-off) back so the whole body stays inside the frame.
  const narrowPull = aspect < 0.85 ? 1 + 0.32 * smoothstep(0.9, 1.0, t) : 1;
  if (narrowPull !== 1) {
    for (let c = 0; c < 3; c += 1) pos[c] = target[c] + (pos[c] - target[c]) * narrowPull;
  }

  return { pos, target, fov };
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

export const DETAIL_BANDS = DETAILS.map((d) => ({
  id: d.id,
  from: { light: 0.168, wheel: 0.298, profile: 0.428, cabin: 0.558, rear: 0.68 }[d.id],
  to: { light: 0.246, wheel: 0.376, profile: 0.506, cabin: 0.636, rear: 0.758 }[d.id],
}));

export function detailState(progress) {
  const t = clamp(progress);
  let best = { id: null, factor: 0, detail: null };
  for (let i = 0; i < DETAIL_BANDS.length; i += 1) {
    const band = DETAIL_BANDS[i];
    const fade = Math.min(
      smoothstep(band.from, band.from + 0.02, t),
      1 - smoothstep(band.to - 0.02, band.to, t),
    );
    if (fade > best.factor) {
      best = { id: band.id, factor: fade, detail: DETAILS[i] };
    }
  }
  return best;
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

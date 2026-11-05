import { clamp } from '../lib/math.js';

// The speed is continuous and positive: f'(t) = 1 - .35 cos(2πt).
export function mapProgress(value, amount = .35) {
  const t = Number.isFinite(value) ? clamp(value) : 0;
  return t - amount / (2 * Math.PI) * Math.sin(2 * Math.PI * t);
}

export function measurePaths(root, selector = 'path[data-ink]') {
  return [...root.querySelectorAll(selector)].map(element => {
    const length = element.getTotalLength();
    const box = element.getBBox();
    const first = element.getPointAtLength(0);
    const last = element.getPointAtLength(length);
    element.style.strokeDasharray = `${length} ${length}`;
    return {
      element, length, x: box.x, width: box.width,
      reverse: last.x < first.x - .01,
      channel: element.dataset.ink ?? 'detail',
    };
  });
}

// One shared spatial frontier. Vertical strokes receive a narrow drawing interval.
// No individual stroke has an ease-in/out or an independent playback clock.
export function schedulePaths(metrics) {
  if (!metrics.length) return [];
  const minimum = Math.min(...metrics.map(path => path.x));
  const maximum = Math.max(...metrics.map(path => path.x + path.width));
  const margin = Math.max(32, (maximum - minimum) * .055);
  const span = maximum - minimum + margin * 2;
  const delays = { structure: 0, road: .006, detail: .022 };
  const scheduled = metrics.map(path => {
    const delay = delays[path.channel] ?? 0;
    const start = clamp((path.x - minimum) / span + delay, 0, .95);
    const end = clamp((path.x + path.width - minimum + margin * 2) / span + delay);
    return { ...path, start, end: Math.max(start + .01, end) };
  }).sort((a, b) => a.start - b.start || a.x - b.x);
  const first = scheduled[0].start;
  return scheduled.map(path => ({
    ...path, start: (path.start - first) / (1 - first),
    end: (path.end - first) / (1 - first),
  }));
}

export function renderPaths(plan, progress) {
  const front = mapProgress(progress);
  let visibleLength = 0;
  let active = 0;
  for (const item of plan) {
    const local = clamp((front - item.start) / (item.end - item.start));
    const offset = item.length * (1 - local) * (item.reverse ? -1 : 1);
    item.element.style.strokeDashoffset = String(offset);
    item.element.style.visibility = local > 0 ? 'visible' : 'hidden';
    visibleLength += item.length * local;
    if (local > 0 && local < 1) active += 1;
  }
  return { front, visibleLength, active };
}

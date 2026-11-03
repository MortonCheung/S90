import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { openingPose } from '/src/story/story.js';

const W = 2400;
const H = 1350;
const DW = 1600;
const DH = 900;
const SCALE = W / DW;

const logEl = document.getElementById('log');
const log = (...args) => {
  console.log(...args);
  logEl.textContent += `${args.join(' ')}\n`;
};

window.__log = [];
const note = (message) => {
  window.__log.push(message);
  log(message);
};

/* ------------------------------------------------------------------ helpers */

function rdp(points, epsilon) {
  if (points.length < 3) return points.slice();
  const keep = new Uint8Array(points.length);
  keep[0] = 1;
  keep[points.length - 1] = 1;
  const stack = [[0, points.length - 1]];
  while (stack.length) {
    const [start, end] = stack.pop();
    const ax = points[start].x;
    const ay = points[start].y;
    const bx = points[end].x;
    const by = points[end].y;
    const dx = bx - ax;
    const dy = by - ay;
    const denom = Math.hypot(dx, dy);
    let best = -1;
    let bestDist = epsilon;
    for (let i = start + 1; i < end; i += 1) {
      const px = points[i].x;
      const py = points[i].y;
      let dist;
      if (denom < 1e-6) {
        dist = Math.hypot(px - ax, py - ay);
      } else {
        dist = Math.abs(dy * px - dx * py + bx * ay - by * ax) / denom;
      }
      if (dist > bestDist) {
        bestDist = dist;
        best = i;
      }
    }
    if (best >= 0) {
      keep[best] = 1;
      stack.push([start, best], [best, end]);
    }
  }
  const out = [];
  for (let i = 0; i < points.length; i += 1) if (keep[i]) out.push(points[i]);
  return out;
}

function pathLength(points, closed) {
  let total = 0;
  for (let i = 1; i < points.length; i += 1) {
    total += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
  }
  if (closed && points.length > 1) {
    total += Math.hypot(points[0].x - points[points.length - 1].x, points[0].y - points[points.length - 1].y);
  }
  return total;
}

function toPath(points, closed = false) {
  if (!points.length) return '';
  const f = (value) => (Math.round(value * 10) / 10).toFixed(1);
  let d = `M${f(points[0].x)} ${f(points[0].y)}`;
  for (let i = 1; i < points.length; i += 1) {
    d += `L${f(points[i].x)} ${f(points[i].y)}`;
  }
  if (closed) d += 'Z';
  return d;
}

/* --------------------------------------------------------------- line edges */

function chainSegments(segments) {
  const keyOf = (x, y) => `${Math.round(x * 2)}:${Math.round(y * 2)}`;
  const ends = segments.map((seg) => [keyOf(seg.x1, seg.y1), keyOf(seg.x2, seg.y2)]);
  const nodes = new Map();
  ends.forEach(([a, b], index) => {
    if (a === b) return;
    if (!nodes.has(a)) nodes.set(a, []);
    if (!nodes.has(b)) nodes.set(b, []);
    nodes.get(a).push(index);
    nodes.get(b).push(index);
  });

  const used = new Uint8Array(segments.length);
  const chains = [];

  const otherPoint = (index, key) => {
    const seg = segments[index];
    return keyOf(seg.x1, seg.y1) === key
      ? { x: seg.x2, y: seg.y2 }
      : { x: seg.x1, y: seg.y1 };
  };

  for (let i = 0; i < segments.length; i += 1) {
    if (used[i]) continue;
    used[i] = 1;
    const seg = segments[i];
    const points = [
      { x: seg.x1, y: seg.y1 },
      { x: seg.x2, y: seg.y2 },
    ];

    for (const direction of ['end', 'start']) {
      let running = true;
      while (running) {
        running = false;
        const anchor = direction === 'end' ? points[points.length - 1] : points[0];
        const key = keyOf(anchor.x, anchor.y);
        const list = nodes.get(key) || [];
        if (list.length > 2) break;
        const next = list.find((index) => !used[index]);
        if (next === undefined) break;
        used[next] = 1;
        const point = otherPoint(next, key);
        if (direction === 'end') points.push(point);
        else points.unshift(point);
        running = true;
      }
    }
    chains.push(points);
  }
  return chains;
}

/* ---------------------------------------------------------------- marching */

function maskContours(mask, width, height) {
  const at = (x, y) =>
    x >= 0 && y >= 0 && x < width && y < height ? mask[y * width + x] : 0;
  const segments = [];
  for (let y = -1; y < height; y += 1) {
    for (let x = -1; x < width; x += 1) {
      const tl = at(x, y);
      const tr = at(x + 1, y);
      const br = at(x + 1, y + 1);
      const bl = at(x, y + 1);
      const index = tl | (tr << 1) | (br << 2) | (bl << 3);
      if (index === 0 || index === 15) continue;
      const T = { x: x + 0.5, y };
      const R = { x: x + 1, y: y + 0.5 };
      const B = { x: x + 0.5, y: y + 1 };
      const L = { x, y: y + 0.5 };
      const add = (a, b) => segments.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y });
      switch (index) {
        case 1:
        case 14:
          add(L, T);
          break;
        case 2:
        case 13:
          add(T, R);
          break;
        case 3:
        case 12:
          add(L, R);
          break;
        case 4:
        case 11:
          add(R, B);
          break;
        case 6:
        case 9:
          add(T, B);
          break;
        case 7:
        case 8:
          add(L, B);
          break;
        case 5:
          add(L, T);
          add(R, B);
          break;
        case 10:
          add(T, R);
          add(B, L);
          break;
        default:
          break;
      }
    }
  }
  return segments;
}

/* ----------------------------------------------------------------- layers */

function layerFor(name) {
  if (/glass|window/i.test(name)) return 'glass';
  if (/tire|rim|wheel|brake|caliper|disc/i.test(name)) return 'wheel';
  if (/headlight|taillight|light|lamp|turn/i.test(name)) return 'light';
  if (/grille|badge|logo|emblem/i.test(name)) return 'detail';
  if (/body|bumper|hood|trunk|door|fender|mirror|roof|quarter|pillar/i.test(name)) return 'body';
  return 'trim';
}

const SKIP = /(seat|dashboard|steering|console|doorpanel|shell|carpet|pedal|belt|interior|underbody)/i;
const LIMITS = { body: 200, glass: 70, wheel: 110, light: 60, trim: 90, detail: 70 };

/* ------------------------------------------------------------------- main */

async function main() {
  const started = performance.now();
  const pose = openingPose(W / H);
  const camera = new THREE.PerspectiveCamera(pose.fov, W / H, 0.05, 300);
  camera.position.fromArray(pose.pos);
  camera.up.set(0, 1, 0);
  camera.lookAt(new THREE.Vector3().fromArray(pose.target));
  camera.updateMatrixWorld(true);
  camera.updateProjectionMatrix();

  const renderer = new THREE.WebGLRenderer({
    antialias: false,
    alpha: false,
    preserveDrawingBuffer: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(1);
  renderer.setSize(W, H, false);
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
  renderer.domElement.style.width = '100vw';
  renderer.domElement.style.height = 'auto';
  document.body.appendChild(renderer.domElement);

  note(`camera ${camera.position.toArray().map((v) => v.toFixed(2)).join(', ')} fov ${pose.fov}`);

  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);
  const gltf = await loader.loadAsync('/public/assets/model/s90-opt.glb');
  const root = gltf.scene;
  root.updateMatrixWorld(true);
  const scene = new THREE.Scene();
  scene.add(root);
  scene.updateMatrixWorld(true);
  note(`model loaded in ${Math.round(performance.now() - started)} ms`);

  // --- depth -----------------------------------------------------------------
  const depthTarget = new THREE.WebGLRenderTarget(DW, DH, {
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
    depthBuffer: true,
  });
  const depthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking });
  scene.overrideMaterial = depthMaterial;
  renderer.setRenderTarget(depthTarget);
  renderer.setClearColor(0xffffff, 1);
  renderer.clear();
  renderer.render(scene, camera);
  const depthBytes = new Uint8Array(DW * DH * 4);
  renderer.readRenderTargetPixels(depthTarget, 0, 0, DW, DH, depthBytes);
  scene.overrideMaterial = null;

  const near = camera.near;
  const far = camera.far;
  const depth = new Float32Array(DW * DH);
  for (let y = 0; y < DH; y += 1) {
    const srcRow = DH - 1 - y;
    for (let x = 0; x < DW; x += 1) {
      const i = (srcRow * DW + x) * 4;
      // three r170 packing: r/256 + g/65536 + b/16777216 + a/2^32
      const packed =
        depthBytes[i] / 256 +
        depthBytes[i + 1] / 65536 +
        depthBytes[i + 2] / 16777216 +
        depthBytes[i + 3] / 4294967296;
      const ndc = packed * 2 - 1;
      depth[y * DW + x] = (2 * far * near) / (far + near - ndc * (far - near));
    }
  }
  note(`depth buffer ready ${Math.round(performance.now() - started)} ms · car center ${depth[Math.floor(DH / 2) * DW + Math.floor(DW / 2)].toFixed(2)} m`);

  // --- silhouette mask --------------------------------------------------------
  const maskTarget = new THREE.WebGLRenderTarget(DW, DH, {
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
  });
  const maskMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
  scene.overrideMaterial = maskMaterial;
  renderer.setRenderTarget(maskTarget);
  renderer.setClearColor(0x000000, 1);
  renderer.clear();
  renderer.render(scene, camera);
  const maskBytes = new Uint8Array(DW * DH * 4);
  renderer.readRenderTargetPixels(maskTarget, 0, 0, DW, DH, maskBytes);
  scene.overrideMaterial = null;

  const mask = new Uint8Array(DW * DH);
  for (let y = 0; y < DH; y += 1) {
    const srcRow = DH - 1 - y;
    for (let x = 0; x < DW; x += 1) {
      mask[y * DW + x] = maskBytes[(srcRow * DW + x) * 4] > 110 ? 1 : 0;
    }
  }
  let maskCount = 0;
  let minX = DW;
  let maxX = 0;
  let minY = DH;
  let maxY = 0;
  for (let y = 0; y < DH; y += 1) {
    for (let x = 0; x < DW; x += 1) {
      if (mask[y * DW + x]) {
        maskCount += 1;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  const centerMask = mask[(DH >> 1) * DW + (DW >> 1)];
  note(`silhouette mask ready ${Math.round(performance.now() - started)} ms · white ${maskCount} · bbox ${minX},${minY}..${maxX},${maxY} · center ${centerMask}`);
  const probe = new THREE.Vector3(0, 0.74, 0).project(camera);
  note(`probe car center -> ${((probe.x * 0.5 + 0.5) * W).toFixed(0)},${((-probe.y * 0.5 + 0.5) * H).toFixed(0)}`);

  // --- edges ------------------------------------------------------------------
  const projected = new THREE.Vector3();
  const worldA = new THREE.Vector3();
  const worldB = new THREE.Vector3();
  const worldMid = new THREE.Vector3();
  const view = new THREE.Vector3();
  const buckets = { body: [], glass: [], wheel: [], light: [], trim: [], detail: [] };
  const inv = camera.matrixWorldInverse;
  let meshCount = 0;
  let edgeCount = 0;
  let kept = 0;

  const project = (world, out) => {
    out.copy(world).project(camera);
    return {
      x: (out.x * 0.5 + 0.5) * W,
      y: (-out.y * 0.5 + 0.5) * H,
      z: out.z,
    };
  };

  const occluded = (x, y, distance) => {
    const px = Math.floor(x / SCALE);
    const py = Math.floor(y / SCALE);
    if (px < 0 || py < 0 || px >= DW || py >= DH) return true;
    return distance > depth[py * DW + px] + 0.06;
  };

  root.traverse((mesh) => {
    if (!mesh.isMesh) return;
    const name = `${mesh.name} ${mesh.parent?.name || ''}`;
    if (SKIP.test(name)) return;
    if (!mesh.geometry?.attributes?.position) return;

    meshCount += 1;
    const layer = layerFor(name);
    let edges;
    try {
      edges = new THREE.EdgesGeometry(mesh.geometry, 22);
    } catch {
      return;
    }
    const attribute = edges.attributes.position;
    if (!attribute) return;
    const matrix = mesh.matrixWorld;

    for (let i = 0; i < attribute.count - 1; i += 2) {
      worldA.fromBufferAttribute(attribute, i).applyMatrix4(matrix);
      worldB.fromBufferAttribute(attribute, i + 1).applyMatrix4(matrix);
      const a = project(worldA, projected);
      const b = project(worldB, projected);
      edgeCount += 1;

      if (a.z > 1 || b.z > 1) continue;
      if (
        (a.x < -40 && b.x < -40) ||
        (a.x > W + 40 && b.x > W + 40) ||
        (a.y < -40 && b.y < -40) ||
        (a.y > H + 40 && b.y > H + 40)
      ) {
        continue;
      }

      const length = Math.hypot(b.x - a.x, b.y - a.y);
      if (length < 1.2) continue;
      const pieces = Math.max(1, Math.min(6, Math.ceil(length / 22)));

      for (let p = 0; p < pieces; p += 1) {
        const t0 = p / pieces;
        const t1 = (p + 1) / pieces;
        const mx = a.x + (b.x - a.x) * ((t0 + t1) / 2);
        const my = a.y + (b.y - a.y) * ((t0 + t1) / 2);
        worldMid.copy(worldA).lerp(worldB, (t0 + t1) / 2);
        view.copy(worldMid).applyMatrix4(inv);
        const distance = -view.z;
        if (occluded(mx, my, distance)) continue;
        const x1 = a.x + (b.x - a.x) * t0;
        const y1 = a.y + (b.y - a.y) * t0;
        const x2 = a.x + (b.x - a.x) * t1;
        const y2 = a.y + (b.y - a.y) * t1;
        buckets[layer].push({ x1, y1, x2, y2 });
        kept += 1;
      }
    }
    edges.dispose();
  });

  note(`edges ${edgeCount} kept ${kept} from ${meshCount} meshes · ${Math.round(performance.now() - started)} ms`);

  // --- silhouette -------------------------------------------------------------
  const contours = chainSegments(maskContours(mask, DW, DH));
  const silhouettes = contours
    .filter((points) => points.length > 12 && pathLength(points, true) * SCALE > 260)
    .sort((a, b) => pathLength(b, true) - pathLength(a, true));
  note(`silhouette contours ${silhouettes.length}`);

  // --- build svg --------------------------------------------------------------
  const parts = [];
  parts.push(
    `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" class="s90-lineart" fill="none" stroke="#14161a" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">`,
  );
  parts.push(
    `<desc>Volvo S90 Recharge side elevation, generated from volvo_s90_recharge_free.glb (lazercar, CC BY 4.0) with hidden-line removal.</desc>`,
  );

  const stats = { silhouette: 0, body: 0, glass: 0, wheel: 0, light: 0, trim: 0, detail: 0 };

  parts.push('<g data-layer="silhouette">');
  for (const contour of silhouettes) {
    const simplified = rdp(contour.map((p) => ({ x: p.x * SCALE, y: p.y * SCALE })), 0.9);
    if (simplified.length < 4) continue;
    parts.push(`<path d="${toPath(simplified, true)}"/>`);
    stats.silhouette += 1;
  }
  parts.push('</g>');

  const order = ['body', 'glass', 'wheel', 'light', 'trim', 'detail'];
  for (const layer of order) {
    const chains = chainSegments(buckets[layer]);
    const items = chains
      .map((points) => ({ points: rdp(points, 0.55) }))
      .filter((item) => item.points.length > 1)
      .map((item) => ({ ...item, length: pathLength(item.points) }))
      .filter((item) => item.length > 1.6)
      .sort((a, b) => b.length - a.length);
    if (!items.length) continue;

    const limit = LIMITS[layer] || 80;
    const individual = items.slice(0, limit);
    const rest = items.slice(limit);

    parts.push(`<g data-layer="${layer}">`);
    for (const item of individual) {
      parts.push(`<path d="${toPath(item.points)}"/>`);
      stats[layer] += 1;
    }
    for (let i = 0; i < rest.length; i += 70) {
      const chunk = rest.slice(i, i + 70);
      const d = chunk.map((item) => toPath(item.points)).join('');
      if (d) {
        parts.push(`<path d="${d}"/>`);
        stats[layer] += 1;
      }
    }
    parts.push('</g>');
  }

  parts.push('</svg>');
  const svg = parts.join('\n');
  const totalPaths = Object.values(stats).reduce((sum, value) => sum + value, 0);

  window.__result = {
    svg,
    stats,
    totalPaths,
    edgeCount,
    kept,
    meshCount,
    bytes: new Blob([svg]).size,
    ms: Math.round(performance.now() - started),
  };
  window.__done = true;
  note(`svg ${(window.__result.bytes / 1024).toFixed(1)} KB · paths ${totalPaths} · ${window.__result.ms} ms`);
}

main().catch((error) => {
  console.error(error);
  window.__error = String(error && error.stack ? error.stack : error);
});

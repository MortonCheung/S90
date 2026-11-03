import { useEffect, useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { useLineart } from './useLineart.js';
import { viewHeightFor } from '../story/story.js';

/**
 * The reference drawing covers this much world height at the near side plane.
 * It must match tools/lineart/generate.mjs (REFERENCE_VIEW_HEIGHT).
 */
const ART_METRES_HIGH = 3.362;
const ART_ASPECT = 2400 / 1350;

const LAYER_ORDER = {
  silhouette: 0,
  body: 1,
  glass: 2,
  wheel: 3,
  light: 4,
  trim: 5,
  detail: 6,
};

export default function Opening({
  ready,
  loading,
  progress,
  drawn,
  error,
  onDrawn,
  onOpened,
  onRetry,
}) {
  const { markup, error: artError } = useLineart('/assets/lineart/s90-side.svg');
  const stageRef = useRef(null);
  const topRef = useRef(null);
  const bottomRef = useRef(null);
  const lineRef = useRef(null);
  const frameRef = useRef(null);
  const drawnRef = useRef(false);
  const revealed = useRef(false);

  // Size the drawing so it exactly matches the camera projection at any aspect.
  useEffect(() => {
    const resize = () => {
      const el = stageRef.current;
      if (!el) return;
      const vh = viewHeightFor(window.innerWidth / Math.max(1, window.innerHeight));
      const height = (ART_METRES_HIGH * window.innerHeight) / vh;
      el.style.setProperty('--art-h', `${height}px`);
      el.style.setProperty('--art-w', `${height * ART_ASPECT}px`);
    };
    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('orientationchange', resize);
    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('orientationchange', resize);
    };
  }, []);

  // Draw every path of both halves in the same order, at the same speed.
  useLayoutEffect(() => {
    if (!markup || !stageRef.current) return undefined;
    const roots = Array.from(stageRef.current.querySelectorAll('svg.s90-lineart'));
    if (!roots.length) return undefined;

    const source = roots[0].querySelectorAll('path');
    const plan = Array.from(source).map((path, index) => {
      const group = path.closest('[data-layer]');
      const layer = group?.getAttribute('data-layer') || 'detail';
      let length = 0;
      try {
        length = path.getTotalLength();
      } catch {
        length = 0;
      }
      return {
        index,
        length,
        order: LAYER_ORDER[layer] ?? 9,
      };
    });
    plan.sort((a, b) => a.order - b.order || b.length - a.length);

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    roots.forEach((root) => {
      root.querySelectorAll('path').forEach((path) => {
        path.style.vectorEffect = 'non-scaling-stroke';
      });
    });

    if (reduce) {
      roots.forEach((root) =>
        root.querySelectorAll('path').forEach((path) => {
          path.style.strokeDasharray = 'none';
          path.style.strokeDashoffset = '0';
        }),
      );
      drawnRef.current = true;
      onDrawn();
      return undefined;
    }

    const timeline = gsap.timeline({
      onComplete: () => {
        if (drawnRef.current) return;
        drawnRef.current = true;
        onDrawn();
      },
    });

    plan.forEach((item, order) => {
      const delay = order * 0.0032;
      roots.forEach((root) => {
        const path = root.querySelectorAll('path')[item.index];
        if (!path) return;
        gsap.set(path, {
          strokeDasharray: item.length,
          strokeDashoffset: item.length,
        });
        timeline.to(
          path,
          {
            strokeDashoffset: 0,
            duration: 0.32 + Math.min(0.62, item.length / 2200),
            ease: 'power1.inOut',
          },
          delay,
        );
      });
    });

    return () => timeline.kill();
  }, [markup, onDrawn]);

  useEffect(() => {
    if (artError) {
      drawnRef.current = true;
      onDrawn();
    }
  }, [artError, onDrawn]);

  // Curtain: the paper splits along the centre line, the line drawing leaves with it.
  useEffect(() => {
    if (!ready || !drawn || !markup || revealed.current) return undefined;
    revealed.current = true;
    const timeline = gsap.timeline({
      defaults: { ease: 'power4.inOut' },
      onComplete: onOpened,
    });
    timeline
      .to(topRef.current, { yPercent: -50, duration: 1.55 }, 0.08)
      .to(bottomRef.current, { yPercent: 50, duration: 1.55 }, 0.08)
      .to(lineRef.current, { opacity: 0, duration: 0.5 }, 0.08)
      .to(frameRef.current, { opacity: 0, duration: 0.55 }, 0.55);
    return () => timeline.kill();
  }, [ready, drawn, markup, onOpened]);

  const percent = Math.round((progress || 0) * 100);
  let status = '正在准备展厅';
  if (error) status = '车模载入失败';
  else if (!drawn) status = '线稿绘制中';
  else if (!ready) status = percent > 0 ? `车模载入 ${percent}%` : '车模载入中';
  else status = '就绪';

  return (
    <div className="opening" ref={stageRef} data-ready={ready && drawn}>
      <div className="sheet sheet--top" ref={topRef}>
        <div className="sheet__paper" />
        <div
          className="sheet__art"
          dangerouslySetInnerHTML={markup ? { __html: markup } : undefined}
        />
      </div>
      <div className="sheet sheet--bottom" ref={bottomRef}>
        <div className="sheet__paper" />
        <div
          className="sheet__art"
          dangerouslySetInnerHTML={markup ? { __html: markup } : undefined}
        />
      </div>

      <div className="opening__line" ref={lineRef} />

      <div className="opening__frame" ref={frameRef} aria-hidden="true">
        <span className="opening__frame-corner opening__frame-corner--tl" />
        <span className="opening__frame-corner opening__frame-corner--tr" />
        <span className="opening__frame-corner opening__frame-corner--bl" />
        <span className="opening__frame-corner opening__frame-corner--br" />
        <span className="opening__frame-label opening__frame-label--tl">S90 / SIDE ELEVATION</span>
        <span className="opening__frame-label opening__frame-label--tr">SCALE 1:1</span>
        <span className="opening__frame-label opening__frame-label--bl">DIGITAL ATELIER · 2026</span>
      </div>

      <div className="opening__status" data-hidden={ready && drawn}>
        <span className="opening__status-key">{status}</span>
        <span className="opening__status-bar" aria-hidden="true">
          <span style={{ transform: `scaleX(${ready ? 1 : Math.max(0.04, progress || 0.04)})` }} />
        </span>
        <span className="opening__status-meta">
          {error ? 'LOAD FAILED' : loading && !ready ? 'REAL-TIME 3D ASSET' : 'READY'}
        </span>
      </div>

      {error ? (
        <div className="opening__error" role="alert">
          <span className="opening__error-mark">!</span>
          <h2>三维车模未能载入</h2>
          <p>{String(error)}</p>
          <p className="opening__error-note">
            请确认 <code>public/assets/model/s90-opt.glb</code> 存在，或点击重试。
          </p>
          <button type="button" className="btn btn--dark" onClick={onRetry}>
            重新载入
          </button>
        </div>
      ) : null}
    </div>
  );
}

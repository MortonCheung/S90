import { useEffect, useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { getLoadingVisual } from './loading-state.js';
import { STROKE_PLAN } from './stroke-plan.js';
import { useLineart } from './useLineart.js';
import { viewHeightFor } from '../story/story.js';

/**
 * The reference drawing covers this much world height at the near side plane.
 * It must match tools/lineart/generate.mjs (REFERENCE_VIEW_HEIGHT).
 */
const ART_METRES_HIGH = 3.362;
const ART_ASPECT = 2400 / 1350;

export default function Opening({
  ready,
  loading,
  progress,
  total,
  assetStatus,
  firstFrameReady,
  drawn,
  error,
  onDrawn,
  onOpened,
  onRetry,
}) {
  const { markup, error: artError } = useLineart('/assets/lineart/s90-draw.svg');
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

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    roots.forEach((root) => {
      root.querySelectorAll('path').forEach((path) => {
        path.style.vectorEffect = 'non-scaling-stroke';
        path.style.visibility = 'hidden';
      });
    });

    if (reduce) {
      roots.forEach((root) =>
        root.querySelectorAll('path').forEach((path) => {
          path.style.visibility = 'visible';
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

    STROKE_PLAN.forEach((item, index) => {
      roots.forEach((root) => {
        const path = root.querySelectorAll('path')[index];
        if (!path) return;
        const length = path.getTotalLength();
        gsap.set(path, { strokeDasharray: length, strokeDashoffset: length + 1, visibility: 'hidden' });
        timeline.set(path, { visibility: 'visible' }, item.start);
        timeline.to(path, { strokeDashoffset: 0, duration: item.duration, ease: 'none' }, item.start);
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
    if (!ready || !drawn || (!markup && !artError) || revealed.current) return undefined;
    revealed.current = true;
    const timeline = gsap.timeline({
      defaults: { ease: 'power4.inOut' },
      onStart: () => { if (stageRef.current) stageRef.current.dataset.revealing = "true"; },
      onComplete: onOpened,
    });
    timeline
      .to(topRef.current, { yPercent: -50, duration: 1.55 }, 0.08)
      .to(bottomRef.current, { yPercent: 50, duration: 1.55 }, 0.08)
      .to(lineRef.current, { opacity: 0, duration: 0.5 }, 0.08)
      .to(frameRef.current, { opacity: 0, duration: 0.55 }, 0.55);
    return () => timeline.kill();
  }, [ready, drawn, markup, artError, onOpened]);

  const visual = getLoadingVisual({ status: assetStatus, progress, total, firstFrameReady });

  return (
    <div className="opening" ref={stageRef} data-ready={ready && drawn}>
      <div className="sheet sheet--top" ref={topRef}>
        <div className="sheet__paper" />
        <div
          className="sheet__art"
          dangerouslySetInnerHTML={markup ? { __html: markup } : undefined}
        />
        <div className="sheet__edge" />
      </div>
      <div className="sheet sheet--bottom" ref={bottomRef}>
        <div className="sheet__paper" />
        <div
          className="sheet__art"
          dangerouslySetInnerHTML={markup ? { __html: markup } : undefined}
        />
        <div className="sheet__edge" />
      </div>

      <div className="opening__line" ref={lineRef} data-state={visual.state}
        role="progressbar" aria-label={visual.label} aria-valuemin={0} aria-valuemax={100}
        aria-valuenow={visual.fraction === null ? undefined : Math.round(visual.fraction * 100)}>
        <div className="opening__line-track" />
        <div className="opening__line-fill" style={{ transform: `scaleX(${visual.fraction ?? 0})` }} />
        <span className="opening__line-label">{visual.label}</span>
      </div>

      <div className="opening__frame" ref={frameRef} aria-hidden="true">
        <span className="opening__frame-corner opening__frame-corner--tl" />
        <span className="opening__frame-corner opening__frame-corner--tr" />
        <span className="opening__frame-corner opening__frame-corner--bl" />
        <span className="opening__frame-corner opening__frame-corner--br" />
        <span className="opening__frame-label opening__frame-label--tl">S90 / SIDE ELEVATION</span>
        <span className="opening__frame-label opening__frame-label--tr">SCALE 1:1</span>
        <span className="opening__frame-label opening__frame-label--bl">DIGITAL ATELIER · 2026</span>
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

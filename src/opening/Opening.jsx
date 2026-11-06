import { useEffect, useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { getLoadingVisual, getOpeningPhase } from './loading-state.js';
import { STROKE_PLAN } from './stroke-plan.js';
import { measurePaths, schedulePaths, renderPaths } from '../sketch/lineGrowth.js';
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

    const plans=roots.map(root=>{
      const metrics=measurePaths(root,'path').map((item,index)=>{
        item.element.style.vectorEffect='non-scaling-stroke';
        const stroke=STROKE_PLAN[index] ?? {lane:2,name:'detail'};
        const innerChannel={glass:'secondary',body:'secondary'}[stroke.name] ?? 'detail';
        const channel=stroke.lane<2 ? 'structure' : innerChannel;
        return {...item,channel,delay:{structure:0,secondary:.08,detail:.13}[channel]};
      });
      return schedulePaths(metrics);
    });
    const update=value=>{
      plans.forEach(plan=>renderPaths(plan,value));
      if(stageRef.current) stageRef.current.dataset.drawProgress=value.toFixed(4);
    };
    update(reduce?1:0);
    const complete=()=>{
      if(drawnRef.current) return;
      drawnRef.current=true;
      onDrawn();
    };
    if(reduce){complete();return undefined;}
    const ink={progress:0};
    const timeline=gsap.to(ink,{
      progress:1,duration:6.6,ease:'none',
      onUpdate:()=>update(ink.progress),
      onComplete:complete,
    });
    return ()=>timeline.kill();
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
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      onOpened();
      return undefined;
    }
    const timeline = gsap.timeline({
      defaults: { ease: 'power4.inOut' },
      onStart: () => {
        if (stageRef.current) {
          stageRef.current.dataset.revealing = 'true';
          stageRef.current.dataset.phase = 'revealing';
        }
      },
      onComplete: onOpened,
    });
    timeline
      .to(topRef.current, { yPercent: -50, duration: 1.55 }, 0.08)
      .to(bottomRef.current, { yPercent: 50, duration: 1.55 }, 0.08)
      .to(lineRef.current, { opacity: 0, duration: 0.5 }, 0.08);
    return () => timeline.kill();
  }, [ready, drawn, markup, artError, onOpened]);

  const visual = getLoadingVisual({ status: assetStatus, progress, total, firstFrameReady });

  return (
    <div className="opening" ref={stageRef} data-ready={ready && drawn} data-phase={getOpeningPhase({status:assetStatus,firstFrameReady,drawn,revealing:revealed.current})}>
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
      </div>

      {error ? (
        <div className="opening__error" role="alert">
          <span className="opening__error-mark">!</span>
          <h2>三维车模未能载入</h2>
          <p>请检查网络连接后重试。</p>
          <button type="button" className="btn btn--dark" onClick={onRetry}>
            重新载入
          </button>
        </div>
      ) : null}
      {artError&&!error ? <p className="opening__notice" role="status">线稿暂不可用，正在准备三维展厅</p> : null}
    </div>
  );
}

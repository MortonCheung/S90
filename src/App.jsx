import { useCallback, useEffect, useRef, useState } from 'react';
import Experience from './scene/Experience.jsx';
import Opening from './opening/Opening.jsx';
import Chrome from './ui/Chrome.jsx';
import DetailPanel from './detail/DetailPanel.jsx';
import ExploreLayer from './explore/ExploreLayer.jsx';
import { useCarAsset } from './scene/useCarAsset.js';
import {
  CHAPTERS,
  DETAILS,
  EXPLORE_ENTER,
  EXPLORE_EXIT,
  SCROLL_VH,
  chapterAt,
  detailState,
} from './story/story.js';
import { clamp } from './lib/math.js';
import { PAINTS } from './story/paints.js';
import { CABIN_THEMES } from './story/cabin.js';
import { ACTS, actAt } from './journey/acts.js';
import SketchScenes from './sketch/SketchScenes.jsx';

const HOTSPOTS = DETAILS.map((d) => ({
  id: d.id,
  label: d.hotspot.label,
  pos: d.hotspot.pos,
  normal: d.hotspot.normal,
}));

export default function App() {
  const [asset, retry] = useCarAsset();
  const [paint, setPaint] = useState(PAINTS[0].hex);
  const [cabin, setCabin] = useState(CABIN_THEMES[0].id);
  const [contextLost, setContextLost] = useState(false);
  const [firstFrameId, setFirstFrameId] = useState(null);
  const [drawn, setDrawn] = useState(false);
  const [opened, setOpened] = useState(false);
  const [ui, setUi] = useState({
    actId: 'morning',
    chapterId: 'form',
    detailId: null,
    explore: false,
    scrolled: false,
  });

  const stateRef = useRef({
    raw: 0,
    smooth: 0,
    detailFactor: 0,
    detailId: null,
    chapterId: 'form',
    journey: actAt(0),
  });
  const exploreRef = useRef(false);
  const api = useRef({});
  const projected = useRef(HOTSPOTS.map(() => ({ x: 0, y: 0, visible: false })));
  const trackRef = useRef(null);
  const visualRef = useRef(null);
  const returningRef = useRef(false);
  const openedRef = useRef(false);
  openedRef.current = opened;

  const onContextLost = useCallback(() => {stateRef.current.paused=true;setContextLost(true);}, []);
  const onFirstFrame = useCallback((id) => setFirstFrameId(id), []);
  const firstFrameReady = Boolean(asset.gltf && firstFrameId === asset.gltf.scene.uuid);

  // Keep the scroll track and the --vh unit in sync with the real viewport.
  useEffect(() => {
    const resize = () => {
      if (trackRef.current) {
        trackRef.current.style.height = `${Math.round(window.innerHeight * SCROLL_VH)}px`;
      }
      document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
    };
    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('orientationchange', resize);
    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('orientationchange', resize);
    };
  }, []);

  // Scroll is locked until the real model is on screen.
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('is-locked', !opened||contextLost);
    if (!opened) window.scrollTo(0, 0);
    return () => root.classList.remove('is-locked');
  }, [opened,contextLost]);

  useEffect(() => {
    if (asset.status === 'error' && !drawn) setDrawn(true);
  }, [asset.status, drawn]);

  useEffect(() => {
    let raf = 0;
    const st = stateRef.current;

    const tick = () => {
      if(st.paused){raf=requestAnimationFrame(tick);return;}

      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const raw = clamp(window.scrollY / max);
      st.raw = raw;
      st.smooth = raw;
      st.journey = actAt(raw);
      if(st.actId!==st.journey.act.id){
        st.actId=st.journey.act.id;
        setUi(u=>u.actId===st.actId?u:{...u,actId:st.actId});
      }
      if (visualRef.current) visualRef.current.dataset.act = st.journey.act.id;

      const detail = detailState(st.smooth);
      if (raw !== st.lastDetailProgress && visualRef.current) {
        st.lastDetailProgress = raw;
        for (const item of DETAILS) {
          const opacity = item.id === detail.content ? 1 - detail.mix : item.id === detail.next ? detail.mix : 0;
          visualRef.current.style.setProperty(`--content-${item.id}`, opacity.toFixed(5));
        }
      }
      if (detail.factor !== st.detailFactor) {
        st.detailFactor = detail.factor;
        visualRef.current?.style.setProperty('--detail-progress', detail.factor.toFixed(5));
      }
      if (detail.id !== st.detailId) {
        st.detailId = detail.id;
        setUi((u) => (u.detailId === detail.id ? u : { ...u, detailId: detail.id }));
      }

      st.renderScene?.(raw, openedRef.current);

      const chapter = chapterAt(st.smooth);
      if (chapter.id !== st.chapterId) {
        st.chapterId = chapter.id;
        setUi((u) => (u.chapterId === chapter.id ? u : { ...u, chapterId: chapter.id }));
      }

      if (st.smooth <= EXPLORE_EXIT) returningRef.current = false;
      const nextExplore = !returningRef.current && (exploreRef.current
        ? st.smooth > EXPLORE_EXIT
        : st.smooth >= EXPLORE_ENTER);
      if (nextExplore !== exploreRef.current) {
        exploreRef.current = nextExplore;
        setUi((u) => ({ ...u, explore: nextExplore }));
      }

      if (!st.scrolled && raw > 0.012) {
        st.scrolled = true;
        setUi((u) => ({ ...u, scrolled: true }));
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (!import.meta.env.DEV) return undefined;
    window.__S90Journey = () => stateRef.current.journey;
    return () => { delete window.__S90Journey; };
  }, []);

  const goChapter = useCallback((at) => {
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const behavior = matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth';
    window.scrollTo({ top: max * at, behavior });
  }, []);

  const backToStory = useCallback(() => {
    returningRef.current = true;
    goChapter(0.86);
  }, [goChapter]);

  const onDrawn = useCallback(() => setDrawn(true), []);
  const onOpened = useCallback(() => setOpened(true), []);

  const chapter = CHAPTERS.find((c) => c.id === ui.chapterId) || CHAPTERS[0];

  return (
    <div className="app" data-explore={ui.explore} data-opening={opened ? 'opened' : 'preparing'}>
      <div className="visual-layout" ref={visualRef}>
      <div className="stage" aria-hidden="true">
        <SketchScenes stateRef={stateRef} />
        <Experience
          asset={asset}
          paused={contextLost}
          paint={paint}
          cabin={cabin}
          stateRef={stateRef}
          explore={ui.explore}
          api={api}
          hotspots={HOTSPOTS}
          projected={projected}
          onFirstFrame={onFirstFrame}
          onContextLost={onContextLost}
        />
        <div className="stage__vignette" />
      </div>
        <DetailPanel activeId={ui.detailId} cabin={cabin} onCabin={setCabin} />
      </div>

      <div className="scroll-track" ref={trackRef} />

      <h1 className="visually-hidden">
        Volvo S90 豪华商务轿车数字交互展厅 — 线稿生长、三维揭幕、连续镜头叙事与自由探索
      </h1>

      <Chrome
        opened={opened}
        chapter={chapter}
        act={ACTS.find(act=>act.id===ui.actId)??ACTS[0]}
        detailOpen={Boolean(ui.detailId)}
        explore={ui.explore}
        scrolled={ui.scrolled}
        onChapter={goChapter}
      />

      {contextLost ? (
        <div className="context-lost" role="alert">
          <h2>三维渲染已中断</h2>
          <p>显卡上下文丢失，叙事已暂停。重新载入可恢复；线稿与文字内容不受影响。</p>
          <button type="button" className="btn btn--dark" onClick={() => window.location.reload()}>
            重新载入
          </button>
        </div>
      ) : null}


      <ExploreLayer
        active={ui.explore}
        hotspots={HOTSPOTS}
        projected={projected}
        api={api}
        paint={paint}
        onPaint={setPaint}
        onBack={backToStory}
      />

      {!opened ? (
        <Opening
          ready={asset.status === 'ready' && firstFrameReady}
          progress={asset.progress}
          firstFrameReady={firstFrameReady}
          total={asset.total}
          assetStatus={asset.status}
          drawn={drawn}
          error={asset.error}
          onDrawn={onDrawn}
          onOpened={onOpened}
          onRetry={retry}
        />
      ) : null}
    </div>
  );
}

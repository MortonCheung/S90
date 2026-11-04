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
  });
  const exploreRef = useRef(false);
  const api = useRef({});
  const projected = useRef(HOTSPOTS.map(() => ({ x: 0, y: 0, visible: false })));
  const trackRef = useRef(null);
  const visualRef = useRef(null);
  const barRef = useRef(null);
  const openedRef = useRef(false);
  openedRef.current = opened;

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
    root.classList.toggle('is-locked', !opened);
    if (!opened) window.scrollTo(0, 0);
    return () => root.classList.remove('is-locked');
  }, [opened]);

  useEffect(() => {
    if (asset.status === 'error' && !drawn) setDrawn(true);
  }, [asset.status, drawn]);

  useEffect(() => {
    let raf = 0;
    const st = stateRef.current;

    const tick = () => {

      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const raw = clamp(window.scrollY / max);
      st.raw = raw;
      st.smooth = raw;

      const detail = detailState(st.smooth);
      if (detail.factor !== st.detailFactor) {
        st.detailFactor = detail.factor;
        visualRef.current?.style.setProperty('--detail-progress', detail.factor.toFixed(5));
      }
      if (detail.id !== st.detailId) {
        st.detailId = detail.id;
        setUi((u) => (u.detailId === detail.id ? u : { ...u, detailId: detail.id }));
      }

      const chapter = chapterAt(st.smooth);
      if (chapter.id !== st.chapterId) {
        st.chapterId = chapter.id;
        setUi((u) => (u.chapterId === chapter.id ? u : { ...u, chapterId: chapter.id }));
      }

      const nextExplore = exploreRef.current
        ? st.smooth > EXPLORE_EXIT
        : st.smooth >= EXPLORE_ENTER;
      if (nextExplore !== exploreRef.current) {
        exploreRef.current = nextExplore;
        setUi((u) => ({ ...u, explore: nextExplore }));
      }

      if (!st.scrolled && raw > 0.012) {
        st.scrolled = true;
        setUi((u) => ({ ...u, scrolled: true }));
      }

      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${st.smooth.toFixed(4)})`;
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const goChapter = useCallback((at) => {
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    window.scrollTo({ top: max * at, behavior: 'smooth' });
  }, []);

  const backToStory = useCallback(() => {
    exploreRef.current = false;
    setUi((u) => ({ ...u, explore: false }));
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    window.scrollTo({ top: max * 0.86, behavior: 'smooth' });
  }, []);

  const onDrawn = useCallback(() => setDrawn(true), []);
  const onOpened = useCallback(() => setOpened(true), []);

  const chapter = CHAPTERS.find((c) => c.id === ui.chapterId) || CHAPTERS[0];
  const detail = DETAILS.find((d) => d.id === ui.detailId) || null;

  return (
    <div className="app">
      <div className="visual-layout" ref={visualRef}>
      <div className="stage" aria-hidden="true">
        <Experience
          asset={asset}
          paint={paint}
          cabin={cabin}
          stateRef={stateRef}
          explore={ui.explore}
          api={api}
          hotspots={HOTSPOTS}
          projected={projected}
          onFirstFrame={onFirstFrame}
          onContextLost={() => setContextLost(true)}
        />
        <div className="stage__vignette" />
      </div>
        <DetailPanel detail={detail} open={Boolean(detail)} cabin={cabin} onCabin={setCabin} />
      </div>

      <div className="scroll-track" ref={trackRef} />

      <h1 className="visually-hidden">
        Volvo S90 豪华商务轿车数字交互展厅 — 线稿生长、三维揭幕、连续镜头叙事与自由探索
      </h1>

      <Chrome
        opened={opened}
        chapter={chapter}
        detailOpen={Boolean(ui.detailId)}
        explore={ui.explore}
        scrolled={ui.scrolled}
        onChapter={goChapter}
        barRef={barRef}
      />

      {contextLost ? (
        <div className="context-lost" role="alert">
          <p className="context-lost__kicker">RENDERER LOST</p>
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
          loading={asset.status === 'loading'}
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

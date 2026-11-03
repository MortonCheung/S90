import { useEffect, useRef } from 'react';
import { PAINTS } from '../story/paints.js';

export default function ExploreLayer({
  active,
  hotspots,
  projected,
  api,
  paint,
  onPaint,
  onBack,
}) {
  const dots = useRef([]);

  useEffect(() => {
    if (!active) return undefined;
    let raf = 0;
    const tick = () => {
      for (let i = 0; i < hotspots.length; i += 1) {
        const el = dots.current[i];
        const point = projected.current[i];
        if (!el || !point) continue;
        el.style.transform = `translate3d(${point.x.toFixed(1)}px, ${point.y.toFixed(1)}px, 0)`;
        el.dataset.visible = point.visible ? 'true' : 'false';
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, hotspots]);

  useEffect(() => {
    if (!active) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') onBack();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, onBack]);

  return (
    <div className="explore" data-active={active}>
      <div className="explore__title">
        <span className="explore__title-en">FREE EXPLORE</span>
        <span className="explore__title-zh">自由探索</span>
      </div>

      <div className="hotspot-layer" aria-hidden={!active}>
        {hotspots.map((spot, index) => (
          <button
            key={spot.id}
            type="button"
            className="hotspot"
            data-visible="false"
            ref={(el) => {
              dots.current[index] = el;
            }}
            onClick={() => api.current?.focus?.(spot.pos)}
            tabIndex={active ? 0 : -1}
            aria-label={`查看${spot.label}`}
          >
            <span className="hotspot__dot" />
            <span className="hotspot__label">{spot.label}</span>
          </button>
        ))}
      </div>

      <div className="explore__bar">
        <div className="explore__group">
          <span className="explore__label">车漆</span>
          <div className="paints">
            {PAINTS.map((item) => (
              <button
                key={item.id}
                type="button"
                className="paint"
                data-active={paint.toLowerCase() === item.hex.toLowerCase()}
                onClick={() => onPaint(item.hex)}
                aria-label={item.name}
                title={`${item.name} · ${item.en}`}
              >
                <span className="paint__chip" style={{ background: item.hex }} />
                <span className="paint__name">{item.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="explore__group explore__group--right">
          <div className="zoom">
            <button type="button" onClick={() => api.current?.zoom?.(1.18)} aria-label="拉远">
              −
            </button>
            <button type="button" onClick={() => api.current?.zoom?.(0.82)} aria-label="拉近">
              +
            </button>
            <button type="button" className="zoom__reset" onClick={() => api.current?.reset?.()}>
              复位
            </button>
          </div>
          <button type="button" className="btn btn--line" onClick={onBack}>
            返回主线
          </button>
        </div>
      </div>

      <div className="explore__hint">拖动旋转 · 滚轮继续页面 · ESC 返回</div>
    </div>
  );
}

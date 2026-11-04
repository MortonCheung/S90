import { useLayoutEffect, useRef } from 'react';
import { CABIN_THEMES } from '../story/cabin.js';
import { DETAILS } from '../story/story.js';

export default function DetailPanel({ activeId, cabin, onCabin }) {
  const panelRef = useRef(null);

  useLayoutEffect(() => {
    const focused = document.activeElement;
    if (panelRef.current?.contains(focused) && !focused.closest('[data-active="true"].detail__inner')) {
      document.querySelector('.site-head .brand')?.focus({ preventScroll: true });
    }
  }, [activeId]);

  return (
    <aside className="detail" ref={panelRef} data-open={Boolean(activeId)} data-content={activeId} aria-hidden={!activeId} aria-live="polite">
      <div className="detail__stack">
      {DETAILS.map((data) => (
        <article className="detail__inner" key={data.id} data-content-id={data.id}
          data-active={data.id === activeId} aria-hidden={data.id !== activeId}
          style={{'--content-opacity': `var(--content-${data.id}, 0)`}}>
          <div className="detail__meta">
            <span>{data.chapter} / 06</span>
            <span className="detail__meta-line" />
            <span>{data.eyebrow}</span>
          </div>

          <h2 className="detail__title">{data.title}</h2>
          <p className="detail__lede">{data.lede}</p>
          <p className="detail__body">{data.body}</p>

          {data.id === 'cabin' ? (
            <div className="detail__cabin">
              <span className="detail__cabin-label">
                内饰 · 概念配色
              </span>
              <div className="detail__cabin-options">
                {CABIN_THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    type="button"
                    className="cabin-option"
                    data-active={cabin === theme.id}
                    onClick={() => onCabin(theme.id)}
                    aria-label={`内饰概念配色：${theme.label}`}
                    tabIndex={activeId === data.id ? 0 : -1}
                  >
                    <span className="cabin-option__chip" style={{ background: theme.swatch }} />
                    <span>{theme.label}</span>
                  </button>
                ))}
              </div>
              <p className="detail__cabin-note">
                概念方案，非厂家在售配置；仅调整座椅与门板皮革色。
              </p>
            </div>
          ) : null}

          <dl className="detail__specs">
            {data.specs.map(([key, value]) => (
              <div className="detail__spec" key={key}>
                <dt>{key}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>

          <div className="detail__foot">
            <span className="detail__foot-rule" aria-hidden="true" />
            <span>继续滚动 · 画面继续</span>
          </div>
        </article>
      ))}
      </div>
    </aside>
  );
}

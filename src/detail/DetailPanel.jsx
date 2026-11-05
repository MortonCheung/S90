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
          <h2 className="detail__title">{data.title}</h2>
          <p className="detail__lede">{data.lede}</p>

          {data.id === 'cabin' ? (
            <div className="detail__cabin">
              <span className="detail__cabin-label">
                座舱概念配色
              </span>
              <div className="detail__cabin-options">
                {CABIN_THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    type="button"
                    className="cabin-option"
                    data-active={cabin === theme.id}
                    aria-pressed={cabin === theme.id}
                    onClick={() => onCabin(theme.id)}
                    aria-label={`内饰概念配色：${theme.label}`}
                    tabIndex={activeId === data.id ? 0 : -1}
                  >
                    <span className="cabin-option__chip" style={{ background: theme.swatch }} />
                    <span>{theme.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

        </article>
      ))}
      </div>
    </aside>
  );
}

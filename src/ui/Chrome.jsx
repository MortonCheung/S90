import { useRef } from 'react';
import { CHAPTERS } from '../story/story.js';
import { ACTS } from '../journey/acts.js';

export default function Chrome({ opened, chapter, act, detailOpen, explore, scrolled, onChapter }) {
  const chaptersRef = useRef(null);
  const aboutRef = useRef(null);
  if (!opened) return null;

  const closeOnEscape = (event) => {
    if (event.key !== 'Escape' || !event.currentTarget.open) return;
    event.stopPropagation();
    event.currentTarget.open = false;
    event.currentTarget.querySelector('summary')?.focus();
  };

  return (
    <>
      <header className="site-head">
        <button type="button" className="brand" onClick={() => onChapter(0)} aria-label="回到展厅开场">
          <span className="brand__mark">VOLVO</span>
          <span className="brand__model">S90</span>
        </button>
        <div className="head-actions">
          <details ref={chaptersRef} className="head-menu" onKeyDown={closeOnEscape}
            onToggle={() => { if (chaptersRef.current.open) aboutRef.current.open = false; }}>
            <summary>行程</summary>
            <nav className="head-popover head-popover--journey" aria-label="四幕行程导航">
              {ACTS.map((item) => (
                <div className="journey-link" key={item.id}>
                  <button className="journey-link__act" type="button" aria-current={act.id===item.id?'step':undefined}
                    onClick={()=>{chaptersRef.current.open=false;onChapter(item.range[0]);}}>{item.label}</button>
                  <div className="journey-link__features">
                    {CHAPTERS.filter(feature=>item.features.includes(feature.id)).map(feature=>(
                      <button key={feature.id} type="button" aria-current={chapter.id===feature.id?'step':undefined}
                        onClick={()=>{chaptersRef.current.open=false;onChapter(feature.at);}}>{feature.label}</button>
                    ))}
                  </div>
                </div>
              ))}
              <button type="button" onClick={() => { chaptersRef.current.open = false; onChapter(1); }}>自由探索</button>
            </nav>
          </details>
          <details ref={aboutRef} className="head-menu" onKeyDown={closeOnEscape}
            onToggle={() => { if (aboutRef.current.open) chaptersRef.current.open = false; }}>
            <summary>关于</summary>
            <div className="head-popover head-popover--about">
              <strong>Volvo S90 数字展厅</strong>
              <p>2026 华灿奖非官方概念设计。</p>
              <p>车模由 lazercar 创作，经几何、贴图与材质整理。</p>
              <a href="https://sketchfab.com/3d-models/volvo-s90-recharge-free-9462b07c10244fd4a28d86846dc9e3a9" target="_blank" rel="noreferrer">模型来源</a>
              <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a>
            </div>
          </details>
        </div>
      </header>
      {!detailOpen && !explore && scrolled && <p className="chapter-heading">{act.label}</p>}
      {!scrolled && !explore && <p className="scroll-cue">向下滚动 <span aria-hidden="true">↓</span></p>}
    </>
  );
}

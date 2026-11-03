import { CHAPTERS } from '../story/story.js';

export default function Chrome({
  opened,
  chapter,
  detailOpen,
  explore,
  scrolled,
  onChapter,
  barRef,
}) {
  return (
    <>
      <div className="progress" aria-hidden="true">
        <span className="progress__bar" ref={barRef} />
      </div>

      <header className="site-head" data-dim={!opened}>
        <button
          type="button"
          className="brand"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="回到开场"
        >
          <span className="brand__mark">VOLVO</span>
          <span className="brand__rule" />
          <span className="brand__model">S90</span>
        </button>
        <div className="head__meta">
          <span>数字交互展厅</span>
          <span className="head__dot" />
          <span>2026 华灿奖</span>
        </div>
      </header>

      <nav className="rail" aria-label="章节导航" data-hidden={!opened || detailOpen || explore}>
        <span className="rail__rule" aria-hidden="true" />
        {CHAPTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            className="rail__item"
            data-active={chapter.id === item.id}
            onClick={() => onChapter(item.at)}
          >
            <span className="rail__num">{item.num}</span>
            <span className="rail__label">{item.label}</span>
            <span className="rail__en">{item.en}</span>
          </button>
        ))}
      </nav>

      <div
        className="chapter-card"
        data-hidden={!opened || detailOpen || explore}
        aria-live="polite"
      >
        <div className="chapter-card__num">{chapter.num}</div>
        <div className="chapter-card__text">
          <div className="chapter-card__title">{chapter.label}</div>
          <div className="chapter-card__en">{chapter.en}</div>
        </div>
      </div>

      <div className="scroll-hint" data-hidden={!opened || scrolled || explore}>
        <span className="scroll-hint__zh">向下滚动</span>
        <span className="scroll-hint__line" aria-hidden="true" />
        <span className="scroll-hint__en">SCROLL</span>
      </div>

      <div className="credit" data-dim={!opened}>非官方概念设计 · 车模 CC BY 4.0 · lazercar</div>
    </>
  );
}

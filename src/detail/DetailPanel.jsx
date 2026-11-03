import { useEffect, useState } from 'react';

export default function DetailPanel({ detail, open }) {
  const [last, setLast] = useState(null);

  useEffect(() => {
    if (detail) setLast(detail);
  }, [detail]);

  const data = detail || last;

  return (
    <aside className="detail" data-open={open} aria-hidden={!open} aria-live="polite">
      {data ? (
        <div className="detail__inner" key={data.id}>
          <div className="detail__meta">
            <span>{data.chapter} / 06</span>
            <span className="detail__meta-line" />
            <span>{data.eyebrow}</span>
          </div>

          <h2 className="detail__title">{data.title}</h2>
          <p className="detail__lede">{data.lede}</p>
          <p className="detail__body">{data.body}</p>

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
        </div>
      ) : null}
    </aside>
  );
}

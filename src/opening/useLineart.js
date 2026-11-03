import { useEffect, useState } from 'react';

/** Loads the generated side-elevation SVG so its paths can be drawn one by one. */
export function useLineart(url) {
  const [state, setState] = useState({ markup: null, error: null });

  useEffect(() => {
    let alive = true;
    fetch(url, { cache: 'force-cache' })
      .then((res) => {
        if (!res.ok) throw new Error(`lineart ${res.status}`);
        return res.text();
      })
      .then((markup) => {
        if (alive) setState({ markup, error: null });
      })
      .catch((error) => {
        if (alive) setState({ markup: null, error });
      });
    return () => {
      alive = false;
    };
  }, [url]);

  return state;
}

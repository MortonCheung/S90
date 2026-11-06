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
        const document=new DOMParser().parseFromString(markup,'image/svg+xml');
        if(document.querySelector('parsererror')||!document.querySelector('svg.s90-lineart path')){
          throw new Error('Invalid opening lineart');
        }
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

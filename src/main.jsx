import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles/tokens.css';
import './styles/global.css';
import './styles/sketch-tokens.css';
import './styles/sketch.css';

function hasWebGL() {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2');
    if (!gl) return false;
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  } catch {
    return false;
  }
}

function renderFallback(root) {
  root.innerHTML = `
    <main class="fallback" role="main">
      <header class="fallback__head">
        <span>VOLVO — S90</span><span>数字交互展厅 · 2026 华灿奖</span>
      </header>
      <div class="fallback__body">
        <p class="fallback__kicker">STATIC FALLBACK</p>
        <h1>这台设备暂时无法运行三维展厅</h1>
        <p class="fallback__text">
          当前浏览器没有可用的 WebGL 渲染环境。静态线稿仍然可以阅读；
          如需完整体验，请使用支持 WebGL2 的桌面浏览器（Chrome / Edge / Safari 最新版）重新打开本页。
        </p>
        <img class="fallback__art" src="/assets/lineart/s90-side.svg" alt="Volvo S90 正侧线稿" />
      </div>
      <footer class="fallback__foot">
        <span>非官方概念设计</span><span>车模 CC BY 4.0 · lazercar</span>
      </footer>
    </main>`;
}

const root = createRoot(document.getElementById('root'));
if (hasWebGL()) {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
} else {
  renderFallback(document.getElementById('root'));
}

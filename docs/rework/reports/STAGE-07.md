# STAGE-07 · 真实双栏空间展开

- 基准 SHA：763d9d107ef3805c860be76635fa748221de7fb6
- 分支：refactor/s90-visual-storytelling-v3
- 当前阶段提交：见 git log --grep 及 COMMITS.txt（报告随本阶段提交）。
- 结果：PASS
- 浏览器：本机 macOS Chrome，Metal GPU，桌面1600×900；移动端为390×844模拟，Safari与真机UNVERIFIED。

App把stage与DetailPanel放入同一固定grid，原生滚动detailFactor直接决定第二列/行宽高；Canvas真实随左区resize。删除旧lens shift与额外退距，保留同一相机和模型。右栏为不透明平面。

npm run build通过，rework-layout.mjs验证26种桌面/移动状态，正反同进度尺寸一致、无重叠/溢出、各一次GLB请求与一个Canvas。1600展开为1080+520px；390×844的Canvas高度从844减至约464px；见../evidence/stage-07/metrics.json。

已看轮毂桌面/移动及侧面截图，轮毂完整，整车侧影留出边距；旧文字的独立显隐仍归08。

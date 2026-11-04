# STAGE-09 · 实际车内机位与侧窗路径

- 基准 SHA：d770b48d41f6f67939ba967640476cb4d95fd73b
- 分支：refactor/s90-visual-storytelling-v3
- 当前阶段提交：见 git log --grep 及 COMMITS.txt（报告随本阶段提交）。
- 结果：PASS
- 浏览器：本机 macOS Chrome，Metal GPU，桌面1600×900；移动端为390×844模拟，Safari与真机UNVERIFIED。

从后排侧窗进入同一模型，先展示方向盘、仪表与中控，再略向中央观察前排座椅和中央通道。只对入窗对应玻璃做滚动区间淡出和恢复；独立调整仪表罩透光率，实拍仪表纹理清晰。内视近裁剪0.018m，外景恢复0.05m。

npm run build通过。rework-cabin-audit与rework-cabin实测两种屏幕、各23位置、每套80段双面射线，实心模型命中0；同进度正反相机坐标和玻璃属性一致，各1次GLB请求。早期探针读到Canvas更新前一帧，最终等待真实目标进度和画幅后再采样。

证据：../evidence/stage-09/poses.json，1600-5-0.59.png与1600-6-0.62.png两张真实车内截图，390对应图，桌面和移动WebM、实际抽帧desktop-filmstrip.jpg。已查看两机位和录屏抽帧。

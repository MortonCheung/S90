# STAGE-03 · 真实首帧与同位裂幕

- 基准 SHA：a9a424c032d8a35cccf376beae70e3c9c7ec7f9d
- 分支：refactor/s90-visual-storytelling-v3
- 当前阶段提交：见 git log --grep 及 COMMITS.txt（报告随本阶段提交）。
- 结果：PASS
- 浏览器：本机 macOS Chrome，Metal GPU，桌面1600×900；移动端为390×844模拟，Safari与真机UNVERIFIED。

App使用本次模型UUID首帧信号；CarModel以完整场景compileAsync和addAfterEffect确认实际render frame后，在遮幕内执行一次GPU finish。揭幕要求drawn且本次firstFrameReady。SVG失败可降级退出，避免锁死。

npm run build、rework-reveal和loading实测通过。1600/1440/390均单Canvas、1次GLB请求、着色器及首帧有真实frame记录，见../evidence/stage-03/reveal.json。三尺寸各6张连续揭幕截图及WebM，已查看中段截图：底层真车完整持续可见，无空场。

投影坐标、相机openingPose与原版一致；简化线稿未变换坐标。视觉轮心同位。未声称测得绝对0px，原始线稿渲染误差及简化容差仍在；Safari和真机未验证。

# STAGE-06 · 产品摄影驻留分镜

- 基准 SHA：0ccfe167ee1e5be8db364d5896d104a3a0fe7848
- 分支：refactor/s90-visual-storytelling-v3
- 当前阶段提交：见 git log --grep 及 COMMITS.txt（报告随本阶段提交）。
- 结果：PASS
- 浏览器：本机 macOS Chrome，Metal GPU，桌面1600×900；移动端为390×844模拟，Safari与真机UNVERIFIED。

story.js以开场、整车、灯、轮、侧、座舱外视、尾与交接的确定驻留区替代Hermite连续漂移。App原生滚动直接驱动；CameraSystem仍唯一控制相机。DEV探针记录位姿和目标投影。

真实Chrome截图及WebM见../evidence/stage-06/。已查看灯、轮、整车、侧面；灯约占左展示区30%宽、轮约47%，侧面两轮及车身完整（profile-checked.png）。各外视机位X<−1.006，非穿壳；座舱内视属于阶段09。

rework-story-probe.mjs验证0.33正反位置逐值相同，静止600ms无变化；npm run build通过。沿用既有详情覆盖结构，07只改空间展开。

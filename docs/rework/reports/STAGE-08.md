# STAGE-08 · 详情文字随滚动连续衔接

- 基准 SHA：51872d50a7a3a65867c6ec3847657f5465437f5a
- 分支：refactor/s90-visual-storytelling-v3
- 当前阶段提交：见 git log --grep 及 COMMITS.txt（报告随本阶段提交）。
- 结果：PASS
- 浏览器：本机 macOS Chrome，Metal GPU，桌面1600×900；移动端为390×844模拟，Safari与真机UNVERIFIED。

详情布局与活跃内容独立计算。灯组和轮毂共享完整阅读区，其余章节间留出全屏间奏。常驻内容层以滚动权重相向滑移并交叉显隐。初次中点截图发现文字叠影，调整两层位置后复拍通过。

Chrome实测19个正反点，灯组至轮毂列宽持续520px、权重和为1、反向数据逐值一致。座舱按钮离场后焦点回到品牌按钮。构建通过。见../evidence/stage-08/metrics.json、截图及WebM录屏。

一次录屏浏览器启动超时，重新启动后通过。阶段09独立校准真实内视。

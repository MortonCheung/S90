# STAGE-01 · 左向右主要笔触生长

- 基准 SHA：028a03101a271449b3caaf4c1c24e4302f2209f1
- 分支：refactor/s90-visual-storytelling-v3
- 当前阶段提交：见 git log --grep 及 COMMITS.txt（报告随本阶段提交）。
- 结果：PASS
- 浏览器：本机 macOS Chrome，Metal GPU，桌面1600×900；移动端为390×844模拟，Safari与真机UNVERIFIED。

修改Opening、stroke-plan.js、新增s90-draw.svg及可复现生成工具。依据原投影选26组主笔触，拆为72段，3条顺序轨道，6.2秒；闭合轮廓拆上下弧，隐藏尚未启笔路径。保留原始SVG。

证据：../evidence/stage-01-final/ 8张定时截图及result.json；已查看20%、约50%、完成前画面。左先成形，右尚未成形，无整体淡入。reduce直接完成态。npm run build通过；1次GLB请求、无pageerror。

线稿使用同一投影坐标，简化容差1.2—1.8 SVG像素（1600屏幕约0.8—1.2px）。下一阶段只修改中央加载线。

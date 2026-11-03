# STAGE-00 · 基线与安全隔离

- 基准 SHA：ae52257295bdb9e84b6926a498cf165b7bc24675
- 分支：refactor/s90-visual-storytelling-v3
- 当前阶段提交：见 git log --grep 及 COMMITS.txt（报告随本阶段提交）。
- 结果：PASS
- 浏览器：本机 macOS Chrome，Metal GPU，桌面1600×900；移动端为390×844模拟，Safari与真机UNVERIFIED。

远端fetch后origin/main与本地均为ae52257295bdb9e84b6926a498cf165b7bc24675，起始工作区干净。已创建独立整改分支。原deliverables全部保留，可由基准SHA恢复；原始模型386347164字节存在。

npm run build通过，日志BASELINE_BUILD.txt。安装本工程Playwright devDependency，未升级既有框架。

证据：../evidence/baseline/ 含8张开场、15张正反叙事、4张移动截图及WebM录屏；result.json记录1次模型请求、单Canvas、无pageerror。已实际查看开场/灯组/座舱/移动截图。

观察：线稿1.3秒即完整；详情右fixed覆盖；车漆有明显折面；座舱仍在车外。源码：Opening 3.2ms stagger、App onFirstFrame空回调、CameraSystem projection lens shift。后续按独立阶段修复。

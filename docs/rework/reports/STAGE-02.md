# STAGE-02 · 中央真实资源进度线

- 基准 SHA：a704d3ea58b1d38b8aa14e70d3cdbe05ca85850e
- 分支：refactor/s90-visual-storytelling-v3
- 当前阶段提交：见 git log --grep 及 COMMITS.txt（报告随本阶段提交）。
- 结果：PASS
- 浏览器：本机 macOS Chrome，Metal GPU，桌面1600×900；移动端为390×844模拟，Safari与真机UNVERIFIED。

中央线绑定真实loaded/total，下载完成显示准备渲染；未知total不显示百分比。移除左下重复条及虚构4%下限。

npm run build通过（首次JSX残留报错已修复并重新构建）；node tools/rework-loading.mjs通过五状态派生断言和真实浏览器：限速1MB/s采样22%，唯一progressbar=1、重复条=0；网络中断显示error，重试后揭幕；正常为preparing。证据../evidence/stage-02/。

首帧信号接通与揭幕由阶段03实现，本阶段未改变揭幕条件。

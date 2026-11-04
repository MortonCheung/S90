# STAGE-10 · 信息减法与真实控件

- 基准 SHA：3ebfffb477ee5ae4e05ad17d2044e508676e4940
- 分支：refactor/s90-visual-storytelling-v3
- 当前阶段提交：见 git log --grep 及 COMMITS.txt（报告随本阶段提交）。
- 结果：PASS
- 浏览器：本机 macOS Chrome，Metal GPU，桌面1600×900；移动端为390×844模拟，Safari与真机UNVERIFIED。

开场保留侧视线稿、真实中线和失败重试。章节导航收入简短菜单，关于入口保留非官方说明、lazercar与CC BY链接。详情去除重复编号、英文注记、规格表及重复提示。探索保留拖动、车漆、热点、重置和返回。

修复原0×0热点按钮点击问题，提供44px交互区域，隐藏热点退出Tab顺序。修复返回探索重复进入风险。桌面鼠标/键盘和移动触屏模拟测试通过，1600、390、320、844横屏均无横向溢出与pageerror；横屏座舱文字顶部裁切已修复并重拍。

npm run build通过，node tools/rework-ui.mjs。证据 ../evidence/stage-10/controls.json 与controls-844.json，开场、轮毂、座舱、探索截图。已实际检查屏幕画面并与阶段07/09同镜位对照。真机未测。

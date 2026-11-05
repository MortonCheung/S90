# 12 · 真实双栏与场景画幅同步

- 开始分支 `feature/s90-sketch-journey`
- 开始 SHA `1a6c0d37d2b9b914b14e79e393205dbda196fd86`
- 验收结果 PASS
- 阶段提交通过 git log --grep="v4 stage 12" 查询，提交收录本报告。
- Chrome / macOS / Metal。真机 Safari 与 Android 在独立报告明确验证前均为 UNVERIFIED。

基线已是真实Grid，继续保留并集中reader宽/高变量，Canvas与建筑使用同一stage实际尺寸。主相机由唯一控制器明确同步aspect，快跳到全幅时也沿用正确取景。

桌面1600与窄屏390各19个正反状态实测。画布和SVG边界匹配、与详情相邻不覆盖、相机aspect等于实际左区比例，无横向溢出。灯组/轮毂中点反向的列宽和文字权重相同。

真实截图与两端录像已查看轮毂、侧面、座舱，车辆主体和文字可读。每会话1次模型请求、1Canvas、无pageerror。npm run build通过。现有文章在同一阅读区连续交接，未卸载模型。

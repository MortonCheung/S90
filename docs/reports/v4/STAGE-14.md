# 14 · 自由探索与黄昏收束

- 开始分支 `feature/s90-sketch-journey`
- 开始 SHA `5b87015ce485381ebbcedd005313dac8826f427c`
- 验收结果 PASS
- 阶段提交通过 git log --grep="v4 stage 14" 查询，提交收录本报告。
- Chrome / macOS / Metal。真机 Safari 与 Android 在独立报告明确验证前均为 UNVERIFIED。

黄昏末段建筑渐退，进入干净探索画面，同一Canvas/模型/主相机交给现有Orbit。返回恢复黄昏场景与主线，仍可重新进入。窄屏恢复44px缩放按钮并分两行容纳控件。

新增真实CDP触屏手势复验发现Orbit事件包装层touch-action:none拦截主线滑动，现由模式CSS明确覆盖。叙事pan-y允许原生纵滑，探索none用于旋转。探索整页滚轮锁定，按钮负责缩放，退出后恢复叙事。

1600、390、320三档原生拖动/触摸、四色、拉近/拉远、复位、热点Enter、返回、重入、反向和场景恢复通过，各1次GLB请求、同模型UUID与0pageerror。已查看窄屏截图，全部必要控件可见且无横向溢出。

初次触屏与热点层滚轮失败均保留日志，修复后完整重跑通过。中间差异检查也纠正了一次CSS误写，最终样式差异已核对。npm run build通过。证据docs/v4/evidence/stage-14。

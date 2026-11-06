# 16 · 真实中央加载线与首帧裂幕

- 开始分支 `feature/s90-sketch-journey`
- 开始 SHA `fc68552dda241dbc8afa6b0e9fe262161540a0c2`
- 验收结果 PASS
- 阶段提交通过 git log --grep="v4 stage 16" 查询，提交收录本报告。
- Chrome / macOS / Metal。真机 Safari 与 Android 在独立报告明确验证前均为 UNVERIFIED。

现有首帧UUID判定和同位裂幕保留，明确七个开场阶段。着色器准备阶段中线改为无百分比等待，避免把网络下载结束当成整个画面准备100%。唯一中线继续使用真实loaded/total。

实际Chrome三尺寸完整回归通过。已知总量阻流1MiB时为1%，未知总量无aria百分比；404重试、WebGL上下文丢失及无WebGL2回退可用，单Canvas与单模型UUID复用。

附加测试只在测试中延迟真实compilePromise完成，阶段为compiling、百分比null、firstFrame=false；释放后进入展厅。正常与慢网下线稿完成/首帧就绪双条件成立才裂幕。

Leader已打开揭幕中段、已知进度与失败重试截图。正常开场录屏在同位真车出现前无空场，未测量绝对0像素误差。npm run build通过，全部实际记录在docs/v4/evidence/stage-16。

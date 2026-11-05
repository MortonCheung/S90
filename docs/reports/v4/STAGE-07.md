# 07 · 连续非线性左向右生长引擎

- 开始分支 `feature/s90-sketch-journey`
- 开始 SHA `73d9b9987db2ed6ef79f0fed34639cba8ba8188d`
- 验收结果 PASS
- 阶段提交通过 git log --grep="v4 stage 07" 查询，提交收录本报告。
- Chrome / macOS / Metal。真机 Safari 与 Android 在独立报告明确验证前均为 UNVERIFIED。

新增lineGrowth.js，mapProgress采用正导数正弦速度曲线；schedulePaths按实际X范围与通道安排全局前沿，measurePaths仅预处理时读长度，renderPaths直接采样弧长dash。纵线具有窄绘制区间，反向几何使用等价逆向dash。

首次测试发现最左道路通道延迟造成短空窗，修正统一起点归一化。最终每幕1001样本可见长度严格增长，速度导数约.65–1.35，随机跳点后25%逐路径offset相同。逆向几何像素检查显示左侧有线、右侧空白。

4幕0/25/50/75/100照片和正反慢绘WebM已生成，Leader实际查看growth-contact及录像抽帧，25%只画到左侧，75%跨主体且右侧细节待补。无整体遮罩或不透明块替代。npm run build通过。

本阶段为独立真实SVG引擎，08接入正式滚动场景。证据docs/v4/evidence/stage-07，包含初次失败与最终通过记录。

# 13 · 既有座舱保留与午后融合

- 开始分支 `feature/s90-sketch-journey`
- 开始 SHA `5209ca1260dd97badd7f031afb39cd29e3aae345`
- 验收结果 PASS
- 阶段提交通过 git log --grep="v4 stage 13" 查询，提交收录本报告。
- Chrome / macOS / Metal。真机 Safari 与 Android 在独立报告明确验证前均为 UNVERIFIED。

保留全部既有入窗、仪表、座椅、退出几何点及局部车窗让位，不重新开发车内功能。午后外景随入舱区间克制淡出，退出及反向准确恢复，背景绘线状态仍按同一t计算。

两端17个正反样本及暖棕内饰切换实测通过，暖棕离开重入后保留，原Canvas和模型UUID一致且各1次GLB。看到了实际仪表台/方向盘/中控/座椅，已打开两端及暖棕截图。

首次严格比较发现旧FOV更新阈值产生0.001254度历史差，改为直接写入当前采样FOV后重跑通过。初次失败日志与最终JSON/录像均保存。npm run build通过。

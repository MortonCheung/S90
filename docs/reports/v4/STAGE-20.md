# 20 · 响应式、资源生命周期与错误恢复

- 开始分支 `feature/s90-sketch-journey`
- 开始 SHA `b284901ccaeb0a572a840e8ba5c0a7a1726842ee`
- 验收结果 PASS
- 阶段提交通过 git log --grep="v4 stage 20" 查询，提交收录本报告。
- Chrome / macOS / Metal。真机 Safari 与 Android 在独立报告明确验证前均为 UNVERIFIED。

已完成六视口真实截图和Chrome测试，设备与测法见 COMPATIBILITY_PERFORMANCE.md。full/regression.json、compat.json和横屏独立capture记录全部结果。手动查看横屏稳定座舱、中屏轮毂与错误截图；探索返回的150ms中间帧移入transition-samples，并修正测试等待完整相机交接。

改动只针对稳定性：卸载及迟到取消GLTF释放资源，颜色tween与PMREM回收；上下文丢失锁定滚动状态并停止Canvas帧；无效SVG不再卡住揭幕。保持单Canvas/模型、单相机以及已缓存线条测量。

适用Chrome验收 PASS：原进度/揭幕/正反滚动/双栏/座舱/探索、模型404和损坏重试、SVG404和畸形回退、context loss暂停/重载、无WebGL、reduced-motion。三轮卸载释放194几何/47材质/45纹理，GPU计数稳定；JS堆小幅增长，长时泄漏仍不能由短测排除。构建 PASS。Safari被远程自动化设置阻止；遵守用户不干扰桌面的指令，不继续前台操作，Safari/手机真机 UNVERIFIED。

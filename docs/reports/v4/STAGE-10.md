# 10 · 按关键帧截图校准镜头工作流

- 开始分支 `feature/s90-sketch-journey`
- 开始 SHA `8013505dcdc79d209cbb90c7f38a74aaf3edbc73`
- 验收结果 PASS
- 阶段提交通过 git log --grep="v4 stage 10" 查询，提交收录本报告。
- Chrome / macOS / Metal。真机 Safari 与 Android 在独立报告明确验证前均为 UNVERIFIED。

新增calibrate-shot CLI与文档，图片关联shotId/视口/角色/归一化目标，真实模型分位置、注视点、FOV生成候选并记录误差。CameraSystem仅DEV预览入口，实际属性仍由同一个useFrame写入，关闭后恢复主线。

本轮没有用户新目标图片，使用阶段09自有整车截图明确自测。16个候选记录及selected图已打开核对，最佳回到原参数，AABB自一致误差0。此值不是用户图片匹配或单图唯一姿态恢复的证明。未来目标图实质对齐为UNVERIFIED。

npm run build通过，关闭预览后真实浏览器复测整车、座舱、探索、反向返回，单Canvas/模型与一次GLB请求，0console/page/network错误。未自动改写正式镜头来迎合自测图。

# 17 · 保守保留几何并移除未使用 UV

- 开始分支 `feature/s90-sketch-journey`
- 开始 SHA `691ae32ac490fd2c9e75fbf70dc6070792b913e9`
- 验收结果 PASS
- 阶段提交通过 git log --grep="v4 stage 17" 查询，提交收录本报告。
- Chrome / macOS / Metal。真机 Safari 与 Android 在独立报告明确验证前均为 UNVERIFIED。

审计：真实源 GLB 386347164 B、v3 质量版 73364248 B、保守版 66209528 B；三个版本均为 3273670 三角面和194 primitive。完整材质、法线、切线、纹理和扩展见 evidence/stage-17/model-audit.json。初版14.54MB仍保留作历史资源，没有恢复其激进减面。

实现：仅删除未被任何材质扩展引用的131组UV；其余顶点属性逐元素一致，未改变相机或热点坐标。当前生产采用 s90-preserved-v4.glb；v3 和原始资源不覆盖。MODEL_DECISION.md 记录选择及原版部分4096贴图与当前2048上限的边界。

真实验收：相同环境/相机的原版、v3、保守版五机位15张截图，手动检查接触图及完整座舱和揭幕帧。v3与保守版五图像素差均为0。实际每帧render的3秒采样约60.5fps；仅代表本机Chrome/Metal。浏览器GLB读取约原版5.45s、v3 1.17s、保守版1.08s，不代表公网。

构建 PASS。regression/regression.json 覆盖1600、1440、390，开场分裂、同实例正反滚动、真实座舱、探索/换漆/热点、404重试、未知长度进度、context loss及无WebGL回退均PASS；零页面错误。此阶段为等画质减重，不宣称通过更大资源改善材质。

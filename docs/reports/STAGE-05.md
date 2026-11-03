# 阶段报告 · 模型优化与预览

## 目标
把 368MiB 源模型压到可交付体积，同时不破坏正侧轮廓与材质观感。

## 命令
`gltf-transform optimize ... --compress meshopt --texture-compress webp --texture-size 2048 --simplify-ratio 0.45 --simplify-error 0.0008 --palette false --join false --instance true`

## 结果
- **386.35 MB → 14.54 MB**；包围盒不变；extensions: EXT_meshopt_compression / EXT_texture_webp / KHR_materials_clearcoat / KHR_materials_transmission / KHR_mesh_quantization。
- 浏览器加载 + 首帧编译约 5.3s（本地、Metal）；正侧观感与轮辐细节保留。

## 证据
`public/assets/model/s90-opt.glb`、`docs/reports/lineart-preview.png`、`reveal-1.png`。

## 结论
PASS。代价：内饰被显著简化（座舱章节以构图为主）。

---
生成时间：2026-11-03

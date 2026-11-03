# Volvo S90 数字交互展厅

2026 华灿奖 · 数字媒体设计（交互界面）参赛作品。
严格正侧线稿开场 → 中央裂幕 → 滚动驱动的连续镜头叙事 → 双栏详情 → 自由探索。

## 运行

```bash
cd project/s90-digital-experience
npm install
npm run dev        # http://127.0.0.1:5177
npm run build      # 产物在 dist/
npm run preview    # http://127.0.0.1:4177
```

模型已随仓库提供：`public/assets/model/s90-opt.glb`（14.54 MB）。
源模型 `source_assets/volvo_s90_recharge_free.glb` 不提交（见 `.gitignore`），仅用于重新生成优化版：

```bash
cd tools/model
npx @gltf-transform/cli optimize ../../source_assets/volvo_s90_recharge_free.glb \
  ../../public/assets/model/s90-opt.glb --compress meshopt --texture-compress webp \
  --texture-size 2048 --simplify-ratio 0.45 --simplify-error 0.0008 \
  --palette false --join false --instance true
```

重新生成线稿（需要 Playwright）：

```bash
node tools/lineart/generate.mjs   # 写 public/assets/lineart/s90-side.svg + docs/reports/lineart-preview.png
```

## 目录

```
src/
  scene/      Canvas、单相机、模型加载、环境与材质
  opening/    线稿生长与中央揭幕
  story/      时间轴、相机关键帧、章节与详情数据、车漆
  detail/     双栏详情面板
  explore/    自由探索层（车漆 / 缩放 / 热点 / 返回）
  ui/         进度、章节索引、滚动提示
  styles/     纸墨铜设计令牌与全局样式
tools/        lineart 生成器、截图、验收脚本、展板生成
deliverables/ 三张 A3 展板 JPG、设计说明 PDF、交互流程图、板面源文件
docs/         设计说明、适配、授权、阶段报告与测试截图
reference/audit/  参考网站取证（仅研究用，不进入成品）
```

## 操作

- 开场自动播放；资源就绪后自动揭幕并解锁滚动。
- 滚动 = 推进叙事；到详情区间自动展开右栏（移动端底部抽屉），反向滚动可逆。
- 滚动到底进入自由探索：拖动旋转、滚轮缩放、切换 4 种车漆、点击 5 个热点、ESC 或“返回主线”退出。
- 座舱章节的详情面板内有“内饰 · 概念配色”（石墨 / 暖棕），仅调整座椅与门板皮革色，标注为概念方案。
- 支持 `prefers-reduced-motion`：跳过逐笔生长，直接显示完成态。

## 规格

- 单 Canvas / 单模型实例 / 单主相机；模型 14.54 MB。
- 桌面 1600×900 实测 52fps（headless Chromium + Metal）；移动 390×844 无横向溢出。
- 构建：`dist` JS 1,149.70 kB（gzip 331.12 kB）。

## 已知问题

- WebGL 不可用有静态线稿回退，运行中上下文丢失有覆盖层可重载；详情关闭后的焦点回位未做；真机 Safari 与低端 Android 未实测。
- 内饰在模型优化中大幅简化，座舱章节以构图为主。
- 车门开合不支持：GLB 的左右门体合并在同一网格，未分侧、无铰链节点（见 `docs/reports/STAGE-19.md`）。

## 授权

车模：Volvo S90 Recharge (Free) by lazercar，CC BY 4.0，Sketchfab。
详见 `docs/ASSET_LICENSES.md`。本项目为非官方概念设计，仅用于竞赛展示。

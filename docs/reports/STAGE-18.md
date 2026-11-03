# 阶段 18 验收报告 · 华灿奖展板与说明材料

## 目标
把真实网页转成符合赛事规格的 A3 展板与说明材料，不虚构未实现的功能。

## 规格核对
| 项 | 要求 | 实测 |
| --- | --- | --- |
| 尺寸 | A3，300dpi 或以上 | 4961 × 3508 px（A3 横版 @300dpi） |
| 数量 | 最多 3 张 | 3 张，方向一致（横版） |
| 格式/色彩 | JPG / RGB | JPG / RGB |
| 单张大小 | 5–6 MB | 5.17 / 5.76 / 5.11 MB |
| 身份信息 | 不得出现姓名/学校 | 未出现（仅赛事名与作品名） |
| 内容 | 高保真图、交互流程、设计说明、PC/移动适配 | 三张分别覆盖：概念主视觉与揭幕、叙事与流程、探索与适配 |

## 产物
- `deliverables/s90_board_01.jpg`（概念 / 主视觉 / 线稿与同位）
- `deliverables/s90_board_02.jpg`（六章分镜 + t 轴 + 交互流程）
- `deliverables/s90_board_03.jpg`（自由探索 + 移动端 + 规格）
- `deliverables/s90_design_statement.pdf`（设计说明）
- `deliverables/s90_interaction_flow.pdf` / `.png`（交互流程）
- `deliverables/exported_metadata.json`（尺寸/dpi/大小/模式）
- `deliverables/boards/`（HTML 源稿）、`deliverables/source_board_files/`（渲染原图）

## 制作方法
- 网页原始截图用 Playwright 在 3200×1800 / 3900×2194 / 780×1688 下真实渲染，未把 1080p 截图放大冒充高精度。
- 展板用 HTML 排版（纸色、宋体、铜色索引），在 4961×3508 视口下一次性渲染；叠加细颗粒纸纹后导出 JPG。
- 展板只写有证据的技术点（单 Canvas、单模型、14.54 MB、52fps、0–3px 同位误差），未写“物理仿真/AI 驱动”等无依据话术。

## 结论
PASS（文件规格逐项实测达标）。风险：A3 在部分评审屏幕上看会缩至 1080p 宽，细节文字需原尺寸查看；展板中手机截图占位较小。

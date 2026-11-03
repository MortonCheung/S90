# 全流程终检报告（FINAL QA）

时间：2026-11-03 21:5x　·　环境：macOS / Node 24.15.0 / Chromium headless + Metal
命令：`node tools/qa.mjs`（结果同时写入 `/tmp/qa-result.json`）

## 1. 构建
- `npm run build`：648 modules，1.9–2.1s，JS 1,153.88 kB（gzip 333.02 kB），CSS 16.9 kB。
- `npm run preview`（4177）：Canvas 创建、揭幕完成、0 console error。

## 2. 桌面 1600×900
| 项 | 实测 | 判定 |
| --- | --- | --- |
| 开场 → 揭幕 | 6.90s（空缓存，含 14.54MB 模型下载/解析/编译） | PASS |
| 帧率 | 61fps（2s 采样；两次终检 60–61fps） | PASS（headless/Metal） |
| 章节状态 | 0.05 整车 → 0.2 灯组 → 0.33 轮毂 → 0.46 侧面 → 0.59 座舱 → 0.715 车尾 → 0.84 收起 → 0.97 探索 → 回 0.46 详情复现 | PASS |
| 详情可逆 | 0.84 关闭、回 0.46 重新打开 | PASS |
| 车漆 | 点击后 `data-active` = 水晶白 | PASS |
| 热点 | 找到可见热点并点击聚焦 | PASS |
| ESC | `explore=false`、回主线 | PASS |
| 横向溢出 | 0px | PASS |
| Canvas 数 | 1 | PASS |
| Console error | 0 | PASS |

## 3. 移动 390×844
| 项 | 实测 | 判定 |
| --- | --- | --- |
| 揭幕 | 6.64s | PASS |
| 座舱配色控件 | 底部抽屉内可见、可点击 | PASS |
| 横向溢出 | 0px | PASS |
| 探索工具条 | x=16、宽 358、视口 390，不溢出 | PASS |
| 探索态 | `explore=true` | PASS |
| Canvas 数 | 1 | PASS |
| Console error | 0 | PASS |
| 真机 | 未测 | UNVERIFIED |

## 4. 参赛展板
| 文件 | 尺寸 | 色彩 | dpi | 大小 | 判定 |
| --- | --- | --- | --- | --- | --- |
| `deliverables/s90_board_01.jpg` | 4961×3508 | RGB | 300 | 5.984 MB | PASS |
| `deliverables/s90_board_02.jpg` | 4961×3508 | RGB | 300 | 5.803 MB | PASS |
| `deliverables/s90_board_03.jpg` | 4961×3508 | RGB | 300 | 5.897 MB | PASS |

展板 02 的“概念内饰”注记、展板 03 的探索/移动端内容均来自本轮真实截图；页脚无姓名/学校。

## 5. 材料清单
- 阶段报告 21 份（01、01A、02–20）+ `INDEX.md` + 本报告。
- 设计说明、交互流程、适配、授权：`docs/DESIGN_STATEMENT.md`、`docs/INTERACTION_FLOW.md`、`docs/ADAPTATION.md`、`docs/ASSET_LICENSES.md`。
- 演示：`deliverables/s90_demo.mp4`（37.3s，含座舱配色切换）。
- 截图：`docs/reports/`（含 final-*.png、cabin-*.png、context-lost.png、kbd-paint.png）。

## 6. 结论
| 项 | 状态 |
| --- | --- |
| 主线体验 / 构建 / 桌面 / 移动仿真 / 展板规格 | **PASS** |
| 运行中上下文丢失、WebGL 不可用回退、键盘主流程 | **PASS** |
| 详情关闭焦点回位 | **PASS**（activeElement 由按钮回落到 body） |
| 真机 Safari / 低端 Android / 横竖屏切换 | **UNVERIFIED** |
| 车门开合 | **NOT SUPPORTED**（左右门体合并，见 STAGE-19） |
| REA 运行 | **BLOCKED**（Node 版本），已降级取证 |

## 7. 风险
- `s90_board_01.jpg` 5.984 MB，距 6MB 上限仅 16KB；若平台二次转码需重新导出。
- 帧率为 headless Chromium/Metal 记录，不代表所有设备；移动端未标称帧率。
- 内饰配色是纹理乘色（概念级），近景皮革颗粒不随主题改变。


## 8. 仓库一致性检查
- `npm run build` 最终 1.83s：JS 1,153.91 kB（gzip 333.05 kB）、CSS 18.78 kB（gzip 4.67 kB）。
- 追踪文件 237 个；源模型 `source_assets/*.glb` 与录屏 `*.mov` 未入库（`.gitignore`）。
- 最终产物：3 张展板 + 2 份 PDF + 1 张流程图 PNG + 1 段 mp4 + 21 份阶段报告 + 证据索引。
- 修复项：移除每帧 `window.__cam` 调试分配；详情关闭时焦点回落到 body；热点聚焦距离 3.4→6.0m 并混入 0.3 车身中心，避免裁车；探索标题加纸色径向衬底，深色车身上仍可读。

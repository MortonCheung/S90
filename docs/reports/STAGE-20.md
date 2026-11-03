# 阶段 20 验收报告 · 选做：内饰材质配置

## 结论
**PARTIAL / PASS（概念）**：实现 2 套概念内饰配色，入口放在“座舱”详情面板内；仅调整已有皮革/饰板材质颜色，不新增贴图、不重载模型。

## 素材审计
| 材质 | 使用网格 | 贴图 | 处置 |
| --- | --- | --- | --- |
| `Front_Seat` | Driver / Passenger Seat | 有 | 座椅皮革，随主题着色 |
| `Rear_Seats` | Rear Seats、Rear SeatBelts | 有 | 后座皮革；安全带有轻微同色（已知） |
| `DoorPanelFront` / `DoorPanelRear` | 前/后门内饰板 | 有 | 门板随主题 |
| `Dashboard` | 仪表台、出风口、手套箱 | 有 | 仪表台随主题 |
| `CenterConsole` | 中控、换挡杆、饰板 | 有 | 中控随主题 |
| `Glass` / `Speedometer` / `infotainmentScreen` | 玻璃、仪表、车机 | — | **不改**，避免误伤 |

## 实现
- `src/story/cabin.js`：`graphite`（原色，不覆盖）与 `cognac`（暖棕 #B0835C / 门板 #7C5C43 / 仪表台 #5D4736）。
- `CarModel` 记录材质原始色（`userData.__baseColor`），用 GSAP 0.7s 补间 color；切回“石墨”恢复原色。
- 入口只在 `detail.id === 'cabin'` 时出现，标注“内饰 · 概念配色”“概念方案，非厂家在售配置”。
- 车漆、玻璃、灯组、屏幕材质不变；不重建模型、不新增请求。

## 测试
- 座舱帧切换前后截图：`cabin-graphite.png` / `cabin-cognac.png`，座椅由冷灰转为暖棕。
- 快速往复 10 次：无 console error、`canvas=1`、车漆仍为曜石黑、`scrollHeight` 不变（无重载）。
- 移动端未单独回归（该控件随面板，断点沿用底部抽屉）。

## 已知边界
- 颜色是纹理乘色，近景皮革颗粒不会改变；因此定位为“概念配色”，不宣称真实选配。
- `Rear_Seats` 材质同时用于后排安全带，暖棕下安全带会轻微同色；未单独克隆材质（克隆会破坏实例共享）。

## 结果
PASS（概念级）；不满足“真实皮革替换”级别，已在文案与报告中明示。

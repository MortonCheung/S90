# 证据索引与验收状态

## 阶段报告
| 阶段 | 报告 | 结论 |
| --- | --- | --- |
| 01 旧仓库审计 | `STAGE-01.md` / `LEGACY_REUSE_AUDIT.md` | PASS |
| 01A 参考站逆向 | `STAGE-01A.md` / `REFERENCE_SITE_AUDIT.md` | PASS（研究）；REA BLOCKED（Node 版本） |
| 02 工程初始化 | `STAGE-02.md` | PASS |
| 03 素材授权 | `STAGE-03.md` / `../ASSET_LICENSES.md` | PASS |
| 04 模型结构 | `STAGE-04.md` | PASS |
| 05 模型优化 | `STAGE-05.md` | PASS |
| 06 视觉系统 | `STAGE-06.md` | PASS |
| 07 分镜关键帧 | `STAGE-07.md` | PASS |
| 08 线稿生长 | `STAGE-08.md` | PASS |
| 09 加载门槛 | `STAGE-09.md` | PASS |
| 10 中央揭幕 | `STAGE-10.md` | PASS |
| 11 滚动时间轴 | `STAGE-11.md` | PASS |
| 12 双栏详情 | `STAGE-12.md` | PASS |
| 13 自由探索 | `STAGE-13.md` | PASS |
| 14 车漆 | `STAGE-14.md` | PASS |
| 15 热点 | `STAGE-15.md` | PASS |
| 16 性能兼容 | `STAGE-16.md` | 桌面/移动仿真 PASS；真机 UNVERIFIED |
| 17 失败恢复 | `STAGE-17.md` | 失败/重试、WebGL 不可用回退 PASS；运行中上下文丢失 BLOCKED |
| 18 展板材料 | `STAGE-18.md` | PASS |
| 19 车门开合（选做） | `STAGE-19.md` | NOT SUPPORTED（模型未分侧） |
| 20 内饰配色（选做） | `STAGE-20.md` | PASS（概念配色，2 套） |

## 关键截图
| 文件 | 内容 |
| --- | --- |
| `opening-1.png` / `lineart-1600.png` | 线稿绘制态 |
| `reveal-1.png` | 揭幕完成、线稿与车模同位 |
| `story-020c.png` | 灯组详情 |
| `story-033b.png` | 轮毂详情 |
| `story-046d.png` | 侧面详情 |
| `story-0715.png` | 车尾详情 |
| `explore-5.png` | 自由探索（含 5 个热点、工具栏） |
| `hotspot-focus.png` | 热点聚焦 |
| `paint-crystal.png` | 车漆切换 |
| `cabin-graphite.png` / `cabin-cognac.png` | 内饰概念配色前后 |
| `back-to-story.png` | 返回主线 |
| `mobile-opening.png` / `mobile-detail4.png` / `mobile-explore3.png` | 移动端三态 |
| `error-retry.png` | 模型失败 + 重试 |
| `webgl-fallback.png` | WebGL 不可用静态回退 |
| `reverse-010.png` | 反向滚动 |

## 运行证据（本次）
- `npm run build`：648 modules，1.90s，JS 1,150.69 kB（gzip 331.43 kB），无警告级错误。
- 浏览器全流程：揭幕 6.32s、61fps（1600×900，空缓存）、5 个详情态正确、0.97 进入 explore、回滚 0.5 详情恢复；console 0 error。
- 移动端 390×844：无横向溢出，详情转底部抽屉。

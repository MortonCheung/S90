# 旧 M4 只读技术审计
日期：2026-11-03。源码：https://github.com/MortonCheung/m4 。提交：e89109c832fa53dc1ddf852ebd1462352144ed9f。

恢复位置：`project/legacy-m4`。使用 partial clone + sparse checkout，仅检出源码及 vendor，排除 assets 和 screenshots；未运行旧脚本、未修改旧代码、未推送。`git status --porcelain` 输出为空。Three.js 为本地 UMD r147（README、vendor/three.min.js）。本报告是静态源码审计，不把旧 README 的性能数字视为本轮实测。

## 实际机制与复用边界
- 加载：index.html:2495 `loadModelBuffer` 读取 content-length 流式计数；file 协议通过 base64 JS 解码。2539 `loadCar` 调用 GLTFLoader.parse，固定88/94/100并立即置 carReady。可参考下载字节计数，不复用固定进度或base64副本；新站必须解析、纹理、首帧分别记录。
- 场景/循环：1330 `initThree` 初始化 renderer/PMREM/RoomEnvironment，1360单carGroup；3997 `loop` 更新 tween/相机/热点/renderer。可参考资源生命周期与环境照明思路；不搬运风洞/发动机独立场景。
- 相机：1273 `setCamPose` 取消上个相机tween，1292 `poseFrom` 将位姿转球坐标，1305 `applyCamera`统一落地。但多场景逻辑、拖动和tween都写camPose。新站采用唯一owner与唯一滚动进度，交接时保存实测位姿。
- 材质：2569 `setupCar` 用BMW材质正则替换外漆，改写玻璃transmission；2741 `setPaint`插值颜色，没有取消旧颜色tween。可参考按白名单筛漆面与线性色彩插值，必须重审S90材质并处理快速切色竞争。
- 部件处理：2632 `buildWheels`合并轮毂几何，2610+重挂引擎盖pivot。仅参考矩阵保持/合并思想；S90节点结构未审计前不得复制参数、宣称可开门。
- 热点：2795 `buildHotspots`创建带aria-label按钮，2812 `updateHotspots`使用Vector3.project转DOM坐标、方位和视锥裁剪，没有真实遮挡raycast。可参考投影；新站需检查遮挡与键盘可达。
- 详情/过渡：2881 `openDetail`调整相机并令车漆透明，2916以brightness(0)切发动机；2931 `closeDetail`回固定overview；3421 `showScene`按场景切UI。新站必须连续重构图、保持车体实体、保存并返回进入前镜头。
- 设备适配：1337按设备限制DPR，3973 `onResize`更新aspect；CSS移动端详情为底部布局，2899直接平移整个canvas。可参考DPR上限，重做实时断点构图，避免缩放后初始isMobile状态失效。
- 失败：1331 renderer异常和2539加载异常进入4048 `enable2D`，但同时置carReady=true。新站应明确不可交互状态、重试按钮、错误原因，不能把降级当3D已就绪。
- 滚动：3914+ wheel/swipe触发showroom/airflow切换，3931+接管story内部滚动。与新站正常浏览器滚动要求不符，必须替换。

## 结论
可复用的是球坐标转换、投影到屏幕、字节计数、环境照明/资源生命周期思想。必须重设计加载门槛、单进度相机控制、可逆详情、自由探索交接、遮挡热点和失败恢复。不复制BMW模型、引擎、照片、视频、声音、字体资产或旧页面代码；旧工程未见项目整体明确开源授权，按研究思路处理。

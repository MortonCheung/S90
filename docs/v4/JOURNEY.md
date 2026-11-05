# 四幕状态接口

`src/journey/acts.js` 是幕数据源。现有 `story/story.js` 六章、相机驻留、座舱进出与详情继续使用原进度。

- 清晨 [0,.27)，整车与灯组，residence。
- 白天 [.27,.53)，轮毂与侧面，city。
- 午后 [.53,.675)，座舱，arrival。
- 黄昏 [.675,1]，车尾和探索，road。

`actAt(t)` 返回act和localProgress，不依赖已播放帧。每幕声明sceneId、cameraSequence、lineGrowthRange、features。FEATURE_ACT可由功能查幕ID。所有区间相接，有限输入被约束0–1，非有限输入回到开始。

App在原有唯一滚动采样中写入 `stateRef.current.journey` 与 `visual-layout[data-act]`。DEV探针 `__S90Journey()` 仅供验收。后续场景和线条读取同一个状态，不能自行建立相机控制循环。

1001个正反纯函数样本及真实浏览器边界样本均已核对。此阶段只完成状态架构，正式建筑由阶段06–08接入。

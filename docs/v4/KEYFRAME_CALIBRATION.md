# 依据图片校准既有镜头

接收图片后，Agent先记录幕、shotId、视口及进入/展示/退出角色，再从图中判断主体占比、焦点、边缘留白和方向，填写目标JSON。用户无需提供相机坐标。

```json
{
  "image": "/absolute/path/to/reference.png",
  "viewport": [1600, 900],
  "shotId": "lamp",
  "phase": "display",
  "subjectBoundsNormalized": [0.05, 0.2, 0.6, 0.85]
}
```

bounds按整个截图宽高归一化。若需只测具体部件，可附模型中的meshName。进入/退出按镜头边界采样，也可提供progress精确定位。seed仅在目标方向与现有构图相差较大时由Agent依据图片估计，之后由候选渲染验证。

执行 `CALIBRATION_OUTPUT=test-results/calibration-review node tools/v4/calibrate-shot.mjs target.json`。工具在真实模型与相同视口中先搜索方位/距离，再检查注视点，最后细调FOV，输出每个候选图、相机参数及RMS包围框误差。需要人工查看透视、主体裁切、遮挡和相邻镜头衔接，包围框吻合不等于唯一求解。

仅DEV环境提供候选预览接口，控制权仍属于CameraSystem的同一个写入循环。关闭预览恢复当前主线。选中参数后修改shots.js对应稳定ID，重新执行shot-check及正反浏览器验收，经过审查后才提交。

阶段10使用本项目阶段09的整车截图作流程自测，没有收到或虚构用户新目标图。实际数值与选中图在evidence/stage-10/calibration.json与selected.png。未来图片的视觉对齐结果为UNVERIFIED。

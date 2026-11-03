# 可供 Agent 直接查阅的参考资源

## 用户指定网站（仅学习设计与行为，不复制受保护素材）

- 线稿开场： https://heronaiapp.com
- 汽车主体叙事： https://spykercars.com/c8-preliator
- 镜头到点展开： https://illoca.unseen.co
- 旧汽车交互： https://demo.morton.xin

## 本次代码基线

- 正式仓库（唯一可写的远端）： https://github.com/MortonCheung/S90
- 旧参考仓库（只读）： https://github.com/MortonCheung/m4
- 审核时main SHA： ae52257295bdb9e84b6926a498cf165b7bc24675（Agent必须重取最新）
- `src/opening/Opening.jsx`、`tools/lineart/trace.js`、`src/scene/useCarAsset.js`、`src/scene/CameraSystem.jsx`、`src/story/story.js`、`src/detail/DetailPanel.jsx`、`src/scene/Studio.jsx`、`src/styles/global.css`。

## 可用技术文档

- GSAP 路径描画：https://gsap.com/docs/v3/Plugins/DrawSVGPlugin/
- Three.js 物理材料：https://threejs.org/docs/pages/MeshPhysicalMaterial.html
- glTF Transform CLI：https://gltf-transform.dev/cli
- REA（可选的浏览器运行时取证，不是开发必需条件）：https://github.com/morluto/rea
- REA浏览器观察：https://github.com/morluto/rea/blob/main/docs/browser-observation.md

## 录屏和模型

原始视频：`录屏2026-11-03 11.37.09.mov`（Heron）、`录屏2026-11-03 11.46.54.mov`（Spyker）。原始高精车模：`volvo_s90_recharge_free.glb`。这些文件可能仅在用户电脑或本次会话上传记录中，**本施工包并未随附原视频和大模型**；Agent应先检查实际可读路径，无法访问必须标记 UNVERIFIED/BLOCKED。

关键帧如提供在 `reference/heron_keyframes.jpg` / `reference/spyker_keyframes.jpg`，只能辅助校准静态构图，不能取代原始录屏的运动验证。

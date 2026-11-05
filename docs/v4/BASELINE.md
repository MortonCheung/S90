# v4 基线与保护接口

起点 626662a15b19be85d38199e1e3482c93aaeb2295，远端 main 为 ae52257295bdb9e84b6926a498cf165b7bc24675。工作区启动时干净，新分支 feature/s90-sketch-journey。

## 模块契约

| 模块 | 当前职责 | 保护接口 |
|---|---|---|
| App | 唯一原生滚动进度、布局与交接 | stateRef.raw/smooth、detailFactor、chapterId |
| story | 相机驻留、六章节、详情、座舱玻璃区间 | sampleCamera、detailState、cabinGlassOpacity |
| Experience | 一个 Canvas | 同一个 GLTF scene、主相机 |
| useCarAsset / CarModel | 真实下载、材质、首帧确认 | onFirstFrame(uuid)，原模型名称 |
| Opening | 三轨主笔触和真实中线揭幕 | drawn + ready、openingPose 投影 |
| DetailPanel | 真正右列/移动下行 | --detail-progress、--content-ID |
| CameraSystem / ExploreLayer | 主线与 Orbit 互斥交接 | focus/zoom/reset/isBusy、返回抑制 |

当前内部机位在 .59 与 .615，可见方向盘、仪表台、中控与前排座椅。原后窗局部淡化和入窗路径按进度恢复。阶段13只融合场景，不重新开发座舱。

## 实际基线

阶段01 Chrome回归涵盖1600×900、1440×900、390×844，单Canvas、一次GLB请求、同模型UUID、正反恢复、404与WebGL错误。附加捕获检查console.error、requestfailed与HTTP错误，均无异常。旧参考网站只读。原始模型386,347,164 B，运行GLB73,364,248 B。

当前Mac硬件短时RAF采样桌面录屏时约46fps，其余约60fps。基线存在录制开销，最终须同条件比较。不可沿用旧60fps作为全程结论。

## 本轮待改

- 四幕建筑与道路尚无。
- 开场分段笔触仍有停顿风险，阶段15使用连续生长引擎。
- 窄屏现隐藏缩放按钮，阶段14恢复可用入口。
- contextLost提示与状态暂停语义需在阶段20核对。
- 真机Safari/Android为UNVERIFIED。

两种整合方向比较后优先选择保留现有六个子镜头与座舱时间映射，将四幕作为主进度的空间节奏层。后续以阶段05结果决定最终区间，所有消费者使用同一映射。

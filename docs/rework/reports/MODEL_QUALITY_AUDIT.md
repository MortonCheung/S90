# MODEL QUALITY AUDIT · 阶段04模型数据审计

本报告只陈述模型数据与转换结果，不以统计代替视觉验收；浏览器画质、解码时间和帧率由主Agent固定环境对照验证。

## 原始与旧opt

原始386,347,164 B；336 nodes、194 meshes、44 materials、45 textures、0 animations；3,273,670 triangles、2,130,931顶点。旧opt为1,230,340 triangles、852,724顶点（按mesh primitive总计，不将复用实例重复累加）。

原始世界bbox min(-1.005600,0.022341,-2.485187)，max(1.005600,1.456083,2.514861)。旧opt同坐标系、同米制尺寸，最大边界差约0.12毫米，无需额外归一化。旧opt扁平化层级，原始保留Sketchfab根变换；层级不同不代表世界坐标不同。

真实简化证据：Body Frame_Car Paint 46,616→20,976 triangles；单前轮辋98,728→44,427。外观几何也被简化，并非仅内饰。

NORMAL原始Float32(5126)，旧opt normalized signed-byte(5120)。原法线长度0.99999991–1.00000017，旧opt解码长度0.993999–1.005195。没有零法线。glTF Transform 4.5.1 functions/src/meshopt.ts high模式使用FILTER、法线精度限制8bit，与实际accessor一致。精度下降是事实，但shader会归一化，不能单独以长度偏差证明全部塑料感原因。未发现旧流程重算法线的证据，不声称调用过computeVertexNormals。

## 候选

- `public/assets/model/candidates/s90-preserved-v3.glb`：99,391,144 B；全部原始NORMAL/TANGENT Float32与面拓扑保留，POSITION15bit/UV16bit；2048px无损WebP法线图，其他q85。此为保留版本，未选中前不要一起提交。
- `public/assets/model/candidates/s90-quality-v3.glb`：73,364,248 B（73.36 MB / 69.97 MiB）；与保留版相同几何，仅法线纹理改为2048px WebP q95。接近70MB目标，低于100MB硬约束；不为精确凑数字进一步损伤纹理。

二者均不简化拓扑，不重算法线，不对NORMAL/TANGENT量化。POSITION15bit和UV16bit量化后通过节点补偿维持世界构图；原[0,1]外UV保留原精度。Meshopt使用QUANTIZE编码，无FILTER预处理，只清理悬空accessor，不合并材质或删除节点。

最终73.36MB候选：3,273,670 triangles、2,130,931顶点，原44材质名/336节点/194 meshes保持；Three GLTFLoader将空格标准化为下划线的既有行为不变。所有纹理最长边2048；法线图缩小且q95编码属于有损，不能称整个候选无损。原asset.extras许可署名随文件保留。

## 验证与复现

`node tools/model/quality-candidate.mjs > docs/rework/reports/MODEL_QUALITY_AUDIT.log 2>&1`

PASS：解码后所有NORMAL/TANGENT及非POSITION/UV属性逐值一致；三角面索引允许循环旋转但不允许反转，全部拓扑等价、difference列表为空。所有材质名一致，bbox最大偏差约0.015毫米。最终转换审计耗时8.25秒，非浏览器解码时间。JSON含完整逐网格统计、法线范围、逐贴图尺寸格式、扩展、SHA256与校验字段。

UNVERIFIED：固定相机下画质、车灯轮毂近景、座舱细节、首帧和FPS，交主Agent实际浏览器验收。三角面约为旧opt的2.66倍，内存与GPU成本必须实测。

## 失败和收敛

原分辨率lossless法线图+完全Float32几何201,016,952 B超约束；2048法线+16bit坐标且未清理悬空accessor141,744,604 B；清理后101,746,664 B；POSITION15bit/其他图q85后99,391,144 B；另存法线图q95版本73,364,248 B。前三个仅在新候选路径迭代，未覆盖原始或旧opt。

未修改src、灯光、相机、原始模型或旧s90-opt.glb；未提交。最终选择与阶段提交由主Agent执行。

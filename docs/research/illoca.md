# illoca · 建筑层次与空间移动

2026-11-05，Chrome 1440×900、Metal。[研究页](https://illoca.unseen.co)。结论为部分OBSERVED，反向与详情完整展开为UNVERIFIED。

## 操作与证据

1. 新会话访问。初次可见纸网格与蓝色几何加载标识，后续ready截图显示室内建筑绘画、桌面、窗与人物，实际图像位于视口中下部。
2. 原生正向轮动。forward-01至06实际捕获全景向桌面靠近、建筑图纸及体量模型进入中心的变化，Leader已查看ready和forward-04。document高度固定900，不能用window.scrollY表示整站叙事进度。
3. 正反补采。后续有界脚本发送输入后页面采样超时，浏览器关闭后的动作无效。不能将attempts.json中的计划动作标为成功恢复，完整可逆行为仍UNVERIFIED。

原始路径为本地 `test-results/v4-reference/illoca/`。ready/forward截图是有效图像；0字节WebM为中断记录，不作为可播放证据。较早6MB录像能作为局部取证，完整状态链缺失。

## 技术证据与应用

OBSERVED。DOM有一个全屏Canvas，布局高度900，视口外section依赖transform定位。INFERRED。页面用自定义滚动状态组织镜头和DOM布局。没有足够证据确定建筑线条的生成算法、具体渲染库或全部视角的实现。

采用的抽象原则为远景先交代空间、向目标靠近后展开信息、主要视觉与文本分别保留可读区域。本工程继续使用普通浏览器滚动，以同一进度函数控制建筑SVG与真实S90，实际缩收Canvas布局。不得复制本站插画、人物、建筑、蓝色场景或源代码。

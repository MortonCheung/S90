# Spyker · 汽车叙事与媒体证据

2026-11-05，Chrome 1440×900、Metal。[研究页](https://spykercars.com/c8-preliator)。本次整体视觉交互结论为UNVERIFIED，加载视图、DOM和资源类型为OBSERVED。

## 操作与证据

1. 新会话访问，probe.png停在92加载指示。DOM存在整车名称、morning/afternoon时间段、部位描述及声音入口。文字存在不代表对应电影画面已显示。
2. 尝试等待和轮动，未得到可核查的完整电影序列，不能把加载态称作叙事完成。
3. 正反与展开的后续有界采样受加载/操作超时影响，成功恢复未验证。历史v2录屏资料只作历史补充，不能冒充本次结果。

本地证据 `test-results/v4-reference/spykercars/probe.json`、`probe.png`。没有复制资源响应正文到产品。

## 技术证据与应用

OBSERVED。页面有5个Canvas、0个video。实际请求出现 `activeframe/...morning-intro-desktop.af`、`evening-desktop.af`，类型为application/octet-stream。INFERRED。部分画面使用自定义媒体封装或帧处理。具体解码、预渲染视频、图像序列和实时WebGL的边界仍UNVERIFIED，仅凭Canvas和af扩展名不能下结论。

采用的抽象原则为一天中的时间变化承接整车与部件，在镜头驻留区给阅读留出空间，再回到完整画面。S90保持同一Canvas和车模，以原创建筑线描承载四幕，不复制该站摄影、视频、车模、声音或源代码。

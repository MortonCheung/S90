# Heron：开场线条、空间与交互取证

研究对象：[Heron AI](https://heronaiapp.com/)。2026-11-05，Chrome 155.0.8059.85，macOS，1600×900，正常动效。使用项目已安装的 Playwright 和 `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`。未启用 REA；未获取、保存或复制商业源码、独立美术资产。仅保存页面截图、自己录制的视频、DOM统计、计算样式及请求元数据。

本项结论为 **PARTIAL**：首屏视觉、菜单展开、真实DOM和网络已取证；菜单收起尝试超时，全站滚动比例未正确落到内部容器，不能宣称已完成全站逆向或正反滚动验收。

## 证据与复现

所有图像、视频和脚本在已被 Git 忽略的 `test-results/v4-reference/`，未放入产品资产目录。首次采样记录见 [inspection.json](../../test-results/v4-reference/heron/inspection.json)，操作时间线、DOM/网络记录见 [actions.json](../../test-results/v4-reference/heron/actions.json)。时间均为对应会话开始后的秒数，截图文件名不能代替成功断言。

1. **H01｜冷启动：纸面→线结构→完整建筑，OBSERVED。** 新建无缓存上下文访问主页并等待，期间没有滚轮输入。初次录屏 [page@6b28d62115c5fee59181004edcf8e0a9.webm](../../test-results/v4-reference/heron/page@6b28d62115c5fee59181004edcf8e0a9.webm) 保留加载全程；[opening-filmstrip.png](../../test-results/v4-reference/heron/opening-filmstrip.png) 以视频2秒起、每2秒一帧抽样。可看到空纸、稀疏建筑主线、完整建筑及周边文字的先后。最终画面见 [load-18395.png](../../test-results/v4-reference/heron/load-18395.png)。这只能证明该次视觉顺序；没有逐笔路径采样，**严格全程左至右、速度连续单调均 UNVERIFIED**。不要据此照抄其描边算法。
2. **H02｜顶部 Product 菜单展开，OBSERVED。** 等首屏稳定后点击顶部 Product，导航单元变深色，向下展开两行子入口；建筑主体没有被重新布局。[02-menu-open.png](../../test-results/v4-reference/heron/02-menu-open.png)，操作时间线约64秒。它是轻量下拉层，不能当成“原展示区收缩、右栏真实展开”的证据。
3. **H03｜再次点击尝试收起，OBSERVED 失败。** 同一导航再次点击，Playwright 5000ms超时；[03-menu-closed.png](../../test-results/v4-reference/heron/03-menu-closed.png) 实际仍显示展开菜单。文件名只是计划动作，**不代表关闭成功**。有效观察是“本环境未完成关闭”，不能推导网站必然没有关闭能力。Cookie Reject 也出现相同的点击超时；本会话没有成功改变 Cookie 状态。
4. **H04｜滚轮正反与文档比例滚动，OBSERVED 尝试，完整行为 UNVERIFIED。** 操作脚本输入 `+900、+1600、-1600、-900` 滚轮，再尝试文档25/50/75/100%。所有样本 `window.scrollY=0`，document/body高度900；`.main-inner.lenis` 自身视口约1585×885，其下已有位于视口外的 `home-intro` 等 section。滚轮输入时鼠标仍在导航区域，没有建立内部容器 scrollTop 证据；`window.scrollTo` 亦未推动该容器。因此 `full-*` 截图**不是全站百分比截图**，不得用它证明滚动不可用、画面可逆或全站已遍历。
5. **H05｜刷新重入，OBSERVED。** 操作脚本最后执行主页 reload，约207.5秒的 `15-reload` 样本已写入原始记录，DOM重新出现144 SVG、371 path、1 Canvas、0 video；当时标题节点尚处于初始化状态。[15-reload.png](../../test-results/v4-reference/heron/15-reload.png) 保留该帧。可以确认刷新已发生，不能据此认定刷新后的整段绘制已完整复播或完成。

本地复现脚本为 `node test-results/v4-reference/reference-inspect.mjs` 与 `node test-results/v4-reference/reference-actions.mjs`，无需启动本地服务器。脚本是取证辅助，仍须目视核对成功/失败。

## DOM、样式与实际网络

- **OBSERVED：** 稳定首屏文档144个SVG、371个SVG path、1个Canvas、0个video。数量包括隐藏及视口外节点，不能将总数量全部归到首屏建筑。
- **OBSERVED：** 通过浏览器初始化时记录成功的Canvas `getContext`，本会话仅发现 `2d`、id为 `canvas-cursor`。没有成功WebGL上下文记录，也没有GLB或视频媒体请求证据。不能写成“Heron用WebGL渲染建筑”。
- **OBSERVED：** DOM包含描边计算样式，例如line的dasharray约1443.42px、path约269.267px；稳定采样offset为0px，且所采节点部分不在可见区。这证明存在dash描边配置，**不能单凭它认定哪个路径驱动了首屏生长**。
- **OBSERVED：** 图片资源中含SVG、WebP、AVIF；例如末尾为 `_Full.webp` 的资源返回200、`image/webp`，另有 `pixel-mask.svg` 返回200。没有保存其响应正文；这些资源的具体图层用途为 **INFERRED/UNVERIFIED**，不能仅凭文件名认定渲染算法。
- **OBSERVED：** 实际请求到Lenis 1.1.5、GSAP 3.12.5、ScrollTrigger、TextPlugin、SplitText、Barba相关库，状态200。只能说明页面加载过这些库；它们与具体某一效果的绑定关系未读取源码证明，仍为 **INFERRED**。
- **OBSERVED：** 初次采样无pageerror/requestfailed；交互会话有操作超时。操作超时属于自动化结果，不等于页面JavaScript错误。完整状态以原始JSON为准。

## 可供S90采用的抽象原则

1. **笔触推进：** 先让少量可读主结构出现，再补细节与面。S90的左至右、连续、非线性进度必须按自己的需求实现和逐帧验收，不能借本站未量化的过程直接宣称满足R04。
2. **背景转场：** 克制的纸色、有限线条层级和少量强调点能把复杂建筑压低为环境。S90仍以真实三维汽车为主角；不能把本站的建筑、树木、纸纹或红色标注下载后复用。
3. **空间重布局：** 明确区分菜单覆盖和真正布局变化。本次只观察到菜单覆盖，未发现可作为S90详情双栏“缩小展示区”的直接证据。内部滚动容器的进度应单独记录，不能统一用window.scrollY代表所有页面。

禁止复制本站商业源码、SVG图形、建筑渲染图、字体包、纹理、Logo、文案或录屏作为产品素材。本报告只提取体验顺序和取证方法；未实施后续场景、相机或动画改造。

# demo.morton.xin 当前页面核对

2026-11-05，Chrome 1440×900。当前域名展示 VEYRA Electric vehicle design 概念页，初版BMW资料属于历史，不代表当前站点。

- OBSERVED。首页中央为整车图像，4个热点分别进入Battery、Electric drive、Paint与Wheels。DOM热点有具体aria-label，正文与系统说明在同一文档。
- OBSERVED。点击Paint后，下方出现独立的五色色板，当前车身仍在原位置，其余热点被禁用。Paint截图存于test-results/v4-reference/demo/Paint.png。
- OBSERVED。直接点击Wheels被禁用状态拦截，不能在另一面板未退出时切换。尝试记录保留在本地探针日志。
- UNVERIFIED。当前页面是否具有360°实时三维、换轮与动力部件开合，以及各种模式之间的连续运镜。没有因为中央有车辆图就声称实时GLB渲染。
- 应用于S90。探索模式明确归属单个控制器，提供可见返回入口并在场景模式与细节模式间保持同一模型。保留本工程已实测的Orbit与四色材质，不能用此参考站的图像/车模替换。

本地截图与录屏位于test-results/v4-reference/demo。参考画面未进入S90运行资源或参赛展板。

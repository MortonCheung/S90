# STAGE-04 · 保留原拓扑与高精法线的模型

- 基准 SHA：635253df1bb8033ac7af2a3473bbb5b20a9fe309
- 分支：refactor/s90-visual-storytelling-v3
- 当前阶段提交：见 git log --grep 及 COMMITS.txt（报告随本阶段提交）。
- 结果：PASS
- 浏览器：本机 macOS Chrome，Metal GPU，桌面1600×900；移动端为390×844模拟，Safari与真机UNVERIFIED。

原始386MB、旧14.54MB、新73.36MB三版完成真实数据与同条件五视角对比。新模型保留全部3273670面和Float32 NORMAL/TANGENT，44材质名不变，坐标最大偏差约0.015mm。旧版1230340面和8bit法线是折面主要数据因素。

实际查看opt/original/quality车头、内饰截图；新版门板高光连续，轮辋和座舱细节恢复。../evidence/stage-04/comparison-contact.jpg并排五视角；原始和旧模型未覆盖。新增预览页和工具，MODEL_URL切至选中候选。

性能实测见../evidence/stage-04/performance.json，Metal Chrome、1600×900、3秒RAF采样；该值不能代表所有设备。更大下载成本换取正确曲面；纹理2048有损q95/q85已明确。npm run build通过。

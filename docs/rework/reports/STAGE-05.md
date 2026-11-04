# STAGE-05 · 影棚反射与物理材质

- 基准 SHA：6358c30026d36b70318d8c9ea03d7841d2c64bd5
- 分支：refactor/s90-visual-storytelling-v3
- 当前阶段提交：见 git log --grep 及 COMMITS.txt（报告随本阶段提交）。
- 结果：PASS
- 浏览器：本机 macOS Chrome，Metal GPU，桌面1600×900；移动端为390×844模拟，Safari与真机UNVERIFIED。

修改Studio.jsx及useCarAsset.js：自制HDR软箱PMREM、曝光下调、漆面连续高光、玻璃物理透射、镀铬粗糙度及沿Z轴的柔和接地影。几何/镜头/布局不变。

证据：../evidence/stage-05/三种软箱配置与四色真实浏览器截图，选择balanced。首轮发现Glass是MeshStandardMaterial且迁移时defines被覆盖，修复为共享MeshPhysicalMaterial并保留贴图。最终图../evidence/stage-05-final/main-front.png，玻璃与金属分层、接地阴影可见。

npm run build通过；最终本机Chrome 1600×900/390×844模拟的静态3秒RAF采样约60.1/60.1fps，无pageerror；非移动真机结论。四种车漆选中并实拍。

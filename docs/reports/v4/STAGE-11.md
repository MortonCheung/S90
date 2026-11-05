# 11 · 汽车与手绘场景的空间关系

- 开始分支 `feature/s90-sketch-journey`
- 开始 SHA `cfe6ee7f6da06fb21ef9fe5600d773e83ed4ed3b`
- 验收结果 PASS
- 阶段提交通过 git log --grep="v4 stage 11" 查询，提交收录本报告。
- Chrome / macOS / Metal。真机 Safari 与 Android 在独立报告明确验证前均为 UNVERIFIED。

新增只读主相机的SceneRegistration，将地平、地面投影锚点和相对焦距变化转为不同深度SVG视差。车辆仍为静止的原三维车，位移/速度记录为0，未增加假行驶转轮。

实测四胎底面Y=.02233–.02542m，沿用约.023m真实接触阴影。SVG位于Canvas底层，无线穿车身的叠放错误。2.5D变形有界，未声称完整三维建筑。

1600×900与390×844实际捕获、前后相同.46注册逐值相等；原六章、座舱与探索正反通过。单Canvas/模型和0console/page/network错误，npm run build通过。Leader已查看桌面/移动注册图。

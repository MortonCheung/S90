# 手绘与叙事技术选择

2026-11-05。已实际打开两个独立80路径小样并截图，数据见 [benchmark.json](evidence/stage-03/benchmark.json)。

| 能力 | 版本 / 许可 | 新增运行体积 | 结论 |
|---|---|---|---|
| 原生SVG dash | 浏览器标准 | 0 | 采用，逐路径可审计、可逆、可离线编辑 |
| 现有GSAP | 3.12.6，包声明Standard no charge | 0 | 沿用，min72,304B / gzip28,252B已在工程内 |
| Canvas2D描边 | 浏览器标准 | 0 | 小样有效，暂不进入产品 |
| Rough.js | 未安装，官方MIT | 0 | 暂不采用，避免重复抖线压过真实汽车 |
| Paper.js | 未安装，官方MIT | 0 | 运行时不需要，后续有明确编辑需求再考虑离线使用 |
| Anime.js | 本地参考4.5.0，MIT | 0 | 仅研究动画组织，不引入第二套运行引擎 |
| glTF Transform | 工具锁4.5.1，MIT | 0 | 仅离线inspect，阶段17再处理几何 |
| React / R3F / Three | 18.3.1 / 8.17.10 / .170.0，MIT | 0 | 保留既有单Canvas基础 |
| Playwright | 1.64.1，Apache2.0 | 0 | 已有开发依赖，继续真实浏览器验证 |

两个小样约21.0与16.6fps，p95约116ms，performance.memory粗粒度都约10MB。这是当前机器混合负载下的1.8秒小样，不能证明生产性能或严格速度优势，最终在实际场景阶段20重新测量。选择SVG的核心理由为可审计路径与维护成本。

当前GSAP包声明其专用许可，未假定MIT。已核对[官方许可](https://gsap.com/community/standard-license/)、[Rough许可](https://github.com/rough-stuff/rough/blob/master/LICENSE)、[Paper许可](https://github.com/paperjs/paper.js/blob/develop/LICENSE.txt)。不引入DrawSVGPlugin，当前需要原生strokeDasharray/offset即可。

已读取本地design-references的GSAP与Anime包元信息作版本比较，实际工程继续使用锁文件现有版本。新增依赖为零。运行GLB和原始模型仅inspect，没有重新压缩。

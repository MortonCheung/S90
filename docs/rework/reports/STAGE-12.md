# STAGE-12 · 参赛展板与演示同步

- 基准 SHA：a9d7ccc85c8f9465ec9230c7b3bf9f9f5d4ba211
- 分支：refactor/s90-visual-storytelling-v3
- 当前阶段提交：见 git log --grep 及 COMMITS.txt（报告随本阶段提交）。
- 结果：PASS
- 浏览器：本机 macOS Chrome，Metal GPU，桌面1600×900；移动端为390×844模拟，Safari与真机UNVERIFIED。

新版独立写入 `deliverables/v3/`。旧版三张展板及 PDF 打开核对，旧材料保留原路径与基线 ae52257。纠正了旧版的 921 路径/3.8 秒、14.54 MB、旧帧率、投影平移和隔窗座舱表述。

实拍来自阶段11。已打开三张最终 JPG、设计说明两页、流程图与演示抽帧，检查字形、主体裁切、色彩与顺序。原图及清晰度审查见 `../evidence/stage-12/boards-proof.jpg`、`statement-1.png`、`statement-2.png`。

三张均为 4961×3508 横向 A3、300 dpi、RGB、sRGB，JPEG 质量 97、无色度降采样，尺寸通过 5–6 MB 及 5–6 MiB 交集。具体字节见 `deliverables/v3/exported_metadata.json`。版面无个人姓名、学校、个人编号。

Demo 连续录制 43.56 秒，1600×900 H.264，无拼接。可核对 `demo-filmstrip.jpg`、`demo-reveal-filmstrip.jpg` 和 `demo-timeline.json`。开场、双栏、舱内两机位、换漆、拖动、退出和逆向均出现，0 pageerror。

阶段12未修改网站运行行为。实际比赛上传与学校最新要求尚未验收。

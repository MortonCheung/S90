# 静谧的秩序 · v3 参赛材料

- [01 · 设计语言与开场](s90_board_01.jpg)
- [02 · 电影化叙事与空间展开](s90_board_02.jpg)
- [03 · 真实座舱与自由探索](s90_board_03.jpg)
- [数字媒体设计说明](s90_design_statement.pdf)
- [交互流程 PDF](s90_interaction_flow.pdf) · [PNG](s90_interaction_flow.png)
- [连续操作演示 MP4](s90_demo.mp4)
- [素材授权与来源](../../docs/ASSET_LICENSES.md)

三张展板均为横向 A3、4961×3508 像素、300 dpi、RGB / sRGB。实际文件大小见 [导出数据](exported_metadata.json)。展示内容使用 [阶段11运行截图](../../docs/rework/evidence/stage-11/)。

演示为同一次浏览器会话的连续录制。约 0–10 秒线稿和揭幕，11–28 秒外观、详情、座舱和车尾，29–36 秒自由探索、换漆和旋转，37–43 秒退出并反向重走主线。设备适配与未验证条件见设计说明第 2 页。

展板与 PDF 的 HTML 在 [source](source/)。从仓库根目录运行 `node tools/rework-boards.mjs` 和 `python3 tools/rework-print-jpeg.py` 可重做 JPG，Python 需要 Pillow 与 NumPy。运行 `node tools/rework-docs.mjs` 导出 PDF。演示在本地开发服务器运行时用 `node tools/rework-demo.mjs` 重录，依赖 Chrome 和 FFmpeg。

旧版材料保存在上一级 `deliverables/`，可在基线提交 `ae52257` 找到相同文件。印刷规格按用户提供的规程验证，材料待赛事平台上传。

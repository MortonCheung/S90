# 01 · 工程基线与版本保护

- 开始分支 `feature/s90-sketch-journey`
- 开始 SHA `626662a15b19be85d38199e1e3482c93aaeb2295`
- 验收结果 PASS
- 阶段提交通过 git log --grep="v4 stage 01" 查询，提交收录本报告。
- Chrome / macOS / Metal。真机 Safari 与 Android 在独立报告明确验证前均为 UNVERIFIED。

已 fetch 核对 main 与 v3；建立 feature/s90-sketch-journey。现有参赛文件清单和全部模型真实大小存于 docs/v4/evidence/stage-01。

当前唯一施工为保护基线。新增需求登记、模块契约、独立报告与可复用截图工具，未改运行源码。报告使用 docs/reports/v4 子目录以保护旧同名报告。

npm run build 通过。重新启动 Vite 后 S90_QA_DIR=docs/v4/evidence/stage-01 node tools/rework-regression.mjs 通过三个画幅及网络异常。附加 capture 检查 pageerror、console.error、requestfailed 与资源状态，均通过。

已打开 baseline-contact.jpg、座舱截图和完整序列，保存桌面WebM。现有座舱与独立分屏实测成立，窄屏缩放入口缺失登记后续阶段14。真机UNVERIFIED。

import fs from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('/Users/morton_cheung/Desktop/比赛/iTeach/node_modules/playwright');

const base = `
  @page { size: A4; margin: 0; }
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:#EDE9E1;color:#111316;font-family:"Helvetica Neue","PingFang SC",sans-serif;-webkit-print-color-adjust:exact}
  .page{width:210mm;height:297mm;padding:22mm 20mm;position:relative;background:#EDE9E1;page-break-after:always;overflow:hidden}
  .page:last-child{page-break-after:auto}
  .top{display:flex;justify-content:space-between;font-size:8pt;letter-spacing:.18em;color:#57534c;border-bottom:1px solid rgba(17,19,22,.2);padding-bottom:4mm}
  h1{font-family:"Songti SC",serif;font-weight:500;font-size:34pt;line-height:1.15;margin-top:14mm;letter-spacing:.02em}
  h2{font-family:"Songti SC",serif;font-weight:500;font-size:15pt;margin:9mm 0 3mm;letter-spacing:.02em}
  .lead{font-size:11pt;line-height:1.9;color:#3a3d42;margin-top:6mm}
  p{font-size:9.5pt;line-height:1.95;color:#3a3d42;margin-top:2.6mm}
  .kicker{font-size:8pt;letter-spacing:.3em;color:#8B6A47;margin-top:10mm}
  .grid{display:grid;grid-template-columns:1fr 1fr;gap:8mm;margin-top:6mm}
  .card{border-top:1px solid rgba(17,19,22,.22);padding-top:3mm}
  .card b{font-family:"Songti SC",serif;font-size:13pt;font-weight:500;display:block;margin-bottom:2mm}
  .card span{font-size:8.5pt;line-height:1.8;color:#57534c;display:block}
  .foot{position:absolute;left:20mm;right:20mm;bottom:12mm;display:flex;justify-content:space-between;font-size:7.5pt;letter-spacing:.08em;color:#6b665e;border-top:1px solid rgba(17,19,22,.16);padding-top:3mm}
  .num{font-family:"Songti SC",serif;font-size:40pt;color:#8B6A47;line-height:1}
  table{width:100%;border-collapse:collapse;margin-top:4mm}
  td,th{font-size:8.5pt;text-align:left;padding:2.4mm 0;border-bottom:1px solid rgba(17,19,22,.14);color:#3a3d42}
  th{color:#8B6A47;font-weight:500;letter-spacing:.1em;font-size:7.5pt}
`;

const statement = `<!doctype html><html><head><meta charset="utf-8"><style>${base}</style></head><body>
<div class="page">
  <div class="top"><span>2026 华灿奖　数字媒体设计 / 交互界面</span><span>VOLVO S90 — DIGITAL ATELIER</span></div>
  <div class="kicker">DESIGN STATEMENT　/　数字媒体设计说明</div>
  <h1>静谧的秩序</h1>
  <div class="lead">Volvo S90 豪华商务轿车 · 数字交互展厅。以一张严格正侧线稿开场，用一条滚动时间轴完成连续叙事，最后把镜头交还给观看者。</div>
  <h2>01　概念</h2>
  <p>S90 的设计靠比例、水平线与材质，而不是夸张的型面。页面因此只用纸、墨、铜三种基调：纸是展厅，墨是线稿与文字，铜只出现在索引与强调处。没有赛博渐变、没有无意义的小字、没有与车无关的卡片。</p>
  <p>开场把“设计图纸”作为叙事起点：921 条路径从模型边线投影而来，逐笔画出正右侧视；同一时刻真实三维模型在纸下并行加载。只有“画完”与“可渲染”同时成立，中央水平线才向上下裂开，露出与线稿同位置的真实车模。</p>
  <h2>02　结构</h2>
  <div class="grid">
    <div class="card"><b>开场</b><span>线稿生长约 3.8s；真实字节进度；就绪后 1.55s 裂幕，解锁滚动。</span></div>
    <div class="card"><b>主线</b><span>原生滚动驱动统一时间轴，相机连续环绕六章：整车、灯组、轮毂、侧面、座舱、车尾。</span></div>
    <div class="card"><b>详情</b><span>五段区间触发“左车右文”双栏；相机只做投影平移，不转向、不裁车；离开区间即收起。</span></div>
    <div class="card"><b>探索</b><span>尾段连续拉远，0.85s 位姿混合交给 Orbit；360°、4 种车漆、5 个热点；ESC 返回主线。</span></div>
  </div>
  <div class="foot"><span>非官方概念设计　·　车模 CC BY 4.0 / lazercar</span><span>01 / 02</span></div>
</div>
<div class="page">
  <div class="top"><span>2026 华灿奖　数字媒体设计 / 交互界面</span><span>VOLVO S90 — DIGITAL ATELIER</span></div>
  <div class="kicker">SYSTEM　/　技术与视觉</div>
  <h2>03　技术方案</h2>
  <p>React 18 + Vite 6 + React Three Fiber + Three.js r170 + GSAP。单 Canvas、单模型实例、单主相机贯穿全流程；滚动进度 t 是唯一状态源，章节、详情、探索状态都是 t 的纯函数，因此反向滚动天然可逆。</p>
  <table>
    <tr><th>项</th><th>实测</th></tr>
    <tr><td>模型</td><td>源 386.35 MB → 交付 14.54 MB（Meshopt + WebP 2048 + 简化 0.45）</td></tr>
    <tr><td>线稿</td><td>921 条路径；与 3D 轮廓同位误差 0–3px（1600×900）</td></tr>
    <tr><td>性能</td><td>1600×900 · 52fps（headless Chromium / Metal）；移动端未标称</td></tr>
    <tr><td>构建</td><td>JS 1,149.70 kB（gzip 331.12 kB）</td></tr>
    <tr><td>适配</td><td>桌面 1600×900；移动 390×844；≤860px 详情转底部抽屉</td></tr>
  </table>
  <h2>04　视觉规范</h2>
  <div class="grid">
    <div class="card"><b>色彩</b><span>纸 #EDE9E1　墨 #111316　铜 #8B6A47<br>车漆：曜石黑 / 水晶白 / 峡湾蓝 / 暖铜棕</span></div>
    <div class="card"><b>字体</b><span>中文标题宋体；正文无衬线；层级 1.35 倍，行高 1.9–2.05</span></div>
    <div class="card"><b>运动</b><span>仅相机、线稿、幕布三类；0.85–1.55s；统一缓动 cubic-bezier(.22,.61,.36,1)</span></div>
    <div class="card"><b>网格</b><span>页面边距 48px；展板 190px；章节索引右侧固定，详情时隐藏</span></div>
  </div>
  <h2>05　应用与边界</h2>
  <p>适用于车展/展厅触屏、品牌官网车型章节、设计评审中的“线稿—实车”对照。本项目为非官方概念设计，不代表 Volvo 官方；车模依 CC BY 4.0 署名。</p>
  <p>未完成/未验证：WebGL 不可用的静态回退、真机 Safari 与低端 Android 实测、键盘全流程走查；内饰在优化中大幅简化，座舱章节以构图与氛围为主。</p>
  <div class="foot"><span>非官方概念设计　·　车模 CC BY 4.0 / lazercar</span><span>02 / 02</span></div>
</div>
</body></html>`;

const flow = `<!doctype html><html><head><meta charset="utf-8"><style>${base}
  @page { size: A4 landscape; margin: 0 }
  .page{width:297mm;height:210mm;padding:16mm 18mm}
  h1{font-size:22pt;margin-top:6mm}
  .flow{display:flex;align-items:stretch;margin-top:8mm}
  .n{flex:1;border-top:2px solid #111316;padding:3mm 2.4mm 0;position:relative}
  .n b{display:block;font-size:7pt;letter-spacing:.18em;color:#8B6A47;margin-bottom:1.5mm;font-weight:500}
  .n span{font-size:9pt;line-height:1.5;display:block}
  .n:after{content:"→";position:absolute;right:-2mm;top:1.5mm;color:#8B6A47;font-size:10pt}
  .n:last-child:after{display:none}
  .states{display:grid;grid-template-columns:repeat(4,1fr);gap:5mm;margin-top:8mm}
  .s{border:1px solid rgba(17,19,22,.22);padding:3.4mm}
  .s b{display:block;font-family:"Songti SC",serif;font-size:12pt;margin-bottom:2mm}
  .s span{font-size:8pt;line-height:1.75;color:#57534c;display:block}
  .note{margin-top:7mm;font-size:8.5pt;line-height:1.85;color:#3a3d42;display:grid;grid-template-columns:1fr 1fr;gap:8mm}
  .note b{color:#8B6A47;letter-spacing:.18em;font-size:7.5pt}
</style></head><body><div class="page">
  <div class="top"><span>2026 华灿奖　数字媒体设计 / 交互界面</span><span>VOLVO S90 — DIGITAL ATELIER</span></div>
  <div class="kicker">INTERACTION FLOW　/　交互流程</div>
  <h1>一条滚动时间轴，四个互斥状态</h1>
  <div class="flow">
    <div class="n"><b>01</b><span>进入页面</span></div>
    <div class="n"><b>02</b><span>线稿生长<br>（3.8s）</span></div>
    <div class="n"><b>03</b><span>模型就绪<br>（真实进度）</span></div>
    <div class="n"><b>04</b><span>中央裂幕<br>（1.55s）</span></div>
    <div class="n"><b>05</b><span>滚动叙事<br>t ∈ [0,1]</span></div>
    <div class="n"><b>06</b><span>双栏详情<br>5 区间</span></div>
    <div class="n"><b>07</b><span>自由探索<br>t ≥ 0.96</span></div>
    <div class="n"><b>08</b><span>返回主线<br>t = 0.86</span></div>
  </div>
  <div class="states">
    <div class="s"><b>opening</b><span>相机固定开场位；滚轮锁定；drawn && ready 才揭幕</span></div>
    <div class="s"><b>story</b><span>sampleCamera(t) 连续采样；章节索引跟随；可反向</span></div>
    <div class="s"><b>detail</b><span>t 落在详情区间；投影平移让出右栏；离开即收起</span></div>
    <div class="s"><b>explore</b><span>OrbitControls；车漆/热点/缩放；ESC 或按钮返回</span></div>
  </div>
  <div class="note">
    <div><b>单一进度源</b><br>没有 ScrollTrigger pin，没有第二套动画时钟；rAF 只做阻尼与采样。</div>
    <div><b>不重载 / 不硬切</b><br>车漆只改材质颜色；探索退出用 0.85s 位姿混合，无页面切换与二次加载。</div>
  </div>
  <div class="foot"><span>非官方概念设计　·　车模 CC BY 4.0 / lazercar</span><span>INTERACTION FLOW / 01</span></div>
</div></body></html>`;

const browser = await chromium.launch({ headless: true, args: ['--use-angle=metal','--ignore-gpu-blocklist','--enable-gpu'] });
const page = await browser.newPage();
await page.setContent(statement, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
await page.pdf({ path: 'deliverables/s90_design_statement.pdf', format: 'A4', printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
await page.setContent(flow, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
await page.pdf({ path: 'deliverables/s90_interaction_flow.pdf', format: 'A4', landscape: true, printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
const view = await browser.newPage({ viewport: { width: 1123, height: 794 }, deviceScaleFactor: 2 });
await view.setContent(flow, { waitUntil: 'load' });
await view.evaluate(() => document.fonts.ready);
await view.screenshot({ path: 'deliverables/s90_interaction_flow.png' });
await browser.close();
console.log('pdfs done');

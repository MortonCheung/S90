import fs from 'node:fs';
const CSS = `
  *{box-sizing:border-box;margin:0;padding:0}
  html,body{width:4961px;height:3508px;background:#EDE9E1;color:#111316;
    font-family:"Helvetica Neue","PingFang SC","Hiragino Sans GB",sans-serif;-webkit-font-smoothing:antialiased}
  .board{position:relative;width:4961px;height:3508px;padding:140px 190px 120px;display:flex;flex-direction:column;justify-content:space-between}
  .top{display:flex;justify-content:space-between;align-items:baseline;font-size:30px;letter-spacing:.22em;color:#57534c}
  .top b{font-weight:500;color:#111316;letter-spacing:.18em}
  .rule{height:1px;background:rgba(17,19,22,.18);margin-top:30px}
  .kicker{margin-top:54px;font-size:27px;letter-spacing:.3em;color:#8B6A47}
  h1{font-family:"Songti SC","STSong","Noto Serif CJK SC",serif;font-weight:500;letter-spacing:.02em;line-height:1.08}
  .muted{color:#5f5b54}
  .foot{position:absolute;left:190px;right:190px;bottom:82px;display:flex;justify-content:space-between;align-items:flex-end;
    font-size:25px;letter-spacing:.06em;color:#6b665e;border-top:1px solid rgba(17,19,22,.16);padding-top:24px}
  img{display:block}
  .cap{font-size:25px;letter-spacing:.1em;color:#6b665e;margin-top:16px}
  .board::after{content:"";position:absolute;inset:0;background-image:url(grain.png);background-size:512px 512px;opacity:.85;mix-blend-mode:soft-light;pointer-events:none;z-index:99}

`;
const B1 = `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}
  .grid{display:grid;grid-template-columns:1660px 1fr;gap:120px;margin-top:40px;flex:1;padding-bottom:110px}
  .left{display:flex;flex-direction:column}
  h1{font-size:176px;margin-top:18px}
  .sub{font-size:42px;margin-top:30px;letter-spacing:.03em;color:#2b2e33}
  .body{font-size:32px;line-height:2.0;margin-top:56px;color:#3a3d42}
  .steps{display:grid;grid-template-columns:repeat(3,1fr);gap:26px;margin-top:92px;border-top:1px solid rgba(17,19,22,.16);padding-top:30px}
  .steps b{display:block;font-family:"Songti SC",serif;font-size:54px;font-weight:500;line-height:1}
  .steps span{display:block;font-size:22px;letter-spacing:.1em;color:#6b665e;margin-top:12px}
  .quote{margin-top:auto;border-left:3px solid #8B6A47;padding-left:34px;font-family:"Songti SC",serif;font-size:38px;line-height:1.75;color:#2b2e33;max-width:1320px}
  .body p+p{margin-top:24px}
  .sw{display:flex;gap:20px;margin-top:60px;padding-top:0;align-items:center;flex-wrap:wrap}
  .sw i{width:50px;height:50px;border-radius:50%;display:block;border:1px solid rgba(17,19,22,.18)}
  .sw span{font-size:21px;letter-spacing:.08em;color:#6b665e;margin-right:14px}
  .meta{margin-top:34px;display:grid;grid-template-columns:repeat(4,1fr);gap:22px;border-top:1px solid rgba(17,19,22,.16);padding-top:26px}
  .meta b{display:block;font-size:52px;font-family:"Songti SC",serif;font-weight:500;line-height:1}
  .meta span{display:block;font-size:21px;letter-spacing:.12em;color:#6b665e;margin-top:10px}
  .right{display:flex;flex-direction:column;gap:34px}
  .fig{position:relative}
  .fig img{width:2580px;border:1px solid rgba(17,19,22,.1)}
  .tag{font-size:23px;letter-spacing:.12em;color:#6b665e;margin-top:12px}
`;
const B2 = `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}
  h1{font-size:128px;margin-top:14px}
  .sub{font-size:32px;color:#3a3d42;margin-top:18px}
  .row{display:grid;grid-template-columns:repeat(5,1fr);gap:32px;margin-top:52px}
  .row figure{border:1px solid rgba(17,19,22,.1);background:#F2EEE6}
  .row img{width:100%;height:1010px;object-fit:cover;object-position:center top}
  .row figcaption{font-size:23px;letter-spacing:.12em;color:#57534c;padding:16px 4px 18px}
  .axis{margin-top:44px;position:relative;height:300px}
  .axis .line{position:absolute;left:0;right:0;top:120px;height:2px;background:#111316}
  .axis .band{position:absolute;top:112px;height:18px;background:rgba(139,106,71,.35)}
  .axis .tick{position:absolute;top:104px;width:2px;height:34px;background:#111316}
  .axis .lab{position:absolute;top:150px;font-size:20px;letter-spacing:.1em;color:#57534c;transform:translateX(-50%)}
  .axis .ch{position:absolute;top:36px;font-size:22px;letter-spacing:.08em;color:#111316;transform:translateX(-50%);white-space:nowrap}
  .axis .note{position:absolute;top:210px;font-size:20px;letter-spacing:.12em;color:#8B6A47;transform:translateX(-50%);white-space:nowrap}
  .flow{display:flex;margin-top:26px}
  .node{flex:1;border-top:2px solid #111316;padding:22px 22px 18px;position:relative}
  .node b{display:block;font-size:22px;letter-spacing:.18em;color:#8B6A47;margin-bottom:10px;font-weight:500}
  .node span{font-size:27px;letter-spacing:.02em}
  .node:after{content:"→";position:absolute;right:-16px;top:18px;font-size:28px;color:#8B6A47}
  .node:last-child:after{display:none}
  .notes{display:grid;grid-template-columns:repeat(4,1fr);gap:46px;margin-top:38px;margin-bottom:16px;font-size:23px;line-height:1.8;color:#3a3d42}
  .notes b{display:block;font-size:22px;letter-spacing:.2em;color:#8B6A47;margin-bottom:10px;font-weight:500}
`;
const B3 = `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}
  h1{font-size:114px;margin-top:14px}
  .sub{font-size:31px;color:#3a3d42;margin-top:16px}
  .main{display:grid;grid-template-columns:3900px 1fr;gap:80px;margin-top:36px}
  .shot{position:relative;border:1px solid rgba(17,19,22,.1)}
  .shot img{width:100%}
  .anno{position:absolute;font-size:23px;letter-spacing:.04em;background:#EDE9E1;border:1px solid rgba(17,19,22,.38);padding:11px 16px;white-space:nowrap}
  .mob{display:flex;flex-direction:column;gap:40px}
  .mob figure{width:300px}
  .mob img{width:300px;border:1px solid rgba(17,19,22,.14)}
  .mob figcaption{font-size:20px;line-height:1.55;color:#57534c;margin-top:12px;letter-spacing:.04em}
  .side-note{margin-top:40px;font-size:24px;line-height:1.85;color:#3a3d42;border-top:1px solid rgba(17,19,22,.16);padding-top:24px}
  .side-note b{display:block;font-size:21px;letter-spacing:.2em;color:#8B6A47;margin-bottom:10px;font-weight:500}
  .spec{margin-top:auto;display:grid;grid-template-columns:repeat(4,1fr);gap:50px;border-top:1px solid rgba(17,19,22,.18);padding-top:30px}
  .spec b{display:block;font-size:42px;font-family:"Songti SC",serif;font-weight:500;margin-bottom:8px}
  .spec span{font-size:23px;line-height:1.65;color:#57534c;letter-spacing:.03em}
`;

const b1 = `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}
  .grid{display:grid;grid-template-columns:1660px 1fr;gap:120px;margin-top:40px;flex:1;padding-bottom:110px}
  .left{display:flex;flex-direction:column}
  h1{font-size:176px;margin-top:18px}
  .sub{font-size:42px;margin-top:30px;letter-spacing:.03em;color:#2b2e33}
  .body{font-size:32px;line-height:2.0;margin-top:56px;color:#3a3d42}
  .steps{display:grid;grid-template-columns:repeat(3,1fr);gap:26px;margin-top:92px;border-top:1px solid rgba(17,19,22,.16);padding-top:30px}
  .steps b{display:block;font-family:"Songti SC",serif;font-size:54px;font-weight:500;line-height:1}
  .steps span{display:block;font-size:22px;letter-spacing:.1em;color:#6b665e;margin-top:12px}
  .quote{margin-top:auto;border-left:3px solid #8B6A47;padding-left:34px;font-family:"Songti SC",serif;font-size:38px;line-height:1.75;color:#2b2e33;max-width:1320px}
  .body p+p{margin-top:24px}
  .sw{display:flex;gap:20px;margin-top:60px;padding-top:0;align-items:center;flex-wrap:wrap}
  .sw i{width:50px;height:50px;border-radius:50%;display:block;border:1px solid rgba(17,19,22,.18)}
  .sw span{font-size:21px;letter-spacing:.08em;color:#6b665e;margin-right:14px}
  .meta{margin-top:34px;display:grid;grid-template-columns:repeat(4,1fr);gap:22px;border-top:1px solid rgba(17,19,22,.16);padding-top:26px}
  .meta b{display:block;font-size:52px;font-family:"Songti SC",serif;font-weight:500;line-height:1}
  .meta span{display:block;font-size:21px;letter-spacing:.12em;color:#6b665e;margin-top:10px}
  .right{display:flex;flex-direction:column;gap:34px}
  .fig img{width:2580px;border:1px solid rgba(17,19,22,.1)}
  .tag{font-size:23px;letter-spacing:.12em;color:#6b665e;margin-top:12px}
</style></head><body><div class="board">
  <div class="top"><span><b>2026 华灿奖</b>　数字媒体设计 / 交互界面</span><span>VOLVO S90　—　DIGITAL ATELIER</span></div>
  <div class="rule"></div>
  <div class="grid">
    <div class="left">
      <div class="kicker">CONCEPT　/　01</div>
      <h1>静谧的<br>秩序</h1>
      <div class="sub">Volvo S90 豪华商务轿车<br>数字交互展厅</div>
      <div class="body">
        <p>以一张 1:1 的正侧线稿开场。线稿不是贴图，而是由展厅里的同一台相机、同一辆车的几何投影生成；当中央水平线向上下裂开，纸面与真实车模共用同一条轮廓。</p>
        <p>五米的行政轿车不适合被夸张的镜头语言打断。整条叙事只用一条滚动时间轴：从整车比例，到灯组、轮毂、侧面、座舱与车尾；镜头连续，章节之间没有切换。</p>
        <p>纸、墨、铜三种材质构成视觉基调。没有赛博装饰，也没有与车无关的卡片；留白与克制的运动，是这辆车应有的语气。</p>
      </div>
      <div class="steps"><div><b>3.8s</b><span>线稿逐笔生长</span></div><div><b>5.3s</b><span>首帧编译就绪</span></div><div><b>1.55s</b><span>中央线裂开</span></div></div>
      <div class="quote">不做页面的硬切。镜头、模型与时间轴，始终只有一个实例。</div>
      <div class="sw"><i style="background:#EDE9E1"></i><span>纸 #EDE9E1</span><i style="background:#111316"></i><span>墨 #111316</span><i style="background:#8B6A47"></i><span>铜 #8B6A47</span><i style="background:#15171B"></i><span>漆 #15171B</span></div>
      <div class="meta">
        <div><b>1</b><span>CANVAS<br>单画布</span></div>
        <div><b>1</b><span>MODEL<br>单模型</span></div>
        <div><b>1</b><span>CAMERA<br>单主相机</span></div>
        <div><b>8.6</b><span>VIEWPORT<br>叙事长度</span></div>
      </div>
    </div>
    <div class="right">
      <div class="fig"><img src="../source_board_files/plate_hero.png" alt="S90 正右侧视渲染"><div class="tag">REVEAL　/　揭幕后：真实车模与线稿同位，轮廓差 0–3px</div></div>
      <div class="fig"><img src="../source_board_files/plate_lineart.png" alt="正侧线稿"><div class="tag">OPENING　/　921 条路径由模型边线投影生成，逐笔生长约 3.8s</div></div>
    </div>
  </div>
  <div class="foot"><span>非官方概念设计　·　车模 CC BY 4.0 / lazercar</span><span>01 / 03</span></div>
</div></body></html>`;

const b2 = `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}
  h1{font-size:128px;margin-top:14px}
  .sub{font-size:32px;color:#3a3d42;margin-top:18px}
  .row{display:grid;grid-template-columns:repeat(5,1fr);gap:32px;margin-top:52px}
  .row figure{border:1px solid rgba(17,19,22,.1);background:#F2EEE6}
  .row img{width:100%;height:1010px;object-fit:cover;object-position:center top}
  .row figcaption{font-size:23px;letter-spacing:.12em;color:#57534c;padding:16px 4px 18px}
  .axis{margin-top:20px;position:relative;height:330px}
  .axis .line{position:absolute;left:0;right:0;top:120px;height:2px;background:#111316}
  .axis .band{position:absolute;top:112px;height:18px;background:rgba(139,106,71,.35)}
  .axis .tick{position:absolute;top:104px;width:2px;height:34px;background:#111316}
  .axis .lab{position:absolute;top:150px;font-size:20px;letter-spacing:.1em;color:#57534c;transform:translateX(-50%)}
  .axis .ch{position:absolute;top:30px;font-size:22px;letter-spacing:.06em;color:#111316;transform:translateX(-50%);white-space:nowrap}
  .axis .note{position:absolute;top:214px;font-size:20px;letter-spacing:.14em;color:#8B6A47;transform:translateX(-50%);white-space:nowrap}
  .flow{display:flex;margin-top:10px}
  .node{flex:1;border-top:2px solid #111316;padding:20px 20px 16px;position:relative}
  .node b{display:block;font-size:22px;letter-spacing:.18em;color:#8B6A47;margin-bottom:10px;font-weight:500}
  .node span{font-size:26px;letter-spacing:.02em}
  .node:after{content:"→";position:absolute;right:-14px;top:16px;font-size:28px;color:#8B6A47}
  .node:last-child:after{display:none}
  .notes{display:grid;grid-template-columns:repeat(4,1fr);gap:46px;margin-top:34px;font-size:23px;line-height:1.8;color:#3a3d42}
  .notes b{display:block;font-size:22px;letter-spacing:.2em;color:#8B6A47;margin-bottom:10px;font-weight:500}
</style></head><body><div class="board">
  <div class="top"><span><b>2026 华灿奖</b>　数字媒体设计 / 交互界面</span><span>VOLVO S90　—　DIGITAL ATELIER</span></div>
  <div class="rule"></div>
  <div class="kicker">NARRATIVE　/　02</div>
  <h1>一条时间轴，六个章节</h1>
  <div class="sub">滚动进度 t ∈ [0,1] 是唯一状态源；正向与反向都只是 t 的增减，没有第二个时间轴。</div>
  <div class="row">
    <figure><img src="../source_board_files/crop_light.png"><figcaption>02　灯组 / LIGHT</figcaption></figure>
    <figure><img src="../source_board_files/crop_wheel.png"><figcaption>03　轮毂 / WHEEL</figcaption></figure>
    <figure><img src="../source_board_files/crop_profile.png"><figcaption>04　侧面 / PROFILE</figcaption></figure>
    <figure><img src="../source_board_files/crop_cabin.png"><figcaption>05　座舱 / CABIN</figcaption></figure>
    <figure><img src="../source_board_files/crop_rear.png"><figcaption>06　车尾 / REAR</figcaption></figure>
  </div>
  <div class="axis">
    <div class="line"></div>
    <div class="tick" style="left:0%"></div><div class="lab" style="left:0%">0.00</div>
    <div class="tick" style="left:15%"></div><div class="lab" style="left:15%">0.15</div>
    <div class="tick" style="left:28%"></div><div class="lab" style="left:28%">0.28</div>
    <div class="tick" style="left:41%"></div><div class="lab" style="left:41%">0.41</div>
    <div class="tick" style="left:54%"></div><div class="lab" style="left:54%">0.54</div>
    <div class="tick" style="left:67%"></div><div class="lab" style="left:67%">0.67</div>
    <div class="tick" style="left:84%"></div><div class="lab" style="left:84%">0.84</div>
    <div class="tick" style="left:100%"></div><div class="lab" style="left:100%">1.00</div>
    <div class="ch" style="left:7.5%">01 整车</div><div class="ch" style="left:21.5%">02 灯组</div><div class="ch" style="left:34.5%">03 轮毂</div>
    <div class="ch" style="left:47.5%">04 侧面</div><div class="ch" style="left:60.5%">05 座舱</div><div class="ch" style="left:75.5%">06 车尾</div><div class="ch" style="left:92%">EXPLORE</div>
    <div class="band" style="left:16.8%;width:7.8%"></div><div class="band" style="left:29.8%;width:7.8%"></div>
    <div class="band" style="left:42.8%;width:7.8%"></div><div class="band" style="left:55.8%;width:7.8%"></div><div class="band" style="left:68%;width:7.8%"></div>
    <div class="note" style="left:20.7%">详情开</div><div class="note" style="left:33.7%">详情开</div><div class="note" style="left:46.7%">详情开</div>
    <div class="note" style="left:59.7%">详情开</div><div class="note" style="left:71.9%">详情开</div>
  </div>
  <div class="flow">
    <div class="node"><b>01</b><span>线稿生长</span></div>
    <div class="node"><b>02</b><span>车模就绪</span></div>
    <div class="node"><b>03</b><span>中央揭幕</span></div>
    <div class="node"><b>04</b><span>滚动环绕</span></div>
    <div class="node"><b>05</b><span>双栏详情</span></div>
    <div class="node"><b>06</b><span>收起续行</span></div>
    <div class="node"><b>07</b><span>自由探索</span></div>
  </div>
  <div class="notes">
    <div><b>可逆</b>详情由 t 的五个区间触发；离开区间即收起，反向滚动不重置相机。</div>
    <div><b>不裁车</b>详情展开时相机不转向，只做投影平移；车身完整留在左栏，右栏留给文字。</div>
    <div><b>不硬切</b>结尾以 0.85s 位姿混合交给 Orbit；无页面切换、无二次加载、无第二个 Canvas。</div>
    <div><b>概念内饰</b>座舱详情提供石墨、暖棕两套皮革色；只改材质颜色，不重载模型，标注为概念方案。</div>
  </div>
  <div class="foot"><span>非官方概念设计　·　车模 CC BY 4.0 / lazercar</span><span>02 / 03</span></div>
</div></body></html>`;

const b3 = `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}
  h1{font-size:114px;margin-top:14px}
  .sub{font-size:31px;color:#3a3d42;margin-top:16px}
  .main{display:grid;grid-template-columns:3900px 1fr;gap:80px;margin-top:36px}
  .shot{position:relative;border:1px solid rgba(17,19,22,.1)}
  .shot img{width:100%}
  .anno{position:absolute;font-size:23px;letter-spacing:.04em;background:#EDE9E1;border:1px solid rgba(17,19,22,.38);padding:11px 16px;white-space:nowrap}
  .mob{display:flex;flex-direction:column;gap:40px}
  .mob figure{width:300px}
  .mob img{width:300px;border:1px solid rgba(17,19,22,.14)}
  .mob figcaption{font-size:20px;line-height:1.55;color:#57534c;margin-top:12px;letter-spacing:.04em}
  .side-note{margin-top:36px;font-size:23px;line-height:1.85;color:#3a3d42;border-top:1px solid rgba(17,19,22,.16);padding-top:22px}
  .side-note b{display:block;font-size:21px;letter-spacing:.2em;color:#8B6A47;margin-bottom:10px;font-weight:500}
  .spec{margin-top:auto;display:grid;grid-template-columns:repeat(4,1fr);gap:50px;border-top:1px solid rgba(17,19,22,.18);padding-top:30px}
  .spec b{display:block;font-size:42px;font-family:"Songti SC",serif;font-weight:500;margin-bottom:8px}
  .spec span{font-size:23px;line-height:1.65;color:#57534c;letter-spacing:.03em}
</style></head><body><div class="board">
  <div class="top"><span><b>2026 华灿奖</b>　数字媒体设计 / 交互界面</span><span>VOLVO S90　—　DIGITAL ATELIER</span></div>
  <div class="rule"></div>
  <div class="kicker">EXPLORE　/　03</div>
  <h1>自由探索与设备适配</h1>
  <div class="sub">叙事结束后，同一台相机连续拉远，交给自由视角；车漆与热点都不触发重新加载。</div>
  <div class="main">
    <div class="shot">
      <img src="../source_board_files/plate_explore_xl.png" alt="自由探索桌面端">
      <div class="anno" style="left:8%;top:46%">① 5 个部件热点随相机投影，背面自动隐藏</div>
      <div class="anno" style="left:36%;top:79%">② 4 种车漆只改材质颜色，不重建模型</div>
      <div class="anno" style="right:6%;top:18%">③ 拖拽旋转 · 滚轮缩放 · ESC 返回</div>
    </div>
    <div>
      <div class="mob">
        <figure><img src="../source_board_files/m_hero.png"><figcaption>开场<br>线稿与资源并行</figcaption></figure>
        <figure><img src="../source_board_files/m_detail.png"><figcaption>详情<br>底部抽屉，车不裁切</figcaption></figure>
        <figure><img src="../source_board_files/m_explore.png"><figcaption>探索<br>工具栏与热点</figcaption></figure>
      </div>
      <div class="side-note"><b>ADAPTATION</b>桌面以 1600×900 为基准；窄屏（≤860px）详情改为底部抽屉，镜头在竖屏时自动后拉 32%，车体不被裁切。</div>
    </div>
  </div>
  <div class="spec">
    <div><b>1 / 1 / 1</b><span>Canvas / 模型 / 主相机<br>单场景贯穿全流程</span></div>
    <div><b>14.54 MB</b><span>模型交付体积<br>源文件 386.35 MB，Meshopt + WebP 2048</span></div>
    <div><b>52 fps</b><span>桌面 1600×900<br>Chromium headless / Metal；移动端未标称帧率</span></div>
    <div><b>390×844</b><span>移动端实测视口<br>无横向溢出，详情转底部抽屉</span></div>
  </div>
  <div class="foot"><span>非官方概念设计　·　车模 Volvo S90 Recharge (Free) by lazercar　·　CC BY 4.0　·　Sketchfab</span><span>03 / 03</span></div>
</div></body></html>`;

fs.writeFileSync('deliverables/boards/board-01.html', b1);
fs.writeFileSync('deliverables/boards/board-02.html', b2);
fs.writeFileSync('deliverables/boards/board-03.html', b3);
console.log('boards rewritten');

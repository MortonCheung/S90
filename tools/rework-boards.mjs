import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

const out = 'deliverables/v3/source';
const temp = 'test-results/stage-12';
const viewport = { width: 4961, height: 3508 };
const evidence = '../../../docs/rework/evidence/stage-11';
const shot = (id, caption, kind = '') =>
  `<figure class="${kind}"><img src="${evidence}/${id}.png" alt="${caption}"><figcaption>${caption}</figcaption></figure>`;

const panels = [
  {
    title: '静谧的秩序',
    label: '01　设计语言与开场',
    lead: '从一张正侧视图开始，让 S90 的比例先于色彩被看见。',
    content: `
      ${shot('1600-0','同一机位 · 裂幕后的 S90 正侧视','hero')}
      <section class="section">
        <h2>从线条到车身</h2><p>从左向右落笔 · 中央线呈现真实加载进度 · 首帧就绪后上下开幕</p>
      </section>
      <div class="grid four">${[
        ['draw-0.2','01　左侧起笔'],['draw-0.6','02　外轮廓与车窗'],['draw-1','03　结构与细节补笔'],['reveal-1','04　中央开缝，真车同位出现'],
      ].map(args => shot(...args)).join('')}</div>`,
  },
  {
    title: '一条时间轴，六个章节',
    label: '02　电影化叙事与空间展开',
    lead: '滚动推进镜头，到点后稳住主体。阅读空间沿画布边缘展开。',
    content: `
      <div class="grid three story">${[
        ['1600-0.075','01　整车 / 全幅构图'],['1600-0.2','02　灯组 / 右栏打开'],['1600-0.33','03　轮毂 / 延续阅读'],
        ['1600-0.46','04　侧面 / 回看轴距'],['1600-0.59','05　座舱 / 进入车内'],['1600-0.715','06　车尾 / 回到外景'],
      ].map(args => shot(...args)).join('')}</div>
      <section class="section"><h2>阅读与返回</h2><p>全幅 → 左图右文 → 全幅　｜　反向滚动沿同一条轨迹恢复</p></section>
      <div class="grid three sequence">${[
        ['1600-0.075','全幅整车'],['1600-0.2','画布缩收 / 右栏展开'],['1600-0.97','镜头移交 / 全幅探索'],
      ].map(args => shot(...args)).join('')}</div>`,
  },
  {
    title: '进入座舱，交还视角',
    label: '03　真实座舱与自由探索',
    lead: '镜头穿过后侧窗进入车内。最后退到整车距离，由观看者接手。',
    content: `
      <div class="explore">
        ${shot('1600-0.615','座舱实拍 · 方向盘、仪表台、中控与前排座椅')}
        ${shot('390-0.59','移动端 · 下方详情','phone')}
        ${shot('390-0.97','移动端 · 自由探索','phone')}
      </div>
      <section class="section"><h2>同一辆车，四种漆面</h2><p>360°旋转 · 热点查看 · 一键返回主线</p></section>
      <div class="grid four">${['曜石黑','水晶白','峡湾蓝','暖铜棕'].map(name => shot('paint-' + name,name)).join('')}</div>`,
  },
];

const style = `
  *{box-sizing:border-box;margin:0}
  body{color:#1a1b1b;background:#f0ece3;font:40px/1.55 "Helvetica Neue","PingFang SC",sans-serif}
  main{width:4961px;height:3508px;padding:130px 185px;position:relative}
  header,footer,.section{display:flex;align-items:baseline;justify-content:space-between;gap:60px}
  header,footer{font-size:35px;letter-spacing:.075em;color:#504740}
  header{border-bottom:2px solid #a49988;padding-bottom:28px}
  footer{position:absolute;left:185px;right:185px;bottom:102px;border-top:2px solid #a49988;padding-top:25px}
  h1,h2{font-family:"Songti SC",serif;font-weight:600}
  h1{font-size:158px;line-height:1.18;margin-top:46px;letter-spacing:.018em}
  .lead{font-size:49px;color:#51483d;margin:16px 0 48px}
  .hero img{width:100%;height:1535px;object-fit:cover;object-position:center}
  figcaption{font-size:37px;line-height:1.3;color:#443b31;margin-top:23px}
  .section{margin:50px 0 28px;padding-top:29px;border-top:2px solid #a49988}
  .section h2{font-size:65px;line-height:1.2}
  .section p{font-size:38px;color:#51483d}
  .grid,.explore{display:grid;gap:38px}
  .four{grid-template-columns:repeat(4,minmax(0,1fr))}
  .three{grid-template-columns:repeat(3,minmax(0,1fr));row-gap:54px}
  img{display:block;width:100%;height:auto}
  .explore{grid-template-columns:minmax(0,1fr) 670px 670px;align-items:start}
  .explore figure:first-child img{height:1570px;object-fit:cover}
  .phone img{width:100%;height:auto}
  .sequence img{height:410px;object-fit:cover;object-position:center}
`;

await Promise.all([fs.mkdir(out,{recursive:true}),fs.mkdir(temp,{recursive:true})]);
const browser = await chromium.launch({executablePath:process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
try {
  const page = await browser.newPage({viewport,deviceScaleFactor:1});
  for (const [index, panel] of panels.entries()) {
    const number = '0' + (index + 1);
    const path = `${out}/board-${number}.html`;
    await fs.writeFile(path,`<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><title>${panel.title}</title><style>${style}</style></head><body><main>
      <header><span>VOLVO S90　/　数字交互展厅</span><span>${panel.label}</span></header>
      <h1>${panel.title}</h1><p class="lead">${panel.lead}</p>
      ${panel.content.trim()}
      <footer><span>2026 华灿奖　·　数字媒体设计</span><span>非官方概念设计　/　${number}</span></footer>
    </main></body></html>\n`);
    await page.goto(pathToFileURL(path).href);
    const geometry = await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all([...document.images].map(image => image.decode()));
      const footer = document.querySelector('footer').getBoundingClientRect();
      const last = document.querySelector('footer').previousElementSibling.getBoundingClientRect();
      return { clearance:footer.top-last.bottom, width:document.documentElement.scrollWidth, height:document.documentElement.scrollHeight };
    });
    assert.ok(geometry.clearance > 80, JSON.stringify(geometry));
    assert.equal(geometry.width, viewport.width);
    assert.equal(geometry.height, viewport.height);
    await page.screenshot({path:`${temp}/board-${number}.png`});
    console.log(number, geometry);
  }
} finally {
  await browser.close();
}

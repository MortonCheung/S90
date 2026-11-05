import fs from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import { chromium } from 'playwright';

const dir='docs/v4/evidence/stage-03';
await fs.mkdir(dir,{recursive:true});
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
const result={date:new Date().toISOString(),browser:browser.version(),viewport:{width:1440,height:900},variants:[]};
try {
  for(const mode of ['svg','canvas']) {
    const page=await browser.newPage({viewport:result.viewport});
    await page.setContent(`<body style="margin:0;background:#eee9df"><svg viewBox="0 0 1440 900" width="1440" height="900" style="position:absolute;inset:0"></svg><canvas width="1440" height="900" style="position:absolute;inset:0"></canvas></body>`);
    await page.addScriptTag({path:'node_modules/gsap/dist/gsap.js'});
    const data=await page.evaluate(async type=>{
      const svg=document.querySelector('svg');
      const canvas=document.querySelector('canvas');
      const ctx=canvas.getContext('2d');
      const paths=[];
      const specs=[];
      for(let i=0;i<80;i++){
        const x=60+(i%20)*67, y=190+Math.floor(i/20)*120;
        const d=`M ${x} ${y+90} L ${x} ${y} L ${x+45} ${y-20} L ${x+45} ${y+70}`;
        specs.push(new Path2D(d));
        const path=document.createElementNS('http://www.w3.org/2000/svg','path');
        path.setAttribute('d',d);path.setAttribute('fill','none');path.setAttribute('stroke','#56534c');path.setAttribute('stroke-width','1.4');
        svg.append(path); const length=path.getTotalLength(); path.style.strokeDasharray=String(length);paths.push({path,length});
      }
      if(type==='svg') canvas.remove(); else svg.style.visibility='hidden';
      let previous=performance.now();const begin=previous;const intervals=[];
      let p=0;
      const draw=()=>{
        if(type==='svg') for(const {path,length} of paths) gsap.set(path,{strokeDashoffset:length*(1-p)});
        else {
          ctx.clearRect(0,0,1440,900);ctx.strokeStyle='#56534c';ctx.lineWidth=1.4;
          paths.forEach(({length},i)=>{ctx.setLineDash([length,length]);ctx.lineDashOffset=length*(1-p);ctx.stroke(specs[i]);});
        }
      };
      await new Promise(resolve=>{
        function frame(time){
          intervals.push(time-previous);previous=time;p=Math.min(1,(time-begin)/1800);draw();
          if(p<1)requestAnimationFrame(frame);else resolve();
        }
        requestAnimationFrame(frame);
      });
      p=.52;draw();
      return {fps:intervals.length/((previous-begin)/1000),p95Ms:intervals.sort((a,b)=>a-b)[Math.floor(intervals.length*.95)],heap:performance.memory?.usedJSHeapSize??null,paths:paths.length};
    },mode);
    await page.screenshot({path:`${dir}/sample-${mode}.png`});
    result.variants.push({mode,...data});await page.close();
  }
  const packageNames=['react','three','@react-three/fiber','@react-three/drei','gsap','vite','playwright'];
  result.packages=[];
  for(const name of packageNames) {
    const pkg=JSON.parse(await fs.readFile(`node_modules/${name}/package.json`,'utf8'));
    result.packages.push({name,version:pkg.version,license:pkg.license??'see package readme'});
  }
  const gsap=await fs.readFile('node_modules/gsap/dist/gsap.min.js');
  result.gsap={minifiedBytes:gsap.length,gzipBytes:gzipSync(gsap).length};
  await fs.writeFile(`${dir}/benchmark.json`,JSON.stringify(result,null,2)+'\n');
  console.log(result);
} finally {await browser.close();}

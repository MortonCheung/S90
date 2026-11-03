import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS, EXTMeshoptCompression} from '@gltf-transform/extensions';
import {getBounds, textureCompress, quantize, prune} from '@gltf-transform/functions';
import {MeshoptDecoder, MeshoptEncoder} from 'meshoptimizer';
import sharp from 'sharp';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const source=path.join(root,'source_assets/volvo_s90_recharge_free.glb');
const opt=path.join(root,'public/assets/model/s90-opt.glb');
const output=path.join(root,'public/assets/model/candidates/s90-quality-v3.glb');
const report=path.join(root,'docs/rework/reports/MODEL_QUALITY_AUDIT.json');
await Promise.all([MeshoptEncoder.ready,MeshoptDecoder.ready]);
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder,'meshopt.encoder':MeshoptEncoder});
async function audit(file,doc){
 const r=doc.getRoot(), meshes=[];
 for(const mesh of r.listMeshes()) for(const p of mesh.listPrimitives()){
  const pos=p.getAttribute('POSITION'),normal=p.getAttribute('NORMAL'),tan=p.getAttribute('TANGENT');
  let min=Infinity,max=0,zero=0; const el=[];
  if(normal)for(let i=0;i<normal.getCount();i++){normal.getElement(i,el);const len=Math.hypot(...el);min=Math.min(min,len);max=Math.max(max,len);if(len<.01)zero++;}
  meshes.push({name:mesh.getName(),material:p.getMaterial()?.getName(),vertices:pos?.getCount(),triangles:(p.getIndices()?.getCount()||pos?.getCount()||0)/3,attributes:p.listSemantics(),normal:normal?{componentType:normal.getComponentType(),normalized:normal.getNormalized(),count:normal.getCount(),minLength:min,maxLength:max,zero}:null,tangent:tan?{componentType:tan.getComponentType(),count:tan.getCount()}:null});
 }
 const textures=[];
 for(const t of r.listTextures()){const data=t.getImage(),meta=await sharp(data).metadata();textures.push({name:t.getName(),mime:t.getMimeType(),width:meta.width,height:meta.height,bytes:data.byteLength});}
 return {file:path.relative(root,file),bytes:(await fs.stat(file)).size,bounds:r.listScenes().map(s=>getBounds(s)),nodes:r.listNodes().length,meshCount:r.listMeshes().length,materials:r.listMaterials().map(m=>m.getName()),animations:r.listAnimations().length,extensions:r.listExtensionsUsed().map(e=>e.extensionName),vertices:meshes.reduce((s,m)=>s+m.vertices,0),triangles:meshes.reduce((s,m)=>s+m.triangles,0),normalTypes:[...new Set(meshes.map(m=>m.normal?.componentType))],meshes,textures};
}
const started=Date.now();
console.log('Reading source');
const original=await io.read(source);
const originalAudit=await audit(source,original);
const oldAudit=await audit(opt,await io.read(opt));
await fs.writeFile(report,JSON.stringify({original:originalAudit,existing:oldAudit},null,2));
console.log(JSON.stringify({originalBounds:originalAudit.bounds,optBounds:oldAudit.bounds,originalTriangles:originalAudit.triangles,optTriangles:oldAudit.triangles,normalTypes:[originalAudit.normalTypes,oldAudit.normalTypes]}));
// Preserve source topology, Float32 normals and tangents, and all names.
// Only POSITION/UV receive 15/16bit quantization; compensating node transforms
// retain world framing. No FILTER preprocessing or normal recomputation.
await original.transform(textureCompress({encoder:sharp,targetFormat:'webp',slots:/normalTexture/,resize:[2048,2048],quality:95,lossless:false,effort:70}));
await original.transform(textureCompress({encoder:sharp,targetFormat:'webp',slots:/^(?!normalTexture$)/,resize:[2048,2048],quality:85,effort:70}));
await original.transform(quantize({pattern:/^(POSITION|TEXCOORD_\d+)$/,quantizePosition:15,quantizeTexcoord:16,cleanup:false}));
await original.transform(prune({propertyTypes:['Accessor'],keepAttributes:true,keepLeaves:true,keepSolidTextures:true}));
original.createExtension(EXTMeshoptCompression).setRequired(true).setEncoderOptions({method:EXTMeshoptCompression.EncoderMethod.QUANTIZE});
await fs.mkdir(path.dirname(output),{recursive:true});
await io.write(output,original);
console.log('Wrote',output,(await fs.stat(output)).size);
const candidate=await io.read(output), candidateAudit=await audit(output,candidate);
const sourceFresh=await io.read(source);
const a=sourceFresh.getRoot().listMeshes(),b=candidate.getRoot().listMeshes();
let exact=true;const differences=[];
for(let i=0;i<a.length;i++)for(let j=0;j<a[i].listPrimitives().length;j++){
 const x=a[i].listPrimitives()[j],y=b[i]?.listPrimitives()[j];
 for(const semantic of x.listSemantics().filter(s=>s!=='POSITION'&&!s.startsWith('TEXCOORD'))){
  const aa=x.getAttribute(semantic)?.getArray(),bb=y?.getAttribute(semantic)?.getArray();
  if(!aa||!bb||aa.length!==bb.length||aa.some((v,k)=>v!==bb[k])){exact=false;differences.push({mesh:i,primitive:j,semantic});}
 }
 const ai=x.getIndices()?.getArray(),bi=y?.getIndices()?.getArray();
 if(ai&&(!bi||ai.length!==bi.length||Array.from({length:ai.length/3},(_,t)=>{const k=t*3;return ![0,1,2].some(o=>ai[k]===bi[k+o]&&ai[k+1]===bi[k+(o+1)%3]&&ai[k+2]===bi[k+(o+2)%3]);}).some(Boolean))){exact=false;differences.push({mesh:i,primitive:j,semantic:'INDICES'});}
}
const result={generatedAt:new Date().toISOString(),method:'No simplification; POSITION 15bit and TEXCOORD 16bit quantization only; untouched Float32 NORMAL/TANGENT; lossless Meshopt; 2048px quality95 WebP normal maps (lossy texture encoding); 2048px WebP quality 85 other maps',original:originalAudit,existing:oldAudit,candidate:candidateAudit,verification:{exactNormalTangentOtherAttributesAndTriangleTopology:exact,differences,under100MB:candidateAudit.bytes<100000000,processingSeconds:(Date.now()-started)/1000}};
await fs.writeFile(report,JSON.stringify(result,null,2));
console.log(JSON.stringify(result.verification));

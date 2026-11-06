import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS, EXTMeshoptCompression } from '@gltf-transform/extensions';
import { prune } from '@gltf-transform/functions';
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer';
import sharp from 'sharp';

const folder='docs/v4/evidence/stage-17';
await fs.mkdir(folder,{recursive:true});
const original='source_assets/volvo_s90_recharge_free.glb';
const current='public/assets/model/candidates/s90-quality-v3.glb';
const candidate='test-results/v4/s90-conservative.glb';
async function inspect(file){
 const buffer=await fs.readFile(file);
 const jsonSize=buffer.readUInt32LE(12);
 const data=JSON.parse(buffer.subarray(20,20+jsonSize).toString());
 const binStart=28+jsonSize;
 const textures=[];
 for(const image of data.images??[]){
  const view=data.bufferViews[image.bufferView];
  const bytes=buffer.subarray(binStart+(view.byteOffset??0),binStart+(view.byteOffset??0)+view.byteLength);
  const metadata=await sharp(bytes).metadata();
  textures.push({name:image.name,mime:image.mimeType,width:metadata.width,height:metadata.height,bytes:bytes.length});
 }
 return {file,bytes:buffer.length,sha256:createHash('sha256').update(buffer).digest('hex'),
  meshes:data.meshes.length,materials:data.materials.map(m=>m.name),extensions:data.extensionsUsed,
  primitives:data.meshes.flatMap(mesh=>mesh.primitives.map(p=>({
   mesh:mesh.name,vertices:data.accessors[p.attributes.POSITION].count,
   triangles:(p.indices===undefined?data.accessors[p.attributes.POSITION].count:data.accessors[p.indices].count)/3,
   attributes:Object.fromEntries(Object.entries(p.attributes).map(([name,index])=>[name,{type:data.accessors[index].componentType,normalized:data.accessors[index].normalized??false}])),
  }))),textures,json:data};
}
await Promise.all([MeshoptEncoder.ready,MeshoptDecoder.ready]);
const audits=[];
for(const file of [original,current]){
 const audit=await inspect(file);audits.push(audit);
 console.log(file,audit.bytes,audit.primitives.reduce((n,p)=>n+p.triangles,0));
}
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder,'meshopt.encoder':MeshoptEncoder});
const usedUV=new Set([0]);
function collect(value){
 if(!value||typeof value!=='object')return;
 if(Number.isInteger(value.texCoord))usedUV.add(value.texCoord);
 for(const child of Object.values(value))collect(child);
}
collect(audits[1].json.materials);
const document=await io.read(current);
const removed=[];
const before=[];
for(const mesh of document.getRoot().listMeshes())for(const primitive of mesh.listPrimitives()){
 for(const semantic of primitive.listSemantics()){
  const attribute=primitive.getAttribute(semantic);
  if(/^TEXCOORD_/.test(semantic)&&!usedUV.has(Number(semantic.slice(9)))){
   primitive.setAttribute(semantic,null);removed.push({mesh:mesh.getName(),semantic,bytes:attribute.getArray().byteLength});
  }else before.push({mesh:mesh.getName(),semantic,array:attribute.getArray().slice()});
 }
}
await document.transform(prune({propertyTypes:['Accessor'],keepAttributes:true,keepLeaves:true,keepSolidTextures:true}));
document.createExtension(EXTMeshoptCompression).setRequired(true).setEncoderOptions({method:EXTMeshoptCompression.EncoderMethod.QUANTIZE});
await io.write(candidate,document);
const after=await io.read(candidate);
let index=0;
for(const mesh of after.getRoot().listMeshes())for(const primitive of mesh.listPrimitives()){
 for(const semantic of primitive.listSemantics()){
  const expected=before[index++],array=primitive.getAttribute(semantic).getArray();
  if(expected.mesh!==mesh.getName()||expected.semantic!==semantic||array.length!==expected.array.length||array.some((v,i)=>v!==expected.array[i]))throw new Error('Preserved vertex data changed');
 }
}
audits.push(await inspect(candidate));
await fs.writeFile(`${folder}/model-audit.json`,JSON.stringify({
 generatedAt:new Date().toISOString(),usedUV:[...usedUV],removed,exactPreservedAttributes:true,
 models:audits.map(({json,...summary})=>summary),
},null,2)+'\n');
console.log('Removed unused UV streams',removed.length,'Candidate bytes',audits[2].bytes);

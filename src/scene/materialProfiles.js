import * as THREE from 'three';

// All surface tuning lives here. Colour changes in CarModel affect colour only.
export const MATERIAL_PROFILES = {
  paint:{metalness:.74,roughness:.23,clearcoat:1,clearcoatRoughness:.065,envMapIntensity:1},
  window:{transmission:.78,ior:1.5,thickness:.008,transparent:false,opacity:1,roughness:.025,metalness:0,depthWrite:true,envMapIntensity:.85},
  'rear-lens':{transparent:true,opacity:.20,depthWrite:false,roughness:.07},
  'rear-diffuser':{metalness:0,roughness:.2,envMapIntensity:.7,emissiveIntensity:.35},
  chrome:{metalness:1,roughness:.17,envMapIntensity:.85},
  rim:{metalness:.92,roughness:.25,envMapIntensity:.85},
  rubber:{metalness:0,roughness:.88,envMapIntensity:.28},
  gloss:{roughness:.19,envMapIntensity:.85},
  leather:{roughness:.67,metalness:0,envMapIntensity:.45},
};

export function rememberMaterial(material) {
  // Primitive values and texture identities are retained for inspection/rollback.
  material.userData.s90Original ??= Object.fromEntries(
    ['metalness','roughness','clearcoat','clearcoatRoughness','transmission','opacity','transparent','depthWrite','envMapIntensity','emissiveIntensity','emissive','color','map','normalMap','roughnessMap'].map(key=>{
      const value=material[key];return [key,value?.isColor?value.getHexString():value?.isTexture?value.uuid:value??null];
    }),
  );
}

export function tuneMaterial(material, surface) {
  if(!material)return;
  rememberMaterial(material);
  const name=material.name;
  const profile=surface!=='base'?surface:
    name==='Car_Paint'?'paint':/^(chrome\.001|Chrome)$/.test(name)?'chrome':
    /^(Translucent_Glass|Translucent_Glass\.001)$/.test(name)?'rear-diffuser':
    name==='Glass_Taillight'?'rear-lens':
    name==='Rims.001'?'rim':/^(Tire\.001|rubber)$/.test(name)?'rubber':
    name==='Black_Glossy'?'gloss':/^(Front_Seat|Rear_Seats|DoorPanelFront|DoorPanelRear|Dashboard|CenterConsole)$/.test(name)?'leather':null;
  if(profile)for(const [key,value] of Object.entries(MATERIAL_PROFILES[profile])){
    if(key in material)material[key]=value;
  }
  if(surface==='rear-lens')material.color.set('#858589');
  if(profile==='rear-diffuser'){
    material.color.set('#9e1921');material.emissive.set('#8a0810');
  }
  if(material.map){material.map.anisotropy=8;material.map.colorSpace=THREE.SRGBColorSpace;}
  material.userData.s90Profile=profile;
  material.needsUpdate=true;
}

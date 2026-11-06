// The GLTF is owned by useCarAsset; no global model cache or shared instances.
export function disposeModel(scene, extraMaterials=[]) {
  const geometries=new Set(),materials=new Set(extraMaterials),textures=new Set();
  scene.traverse(object=>{
    if(object.geometry)geometries.add(object.geometry);
    if(object.material)for(const m of Array.isArray(object.material)?object.material:[object.material])materials.add(m);
  });
  for(const m of materials)for(const value of Object.values(m))if(value?.isTexture)textures.add(value);
  for(const geometry of geometries)geometry.dispose();
  for(const material of materials)material.dispose();
  for(const texture of textures)texture.dispose();
  const disposed={geometries:geometries.size,materials:materials.size,textures:textures.size};
  if(import.meta.env.DEV&&new URLSearchParams(location.search).has('lifecycle')){
    (window.__S90Disposals??=[]).push(disposed);
  }
  return disposed;
}

import { NodeIO } from '@gltf-transform/core';
import { KHRMaterialsClearcoat, KHRMaterialsTransmission } from '@gltf-transform/extensions';
const io = new NodeIO().registerExtensions([KHRMaterialsClearcoat, KHRMaterialsTransmission]);
const doc = await io.read('../../source_assets/volvo_s90_recharge_free.glb');
for (const m of doc.getRoot().listMaterials()) {
  const c = m.getBaseColorFactor();
  const e = m.getEmissiveFactor();
  console.log(m.getName().padEnd(22), 'base', c.map(v=>v.toFixed(3)).join(','), 'metal', m.getMetallicFactor().toFixed(2), 'rough', m.getRoughnessFactor().toFixed(2), 'alpha', m.getAlpha(), 'mode', m.getAlphaMode(), 'emis', e.map(v=>v.toFixed(2)).join(','), m.getExtension('KHR_materials_transmission') ? 'TRANS' : '');
}

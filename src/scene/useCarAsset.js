import { useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { tuneMaterial, rememberMaterial } from './materialProfiles.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

export const MODEL_URL = '/assets/model/candidates/s90-preserved-v4.glb';

export function useCarAsset() {
  const [state, setState] = useState({
    status: 'loading',
    progress: 0,
    total: 0,
    gltf: null,
    error: null,
  });
  const [attempt, setAttempt] = useState(0);
  const urlRef = useRef(MODEL_URL);

  useEffect(() => {
    let cancelled = false;
    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);

    setState((s) => ({ ...s, status: 'loading', progress: 0, error: null, gltf: null }));

    loader.load(
      urlRef.current,
      (gltf) => {
        if (cancelled) return;
        const replacements = new Map();
        gltf.scene.traverse((obj) => {
          if (!obj.isMesh) return;
          obj.castShadow = false;
          obj.receiveShadow = false;
          const upgrade = (original) => {
            if (!original) return original;
            rememberMaterial(original);
            let surface = 'base';
            if (original.name === 'Glass') {
              if (/taillight/i.test(obj.name)) surface = 'rear-lens';
              else if (/DoorGlass|SunRoof|Windsheild|QuarterpanelGlass/i.test(obj.name)) surface = 'window';
            }
            let materials = replacements.get(original);
            if (!materials) {
              materials = new Map();
              replacements.set(original, materials);
            }
            if (materials.has(surface)) return materials.get(surface);
            let material = surface === 'base' ? original : original.clone();
            if (surface === 'window' && !original.isMeshPhysicalMaterial) {
              material = new THREE.MeshPhysicalMaterial();
              THREE.MeshStandardMaterial.prototype.copy.call(material, original);
              material.defines = { STANDARD: '', PHYSICAL: '' };
              material.name = original.name;
              material.color.set('#748182');
            }
            tuneMaterial(material, surface);
            materials.set(surface, material);
            return material;
          };
          obj.material = Array.isArray(obj.material) ? obj.material.map(upgrade) : upgrade(obj.material);
        });
        gltf.scene.updateMatrixWorld(true);
        setState({ status: 'ready', progress: 1, total: 0, gltf, error: null });
      },
      (event) => {
        if (cancelled) return;
        const total = event.total || 0;
        const ratio = total > 0 ? Math.min(1, event.loaded / total) : 0;
        setState((s) => (s.status === 'ready' ? s : { ...s, progress: ratio, total }));
      },
      (error) => {
        if (cancelled) return;
        setState({
          status: 'error',
          progress: 0,
          total: 0,
          gltf: null,
          error: error?.message || '模型载入失败',
        });
      },
    );

    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const retry = useCallback(() => setAttempt((a) => a + 1), []);
  return [state, retry];
}

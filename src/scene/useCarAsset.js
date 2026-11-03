import { useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

export const MODEL_URL = '/assets/model/candidates/s90-quality-v3.glb';

function tuneMaterial(material) {
  if (!material) return;
  const name = material.name || '';

  if (/^Car_Paint$/i.test(name)) {
    material.metalness = 0.82;
    material.roughness = 0.3;
    if ('clearcoat' in material) {
      material.clearcoat = 1;
      material.clearcoatRoughness = 0.055;
    }
    material.envMapIntensity = 1.25;
  } else if (/^Glass$/i.test(name)) {
    material.transmission = 0;
    material.transparent = true;
    material.opacity = 0.66;
    material.roughness = 0.03;
    material.metalness = 0.1;
    material.depthWrite = false;
    material.envMapIntensity = 1.5;
    material.needsUpdate = true;
  } else if (/chrome/i.test(name)) {
    material.envMapIntensity = 1.7;
    material.roughness = 0.06;
  } else if (/Black_Glossy/i.test(name)) {
    material.roughness = 0.12;
    material.envMapIntensity = 1.4;
  } else if (/Tire|rubber/i.test(name)) {
    material.roughness = 0.72;
    material.envMapIntensity = 0.5;
  }

  if (material.map) {
    material.map.anisotropy = 8;
    material.map.colorSpace = THREE.SRGBColorSpace;
  }
  material.needsUpdate = true;
}

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
        const seen = new Set();
        gltf.scene.traverse((obj) => {
          if (!obj.isMesh) return;
          obj.castShadow = false;
          obj.receiveShadow = false;
          const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
          materials.forEach((m) => {
            if (!m || seen.has(m.uuid)) return;
            seen.add(m.uuid);
            tuneMaterial(m);
          });
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

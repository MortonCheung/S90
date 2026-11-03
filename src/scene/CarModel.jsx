import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { useThree } from '@react-three/fiber';

/**
 * Mounts the single car instance.  The same object graph is reused for the
 * opening reveal, the story and free exploration — never re-loaded, never cloned.
 */
export function CarModel({ gltf, paint, onFirstFrame }) {
  const gl = useThree((s) => s.gl);
  const camera = useThree((s) => s.camera);
  const reported = useRef(false);
  const paintMaterial = useRef(null);

  const paintTargets = useMemo(() => {
    if (!gltf) return [];
    const set = new Set();
    gltf.scene.traverse((obj) => {
      if (!obj.isMesh) return;
      const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
      mats.forEach((m) => {
        if (m && /^Car_Paint$/i.test(m.name || '')) set.add(m);
      });
    });
    return [...set];
  }, [gltf]);

  useEffect(() => {
    paintMaterial.current = paintTargets[0] || null;
  }, [paintTargets]);

  useEffect(() => {
    if (!gltf || reported.current) return undefined;
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      try {
        gl.compile(gltf.scene, camera);
      } catch (error) {
        console.warn('shader precompile skipped', error);
      }
      raf2 = requestAnimationFrame(() => {
        reported.current = true;
        onFirstFrame?.();
      });
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [gltf, gl, camera, onFirstFrame]);

  useEffect(() => {
    const mat = paintMaterial.current;
    if (!mat) return;
    const target = new THREE.Color(paint);
    gsap.to(mat.color, {
      r: target.r,
      g: target.g,
      b: target.b,
      duration: 0.9,
      ease: 'power2.inOut',
      overwrite: true,
    });
  }, [paint]);

  if (!gltf) return null;
  return <primitive object={gltf.scene} />;
}

import { useEffect, useMemo, useRef } from 'react';
import { CABIN_MATERIALS, CABIN_THEMES } from '../story/cabin.js';
import * as THREE from 'three';
import { cabinGlassOpacity } from '../story/story.js';
import gsap from 'gsap';
import { useThree, useFrame, addAfterEffect } from '@react-three/fiber';

/**
 * Mounts the single car instance.  The same object graph is reused for the
 * opening reveal, the story and free exploration — never re-loaded, never cloned.
 */
export function CarModel({ gltf, stateRef, paint, cabin, onFirstFrame }) {
  const gl = useThree((s) => s.gl);
  const camera = useThree((s) => s.camera);
  const scene = useThree((s) => s.scene);
  const reported = useRef(false);
  const paintMaterial = useRef(null);

  const windowMesh = gltf.scene.getObjectByName('RearDoorGlass__Glass_0');
  const glassRef = useRef(null);
  useEffect(() => {
    if (!windowMesh?.material || Array.isArray(windowMesh.material)) return undefined;
    const original = windowMesh.material;
    const faded = original.clone();
    faded.transparent = true;
    faded.depthWrite = false;
    glassRef.current = { original, faded };
    return () => {
      windowMesh.visible = true;
      windowMesh.material = original;
      faded.dispose();
      glassRef.current = null;
    };
  }, [windowMesh]);

  useFrame(() => {
    if (!glassRef.current || !windowMesh) return;
    const opacity = cabinGlassOpacity(stateRef.current.smooth);
    const { original, faded } = glassRef.current;
    windowMesh.visible = opacity > 0.001;
    windowMesh.material = opacity >= .999 ? original : faded;
    faded.opacity = opacity;
  });

  // The instrument cover shares the dark exterior glass material in the GLB.
  // Give this one interior surface a clear, thin cover to reveal the gauge texture.
  useEffect(() => {
    const cover = gltf.scene.getObjectByName('SpeedoGlass_Glass_0');
    if (!cover?.material || Array.isArray(cover.material)) return undefined;
    const original = cover.material;
    const clear = original.clone();
    clear.color.set('#c5c9ca');
    clear.transmission = 0;
    clear.transparent = true;
    clear.opacity = .12;
    clear.depthWrite = false;
    cover.material = clear;
    return () => { cover.material = original; clear.dispose(); };
  }, [gltf]);

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

  const cabinTargets = useMemo(() => {
    if (!gltf) return [];
    const names = new Set(CABIN_MATERIALS.map((n) => n.toLowerCase()));
    const found = new Map();
    gltf.scene.traverse((obj) => {
      if (!obj.isMesh) return;
      const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
      mats.forEach((m) => {
        if (m && names.has((m.name || '').toLowerCase()) && !found.has(m.name)) {
          found.set(m.name, m);
        }
      });
    });
    return [...found.values()];
  }, [gltf]);

  // Remember the untouched colours once, so switching back is exact.
  useEffect(() => {
    cabinTargets.forEach((m) => {
      if (!m.userData.__baseColor) m.userData.__baseColor = m.color.clone();
    });
  }, [cabinTargets]);

  useEffect(() => {
    if (!cabin) return undefined;
    const theme = CABIN_THEMES.find((item) => item.id === cabin);
    if (!theme) return undefined;
    const tweenValues = (mat, hex) => {
      const base = mat.userData.__baseColor || mat.color;
      const target = hex ? new THREE.Color(hex) : base;
      gsap.to(mat.color, {
        r: target.r,
        g: target.g,
        b: target.b,
        duration: 0.7,
        ease: 'power2.inOut',
        overwrite: true,
      });
    };
    cabinTargets.forEach((mat) => {
      const name = (mat.name || '').toLowerCase();
      if (name === 'front_seat' || name === 'rear_seats') tweenValues(mat, theme.seat);
      else if (name === 'dashboard') tweenValues(mat, theme.dash);
      else tweenValues(mat, theme.panel);
    });
    return undefined;
  }, [cabin, cabinTargets]);

  useEffect(() => {
    if (!gltf || reported.current) return undefined;
    let alive = true;
    let compiled = false;
    const first = gl.info.render.frame;
    // Compile the complete scene with its studio environment while masked.
    Promise.resolve(gl.compileAsync(scene, camera)).then(() => { compiled = true; }).catch((e) => {
      console.error('Unable to prepare car shaders', e);
    });
    const remove = addAfterEffect(() => {
      if (!alive || !compiled || reported.current || gl.info.render.frame <= first + 1 || gl.info.render.calls === 0) return;
      // Once only, under the curtain: wait for the submitted frame to finish.
      gl.getContext().finish();
      reported.current = true;
      onFirstFrame?.(gltf.scene.uuid);
      if (import.meta.env.DEV) window.__S90Ready = { modelId: gltf.scene.uuid, frame: gl.info.render.frame, shaderPrepared: true, firstFrameReady: true };
    });
    return () => { alive = false; remove(); };
  }, [gltf, gl, scene, camera, onFirstFrame]);

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

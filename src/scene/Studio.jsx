import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { useThree } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei';

function makeStudioEnv() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  const bg = ctx.createLinearGradient(0, 0, 0, 512);
  bg.addColorStop(0, '#fdfdfb');
  bg.addColorStop(0.38, '#d9d5cd');
  bg.addColorStop(0.52, '#9a958c');
  bg.addColorStop(0.72, '#4a4741');
  bg.addColorStop(1, '#171614');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 1024, 512);

  const softbox = (x, y, rx, ry, color, alpha) => {
    const grad = ctx.createRadialGradient(x, y, 0, x, y, Math.max(rx, ry));
    grad.addColorStop(0, color);
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  // Overhead strip + two side softboxes, the classic car-studio reflection set.
  softbox(512, 44, 420, 70, '#ffffff', 0.9);
  softbox(232, 150, 190, 120, '#ffffff', 0.72);
  softbox(800, 168, 150, 96, '#fff6e6', 0.55);
  softbox(120, 300, 120, 60, '#ffe6c4', 0.28);
  softbox(900, 320, 140, 70, '#dfe9f5', 0.22);

  const texture = new THREE.CanvasTexture(canvas);
  texture.mapping = THREE.EquirectangularReflectionMapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

/** Studio lighting, procedural environment map and grounded contact shadow. */
export function Studio({ ready }) {
  const { scene, gl } = useThree();

  const env = useMemo(() => makeStudioEnv(), []);

  useEffect(() => {
    scene.environment = env;
    scene.environmentIntensity = 1.05;
    return () => {
      if (scene.environment === env) scene.environment = null;
      env.dispose();
    };
  }, [scene, env]);

  useEffect(() => {
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.04;
  }, [gl]);

  return (
    <>
      <ambientLight intensity={0.18} />
      <directionalLight position={[-6, 8, 6]} intensity={2.4} color="#fff7ea" />
      <directionalLight position={[7, 4.5, -3]} intensity={1.0} color="#e7eef8" />
      <directionalLight position={[0, 3.5, -9]} intensity={1.6} color="#ffffff" />
      <directionalLight position={[0, 1.2, 9]} intensity={0.5} color="#fff2df" />
      {ready ? (
        <ContactShadowLayer />
      ) : null}
    </>
  );
}

function ContactShadowLayer() {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(128, 128, 8, 128, 128, 126);
    grad.addColorStop(0, 'rgba(23,20,16,0.55)');
    grad.addColorStop(0.42, 'rgba(23,20,16,0.3)');
    grad.addColorStop(0.72, 'rgba(23,20,16,0.09)');
    grad.addColorStop(1, 'rgba(23,20,16,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);

  useEffect(() => () => texture.dispose(), [texture]);

  return (
    <>
      <mesh position={[0, 0.004, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={-1}>
        <planeGeometry args={[6.6, 3.4]} />
        <meshBasicMaterial
          map={texture}
          transparent
          opacity={0.9}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <ContactShadows
        position={[0, 0.006, 0]}
        scale={7}
        resolution={1024}
        far={2.4}
        blur={2.4}
        opacity={0.55}
        color="#171410"
        frames={2}
      />
    </>
  );
}

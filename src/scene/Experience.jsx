import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { Studio } from './Studio.jsx';
import { CarModel } from './CarModel.jsx';
import { CameraSystem } from './CameraSystem.jsx';
import SceneRegistration from '../sketch/SceneRegistration.jsx';

function HotspotProjector({ items, outRef }) {
  const { camera, size } = useThree();
  const v = new THREE.Vector3();
  const n = new THREE.Vector3();
  const dir = new THREE.Vector3();

  useFrame(() => {
    const w = size.width;
    const h = size.height;
    for (let i = 0; i < items.length; i += 1) {
      const item = items[i];
      v.fromArray(item.pos);
      n.fromArray(item.normal);
      dir.copy(camera.position).sub(v).normalize();
      const facing = n.dot(dir) > -0.02;
      v.project(camera);
      const x = (v.x * 0.5 + 0.5) * w;
      const y = (-v.y * 0.5 + 0.5) * h;
      const visible =
        facing && v.z > -1 && v.z < 1 && x > 10 && x < w - 10 && y > 10 && y < h - 10;
      const entry = outRef.current[i];
      if (entry) {
        entry.x = x;
        entry.y = y;
        entry.visible = visible;
      }
    }
  });

  return null;
}

export default function Experience({
  asset,
  paint,
  cabin,
  stateRef,
  explore,
  api,
  hotspots,
  projected,
  onFirstFrame,
  onContextLost,
}) {
  return (
    <Canvas
      className="scene"
      dpr={[1, 1.8]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      camera={{ fov: 31, near: 0.05, far: 400, position: [-16, 1.5, 6] }}
      onCreated={({ gl, scene }) => {
        gl.setClearColor(0x000000, 0);
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        if (import.meta.env.DEV) { window.__scene = scene; window.__S90Renderer = gl; }
        gl.domElement.addEventListener(
          'webglcontextlost',
          (event) => {
            event.preventDefault();
            onContextLost?.();
          },
          false,
        );
      }}
    >
      <Studio ready={asset.status === 'ready'} stateRef={stateRef} />
      {asset.gltf ? (
        <CarModel gltf={asset.gltf} stateRef={stateRef} paint={paint} cabin={cabin} onFirstFrame={onFirstFrame} onFrameError={onContextLost} />
      ) : null}
      <CameraSystem stateRef={stateRef} explore={explore} api={api} />
      <SceneRegistration stateRef={stateRef} />
      <HotspotProjector items={hotspots} outRef={projected} />
    </Canvas>
  );
}

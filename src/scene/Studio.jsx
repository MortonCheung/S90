import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei';

// Original studio: a long overhead softbox and two vertical fill strips.
// HDR values are generated locally; no third-party environment photography.
function makeEnvironment(gl, profile) {
  const stage = new THREE.Scene();
  stage.background = new THREE.Color('#55534f');
  const box = (position, scale, brightness) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(...scale), new THREE.MeshBasicMaterial({color:new THREE.Color(brightness, brightness, brightness), side:THREE.DoubleSide}));
    m.position.set(...position); m.lookAt(0, 0, 0); stage.add(m);
  };
  box([-3,5,0], [3.6,12], profile === 'soft' ? 2 : 4);
  box([-5,1.8,-1], [2.0,9], profile === 'contrast' ? 3.0 : 1.9);
  box([5,2,1], [1.4,8], profile === 'soft' ? 1.6 : .9);
  box([0,2,-7], [5,2], 1.4);
  const generator = new THREE.PMREMGenerator(gl);
  const target = generator.fromScene(stage, .035, .1, 100);
  stage.traverse(o=>{o.geometry?.dispose();o.material?.dispose()});generator.dispose();
  return target;
}

export function Studio({ ready }) {
  const { scene, gl } = useThree();
  const profile = import.meta.env.DEV ? new URLSearchParams(location.search).get('studio') || 'balanced' : 'balanced';
  const env = useMemo(()=>makeEnvironment(gl,profile),[gl,profile]);
  useEffect(()=>{scene.environment=env.texture;scene.environmentIntensity=1;return()=>{if(scene.environment===env.texture)scene.environment=null;env.dispose()}},[scene,env]);
  useEffect(()=>{gl.toneMapping=THREE.ACESFilmicToneMapping;gl.toneMappingExposure=.95},[gl]);
  return <>
    <ambientLight intensity={.25}/>
    <directionalLight position={[-5,8,4]} intensity={1.4} color="#fffcf7"/>
    <directionalLight position={[4,3,-6]} intensity={.7} color="#eef1f3"/>
    {ready && <GroundingShadow/>}
    {ready && <ContactShadows position={[0,.023,0]} scale={[3.2,6.4]} resolution={1024} far={2} blur={2} opacity={.62} color="#383731" frames={2}/>}
  </>;
}

function GroundingShadow() {
  const texture=useMemo(()=>{
    const c=document.createElement('canvas');c.width=256;c.height=512;
    const ctx=c.getContext('2d');ctx.scale(1,2);
    const g=ctx.createRadialGradient(128,128,18,128,128,128);
    g.addColorStop(0,'rgba(35,33,29,.45)');g.addColorStop(.6,'rgba(35,33,29,.25)');g.addColorStop(1,'rgba(35,33,29,0)');ctx.fillStyle=g;ctx.fillRect(0,0,256,256);
    return new THREE.CanvasTexture(c);
  },[]);
  useEffect(()=>()=>texture.dispose(),[texture]);
  return <mesh position={[0,.021,0]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[2.8,6]}/><meshBasicMaterial map={texture} transparent depthWrite={false} toneMapped={false}/></mesh>;
}

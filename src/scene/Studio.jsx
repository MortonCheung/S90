import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useThree, useFrame } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei';
import { sampleScene } from '../journey/SceneOrchestrator.js';

// Original studio: a long overhead softbox and two vertical fill strips.
// HDR values are generated locally; no third-party environment photography.
function makeEnvironment(gl, profile) {
  const stage = new THREE.Scene();
  stage.background = new THREE.Color('#8e9490');
  const box = (position, scale, brightness) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(...scale), new THREE.MeshBasicMaterial({color:new THREE.Color(brightness, brightness, brightness), side:THREE.DoubleSide}));
    m.position.set(...position); m.lookAt(0, 0, 0); stage.add(m);
  };
  box([-1,6,0], [3.0,10], profile === 'soft' ? 1.5 : 2.4);
  box([-4,3.6,-1], [.85,10], profile === 'contrast' ? 4 : 3.2);
  box([5,2.6,1], [1.2,8], profile === 'soft' ? 1.6 : 1.2);
  box([0,2.5,-7], [4,2.5], 1.6);
  // Dark flags separate broad softbox reflections and reveal body curvature.
  box([-5,.4,0], [1,10], .015);
  const generator = new THREE.PMREMGenerator(gl);
  const target = generator.fromScene(stage, .035, .1, 100);
  stage.traverse(o=>{o.geometry?.dispose();o.material?.dispose()});generator.dispose();
  return target;
}

const LIGHTS=[['#fff0db',1.15,'#e0ebf0',.62],['#fffefa',1.25,'#e5edf1',.7],['#fff0dc',1.2,'#e9e5e0',.6],['#ffdfbd',1.05,'#d8e0eb',.62]];
const LIGHT_COLORS=LIGHTS.map(([key,,fill])=>[new THREE.Color(key),new THREE.Color(fill)]);

export function Studio({ ready, stateRef }) {
  const { scene, gl } = useThree();
  const key=useRef();const fill=useRef();
  const profile = import.meta.env.DEV ? new URLSearchParams(location.search).get('studio') || 'balanced' : 'balanced';
  useEffect(()=>{
    const env=makeEnvironment(gl,profile);scene.environment=env.texture;scene.environmentIntensity=1;
    return()=>{if(scene.environment===env.texture)scene.environment=null;env.dispose();};
  },[scene,gl,profile]);
  useEffect(()=>{gl.toneMapping=THREE.ACESFilmicToneMapping;gl.outputColorSpace=THREE.SRGBColorSpace;gl.toneMappingExposure=.92},[gl]);
  useFrame(()=>{
    if(!key.current||!fill.current)return;
    const {scenes}=stateRef.current.sceneState??sampleScene(stateRef.current.smooth,null,true);
    key.current.color.setRGB(0,0,0);fill.current.color.setRGB(0,0,0);
    key.current.intensity=0;fill.current.intensity=0;
    scenes.forEach((scene,index)=>{
      for(const channel of ['r','g','b']){
        key.current.color[channel]+=LIGHT_COLORS[index][0][channel]*scene.weight;
        fill.current.color[channel]+=LIGHT_COLORS[index][1][channel]*scene.weight;
      }
      key.current.intensity+=LIGHTS[index][1]*scene.weight;
      fill.current.intensity+=LIGHTS[index][3]*scene.weight;
    });
  });
  return <>
    <ambientLight intensity={.25}/>
    <directionalLight ref={key} position={[-5,8,4]} intensity={1.15} color="#fff0db"/>
    <directionalLight ref={fill} position={[4,3,-6]} intensity={.62} color="#e0ebf0"/>
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

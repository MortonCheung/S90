import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { sampleCamera } from '../story/story.js';
import { clamp } from '../lib/math.js';

// Observe the existing camera. This component never writes a camera or car pose.
export default function SceneRegistration({ stateRef }) {
  const vectors=useMemo(()=>({
    anchor:new THREE.Vector3(),direction:new THREE.Vector3(),forward:new THREE.Vector3(),
    right:new THREE.Vector3(),up:new THREE.Vector3(),delta:new THREE.Vector3(),referencePosition:new THREE.Vector3(),
  }),[]);
  const referenceRef=useRef({aspect:0,pose:null});
  useEffect(()=>{
    if(!import.meta.env.DEV) return undefined;
    window.__S90Registration=()=>stateRef.current.registration;
    return ()=>{delete window.__S90Registration;};
  },[stateRef]);
  useFrame(({camera})=>{
    const {anchor,direction,forward,right,up,delta,referencePosition}=vectors;
    if(referenceRef.current.aspect!==camera.aspect) {
      referenceRef.current={aspect:camera.aspect,pose:sampleCamera(.075,camera.aspect)};
    }
    const reference=referenceRef.current.pose;
    referencePosition.fromArray(reference.pos);
    const referenceDistance=referencePosition.length();
    forward.fromArray(reference.target).sub(referencePosition).normalize();
    right.crossVectors(forward,THREE.Object3D.DEFAULT_UP).normalize();
    up.crossVectors(right,forward);
    delta.set(0,.022,0).sub(referencePosition);
    const depth=delta.dot(forward);
    const tangent=Math.tan(THREE.MathUtils.degToRad(reference.fov/2));
    const referenceX=.5+delta.dot(right)/(2*depth*tangent*camera.aspect);
    const referenceY=.5-delta.dot(up)/(2*depth*tangent);
    const referenceHorizon=.5+forward.y/(2*Math.hypot(forward.x,forward.z)*tangent);
    anchor.set(0,.022,0).project(camera);
    const x=(anchor.x+1)/2, y=(1-anchor.y)/2;
    camera.getWorldDirection(direction);
    const currentTangent=Math.tan(THREE.MathUtils.degToRad(camera.fov/2));
    const horizon=.5+direction.y/(2*Math.hypot(direction.x,direction.z)*currentTangent);
    const cameraDistance=camera.position.length();
    const scale=clamp(referenceDistance/Math.max(.1,cameraDistance)*tangent/currentTangent,.65,1.8);
    const yaw=Math.atan2(camera.position.x,camera.position.z)-Math.atan2(reference.pos[0],reference.pos[2]);
    const shiftX=clamp((x-referenceX)*1600-Math.sin(yaw)*100,-200,200);
    const shiftY=clamp(((y-referenceY)*.65+(horizon-referenceHorizon)*.35)*900,-180,180);
    const registration={anchor:[x,y],horizon,scale,shiftX,shiftY,vehiclePosition:[0,0,0],vehicleSpeed:0};
    stateRef.current.registration=registration;
    stateRef.current.registerScene?.(registration);
  });
  return null;
}

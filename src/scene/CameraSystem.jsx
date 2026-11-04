import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { clamp } from '../lib/math.js';
import { sampleCamera } from '../story/story.js';

const _pos = new THREE.Vector3();
const _body = new THREE.Vector3(0, 0.72, 0);
const _tgt = new THREE.Vector3();
const _offset = new THREE.Vector3();
const _look = new THREE.Vector3();

const easeInOutCubic = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/**
 * Single owner of the main camera.  Scroll drives the shot; the same camera is
 * handed to OrbitControls at the end of the story and taken back on exit, with
 * a short blend so neither transition is a cut.
 */
export function CameraSystem({ stateRef, explore, api }) {
  const { camera, size } = useThree();
  const controlsRef = useRef(null);
  const sizeRef = useRef(size);
  sizeRef.current = size;

  const blend = useRef({
    active: false,
    t: 0,
    fromPos: new THREE.Vector3(),
    fromTarget: new THREE.Vector3(),
  });
  const wasExplore = useRef(false);
  const tweening = useRef(false);

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;
    controls.target.set(0, 0.68, 0);
  }, []);

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    if (explore && !wasExplore.current) {
      controls.target.set(0, 0.68, 0);
      controls.enabled = true;
      controls.update();
    } else if (!explore && wasExplore.current) {
      gsap.killTweensOf(camera.position);
      gsap.killTweensOf(controls.target);
      tweening.current = false;
      blend.current.active = true;
      blend.current.t = 0;
      blend.current.fromPos.copy(camera.position);
      blend.current.fromTarget.copy(controls.target);
      controls.enabled = false;
    }
    wasExplore.current = explore;
  }, [explore, camera]);

  useEffect(() => {
    if (!api) return undefined;
    const controls = controlsRef.current;
    if (!controls) return undefined;

    const kill = () => {
      gsap.killTweensOf(camera.position);
      gsap.killTweensOf(controls.target);
    };

    const moveTo = (targetPos, targetLook, duration = 1.0) => {
      kill();
      tweening.current = true;
      controls.enabled = false;
      gsap.to(controls.target, {
        x: targetLook.x,
        y: targetLook.y,
        z: targetLook.z,
        duration,
        ease: 'power3.inOut',
        onUpdate: () => camera.lookAt(controls.target),
      });
      gsap.to(camera.position, {
        x: targetPos.x,
        y: targetPos.y,
        z: targetPos.z,
        duration,
        ease: 'power3.inOut',
        onUpdate: () => camera.lookAt(controls.target),
        onComplete: () => {
          tweening.current = false;
          controls.enabled = true;
          controls.update();
        },
      });
    };

    api.current = {
      zoom(factor) {
        if (!explore) return;
        _offset.copy(camera.position).sub(controls.target);
        _offset.setLength(clamp(_offset.length() * factor, 4.2, 26));
        _pos.copy(controls.target).add(_offset);
        moveTo(_pos.clone(), controls.target.clone(), 0.7);
      },
      reset() {
        if (!explore) return;
        const aspect = sizeRef.current.width / Math.max(1, sizeRef.current.height);
        const pose = sampleCamera(1, aspect);
        moveTo(
          new THREE.Vector3(...pose.pos),
          new THREE.Vector3(...pose.target),
          1.1,
        );
      },
      focus(hotspotPos) {
        if (!explore) return;
        // Keep some context around the part: aim slightly towards the body
        // centre and stand back far enough that the car is not sliced.
        _look.set(...hotspotPos).lerp(_body, 0.3);
        _offset.copy(camera.position).sub(_look);
        if (_offset.lengthSq() < 1e-4) _offset.set(-1, 0.4, 0.4);
        _offset.setLength(6.0);
        _offset.y = Math.max(_offset.y, 1.05);
        _pos.copy(_look).add(_offset);
        moveTo(_pos.clone(), _look.clone(), 1.1);
      },
      isBusy: () => tweening.current,
    };

    return () => {
      kill();
      api.current = {};
    };
  }, [api, camera, explore]);

  useEffect(() => {
    if (!import.meta.env.DEV) return undefined;
    window.__S90Shot = () => ({ progress:stateRef.current.smooth, position:camera.position.toArray(), quaternion:camera.quaternion.toArray(), target:_tgt.toArray(), fov:camera.fov, aspect:camera.aspect, owner:explore?'orbit':blend.current.active?'blend':'story', targetNdc:_tgt.clone().project(camera).toArray() });
    return () => { delete window.__S90Shot; };
  }, [camera, explore, stateRef]);

  useFrame((_, delta) => {
    const controls = controlsRef.current;
    if (explore) {
      if (controls && !tweening.current) controls.update();
      return;
    }

    const { width, height } = sizeRef.current;
    const aspect = width / Math.max(1, height);
    const detailFactor = stateRef.current.detailFactor || 0;
    const pose = sampleCamera(stateRef.current.smooth, aspect);

    _pos.fromArray(pose.pos);
    _tgt.fromArray(pose.target);

    // Push back slightly while a detail panel is open so nothing is cropped.
    const narrow = aspect < 0.85;
    _pos.lerpVectors(_tgt, _pos, 1 + 0.055 * detailFactor + (narrow ? 0.16 * detailFactor : 0));

    if (blend.current.active) {
      blend.current.t += Math.min(delta, 0.05) / 0.85;
      const e = easeInOutCubic(clamp(blend.current.t));
      _pos.lerpVectors(blend.current.fromPos, _pos, e);
      _tgt.lerpVectors(blend.current.fromTarget, _tgt, e);
      if (blend.current.t >= 1) blend.current.active = false;
    }

    camera.position.copy(_pos);
    camera.lookAt(_tgt);

    if (camera.isPerspectiveCamera) {
      if (Math.abs(camera.fov - pose.fov) > 0.002) camera.fov = pose.fov;
      camera.updateProjectionMatrix();

      // Lens shift instead of rotating towards the text panel: the car stays
      // exactly as framed shot-wise, but occupies the free column.
      const isNarrow = width <= 820;
      camera.projectionMatrix.elements[8] += (isNarrow ? 0.12 : 0.325) * detailFactor;
      camera.projectionMatrix.elements[9] += (isNarrow ? -0.24 : 0) * detailFactor;
      camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enabled={explore}
      enablePan={false}
      enableZoom={false}
      enableDamping
      dampingFactor={0.07}
      rotateSpeed={0.55}
      minDistance={4.2}
      maxDistance={26}
      minPolarAngle={0.32}
      maxPolarAngle={1.53}
    />
  );
}

import { useLayoutEffect, useRef } from 'react';
import { smoothstep } from '../lib/math.js';
import { ACTS } from '../journey/acts.js';
import { sampleScene, SCENE_COLORS } from '../journey/SceneOrchestrator.js';
import { measurePaths, schedulePaths, renderPaths } from './lineGrowth.js';
import residence from './scenes/residence.svg?raw';
import city from './scenes/city.svg?raw';
import arrival from './scenes/arrival.svg?raw';
import road from './scenes/road.svg?raw';

const SOURCES = { residence, city, arrival, road };

export default function SketchScenes({ stateRef }) {
  const worldRef = useRef(null);
  useLayoutEffect(() => {
    const world = worldRef.current;
    const elements = [...world.children];
    const plans = elements.map(element => schedulePaths(measurePaths(element)));
    const washes = elements.map(element => [...element.querySelectorAll('[data-wash]:not([data-wash="paper"])')]);
    const root = document.documentElement;
    const previousColors = SCENE_COLORS.map(name => [`--sketch-${name}`,root.style.getPropertyValue(`--sketch-${name}`)]);
    let viewport = {width:world.clientWidth,height:world.clientHeight};
    let previous = '';
    const observer = new ResizeObserver(() => {
      viewport = {width:world.clientWidth,height:world.clientHeight};
      previous = '';
    });
    observer.observe(world);
    const render = (progress,ready) => {
      const key = `${progress}:${ready}:${viewport.width}:${viewport.height}`;
      if (key === previous) return;
      previous = key;
      const state = sampleScene(progress,viewport,ready);
      world.style.visibility = state.visible ? 'visible' : 'hidden';
      world.dataset.act = state.act.id;
      for (const [name,value] of state.colors) root.style.setProperty(name,value);
      state.scenes.forEach((scene,index) => {
        elements[index].style.opacity = String(scene.weight);
        elements[index].dataset.draw = scene.draw.toFixed(5);
        const ink = renderPaths(plans[index],scene.draw);
        scene.visibleLength = ink.visibleLength;
        // Flat architectural tones arrive behind drawn structure, never as an ink mask.
        for (const wash of washes[index]) wash.style.opacity = String(smoothstep(.3,1,scene.draw));
      });
      stateRef.current.sceneState = state;
    };
    stateRef.current.renderScene = render;
    render(stateRef.current.smooth,false);
    if (import.meta.env.DEV) window.__S90Scenes = () => stateRef.current.sceneState;
    return () => {
      observer.disconnect();
      if (stateRef.current.renderScene === render) delete stateRef.current.renderScene;
      for (const [name,value] of previousColors) {
        if(value) root.style.setProperty(name,value);
        else root.style.removeProperty(name);
      }
      if (import.meta.env.DEV) delete window.__S90Scenes;
    };
  },[stateRef]);

  return <div className="sketch-world" ref={worldRef} aria-hidden="true">
    {ACTS.map(act => <div className="sketch-layer" data-scene={act.sceneId} key={act.id}
      dangerouslySetInnerHTML={{__html:SOURCES[act.sceneId]}} />)}
  </div>;
}

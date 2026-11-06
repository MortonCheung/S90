export function getLoadingVisual({ status, progress, total, firstFrameReady }) {
  if (status === 'error') return { state: 'error', fraction: 0, label: '载入失败' };
  if (status === 'ready') return firstFrameReady
    ? { state: 'ready', fraction: 1, label: '资源已就绪' }
    : { state: 'preparing', fraction: null, label: '正在准备画面' };
  if (!(total > 0)) return { state: 'indeterminate', fraction: null, label: '正在载入' };
  return { state: 'loading', fraction: Math.min(1, Math.max(0, progress || 0)), label: '正在载入' };
}

export function getOpeningPhase({status,firstFrameReady,drawn,revealing=false,opened=false}) {
  if(status==='error') return 'error';
  if(opened) return 'opened';
  if(revealing) return 'revealing';
  if(status!=='ready') return 'loading-model';
  if(!firstFrameReady) return 'compiling';
  if(!drawn) return 'line-drawing';
  return 'ready';
}

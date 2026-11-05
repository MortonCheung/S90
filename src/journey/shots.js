export const SHOTS = [
  { id:'whole', actId:'morning', focusPart:'vehicle', from:.069, to:.145, pos:[-4.8,1.65,5.7], target:[0,.69,.14], fov:31, whole:true },
  { id:'lamp', actId:'morning', focusPart:'front-light', from:.187, to:.228, pos:[-2.72,1.13,4.28], target:[-.63,.74,2.19], fov:29 },
  { id:'wheel', actId:'day', focusPart:'front-wheel', from:.318, to:.358, pos:[-2.81,.73,2.43], target:[-.91,.40,1.58], fov:31 },
  { id:'profile', actId:'day', focusPart:'shoulder-line', from:.448, to:.488, pos:[-8.5,.89,.05], target:[0,.71,.05], fov:29, whole:true },
  { id:'cabin-approach', actId:'afternoon', focusPart:'side-window', from:.549, to:.553, pos:[-2.50,1.22,-.40], target:[-.65,1.19,-.40], fov:34, cabin:true },
  { id:'cabin-window', actId:'afternoon', focusPart:'entry', from:.573, to:.573, pos:[-.65,1.18,-.40], target:[-.05,1.05,.30], fov:52, near:.018, cabin:true },
  { id:'cabin-dashboard', actId:'afternoon', focusPart:'dashboard', from:.588, to:.607, pos:[-.23,1.18,-.65], target:[.06,.96,.87], fov:63, near:.018, cabin:true },
  { id:'cabin-seats', actId:'afternoon', focusPart:'front-seats', from:.618, to:.626, pos:[-.03,1.13,-.56], target:[.08,.78,.76], fov:65, near:.018, cabin:true },
  { id:'cabin-return-window', actId:'afternoon', focusPart:'exit', from:.650, to:.650, pos:[-.65,1.18,-.40], target:[-.05,1.05,.30], fov:52, near:.018, cabin:true },
  { id:'cabin-exterior', actId:'afternoon', focusPart:'side-window', from:.675, to:.675, pos:[-2.50,1.22,-.40], target:[-.65,1.19,-.40], fov:34, cabin:true },
  { id:'rear', actId:'evening', focusPart:'tail-light', from:.703, to:.738, pos:[-3.28,1.42,-4.85], target:[-.42,.73,-1.93], fov:32 },
  { id:'explore', actId:'evening', focusPart:'whole-vehicle', from:.91, to:1, pos:[-6.2,2.08,-5.45], target:[0,.68,0], fov:31, whole:true },
];

export const SHOT_ANCHORS = SHOTS.map(shot => ({
  id:shot.id, actId:shot.actId, focusPart:shot.focusPart,
  holdRange:[shot.from,shot.to], at:(shot.from+shot.to)/2,
  pos:shot.pos, target:shot.target, fov:shot.fov,
}));

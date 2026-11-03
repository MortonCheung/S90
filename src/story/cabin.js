/**
 * Concept interior colourways.  These are visual studies, not Volvo factory
 * options: the base GLB ships a single grey leather, and the second theme is a
 * colour study applied to the existing leather / trim textures.
 */
export const CABIN_THEMES = [
  {
    id: 'graphite',
    label: '石墨',
    en: 'GRAPHITE',
    swatch: '#4b4c49',
    seat: null,
    panel: null,
    dash: null,
  },
  {
    id: 'cognac',
    label: '暖棕',
    en: 'COGNAC',
    swatch: '#a97c55',
    seat: '#b0835c',
    panel: '#7c5c43',
    dash: '#5d4736',
  },
];

export const CABIN_MATERIALS = [
  'Front_Seat',
  'Rear_Seats',
  'DoorPanelFront',
  'DoorPanelRear',
  'CenterConsole',
  'Dashboard',
];

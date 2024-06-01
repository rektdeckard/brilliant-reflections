
export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 300;

export const C = 3.5; // The speed of light, for our purposes :)
export const PHOTON_RADIUS = 6; // The photon's radius
export const DETECTOR_RADIUS = 14; // The photon's radius
export const OBJECT_RADIUS = 14; // The photon's radius
export const WALL_THICKNESS = 4;

export const Color = {
  DEBUG: [255, 128, 0],
  FLOOR: [228, 228, 228],
  MIRROR: [56, 122, 240],
  OBJECT: [225, 80, 60],
  RAY: [225, 80, 60],
  WALL: [83, 83, 83],
  SUCCESS: [21, 180, 65],
} as const;

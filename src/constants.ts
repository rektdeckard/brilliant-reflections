
export const CANVAS_WIDTH = 400;
export const CANVAS_HEIGHT = 400;

export const C = 3.5; // The speed of light, for our purposes :)
export const PHOTON_RADIUS = 6; // The photon's radius
export const DETECTOR_RADIUS = 20; // The photon's radius
export const WALL_THICKNESS = 6;

export const Color = {
  DEBUG: [255, 128, 0],
  FLOOR: [220],
  MIRROR: [20, 20, 240],
  RAY: [255, 0, 0],
  WALL: [20],
} as const;

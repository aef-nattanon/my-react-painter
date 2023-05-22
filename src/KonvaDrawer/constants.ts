export type DrawnLine = {
  points: number[];
  color: string;
  width: number;
  tool: string;
  opacity: number;
};

export type Size = {
  // original
  sceneWidth: number;
  sceneHeight: number;

  // responsive
  stageWidth: number;
  stageHeight: number;

  // original scale
  scale: number;
};

export type Point = {
  x: number;
  y: number;
};

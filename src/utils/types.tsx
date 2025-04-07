export interface ImageDisplayProps {
  mapID: number;
}

export interface Line {
  start: {x: number; y:number};
  end: {x: number; y:number};
  length: number;
  color: string;
  index: number;
}

interface BaseDot{
  id: number;
  lineIndex: number;
  positionPx: number;
  color:string;
}
export interface Calibration extends BaseDot{
  positionM?: number;
}

export interface Zone extends BaseDot{
  absPositionPx?: number;
  positionAbsM?: number;
  zoneDistance?: number;
}
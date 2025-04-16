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
  positionMeters?: number;
}

export interface Zone extends BaseDot{
  positionPxAbsolute?: number;
  positionMetersAbsolute?: number;
  zoneDistance?: number;
}
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
  positionZoneEndPixelsAbsolute?: number;
  positionZoneStartPixelsAbsolute?: number;
  positionZoneEndMetersAbsolute?: number;
  positionZoneStartMetersAbsolute?: number;
  positionZoneTotalLengthMeters?: number;
  positionZoneTotalLengthPixels ?: number;
}
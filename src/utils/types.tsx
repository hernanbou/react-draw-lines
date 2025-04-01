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

export interface Dot{
  id: number;
  lineIndex: number;
  positionPx: number;
  absPositionPx?: number;
  positionM?: number;
  positionAbsM?: number;
  zoneID?:number;
  color:string;
  zoneDistance?: number;
}
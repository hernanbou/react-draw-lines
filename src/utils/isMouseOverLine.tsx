import {Line} from '../utils/types'

export const isMouseOverLine = (x: number, y: number, line: Line): boolean => {
    const distance = Math.sqrt(Math.pow(line.end!.x - line.start!.x, 2) + Math.pow(line.end!.y - line.start!.y, 2));
    const distanceToStart = Math.sqrt(Math.pow(x - line.start!.x, 2) + Math.pow(y - line.start!.y, 2));
    const distanceToEnd = Math.sqrt(Math.pow(x - line.end!.x, 2) + Math.pow(y - line.end!.y, 2));
    
    return Math.abs(distance - (distanceToStart + distanceToEnd)) < 0.01; //precisão de proximidade do mouse em relação ao vetor 
    }; 
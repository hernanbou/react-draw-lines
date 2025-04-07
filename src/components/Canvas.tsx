import React, { useRef, useState, useEffect, useCallback } from 'react';
import '../styles/canvas.scss';

import {drawPerpendicularLine, convertPxToMeters, calculateLineLength} from '../utils/calculations';
import {isMouseOverLine} from '../utils/isMouseOverLine'
import {Calibration, Zone, Line, ImageDisplayProps} from '../utils/types'
import {saveLines, saveDots, saveZones} from '../utils/savesUtils'

const Canvas: React.FC<ImageDisplayProps> = ({ mapID }) => {

  const [lines, setLines] = useState<Line[]>([]);
  const [calibrationPoint, setCalibrationPoint] = useState<Calibration[]>([]);
  const [zoneList, setZoneList] = useState<Zone[]>([]);
  const [currentStart, setCurrentStart] = useState<{ x: number; y: number } | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [currentColor, setCurrentColor] = useState<string>('#D80300');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [triggerRedraw, setTriggerRedraw] = useState<boolean>(false);
  const [zoneState, setZoneState] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const prevLinesLength = useRef<number>(0);
  
  const redrawCanvas = (tempLine?: { start: { x: number; y: number }; end: { x: number; y: number }; color: string }) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const image = new Image();
    image.src = imageUrl;
    image.crossOrigin = 'anonymous';

    image.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpa o canvas
        ctx.drawImage(image, 0, 0); // Redesenha a imagem

        // desenha todos os vetores
        lines.forEach(({ start, end, color = '#D80300' }) => {
            if (start && end) {
                ctx.beginPath();
                ctx.moveTo(start.x, start.y);
                ctx.lineTo(end.x, end.y);
                ctx.strokeStyle = color;
                ctx.lineWidth = 3;
                ctx.stroke();
            }
        });

        // desenha os pontos finais dos vetores
        lines.forEach(({ end }) => {
            if (end) {
                ctx.beginPath();
                ctx.arc(end.x, end.y, 4, 0, Math.PI * 2);
                ctx.fillStyle = '#FDEE2F';
                ctx.fill();
            }
        });

        // desenha os pontos de calibracao
        calibrationPoint.forEach(({ lineIndex, positionPx }) => {
            const line = lines[lineIndex];
            if (line.start && line.end) {
                const { x: startX, y: startY } = line.start;
                const { x: endX, y: endY } = line.end;
                const ratio = positionPx / line.length;
                const pointX = startX + (endX - startX) * ratio;
                const pointY = startY + (endY - startY) * ratio;
                
                ctx.beginPath();
                ctx.arc(pointX, pointY, 4, 0, Math.PI * 2);
                ctx.fillStyle = '#4B0082';
                ctx.fill();
            }
        });

        // desenha as traves perpendiculares
        zoneList.forEach(({ lineIndex, positionPx }) => {
            const line = lines[lineIndex];
            if (line.start && line.end) {
                const { x: startX, y: startY } = line.start;
                const { x: endX, y: endY } = line.end;
                const ratio = positionPx / line.length;
                const pointX = startX + (endX - startX) * ratio;
                const pointY = startY + (endY - startY) * ratio;
                drawPerpendicularLine(ctx, line, pointX, pointY);
            }
        });

        // desenha a linha temporária
        if (tempLine) {
            ctx.beginPath();
            ctx.moveTo(tempLine.start.x, tempLine.start.y);
            ctx.lineTo(tempLine.end.x, tempLine.end.y);
            ctx.strokeStyle = tempLine.color;
            ctx.lineWidth = 3;
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(tempLine.start.x, tempLine.start.y, 4, 0, Math.PI * 2);
            ctx.fillStyle = '#FDEE2F';
            ctx.fill();
        }
    };
  };

  const finalizeLine = (x: number, y: number) => {
    if (currentStart) {
      const length = calculateLineLength(currentStart, { x, y });
      const newIndex = lines.length + 1;
      const newLine: Line = {
        start: currentStart,
        end: { x, y },
        length: parseFloat(length),
        color: currentColor,
        index: newIndex
      };
      setLines((prevLines) => [...prevLines, newLine]);
      setCurrentStart({ x, y });
      setIsDrawing(true);
    } else {
      setCurrentStart({ x, y });
    }
};

  const createCalibrationPoint = (x: number, y: number) => {
    
      const lineUnderCursorIndex = lines.findIndex(line => line.start && line.end && isMouseOverLine(x, y, line));
    
      if (lineUnderCursorIndex !== -1){
        const line = lines[lineUnderCursorIndex];
        const lengthToStart = Math.sqrt(Math.pow(x - line.start!.x, 2) + Math.pow(y - line.start!.y, 2));
        const totalPreviousLength = lines
          .slice(0, lineUnderCursorIndex) // Linhas anteriores
          .reduce((sum, prevLine) => {
            if (prevLine.start && prevLine.end) {
              return sum + Math.sqrt(
                Math.pow(prevLine.end.x - prevLine.start.x, 2) + Math.pow(prevLine.end.y - prevLine.start.y, 2)
              );
            }
            return sum;
          }, 0);
        
        const position = totalPreviousLength + lengthToStart;  

        const newDot: Calibration = {
          id: calibrationPoint.length + 1,
          lineIndex: lineUnderCursorIndex,
          positionPx: position === 0 ? 1 : position,
          color:'#4B0082',
          positionM: 0,
        };
        setCalibrationPoint((prevDots) => [...prevDots, newDot]);
        setTriggerRedraw(true);
    };
  };  

const calculateZoneDistance = (point1:Zone , point2: Zone): number => {
  let zoneDistance = 0;

  if (point1.lineIndex === point2.lineIndex) {
  return Math.abs(point2.positionPx - point1.positionPx);
  }
  
  zoneDistance += lines[point1.lineIndex].length - point1.positionPx;  // distancia do primeiro ponto ate o final do vetor em que ele foi posicionado
  
  zoneDistance += point2.positionPx; // distancia do inicio do vetor em que o segundo ponto esta ate o ponto
  
  for (let i = point1.lineIndex + 1; i < point2.lineIndex; i++) { 
  zoneDistance += lines[i].length;
  } // distancia dos vetores intermediários

  return parseFloat(zoneDistance.toFixed(5));
};  

const findCalibrationPoint = (Zone: Zone) => {
  const zonePoint = Zone.absPositionPx;

  if (!calibrationPoint.length) return null;

  const sortedCalibrationPoint = [...calibrationPoint].sort((a, b) => (a.positionPx as number) - (b.positionPx as number));
  const nextPoint = sortedCalibrationPoint.find(point => (point.positionPx ?? 0) > (zonePoint ?? 0));
  
  const reversedCalibrationPoint = [...sortedCalibrationPoint].reverse();
  const prevPoint = reversedCalibrationPoint.find(point => (point.positionPx ?? 0) < (zonePoint ?? 0));

  return {
      pxAbsPCalibPost: nextPoint?.positionPx ?? null,
      mAbsPCalibPost: nextPoint?.positionM ?? null,
      pxAbsPCalibAnt: prevPoint?.positionPx ?? null,
      mAbsPCalibAnt: prevPoint?.positionM ?? null
  };
};

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setMousePos({ x, y });

    if (zoneState) {
        const lineUnderCursorIndex = lines.findIndex(line => line.start && line.end && isMouseOverLine(x, y, line));

        if (lineUnderCursorIndex !== -1) {
            const line = lines[lineUnderCursorIndex];
            if (line.start && line.end) {
                const lengthToStart = Math.sqrt(Math.pow(x - line.start.x, 2) + Math.pow(y - line.start.y, 2)).toFixed(5);
                const totalPreviousLength = lines
                  .slice(0, lineUnderCursorIndex) // Linhas anteriores
                  .reduce((sum, prevLine) => {
                    if (prevLine.start && prevLine.end) {
                      return sum + Math.sqrt(
                        Math.pow(prevLine.end.x - prevLine.start.x, 2) + Math.pow(prevLine.end.y - prevLine.start.y, 2)
                      );
                    }
                    return sum;
                  }, 0);
                const absoluteDistance = totalPreviousLength + (parseFloat(lengthToStart))
                const calculatePositonMeters = 0;
                const newDot: Zone = {
                    id: zoneList.length + 1,
                    lineIndex: lineUnderCursorIndex,
                    positionPx: parseFloat(lengthToStart),
                    absPositionPx: absoluteDistance,
                    positionAbsM: calculatePositonMeters,
                    color: '#FDEE2F',
                };
                
                const calibrationData = findCalibrationPoint(newDot);

                if (calibrationData) {
                  const { 
                    pxAbsPCalibPost, 
                    mAbsPCalibPost, 
                    pxAbsPCalibAnt, 
                    mAbsPCalibAnt 
                  } = calibrationData;

                  convertPxToMeters(newDot, pxAbsPCalibPost!, mAbsPCalibPost!, pxAbsPCalibAnt!, mAbsPCalibAnt!);
                };

                setZoneList((prevZoneLength) => {
                    const updatedZoneLength = [...prevZoneLength, newDot];
                    if (updatedZoneLength.length === 1) {
                        updatedZoneLength[0].zoneDistance = newDot.positionPx;
                    } else if (updatedZoneLength.length > 1) {
                        const lastDot = updatedZoneLength[updatedZoneLength.length - 1];
                        const secondLastDot = updatedZoneLength[updatedZoneLength.length - 2];
                        const totalDistance = calculateZoneDistance(secondLastDot, lastDot);
                        updatedZoneLength[updatedZoneLength.length - 1].zoneDistance = totalDistance;
                    }
                    return updatedZoneLength;
                });

                const ctx = canvas.getContext('2d');
                if (ctx) {
                    const dx = line.end.x - line.start.x;
                    const dy = line.end.y - line.start.y;
                    const ratio = parseFloat(lengthToStart) / line.length;
                    const pointX = line.start.x + dx * ratio;
                    const pointY = line.start.y + dy * ratio;
                    drawPerpendicularLine(ctx, line, pointX, pointY);
                }
            }
        }
        console.log(zoneList);
    } else {
        finalizeLine( x, y );

        if (lines.length > prevLinesLength.current && calibrationPoint.length < 1){
          const firstLine = lines[0];
          const x = firstLine.start.x;
          const y = firstLine.start.y;

          createCalibrationPoint( x, y )
        };
    }
  };
   
  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'z') {
      setZoneState((prev) => !prev);
    } else if (e.key === 'x') {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;
  
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      redrawCanvas();
      setCurrentStart(null);
      setMousePos(null);
      setCurrentColor('#D80300');
      setLines([...lines]);
      setIsDrawing(false);

      if (lines.length > prevLinesLength.current ){
        const lastLine = lines[lines.length -1];
        const x = lastLine.end.x;
        const y = lastLine.end.y;

        createCalibrationPoint( x, y );
      };

      prevLinesLength.current = lines.length;

    } else if (e.key === 'c' && mousePos) {
      const x = mousePos.x
      const y = mousePos.y
      createCalibrationPoint( x, y );
    }
  };    

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>): void => {
    const canvas = canvasRef.current;
    const cursor = cursorRef.current;
    if (!canvas || !cursor) return;
  
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
  
    setMousePos({ x, y });
  
    const isOverLine = lines.some(line => line.start && line.end && isMouseOverLine(x, y, line));
    if (isOverLine && !isDrawing) {
      cursor.style.display = 'block';
      cursor.style.left = `${x}px`;
      cursor.style.top = `${y}px`;
      cursor.style.backgroundColor = zoneState ? '#FDEE2F' : '#4B0082';
    } else {
      cursor.style.display = 'none';
    }
  
    if (currentStart) {
      drawTemporaryLine(x, y);
      cursor.style.display = 'block';
      cursor.style.left = `${x}px`;
      cursor.style.top = `${y}px`;
      cursor.style.backgroundColor = zoneState ? '#FDEE2F' : '#4B0082';
    }
  };  

  const handleDotInputChange = (e:React.ChangeEvent<HTMLInputElement>, dotID: number) => {
    const newPositionM = parseFloat(e.target.value);
    setCalibrationPoint((prevDots) =>
      prevDots.map((dot) =>
      dot.id === dotID ? {...dot, positionM: newPositionM} : dot
      )
    );
  };

  const drawTemporaryLine = (mouseX: number, mouseY: number) => {
    if (currentStart) {
      redrawCanvas({
        start: currentStart,
        end: { x: mouseX, y: mouseY },
        color: currentColor,
      });
    }
  };
  
  const handleSave = () => {

    saveLines(mapID, lines);
    saveDots(mapID, calibrationPoint);
    saveZones(mapID, zoneList);
  };

  const fetchMapData = useCallback(async () => {
    try {
      console.log('Fetching map data...');
      const response = await fetch(`http://localhost:5000/maps/${mapID}/original_image`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      console.log('Map image fetched:', imageUrl);
      setImageUrl(imageUrl);
    } catch (error) {
      console.error('Erro ao buscar dados do mapa', error);
    }
  }, [mapID, setImageUrl]);  

  const fetchLineList = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:5000/maps/${mapID}/line_list`);
      const lineData: Line[] = await response.json();

      setLines(lineData);
    } catch (error) {
      console.error('Erro ao buscar lista de vetores', error);
    }
  }, [mapID, setLines]);

  const fetchPointList = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:5000/maps/${mapID}/point_list`);
      const pointData: Calibration[] = await response.json();
      
      setCalibrationPoint(pointData);
    } catch (error) {
      console.error('Erro ao buscar lista de pontos', error);
    }
  }, [mapID, setCalibrationPoint]);
  
  const fetchZoneList = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:5000/maps/${mapID}/zone_list`);
      const zoneData: Zone[] = await response.json();
      
      setZoneList(zoneData);
    } catch (error) {
      console.error('Erro ao buscar lista de pontos', error);
    }
  }, [mapID, setZoneList]); 

  const resetStates = () => {
    setLines([]);
    setCalibrationPoint([]);
    setCurrentStart(null);
    setMousePos(null);
  };

  useEffect(() => {
    if (triggerRedraw) {
      redrawCanvas();
      setTriggerRedraw(false);
    }
  }, [triggerRedraw]);  

  useEffect(() => {
    fetchMapData();
    fetchLineList();
    fetchPointList();
    fetchZoneList();
    resetStates();
  }, [fetchMapData, fetchLineList, fetchPointList, fetchZoneList]);    

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [lines, currentStart, mousePos, calibrationPoint]);  

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      const img = new Image();
      img.src = imageUrl;
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        redrawCanvas();
      };
    }

    const handleMouseMoveWrapper = (e: MouseEvent) => handleMouseMove(e as unknown as React.MouseEvent<HTMLCanvasElement>);
    canvas?.addEventListener('mousemove', handleMouseMoveWrapper);

    return () => {
      canvas?.removeEventListener('mousemove', handleMouseMoveWrapper);
    };
  }, [imageUrl]);  

  return (
    <div className="canvas-container">
        <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            onMouseMove={handleMouseMove}
        />
        <div ref={cursorRef} className="calibration-point" />
        <div className="info-container">
            <div className="line-info">
                <div>
                    {lines.length === 0
                    ? <div>Nenhuma lista de vetores disponível. Trace os vetores.</div>
                    : lines.map((line, i) =>(
                        <div key={i}>
                            Linha {i + 1} : <span>{line.length} px</span>
                        </div>
                    ))}
                </div>
            </div>
            <div className='dots-info'>
              <div>
                {calibrationPoint.length === 0 ? (
                  <div>Nenhum ponto foi adicionado.</div>
                ) : (
                  calibrationPoint.map((dot, i) => (
                    <div key={i} className='dots-container'>
                      <div>Ponto {dot.id}:</div>
                      <div>Vetor número <span>{dot.lineIndex + 1}</span></div>
                      <div>Posição do Ponto em relação ao vetor: <span>{dot.positionPx} px</span></div>
                      <div className='canvas-input'>
                        <p>Digite o valor em metros: </p>
                        <input 
                          type="number"
                          min="0"
                          value={dot.positionM}
                          onChange={(e) => handleDotInputChange(e, dot.id)}
                          placeholder='Metros'
                          className='dot-input'
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
        </div>
        <button onClick={handleSave}>Salvar Dados do Mapa</button>
    </div>
  );
};

export default Canvas;
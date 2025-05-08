import React, { useRef, useState, useEffect, useCallback } from 'react';
import '../styles/canvas.scss';

import {drawPerpendicularLine, calculateLineLength} from '../utils/calculations';
import {isMouseOverLine} from '../utils/isMouseOverLine'
import {Calibration, Zone, Alarm, Line, ImageDisplayProps, AlarmCalculationInput} from '../utils/types'
import {saveLines, saveDots, saveZones} from '../utils/savesUtils'
import locationIcon from '../utils/location_SVG.svg';

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
  const [alarmLog, setAlarmLog] = useState<Alarm[]>([]);
  const [alarmInput, setAlarmInput] = useState<number>(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const prevLinesLength = useRef<number>(0);

  const alarmImg = new Image();
  alarmImg.src = locationIcon;

  
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
            const lineLength = Math.sqrt(
              Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2)
            );

            const previousLength = lines
              .slice(0, lineIndex)
              .reduce((sum, line) => {
                if (line.start && line.end) {
                  return sum + Math.sqrt(
                    Math.pow(line.end.x - line.start.x, 2) +
                    Math.pow(line.end.y - line.start.y, 2)
                  );
                }
                return sum;
              }, 0);

            const relativePositionPx = positionPx - previousLength;
            const ratio = relativePositionPx / lineLength;

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

        // desenha icone de alarme
        alarmLog.forEach(alarm => {
          const line = lines[alarm.lineIndex];
          if (line?.start && line?.end) {
            const ratio = alarm.positionPx / line.length;
            const x = line.start.x + (line.end.x - line.start.x) * ratio;
            const y = line.start.y + (line.end.y - line.start.y) * ratio;
        
            const iconSize = 40;
            if (alarmImg.complete) {
              ctx.drawImage(alarmImg, x - iconSize / 2, y - iconSize, iconSize, iconSize);
            } else {
              alarmImg.onload = () => {
                ctx.drawImage(alarmImg, x - iconSize / 2, y - iconSize, iconSize, iconSize);
              };
            }
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
        length: length,
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
        
        const position = Math.round(totalPreviousLength + lengthToStart);  

        const newDot: Calibration = {
          id: calibrationPoint.length + 1,
          lineIndex: lineUnderCursorIndex,
          positionPx: position === 0 ? 1 : position,
          color:'#4B0082',
          positionMeters: 0,
        };
        setCalibrationPoint((prevDots) => [...prevDots, newDot]);
        setTriggerRedraw(true);
    };
  };  

const convertZonePxToMeters = (Zone: Zone) => {

  if (!calibrationPoint.length) return null;

  const endZonePoint = Zone.positionZoneEndPixelsAbsolute;
  const startZonePoint = Zone.positionZoneStartPixelsAbsolute;


  const sortedCalibrationPoint = [...calibrationPoint].sort((a, b) => (a.positionPx as number) - (b.positionPx as number));
  const nextEndPoint = sortedCalibrationPoint.find(point => (point.positionPx ?? 0) > (endZonePoint ?? 0));
  
  const reversedCalibrationPoint = [...sortedCalibrationPoint].reverse();
  const prevEndPoint = reversedCalibrationPoint.find(point => (point.positionPx ?? 0) < (endZonePoint ?? 0));

  const calibrationPointsInZone = sortedCalibrationPoint.filter(point => {
    const px = point.positionPx ?? -1;
    return px > startZonePoint && px < endZonePoint;
  });

  if (calibrationPointsInZone.length > 0){

    const postPixelDiff = nextEndPoint!.positionPx - prevEndPoint!.positionPx;
    const postMetersDiff = nextEndPoint!.positionMeters - prevEndPoint!.positionMeters;
    const postConversion = postMetersDiff / postPixelDiff;

    const partialPostPixelDiff = Zone.positionZoneEndPixelsAbsolute - prevEndPoint!.positionPx;

    Zone.positionZoneEndMetersAbsolute  = Math.round(prevEndPoint!.positionMeters + (partialPostPixelDiff * postConversion));

  } else {
    const pixelDiff = nextEndPoint!.positionPx - prevEndPoint!.positionPx;
    const metersDiff = nextEndPoint!.positionMeters - prevEndPoint!.positionMeters;
    const conversion = metersDiff / pixelDiff;

    Zone.positionZoneEndMetersAbsolute = Math.round(Zone.positionZoneStartMetersAbsolute + (Zone.positionZoneTotalLengthPixels * conversion));
  };

  Zone.positionZoneTotalLengthMeters = Zone.positionZoneEndMetersAbsolute - Zone.positionZoneStartMetersAbsolute;

};

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setMousePos({ x, y });

    if (zoneState) {
      const lineUnderCursorIndex = lines.findIndex((line) => line.start && line.end && isMouseOverLine(x, y, line));
    
      if (lineUnderCursorIndex !== -1) {

        const line = lines[lineUnderCursorIndex];

        if (line.start && line.end) {
          const lengthToStart = Math.round(
            Math.sqrt(Math.pow(x - line.start.x, 2) + Math.pow(y - line.start.y, 2))
          );
    
          const totalPreviousLength = lines.slice(0, lineUnderCursorIndex).reduce((sum, prevLine) => {
            if (prevLine.start && prevLine.end) {
              return (
                sum +
                Math.sqrt(
                  Math.pow(prevLine.end.x - prevLine.start.x, 2) +
                  Math.pow(prevLine.end.y - prevLine.start.y, 2)
                )
              );
            }
            return sum;
          }, 0);
    
          const absolutePixelDistance = Math.round(totalPreviousLength + lengthToStart);
          const isFirstZone = zoneList.length === 0;
          const startPixels = isFirstZone ? 1 : zoneList[zoneList.length - 1].positionZoneEndPixelsAbsolute + 1;
          const startMeters = isFirstZone ? (calibrationPoint[0]?.positionMeters ?? 0) + 1 : zoneList[zoneList.length - 1].positionZoneEndMetersAbsolute + 1;
          const totalPixels = absolutePixelDistance - startPixels;
    
          const newDot: Zone = {
            id: zoneList.length + 1,
            lineIndex: lineUnderCursorIndex,
            positionPx: lengthToStart,
            positionZoneStartPixelsAbsolute: startPixels,
            positionZoneEndPixelsAbsolute: absolutePixelDistance,
            positionZoneTotalLengthPixels: totalPixels,
            positionZoneStartMetersAbsolute: startMeters,
            positionZoneEndMetersAbsolute: 0,
            positionZoneTotalLengthMeters: 0,
            color: '#FDEE2F',
          };
    
          convertZonePxToMeters(newDot);
    
          setZoneList((prev) => [...prev, newDot]);
    
          const ctx = canvas.getContext('2d');
          if (ctx) {
            const dx = line.end.x - line.start.x;
            const dy = line.end.y - line.start.y;
            const ratio = lengthToStart / line.length;
            const pointX = line.start.x + dx * ratio;
            const pointY = line.start.y + dy * ratio;
            drawPerpendicularLine(ctx, line, pointX, pointY);
          }
    
          console.log(zoneList);
        }
      }
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
  
  function calculateAlarmPixelPosition({
    alarmMeters,
    calibrations,
    zones,
  }: AlarmCalculationInput): {
    pixelRelative: number;
    pixelAbsolute: number;
    zoneID: number;
    lineIndex: number;
  } | null {
    // 1. Identificar em qual zona o alarme ocorreu
    const zone = zones.find(
      z =>
        alarmMeters >= z.positionZoneStartMetersAbsolute &&
        alarmMeters <= z.positionZoneEndMetersAbsolute
    );
    if (!zone) return null;
  
    // 2. Filtrar e ordenar os pontos de calibração da mesma linha
    const pointsInLine = calibrations
      .filter(p => p.lineIndex === zone.lineIndex)
      .sort((a, b) => (a.positionMeters - b.positionMeters));
  
    if (pointsInLine.length < 2) {
      // Nenhum ou apenas um ponto de calibração — usar média global da zona
      const metersPerPixel =
        zone.positionZoneTotalLengthMeters / zone.positionZoneTotalLengthPixels;
      const metersFromStart = alarmMeters - zone.positionZoneStartMetersAbsolute;
      const pixelOffset = metersFromStart / metersPerPixel;
      const pixelAbsolute = zone.positionZoneStartPixelsAbsolute + pixelOffset;
  
      return {
        pixelRelative: Math.round(pixelAbsolute),
        pixelAbsolute,
        zoneID: zone.id,
        lineIndex: zone.lineIndex
      };
    }
  
    // 3. Identificar pontos anteriores e posteriores ao alarme
    const prev = [...pointsInLine].reverse().find(p => p.positionMeters <= alarmMeters);
    const next = pointsInLine.find(p => p.positionMeters >= alarmMeters);
  
    // 4. Se o alarme estiver ENTRE dois pontos — interpolação padrão
    if (prev && next && prev.id !== next.id) {
      const meterDiff = next.positionMeters - prev.positionMeters;
      const pixelDiff = next.positionPx - prev.positionPx;
      const metersPerPixel = pixelDiff / meterDiff;
      const distanceFromPrev = alarmMeters - prev.positionMeters;
      const pixelAbsolute = prev.positionPx + (distanceFromPrev * metersPerPixel);
  
      return {
        pixelRelative: Math.round(pixelAbsolute),
        pixelAbsolute,
        zoneID: zone.id,
        lineIndex: zone.lineIndex
      };
    }
  
    // 5. Se o alarme for ANTES do primeiro ponto de calibração
    const first = pointsInLine[0];
    if (alarmMeters < first.positionMeters) {
      const nextAfterFirst = pointsInLine.find(p => p.positionMeters > first.positionMeters);
      if (!nextAfterFirst) return null;
  
      const meterDiff = nextAfterFirst.positionMeters - first.positionMeters;
      const pixelDiff = nextAfterFirst.positionPx - first.positionPx;
      const metersPerPixel = pixelDiff / meterDiff;
      const distance = alarmMeters - first.positionMeters;
      const pixelAbsolute = first.positionPx + (distance * metersPerPixel);
  
      return {
        pixelRelative: Math.round(pixelAbsolute),
        pixelAbsolute,
        zoneID: zone.id,
        lineIndex: zone.lineIndex
      };
    }
  
    // 6. Se o alarme for DEPOIS do último ponto de calibração
    const last = pointsInLine[pointsInLine.length - 1];
    if (alarmMeters > last.positionMeters) {
      const prevBeforeLast = [...pointsInLine]
        .reverse()
        .find(p => p.positionMeters < last.positionMeters);
      if (!prevBeforeLast) return null;
  
      const meterDiff = last.positionMeters - prevBeforeLast.positionMeters;
      const pixelDiff = last.positionPx - prevBeforeLast.positionPx;
      const pixelsPerMeter = pixelDiff / meterDiff;
      
      // distância entre o alarme e o último ponto (positivo se estiver depois)
      const distanceMeters = alarmMeters - last.positionMeters;
      
      // mover na mesma direção do último segmento
      const direction = Math.sign(pixelDiff); // +1 ou -1
      const pixelOffset = Math.abs(distanceMeters * pixelsPerMeter) * direction;
      const pixelAbsolute = last.positionPx + pixelOffset;
  
      return {
        pixelRelative: Math.round(pixelAbsolute),
        pixelAbsolute,
        zoneID: zone.id,
        lineIndex: zone.lineIndex
      };
    }
  
    // 7. Se chegou aqui, não conseguiu calcular
    return null;
  }   

  const generateTimestamp = (): number => {
    const now = new Date();
  
    const pad = (num: number): string => num.toString().padStart(2, '0');
  
    const day = pad(now.getDate());
    const month = pad(now.getMonth() + 1);
    const year = now.getFullYear().toString();
    const hours = pad(now.getHours());
    const minutes = pad(now.getMinutes());
    const seconds = pad(now.getSeconds());
  
    return Number(`${day}${month}${year}${hours}${minutes}${seconds}`);
  };  

  const getRelativePxInLine = (absolutePx: number, lineIndex: number, lines: Line[]) => {
    const offsetPx = lines
      .slice(0, lineIndex)
      .reduce((sum, line) => sum + line.length, 0);
    return absolutePx - offsetPx;
  };  

  const handleAlarmTrigger = () => {
    if (alarmInput <= 0 || !zoneList.length) return;
  
    const result = calculateAlarmPixelPosition({
      alarmMeters: alarmInput,
      zones: zoneList,
      calibrations: calibrationPoint
    });
  
    if (!result) {
      console.warn('Não foi possível determinar a posição do alarme.');
      return;
    }
  
    const { pixelAbsolute, zoneID, lineIndex } = result;
    const pixelRelative = getRelativePxInLine(pixelAbsolute, lineIndex, lines);
    const dateID = generateTimestamp();
  
    const newAlarm: Alarm = {
      id: dateID,
      lineIndex,
      positionPx: pixelRelative,
      positionMeters: alarmInput,
      zoneID,
      color: '#FF0000'
    };
  
    setAlarmLog(prev => [...prev, newAlarm]);
    console.log(alarmLog);
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
      dot.id === dotID ? {...dot, positionMeters: newPositionM} : dot
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
    if (alarmLog.length > 0) {
      redrawCanvas();
    }
  }, [alarmLog]);
  

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
                          value={dot.positionMeters}
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
            <input
              type="number"
              placeholder="Distância do alarme (m)"
              value={alarmInput}
              onChange={(e) => setAlarmInput(Number(e.target.value))}
            />
            <button onClick={handleAlarmTrigger}>Disparar Alarme</button>
        </div>
        <button onClick={handleSave}>Salvar Dados do Mapa</button>
    </div>
  );
};

export default Canvas;
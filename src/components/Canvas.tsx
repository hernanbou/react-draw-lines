import React, { useRef, useState, useEffect, useCallback } from 'react';
import '../styles/canvas.scss';

interface ImageDisplayProps {
  mapID: number;
}

interface Line {
  start: {x: number; y:number};
  end: {x: number; y:number};
  length: number;
  color: string;
  index: number;
}

interface Dot{
  id: number;
  lineIndex: number;
  positionPx: number;
  positionM?:number;
  zoneID?:number;
  color:string;
  zoneDistance?: number;
}

const Canvas: React.FC<ImageDisplayProps> = ({ mapID }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const [lines, setLines] = useState<Line[]>([]);
  const [dots, setDots] = useState<Dot[]>([]);
  const [currentStart, setCurrentStart] = useState<{ x: number; y: number } | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [currentColor, setCurrentColor] = useState<string>('#D80300');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [triggerRedraw, setTriggerRedraw] = useState<boolean>(false);
  const [zoneState, setZoneState] = useState<boolean>(false);
  const [zoneLength, setZoneLength] = useState<Dot[]>([]);
  
  const redrawCanvas = (tempLine?: { start: { x: number; y: number }; end: { x: number; y: number }; color: string }) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
  
    const image = new Image();
    image.src = imageUrl;
    image.crossOrigin = 'anonymous';
  
    image.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height); // limpa o canvas
      ctx.drawImage(image, 0, 0); // redesenha a imagem
  
      lines.forEach((line) => {
        if (line.start && line.end) {
          ctx.beginPath();
          ctx.moveTo(line.start.x, line.start.y);
          ctx.lineTo(line.end.x, line.end.y);
          ctx.strokeStyle = line.color || '#D80300';
          ctx.lineWidth = 3; // valor da largura do vetor
          ctx.stroke();
        }
      });
  
      lines.forEach((line) => {
        if (line.end) {
          ctx.beginPath();
          ctx.arc(line.end.x, line.end.y, 4, 0, Math.PI * 2); // valor do raio do ponto
          ctx.fillStyle = '#FDEE2F';
          ctx.fill();
        }
      });
  
      dots.forEach(dot => {
        const line = lines[dot.lineIndex];
        if (line.start) {
          const dx = line.end!.x - line.start.x;
          const dy = line.end!.y - line.start.y;
          const ratio = dot.positionPx / line.length;
          const pointX = line.start.x + dx * ratio;
          const pointY = line.start.y + dy * ratio;
          ctx.beginPath();
          ctx.arc(pointX, pointY, 4, 0, Math.PI * 2); // valor do raio do ponto
          ctx.fillStyle = '#4B0082';
          ctx.fill();
        }
      });
  
      zoneLength.forEach(zoneDot => {
        const line = lines[zoneDot.lineIndex];
        if (line.start) {
          const dx = line.end.x - line.start.x;
          const dy = line.end.y - line.start.y;
          const ratio = zoneDot.positionPx / line.length;
          const pointX = line.start.x + dx * ratio;
          const pointY = line.start.y + dy * ratio;
   
          const perpendicularAngle = Math.atan2(dy, dx) + Math.PI / 2; // calcular a inclinação perpendicular
          const perpLength  = 6; // comprimento do traço
      
          // coordenadas do traço perpendicular
          const startX = pointX + perpLength  * Math.cos(perpendicularAngle);
          const startY = pointY + perpLength  * Math.sin(perpendicularAngle);
          const endX = pointX - perpLength  * Math.cos(perpendicularAngle);
          const endY = pointY - perpLength  * Math.sin(perpendicularAngle);
      
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(endX, endY);
          ctx.lineWidth = 4; // espessura do traço
          ctx.strokeStyle = '#FDEE2F';
          ctx.stroke();
        }
      });      
  
      if (tempLine) {
        ctx.beginPath();
        ctx.moveTo(tempLine.start.x, tempLine.start.y);
        ctx.lineTo(tempLine.end.x, tempLine.end.y);
        ctx.strokeStyle = tempLine.color;
        ctx.lineWidth = 3; // valor da largura do vetor
        ctx.stroke();
  
        ctx.beginPath();
        ctx.arc(tempLine.start.x, tempLine.start.y, 4, 0, Math.PI * 2); // valor do raio do ponto
        ctx.fillStyle = '#FDEE2F';
        ctx.fill();
      }
    };
  };
  
  const isMouseOverLine = (x: number, y: number, line: Line): boolean => {
    const distance = Math.sqrt(Math.pow(line.end!.x - line.start!.x, 2) + Math.pow(line.end!.y - line.start!.y, 2));
    const distanceToStart = Math.sqrt(Math.pow(x - line.start!.x, 2) + Math.pow(y - line.start!.y, 2));
    const distanceToEnd = Math.sqrt(Math.pow(x - line.end!.x, 2) + Math.pow(y - line.end!.y, 2));
    
    return Math.abs(distance - (distanceToStart + distanceToEnd)) < 0.01; //precisão de proximidade do mouse em relação ao vetor
  };  

  const calculateLineLength = (start: { x: number; y: number }, end: { x: number; y: number }) => {
    return Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)).toFixed(5);
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

  
  const calculateZoneDistance = (point1: Dot, point2: Dot): number => {
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

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
  
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
  
    if (zoneState) {
      const lineUnderCursorIndex = lines.findIndex(line => line.start && line.end && isMouseOverLine(x, y, line));
  
      if (lineUnderCursorIndex !== -1) {
        const line = lines[lineUnderCursorIndex];
        if (line.start && line.end) {
          const lengthToStart = Math.sqrt(Math.pow(x - line.start.x, 2) + Math.pow(y - line.start.y, 2)).toFixed(5);
          const newDot: Dot = {
            id: zoneLength.length + 1,
            lineIndex: lineUnderCursorIndex,
            positionPx: parseFloat(lengthToStart),
            color: '#FDEE2F',
            zoneID: zoneLength.length + 1, // Atualiza o zoneID de forma contínua
          };
  
          setZoneLength((prevZoneLength) => {
            const updatedZoneLength = [...prevZoneLength, newDot];
            if (updatedZoneLength.length === 1) {
              // se for o primeiro ponto, zoneDistance é igual a positionPx
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

            const perpendicularAngle = Math.atan2(dy, dx) + Math.PI / 2; // calcular a inclinação perpendicular
            const perpLength  = 6; // comprimento do traço

            // coordenadas do traço perpendicular
            const startX = pointX + perpLength  * Math.cos(perpendicularAngle);
            const startY = pointY + perpLength  * Math.sin(perpendicularAngle);
            const endX = pointX - perpLength  * Math.cos(perpendicularAngle);
            const endY = pointY - perpLength  * Math.sin(perpendicularAngle);

            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.lineWidth = 4; // espessura do traço
            ctx.strokeStyle = '#FDEE2F';
            ctx.stroke();
          }
        }
      }
    } else {
      finalizeLine(x, y);
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
    } else if (e.key === 'c' && mousePos) {
      const lineUnderCursorIndex = lines.findIndex(line => line.start && line.end && isMouseOverLine(mousePos.x, mousePos.y, line));
      
      if (lineUnderCursorIndex !== -1){
        const line = lines[lineUnderCursorIndex];
        const lengthToStart = Math.sqrt(Math.pow(mousePos.x - line.start!.x, 2) + Math.pow(mousePos.y - line.start!.y, 2)).toFixed(5);
        const newDot: Dot = {
          id: dots.length + 1,
          lineIndex: lineUnderCursorIndex,
          positionPx: parseFloat(lengthToStart),
          color:'#4B0082',
          positionM: 0,
        };
        setDots((prevDots) => [...prevDots, newDot]);
        setTriggerRedraw(true);
      }
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
    setDots((prevDots) =>
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

  const saveLines = async () => {
  
    try {
      const response = await fetch(`http://localhost:5000/maps/${mapID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ line_list: lines }),
      });
  
      if (response.ok) {
        console.log('Vetores salvas com sucesso!');
      } else {
        console.error('Erro ao salvar vetores:', response.statusText);
      }
    } catch (error) {
      console.error('Erro ao salvar vetores:', error);
    }
  };   

  const saveDots = async () => {
    try {
      const response = await fetch(`http://localhost:5000/maps/${mapID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ point_list: dots }),
      });
  
      if (response.ok) {
        console.log('Pontos salvos com sucesso!');
      } else {
        console.error('Erro ao salvar pontos:', response.statusText);
      }
    } catch (error) {
      console.error('Erro ao salvar pontos:', error);
    }
  };

  const saveZones = async () => {
    try {
      const response = await fetch(`http://localhost:5000/maps/${mapID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ zone_list: zoneLength }),
      });
  
      if (response.ok) {
        console.log('Zonas salvos com sucesso!');
      } else {
        console.error('Erro ao salvar zonas:', response.statusText);
      }
    } catch (error) {
      console.error('Erro ao salvar zonas:', error);
    }
  };
  
  const handleSave = () => {

    //const canvas = canvasRef.current;
    //saveImage(canvas);

    saveLines();
    saveDots();
    saveZones();
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
      const pointData: Dot[] = await response.json();
      
      setDots(pointData);
    } catch (error) {
      console.error('Erro ao buscar lista de pontos', error);
    }
  }, [mapID, setDots]);
  
  const fetchZoneList = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:5000/maps/${mapID}/zone_list`);
      const zoneData: Dot[] = await response.json();
      
      setZoneLength(zoneData);
    } catch (error) {
      console.error('Erro ao buscar lista de pontos', error);
    }
  }, [mapID, setZoneLength]); 

  const resetStates = () => {
    setLines([]);
    setDots([]);
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
  }, [lines, currentStart, mousePos, dots]);  

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
                {dots.length === 0 ? (
                  <div>Nenhum ponto foi adicionado.</div>
                ) : (
                  dots.map((dot, i) => (
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
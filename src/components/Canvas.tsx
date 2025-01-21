import React, { useRef, useState, useEffect, useCallback } from 'react';
import '../styles/canvas.css';

interface ImageDisplayProps {
  mapID: number;
}

interface MapData {
  id: number;
  zone_image:string;
  original_image: string;
}

interface Line {
  start?: {x: number; y:number};
  end?: {x: number; y:number};
  length: number;
  color?: string;
}

interface Dot {
  x: number;
  y: number;
}

const Canvas: React.FC<ImageDisplayProps> = ({ mapID }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const [lines, setLines] = useState<Line[]>([]);
  const [currentStart, setCurrentStart] = useState<{ x: number; y: number } | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [currentColor, setCurrentColor] = useState<string>('#D80300');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [fixedPoints, setFixedPoints] = useState<Dot[]>([])
  const [triggerRedraw, setTriggerRedraw] = useState<boolean>(false);

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
  
      fixedPoints.forEach(point => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 4, 0, Math.PI * 2); // valor do raio do ponto
        ctx.fillStyle = '#4B0082';
        ctx.fill();
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
    
    return Math.abs(distance - (distanceToStart + distanceToEnd)) < 0.5;
  };  

  const calculateLineLength = (start: { x: number; y: number }, end: { x: number; y: number }) => {
    return Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)).toFixed(5);
  };

  const finalizeLine = (x: number, y: number) => {
    if (currentStart) {
      const length = calculateLineLength(currentStart, { x, y });
      setLines([...lines, { start: currentStart, end: { x, y }, length: parseFloat(length), color: currentColor }]);
      setCurrentStart({ x, y });
      setIsDrawing(true);
    } else {
      setCurrentStart({ x, y });
    }
  };  

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    finalizeLine(x, y);
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'z') {
      setCurrentColor((prevColor) => (prevColor === '#D80300' ? '#39FF14' : '#D80300'));
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
      setFixedPoints((prevPoints) => {
        const newPoints = [...prevPoints, mousePos];
        return newPoints;
      });
      setTriggerRedraw(true);
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

    if (currentStart) {
      drawTemporaryLine(x, y);
      cursor.style.display = 'block';
      cursor.style.left = `${x}px`;
      cursor.style.top = `${y}px`;

      const isOverLine = lines.some(line => line.start && line.end && isMouseOverLine(x, y, line));
      if (isOverLine) {
        cursor.style.backgroundColor = '#4B0082';
      } else {
        cursor.style.display = 'none';
      }
    } else {
      const isOverLine = lines.some(line => line.start && line.end && isMouseOverLine(x, y, line));
      if (isOverLine && !isDrawing) {
        cursor.style.display = 'block';
        cursor.style.left = `${x}px`;
        cursor.style.top = `${y}px`;
        cursor.style.backgroundColor = '#4B0082';
      } else {
        cursor.style.display = 'none';
      }
    }
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

  const saveCanvas = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob(async (blob) => {
      if (!blob) return;

      const formData = new FormData();
      formData.append('image', blob);
      const lineLengths = lines.map(line => line.length);

      formData.append('lines', JSON.stringify(lineLengths));

      const response = await fetch(`http://localhost:5000/maps/${mapID}/save_image`, {
        method: 'PUT',
        body: formData,
      });

      if (response.ok) {
        console.log('Imagem e linhas salvas com sucesso!');
      } else {
        console.error('Erro ao salvar imagem e linhas.');
      }
    }, 'image/png');
  };    

  const fetchMapData = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:5000/maps/${mapID}`);
      const mapData: MapData = await response.json();

      const url = mapData.zone_image
        ? `http://localhost:5000/maps/${mapID}/zone_image`
        : `http://localhost:5000/maps/${mapID}/original_image`;

      setImageUrl(url);
    } catch (error) {
      console.error('Erro ao buscar dados do mapa', error);
    }
  }, [mapID]);

  const fetchLineList = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:5000/maps/${mapID}/line_list`);
      const lineData: number[] = await response.json();

      const newLines = lineData.map((length) => ({
        length,
      }));
      setLines(newLines);
    } catch (error) {
      console.error('Erro ao buscar lista de vetores', error);
    }
  }, [mapID, setLines]);

  const resetStates = () => {
    setLines([]);
    setFixedPoints([]);
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
    resetStates();
  }, [fetchMapData, fetchLineList]);    

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [lines, currentStart, mousePos, fixedPoints]);  

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
      <div style={{ marginTop: '10px' }}>
        {lines.length === 0
        ? <div>Nenhuma lista de vetores disponivel. Traçe os vetores.</div>
        : lines.map((line, i) =>(
          <div key={i}>
            Linha {i + 1} : {line.length} px
          </div>
        ))}
      </div>
      <button onClick={saveCanvas}>Salvar Imagem</button>
    </div>
  );
};

export default Canvas;
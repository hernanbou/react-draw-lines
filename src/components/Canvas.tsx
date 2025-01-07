import React, { useRef, useState, useEffect } from 'react';

interface ImageDisplayProps {
  mapID: number;
}

const Canvas: React.FC<ImageDisplayProps> = ({ mapID }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [lines, setLines] = useState<{ start: { x: number; y: number }; end: { x: number; y: number }; length: number }[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStart, setCurrentStart] = useState<{ x: number; y: number } | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const imageUrl = `http://localhost:5000/maps/${mapID}/image`;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      const image = new Image();
      image.src = imageUrl;

      image.onload = () => {
        canvas.width = image.width;
        canvas.height = image.height;
        ctx.drawImage(image, 0, 0);
      };
    }
  }, [imageUrl]);

  const calculateLineLength = (start: { x: number; y: number }, end: { x: number; y: number }) => {
    return Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)).toFixed(5);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (!isDrawing) {
      // Inicia o traçado
      setCurrentStart({ x, y });
      setIsDrawing(true);
    } else {
      // Finaliza o traçado e calcula o comprimento
      const length = calculateLineLength(currentStart!, { x, y });
      setLines([...lines, { start: currentStart!, end: { x, y }, length: parseFloat(length) }]);
      setIsDrawing(false);
      setCurrentStart(null);
      setMousePos(null); // Reseta o mouse position
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setMousePos({ x, y });
    drawTemporaryLine(x, y);
  };

  const drawTemporaryLine = (mouseX: number, mouseY: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !currentStart) return;

    const image = new Image();
    image.src = imageUrl;

    image.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpa o canvas
      ctx.drawImage(image, 0, 0); // Redesenha a imagem

      // Redesenha todas as linhas fixadas
      lines.forEach((line, index) => {
        ctx.beginPath();
        ctx.moveTo(line.start.x, line.start.y);
        ctx.lineTo(line.end.x, line.end.y);
        ctx.strokeStyle = index % 2 === 0 ? '#D80300' : '#39FF14';
        ctx.lineWidth = 5;
        ctx.stroke();
      });

      // Desenha a linha temporária
      ctx.beginPath();
      ctx.moveTo(currentStart.x, currentStart.y);
      ctx.lineTo(mouseX, mouseY);
      ctx.strokeStyle = lines.length % 2 === 0 ? '#D80300' : '#39FF14'; // Alterna as cores
      ctx.lineWidth = 5;
      ctx.stroke();
    };
  };

  useEffect(() => {
    if (!isDrawing) {
      drawLines();
    }
  }, [lines]);

  const drawLines = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const image = new Image();
    image.src = imageUrl;

    image.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpa o canvas
      ctx.drawImage(image, 0, 0); // Redesenha a imagem

      // Redesenha todas as linhas fixadas
      lines.forEach((line, index) => {
        ctx.beginPath();
        ctx.moveTo(line.start.x, line.start.y);
        ctx.lineTo(line.end.x, line.end.y);
        ctx.strokeStyle = index % 2 === 0 ? '#D80300' : '#39FF14';
        ctx.lineWidth = 5;
        ctx.stroke();
      });
    };
  };

  return (
    <div>
      <canvas
        ref={canvasRef}
        style={{ border: '1px solid black', cursor: 'crosshair' }}
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMove}
      />
      <div style={{ marginTop: '10px' }}>
        {lines.map((line, index) => (
          <div key={index}>
            Linha {index + 1}: {line.length} px
          </div>
        ))}
      </div>
    </div>
  );
};

export default Canvas;
import React, { useRef, useState, useEffect } from 'react';

interface ImageDisplayProps {
  mapID: number;
}

const Canvas: React.FC<ImageDisplayProps> = ({ mapID }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [lines, setLines] = useState<{ start: { x: number; y: number }; end: { x: number; y: number }; length: number }[]>([]);
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

    if (currentStart) {
      // Finaliza a linha anterior e inicia uma nova
      const length = calculateLineLength(currentStart, { x, y });
      setLines([...lines, { start: currentStart, end: { x, y }, length: parseFloat(length) }]);
      setCurrentStart({ x, y }); // Define o ponto final como o início da próxima linha
    } else {
      // Inicia a primeira linha
      setCurrentStart({ x, y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!currentStart) return;

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
        // Desenha a linha
        ctx.beginPath();
        ctx.moveTo(line.start.x, line.start.y);
        ctx.lineTo(line.end.x, line.end.y);
        ctx.strokeStyle = index % 2 === 0 ? '#D80300' : '#39FF14';
        ctx.lineWidth = 3; // Atualizado para o novo valor
        ctx.stroke();
      });
  
      // Desenha os pontos após as linhas fixadas
      lines.forEach((line) => {
        ctx.beginPath();
        ctx.arc(line.end.x, line.end.y, 4, 0, Math.PI * 2); // Ajustado para o novo raio
        ctx.fillStyle = '#FDEE2F';
        ctx.fill();
      });
  
      // Desenha a linha temporária
      ctx.beginPath();
      ctx.moveTo(currentStart.x, currentStart.y);
      ctx.lineTo(mouseX, mouseY);
      ctx.strokeStyle = lines.length % 2 === 0 ? '#D80300' : '#39FF14'; // Alterna as cores
      ctx.lineWidth = 3; // Ajustado para o novo valor
      ctx.stroke();
  
      // Desenha o ponto no início da linha temporária
      ctx.beginPath();
      ctx.arc(currentStart.x, currentStart.y, 4, 0, Math.PI * 2); // Ajustado para o novo raio
      ctx.fillStyle = '#FDEE2F';
      ctx.fill();
    };
  };

  useEffect(() => {
    drawLines();
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
        // Desenha a linha
        ctx.beginPath();
        ctx.moveTo(line.start.x, line.start.y);
        ctx.lineTo(line.end.x, line.end.y);
        ctx.strokeStyle = index % 2 === 0 ? '#D80300' : '#39FF14';
        ctx.lineWidth = 3; // Atualizado para o novo valor
        ctx.stroke();
      });
  
      // Desenha os pontos após as linhas
      lines.forEach((line) => {
        ctx.beginPath();
        ctx.arc(line.end.x, line.end.y, 4, 0, Math.PI * 2); // Ajustado para o novo raio
        ctx.fillStyle = '#FDEE2F';
        ctx.fill();
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
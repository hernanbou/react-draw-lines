import React, { useRef, useState, useEffect } from 'react';

interface ImageDisplayProps {
  mapID: number;
}

const Canvas: React.FC<ImageDisplayProps> = ({ mapID }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [lines, setLines] = useState<{ start: { x: number; y: number }; end: { x: number; y: number }; length: number; color: string }[]>([]);
  const [currentStart, setCurrentStart] = useState<{ x: number; y: number } | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [currentColor, setCurrentColor] = useState<string>('#D80300');
  const imageUrl = `http://localhost:5000/maps/${mapID}/original_image`;

  const redrawCanvas = (tempLine?: { start: { x: number; y: number }; end: { x: number; y: number }; color: string }) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
  
    const image = new Image();
    image.src = imageUrl;
    image.crossOrigin = 'anonymous'; // Adicione isso
  
    image.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpa o canvas
      ctx.drawImage(image, 0, 0); // Redesenha a imagem
  
      lines.forEach((line) => {
        ctx.beginPath();
        ctx.moveTo(line.start.x, line.start.y);
        ctx.lineTo(line.end.x, line.end.y);
        ctx.strokeStyle = line.color;
        ctx.lineWidth = 3; // Atualizado para o novo valor
        ctx.stroke();
      });
  
      lines.forEach((line) => {
        ctx.beginPath();
        ctx.arc(line.end.x, line.end.y, 4, 0, Math.PI * 2); // Ajustado para o novo raio
        ctx.fillStyle = '#FDEE2F';
        ctx.fill();
      });
  
      if (tempLine) {
        ctx.beginPath();
        ctx.moveTo(tempLine.start.x, tempLine.start.y);
        ctx.lineTo(tempLine.end.x, tempLine.end.y);
        ctx.strokeStyle = tempLine.color;
        ctx.lineWidth = 3; // Ajustado para o novo valor
        ctx.stroke();
  
        ctx.beginPath();
        ctx.arc(tempLine.start.x, tempLine.start.y, 4, 0, Math.PI * 2); // Ajustado para o novo raio
        ctx.fillStyle = '#FDEE2F';
        ctx.fill();
      }
    };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      const img = new Image();
      img.src = imageUrl;
      img.crossOrigin = 'anonymous'; // Adicione isso

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        redrawCanvas();
      };
    }
  }, [imageUrl]);

  const calculateLineLength = (start: { x: number; y: number }, end: { x: number; y: number }) => {
    return Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)).toFixed(5);
  };

  const finalizeLine = (x: number, y: number) => {
    if (currentStart) {
      const length = calculateLineLength(currentStart, { x, y });
      setLines([...lines, { start: currentStart, end: { x, y }, length: parseFloat(length), color: currentColor }]);
      setCurrentStart({ x, y });
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
    } else if (e.key === 'p') {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;
  
      ctx.clearRect(0, 0, canvas.width, canvas.height); 
      redrawCanvas(); 
      setCurrentStart(null);
      setMousePos(null);
      setCurrentColor('#D80300');
      setLines([...lines]);
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
    if (currentStart) {
      redrawCanvas({
        start: currentStart,
        end: { x: mouseX, y: mouseY },
        color: currentColor,
      });
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [lines, currentStart, mousePos]);

  const saveCanvasAsBlob = async () => {
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
      <button onClick={saveCanvasAsBlob}>Salvar Imagem</button>
    </div>
  );
};

export default Canvas;
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
  const imageUrl = `/api/maps/${mapID}/original_image`;

  // Função para redesenhar o canvas
  const redrawCanvas = (tempLine?: { start: { x: number; y: number }; end: { x: number; y: number }; color: string }) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
  
    const image = new Image();
    image.src = imageUrl;
  
    image.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpa o canvas
      ctx.drawImage(image, 0, 0); // Redesenha a imagem
  
      // Redesenha todas as linhas fixadas
      lines.forEach((line) => {
        ctx.beginPath();
        ctx.moveTo(line.start.x, line.start.y);
        ctx.lineTo(line.end.x, line.end.y);
        ctx.strokeStyle = line.color;
        ctx.lineWidth = 3; // Atualizado para o novo valor
        ctx.stroke();
      });
  
      // Redesenha os pontos após as linhas fixadas
      lines.forEach((line) => {
        ctx.beginPath();
        ctx.arc(line.end.x, line.end.y, 4, 0, Math.PI * 2); // Ajustado para o novo raio
        ctx.fillStyle = '#FDEE2F';
        ctx.fill();
      });
  
      // Desenha a linha temporária, se fornecida
      if (tempLine) {
        ctx.beginPath();
        ctx.moveTo(tempLine.start.x, tempLine.start.y);
        ctx.lineTo(tempLine.end.x, tempLine.end.y);
        ctx.strokeStyle = tempLine.color;
        ctx.lineWidth = 3; // Ajustado para o novo valor
        ctx.stroke();
  
        // Desenha o ponto no início da linha temporária
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
    const image = new Image();
    image.crossOrigin = "Anonymous";  // Permitir o carregamento da imagem sem "contaminar" o canvas
    image.src = imageUrl;

    image.onload = () => {
      canvas.width = image.width;
      canvas.height = image.height;
      ctx.drawImage(image, 0, 0);

      // Redesenhar as linhas fixadas após carregar a imagem
      redrawCanvas();
    };

    image.onerror = () => {
      console.error("Erro ao carregar a imagem.");
    };
  }
}, [imageUrl]);  // Atualiza sempre que imageUrl mudar

console.log(`Carregando imagem de: ${imageUrl}`);
  

const calculateLineLength = (start: { x: number; y: number }, end: { x: number; y: number }) => {
  return Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)).toFixed(5);
};

  const finalizeLine = (x: number, y: number) => {
    if (currentStart) {
      const length = calculateLineLength(currentStart, { x, y });
      setLines([...lines, { start: currentStart, end: { x, y }, length: parseFloat(length), color: currentColor }]);
      setCurrentStart({ x, y }); // Define o ponto final como o início da próxima linha
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
  
      // Limpa o canvas e redesenha as linhas fixadas
      ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpa o canvas
      redrawCanvas(); // Redesenha as linhas fixadas
  
      // Reseta os estados para garantir que a linha temporária seja removida
      setCurrentStart(null);
      setMousePos(null);
  
      // Reseta a cor para o padrão
      setCurrentColor('#D80300');
  
      // Força uma atualização do componente para garantir o redesenho imediato
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

  const saveCanvasAndLinesToAPI = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
  
    try {
      const imageBase64 = canvas.toDataURL('image/png'); // Converte o canvas para uma string base64
      console.log(imageBase64)
      const response = await fetch(`http://localhost:5000/maps/${mapID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          zone_image: imageBase64,
          line_list: lines.map(line => line.length), // Apenas os comprimentos das linhas
        }),
      });
  
      if (response.ok) {
        console.log('Canvas e linhas salvos com sucesso na API!');
      } else {
        console.error('Erro ao salvar canvas e linhas:', response.statusText);
      }
    } catch (error) {
      console.error('Erro ao salvar canvas e linhas:', error);
    }
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
      <div style={{ marginTop: '20px' }}>
        <button onClick={saveCanvasAndLinesToAPI} style={{ padding: '10px 20px', backgroundColor: '#4CAF50', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          Salvar Canvas e Linhas
        </button>
      </div>
    </div>
  );
};

export default Canvas;
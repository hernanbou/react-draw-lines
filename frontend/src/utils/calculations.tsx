export const calculateLineLength = (start: { x: number; y: number }, end: { x: number; y: number }) => {
    return Math.round(Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)));
};

export const drawPerpendicularLine = (ctx: CanvasRenderingContext2D, line: any, pointX: number, pointY: number) => {
    const dx = line.end.x - line.start.x;
    const dy = line.end.y - line.start.y;

    const perpendicularAngle = Math.atan2(dy, dx) + Math.PI / 2; // calcular a inclinação perpendicular
    const perpLength = 6; // comprimento do traço

    // coordenadas do traço perpendicular
    const startX = pointX + perpLength * Math.cos(perpendicularAngle);
    const startY = pointY + perpLength * Math.sin(perpendicularAngle);
    const endX = pointX - perpLength * Math.cos(perpendicularAngle);
    const endY = pointY - perpLength * Math.sin(perpendicularAngle);

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.lineWidth = 4; // espessura do traço
    ctx.strokeStyle = '#FDEE2F';
    ctx.stroke();
};
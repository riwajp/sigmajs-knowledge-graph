export function drawNodeHover(
  ctx: CanvasRenderingContext2D,
  data: any,
  settings: any
) {
  const size = data.size * 1.5; // larger
  const color = data.color || "#999";

  ctx.beginPath();
  ctx.arc(data.x, data.y, size, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
}

export function drawNodeLabel(
  ctx: CanvasRenderingContext2D,
  data: any,
  settings: any
) {
  const label = data.label;
  if (!label) return;

  let fontSize = settings.labelSize || 14;
  if (data.highlight) fontSize *= 1.1;

  ctx.font = `${fontSize}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const textWidth = ctx.measureText(label).width;
  const padding = 4;
  const bgWidth = textWidth + padding * 2;
  const bgHeight = fontSize + padding * 2;

  ctx.fillStyle = "#333333";
  ctx.fillRect(
    data.x - bgWidth / 2,
    data.y - data.size - bgHeight - 2,
    bgWidth,
    bgHeight
  );

  ctx.fillStyle = data.highlight ? "#ffffff" : "#cccccc";
  ctx.fillText(label, data.x, data.y - data.size - bgHeight / 2 - 2);
}

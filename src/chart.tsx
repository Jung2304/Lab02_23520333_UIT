/** @jsx createElement */
import { createElement } from "./jsx-runtime";
import { useEffect, useRef } from "./hooks";
import { DataPoint } from "./data-service";

export interface ChartProps {
  data: DataPoint[];
  type: "bar" | "line" | "pie";
  width?: number;
  height?: number;
  onDataPointClick?: (dataPoint: DataPoint) => void;
}

const PALETTE = [
  "#EE6055",
  "#17BEBB",
  "#AAF683",
  "#FFD97D",
  "#FF9B85",
  "#3B3C8A",
];

const Chart = ({ 
  data, 
  type, 
  width = 600, 
  height = 350,
  onDataPointClick 
}: ChartProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const hoveredIndexRef = useRef<number>(-1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.warn("⚠️ Canvas not found!");
      return;
    }
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#f9fafb";
    ctx.fillRect(0, 0, width, height);

    // Draw chart based on type
    switch (type) {
      case "bar":
        drawBarChart(ctx, data, width, height, hoveredIndexRef.current);
        break;
      case "line":
        drawLineChart(ctx, data, width, height, hoveredIndexRef.current);
        break;
      case "pie":
        drawPieChart(ctx, data, width, height, hoveredIndexRef.current);
        break;
    }

    // Setup interactivity
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      let newHoveredIndex = -1;

      if (type === "bar") {
        newHoveredIndex = getBarIndexAtPosition(x, y, data, width, height);
      } else if (type === "pie") {
        newHoveredIndex = getPieSliceAtPosition(x, y, data, width, height);
      } else if (type === "line") {
        newHoveredIndex = getLinePointAtPosition(x, y, data, width, height);
      }

      if (newHoveredIndex !== hoveredIndexRef.current) {
        hoveredIndexRef.current = newHoveredIndex;
        // Redraw with new hover state
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = "#f9fafb";
        ctx.fillRect(0, 0, width, height);

        switch (type) {
          case "bar":
            drawBarChart(ctx, data, width, height, hoveredIndexRef.current);
            break;
          case "line":
            drawLineChart(ctx, data, width, height, hoveredIndexRef.current);
            break;
          case "pie":
            drawPieChart(ctx, data, width, height, hoveredIndexRef.current);
            break;
        }
      }

      // Change cursor on hover
      canvas.style.cursor = newHoveredIndex >= 0 ? "pointer" : "default";
    };

    const handleClick = (e: MouseEvent) => {
      if (hoveredIndexRef.current >= 0 && onDataPointClick) {
        onDataPointClick(data[hoveredIndexRef.current]);
      }
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("click", handleClick);

    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("click", handleClick);
    };
  }, [data, type]);

  const renderLegend = () => (
    <div
      style={{
        marginTop: "12px",
        display: "flex",
        justifyContent: "center",
        flexWrap: "wrap",
        gap: "12px",
      }}
    >
      {data.map((d, i) => (
        <div
          key={i}
          style={{ display: "flex", alignItems: "center", gap: "6px" }}
        >
          <div
            style={{
              width: "14px",
              height: "14px",
              background: PALETTE[i % PALETTE.length],
              borderRadius: "3px",
            }}
          ></div>
          <span style={{ fontSize: "13px", color: "#374151" }}>
            {d.label}: {d.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ position: "relative", textAlign: "center" }}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{ borderRadius: "10px" }}
      />
      {renderLegend()}
    </div>
  );
};

// ============================================
// Drawing Functions
// ============================================

function drawBarChart(
  ctx: CanvasRenderingContext2D,
  data: DataPoint[],
  width: number,
  height: number,
  hoveredIndex: number
) {
  const maxVal = Math.max(...data.map((d) => d.value));
  const barWidth = width / data.length - 20;
  const padding = 10;

  data.forEach((d, i) => {
    const barHeight = (d.value / maxVal) * (height - 80);
    const x = i * (barWidth + 20) + padding;
    const y = height - barHeight - 30;

    // Highlight on hover
    const isHovered = i === hoveredIndex;
    ctx.fillStyle = PALETTE[i % PALETTE.length];
    ctx.globalAlpha = isHovered ? 1 : 0.85;

    ctx.beginPath();
    ctx.roundRect(x, y, barWidth, barHeight, 6);
    ctx.fill();

    ctx.globalAlpha = 1;

    // Draw value on top
    ctx.fillStyle = "#111827";
    ctx.font = isHovered ? "bold 14px Montserrat" : "13px Montserrat";
    ctx.textAlign = "center";
    ctx.fillText(d.value.toLocaleString(), x + barWidth / 2, y - 6);

    // Draw label at bottom
    ctx.fillStyle = "#374151";
    ctx.font = "13px Montserrat";
    ctx.fillText(d.label, x + barWidth / 2, height - 10);
  });
}

function drawLineChart(
  ctx: CanvasRenderingContext2D,
  data: DataPoint[],
  width: number,
  height: number,
  hoveredIndex: number
) {
  const maxVal = Math.max(...data.map((d) => d.value));
  const gap = width / (data.length - 1);

  // Draw gradient fill
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, "rgba(23,190,187,0.25)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");

  ctx.beginPath();
  ctx.moveTo(0, height);
  data.forEach((d, i) => {
    const x = i * gap;
    const y = height - (d.value / maxVal) * (height - 80);
    if (i === 0) ctx.lineTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.lineTo(width, height);
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();

  // Draw line
  ctx.beginPath();
  ctx.strokeStyle = "#17BEBB";
  ctx.lineWidth = 3;
  data.forEach((d, i) => {
    const x = i * gap;
    const y = height - (d.value / maxVal) * (height - 80);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  // Draw points
  data.forEach((d, i) => {
    const x = i * gap;
    const y = height - (d.value / maxVal) * (height - 80);
    const isHovered = i === hoveredIndex;
    
    ctx.fillStyle = PALETTE[i % PALETTE.length];
    ctx.beginPath();
    ctx.arc(x, y, isHovered ? 8 : 6, 0, Math.PI * 2);
    ctx.fill();

    // Draw value on hover
    if (isHovered) {
      ctx.fillStyle = "#111827";
      ctx.font = "bold 12px Montserrat";
      ctx.textAlign = "center";
      ctx.fillText(d.value.toLocaleString(), x, y - 15);
    }
  });
}

function drawPieChart(
  ctx: CanvasRenderingContext2D,
  data: DataPoint[],
  width: number,
  height: number,
  hoveredIndex: number
) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const centerX = width / 2;
  const centerY = height / 2 - 20;
  const radius = Math.min(width, height) / 3;
  let startAngle = 0;

  data.forEach((d, i) => {
    const sliceAngle = (d.value / total) * 2 * Math.PI;
    const isHovered = i === hoveredIndex;
    
    // Offset slice if hovered
    const offsetX = isHovered ? Math.cos(startAngle + sliceAngle / 2) * 10 : 0;
    const offsetY = isHovered ? Math.sin(startAngle + sliceAngle / 2) * 10 : 0;

    ctx.beginPath();
    ctx.moveTo(centerX + offsetX, centerY + offsetY);
    ctx.arc(
      centerX + offsetX,
      centerY + offsetY,
      radius,
      startAngle,
      startAngle + sliceAngle
    );
    ctx.closePath();
    ctx.fillStyle = PALETTE[i % PALETTE.length];
    ctx.globalAlpha = isHovered ? 1 : 0.85;
    ctx.fill();

    // Draw percentage in slice
    ctx.globalAlpha = 1;
    const percentage = ((d.value / total) * 100).toFixed(1);
    const midAngle = startAngle + sliceAngle / 2;
    const textX = centerX + offsetX + Math.cos(midAngle) * (radius * 0.6);
    const textY = centerY + offsetY + Math.sin(midAngle) * (radius * 0.6);

    ctx.fillStyle = "#fff";
    ctx.font = isHovered ? "bold 14px Montserrat" : "12px Montserrat";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`${percentage}%`, textX, textY);

    startAngle += sliceAngle;
  });
}

// ============================================
// Helper Functions for Interactivity
// ============================================

function getBarIndexAtPosition(
  x: number,
  y: number,
  data: DataPoint[],
  width: number,
  height: number
): number {
  const barWidth = width / data.length - 20;
  const padding = 10;
  const maxVal = Math.max(...data.map((d) => d.value));

  for (let i = 0; i < data.length; i++) {
    const barHeight = (data[i].value / maxVal) * (height - 80);
    const barX = i * (barWidth + 20) + padding;
    const barY = height - barHeight - 30;

    if (x >= barX && x <= barX + barWidth && y >= barY && y <= barY + barHeight) {
      return i;
    }
  }

  return -1;
}

function getLinePointAtPosition(
  x: number,
  y: number,
  data: DataPoint[],
  width: number,
  height: number
): number {
  const gap = width / (data.length - 1);
  const maxVal = Math.max(...data.map((d) => d.value));
  const threshold = 15; // Click threshold in pixels

  for (let i = 0; i < data.length; i++) {
    const pointX = i * gap;
    const pointY = height - (data[i].value / maxVal) * (height - 80);

    const distance = Math.sqrt(Math.pow(x - pointX, 2) + Math.pow(y - pointY, 2));
    if (distance <= threshold) {
      return i;
    }
  }

  return -1;
}

function getPieSliceAtPosition(
  x: number,
  y: number,
  data: DataPoint[],
  width: number,
  height: number
): number {
  const centerX = width / 2;
  const centerY = height / 2 - 20;
  const radius = Math.min(width, height) / 3;

  const dx = x - centerX;
  const dy = y - centerY;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance > radius) return -1;

  let angle = Math.atan2(dy, dx);
  if (angle < 0) angle += 2 * Math.PI;

  const total = data.reduce((sum, d) => sum + d.value, 0);
  let startAngle = 0;

  for (let i = 0; i < data.length; i++) {
    const sliceAngle = (data[i].value / total) * 2 * Math.PI;
    if (angle >= startAngle && angle <= startAngle + sliceAngle) {
      return i;
    }
    startAngle += sliceAngle;
  }

  return -1;
}

export { Chart };

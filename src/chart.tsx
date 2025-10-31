/** @jsx createElement */
import { createElement } from "./jsx-runtime";
import { useEffect, useRef } from "./hooks";
import { DataPoint } from "./data-service";

export interface ChartProps {
  data: DataPoint[];
  type: "bar" | "line" | "pie";
  width?: number;
  height?: number;
}

const PALETTE = [
  "#EE6055",
  "#17BEBB",
  "#AAF683",
  "#FFD97D",
  "#FF9B85",
  "#3B3C8A",
];

const Chart = ({ data, type, width = 600, height = 350 }: ChartProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.warn("⚠️ Canvas not found!");
      return;
    }
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#f9fafb";
    ctx.fillRect(0, 0, width, height);

    switch (type) {
      case "bar":
        drawBarChart(ctx, data, width, height);
        break;
      case "line":
        drawLineChart(ctx, data, width, height);
        break;
      case "pie":
        drawPieChart(ctx, data, width, height);
        break;
    }
  }, [data, type]);

  // Render legend dưới canvas
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
          <span style={{ fontSize: "13px", color: "#374151" }}>{d.label}</span>
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
      {type !== "bar" && renderLegend()}
    </div>
  );
};

// ==================== DRAW FUNCTIONS ====================

function drawBarChart(
  ctx: CanvasRenderingContext2D,
  data: DataPoint[],
  width: number,
  height: number
) {
  const maxVal = Math.max(...data.map((d) => d.value));
  const barWidth = width / data.length - 20;

  data.forEach((d, i) => {
    const barHeight = (d.value / maxVal) * (height - 80);
    const x = i * (barWidth + 20);
    const y = height - barHeight - 30;

    // Vẽ cột
    ctx.fillStyle = PALETTE[i % PALETTE.length];
    ctx.beginPath();
    ctx.roundRect(x, y, barWidth, barHeight, 6);
    ctx.fill();

    // Giá trị phía trên thanh
    ctx.fillStyle = "#111827";
    ctx.font = "13px Montserrat";
    ctx.textAlign = "center";
    ctx.fillText(d.value.toString(), x + barWidth / 2, y - 6);

    // Nhãn dưới thanh
    ctx.fillStyle = "#374151";
    ctx.font = "13px Montserrat";
    ctx.fillText(d.label, x + barWidth / 2, height - 10);
  });
}

function drawLineChart(
  ctx: CanvasRenderingContext2D,
  data: DataPoint[],
  width: number,
  height: number
) {
  const maxVal = Math.max(...data.map((d) => d.value));
  const gap = width / (data.length - 1);

  // Fill gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, "rgba(23,190,187,0.25)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");

  // Fill background area
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

  // Line stroke
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

  // Points
  data.forEach((d, i) => {
    const x = i * gap;
    const y = height - (d.value / maxVal) * (height - 80);
    ctx.fillStyle = PALETTE[i % PALETTE.length];
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawPieChart(
  ctx: CanvasRenderingContext2D,
  data: DataPoint[],
  width: number,
  height: number
) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const radius = Math.min(width, height) / 3;
  let startAngle = 0;

  data.forEach((d, i) => {
    const sliceAngle = (d.value / total) * 2 * Math.PI;
    ctx.beginPath();
    ctx.moveTo(width / 2, height / 2);
    ctx.arc(width / 2, height / 2, radius, startAngle, startAngle + sliceAngle);
    ctx.closePath();
    ctx.fillStyle = PALETTE[i % PALETTE.length];
    ctx.fill();
    startAngle += sliceAngle;
  });
}

export { Chart };

import React, { useState } from "react";

// ==========================================
// 1. BAR CHART COMPONENTS
// ==========================================
interface BarChartProps {
  data: number[];
  labels: string[];
  height?: number;
  color?: string;
  glowColor?: string;
}

export function BarChart({
  data,
  labels,
  height = 200,
  color = "#6366f1", // Indigo
  glowColor = "rgba(99, 102, 241, 0.4)",
}: BarChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const maxVal = Math.max(...data, 1);
  const paddingBottom = 25;
  const paddingTop = 20;
  const paddingLeft = 35;
  const paddingRight = 10;
  
  const chartHeight = height - paddingTop - paddingBottom;
  const chartWidth = 500;
  
  const barWidth = (chartWidth - paddingLeft - paddingRight) / data.length - 12;
  
  return (
    <div style={{ width: "100%", height: `${height}px`, position: "relative" }}>
      <svg
        viewBox={`0 0 ${chartWidth} ${height}`}
        width="100%"
        height="100%"
        style={{ overflow: "visible" }}
      >
        <defs>
          <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor="#1e1b4b" stopOpacity={0.2} />
          </linearGradient>
          <linearGradient id="barGradHover" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="50%" stopColor={color} />
            <stop offset="100%" stopColor="#131936" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Gridlines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
          const y = paddingTop + chartHeight * (1 - ratio);
          const gridVal = Math.round(maxVal * ratio);
          return (
            <g key={idx}>
              <line
                x1={paddingLeft}
                y1={y}
                x2={chartWidth - paddingRight}
                y2={y}
                stroke="rgba(255,255,255,0.06)"
                strokeDasharray="4 4"
              />
              <text
                x={paddingLeft - 8}
                y={y + 4}
                fill="#64748b"
                fontSize="10px"
                textAnchor="end"
                fontFamily="sans-serif"
              >
                {gridVal >= 1000 ? `${(gridVal / 1000).toFixed(1)}k` : gridVal}
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {data.map((val, idx) => {
          const valRatio = val / maxVal;
          const barHeight = chartHeight * valRatio;
          const x = paddingLeft + idx * (barWidth + 12) + 6;
          const y = paddingTop + chartHeight - barHeight;
          const isHovered = hoveredIdx === idx;

          return (
            <g
              key={idx}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              style={{ cursor: "pointer" }}
            >
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(barHeight, 4)}
                rx={6}
                fill={isHovered ? "url(#barGradHover)" : "url(#barGrad)"}
                stroke={isHovered ? "#a5b4fc" : "none"}
                strokeWidth={isHovered ? 1 : 0}
                style={{
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  filter: isHovered ? "url(#glow)" : "none",
                }}
              />
              <text
                x={x + barWidth / 2}
                y={height - 5}
                fill={isHovered ? "#f8fafc" : "#94a3b8"}
                fontSize="10px"
                fontWeight={isHovered ? "600" : "500"}
                textAnchor="middle"
                style={{ transition: "all 0.3s ease-out" }}
              >
                {labels[idx]}
              </text>

              {isHovered && (
                <g>
                  <rect
                    x={x + barWidth / 2 - 40}
                    y={y - 30}
                    width={80}
                    height={22}
                    rx={6}
                    fill="#1e293b"
                    stroke={color}
                    strokeWidth={1}
                  />
                  <text
                    x={x + barWidth / 2}
                    y={y - 15}
                    fill="#fff"
                    fontSize="10px"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    Rp {val.toLocaleString("id-ID")}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}


// ==========================================
// 2. LINE CHART COMPONENTS
// ==========================================
interface LineChartProps {
  data: number[];
  labels: string[];
  height?: number;
  color?: string;
  glowColor?: string;
}

export function LineChart({
  data,
  labels,
  height = 200,
  color = "#10b981",
  glowColor = "rgba(16, 185, 129, 0.4)",
}: LineChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const maxVal = Math.max(...data, 1);
  const paddingTop = 20;
  const paddingBottom = 25;
  const paddingLeft = 35;
  const paddingRight = 15;

  const chartHeight = height - paddingTop - paddingBottom;
  const chartWidth = 500;

  const pointsCount = data.length;
  const stepX = (chartWidth - paddingLeft - paddingRight) / (pointsCount - 1 || 1);

  const coords = data.map((val, idx) => {
    const x = paddingLeft + idx * stepX;
    const y = paddingTop + chartHeight - (val / maxVal) * chartHeight;
    return { x, y };
  });

  let pathD = "";
  if (coords.length > 0) {
    pathD = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const curr = coords[i];
      const next = coords[i + 1];
      const controlX1 = curr.x + stepX / 3;
      const controlY1 = curr.y;
      const controlX2 = next.x - stepX / 3;
      const controlY2 = next.y;
      pathD += ` C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${next.x} ${next.y}`;
    }
  }

  let areaD = "";
  if (coords.length > 0) {
    areaD = `${pathD} L ${coords[coords.length - 1].x} ${height - paddingBottom} L ${coords[0].x} ${height - paddingBottom} Z`;
  }

  return (
    <div style={{ width: "100%", height: `${height}px`, position: "relative" }}>
      <svg
        viewBox={`0 0 ${chartWidth} ${height}`}
        width="100%"
        height="100%"
        style={{ overflow: "visible" }}
      >
        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.4} />
            <stop offset="100%" stopColor={color} stopOpacity={0.0} />
          </linearGradient>
          <filter id="lineGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Gridlines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
          const y = paddingTop + chartHeight * (1 - ratio);
          const gridVal = Math.round(maxVal * ratio);
          return (
            <g key={idx}>
              <line
                x1={paddingLeft}
                y1={y}
                x2={chartWidth - paddingRight}
                y2={y}
                stroke="rgba(255,255,255,0.06)"
                strokeDasharray="4 4"
              />
              <text
                x={paddingLeft - 8}
                y={y + 4}
                fill="#64748b"
                fontSize="10px"
                textAnchor="end"
                fontFamily="sans-serif"
              >
                {gridVal >= 1000 ? `${(gridVal / 1000).toFixed(1)}k` : gridVal}
              </text>
            </g>
          );
        })}

        {/* Fill Area */}
        {areaD && <path d={areaD} fill="url(#lineGrad)" />}

        {/* Line Path */}
        {pathD && (
          <path
            d={pathD}
            fill="none"
            stroke={color}
            strokeWidth={3}
            strokeLinecap="round"
            style={{
              filter: `drop-shadow(0px 4px 8px ${glowColor})`,
            }}
          />
        )}

        {/* Dots */}
        {coords.map((pt, idx) => {
          const isHovered = hoveredIdx === idx;
          return (
            <g
              key={idx}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              style={{ cursor: "pointer" }}
            >
              <circle cx={pt.x} cy={pt.y} r={16} fill="transparent" />
              <circle
                cx={pt.x}
                cy={pt.y}
                r={isHovered ? 8 : 4}
                fill={isHovered ? color : "#ffffff"}
                stroke={color}
                strokeWidth={isHovered ? 2 : 1}
                style={{
                  transition: "all 0.2s ease-out",
                  filter: isHovered ? "url(#lineGlow)" : "none",
                }}
              />
              {idx % Math.ceil(coords.length / 7) === 0 && (
                <text
                  x={pt.x}
                  y={height - 5}
                  fill={isHovered ? "#f8fafc" : "#94a3b8"}
                  fontSize="10px"
                  textAnchor="middle"
                  fontWeight={isHovered ? "600" : "500"}
                  style={{ transition: "all 0.3s ease-out" }}
                >
                  {labels[idx]}
                </text>
              )}

              {isHovered && (
                <g>
                  <rect
                    x={pt.x - 40}
                    y={pt.y - 35}
                    width={80}
                    height={22}
                    rx={6}
                    fill="#1e293b"
                    stroke={color}
                    strokeWidth={1}
                  />
                  <text
                    x={pt.x}
                    y={pt.y - 20}
                    fill="#fff"
                    fontSize="10px"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    Rp {data[idx].toLocaleString("id-ID")}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}


// ==========================================
// 3. DONUT CHART COMPONENTS
// ==========================================
interface DonutChartProps {
  data: number[];
  labels: string[];
  colors?: string[];
  size?: number;
}

export function DonutChart({
  data,
  labels,
  colors = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#0ea5e9"],
  size = 200,
}: DonutChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  
  const total = data.reduce((acc, curr) => acc + curr, 0);
  const radius = 60;
  const strokeWidth = 14;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercentage = 0;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap", justifyContent: "center" }}>
      <div style={{ width: `${size}px`, height: `${size}px`, position: "relative" }}>
        <svg viewBox={`0 0 ${size} ${size}`} width="100%" height="100%">
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="rgba(255,255,255,0.04)"
            strokeWidth={strokeWidth}
          />
          {data.map((val, idx) => {
            const percentage = (val / (total || 1)) * 100;
            const strokeLength = (percentage / 100) * circumference;
            const strokeOffset = circumference - (accumulatedPercentage / 100) * circumference;
            accumulatedPercentage += percentage;

            const color = colors[idx % colors.length];
            const isHovered = hoveredIdx === idx;

            return (
              <circle
                key={idx}
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke={color}
                strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={`${strokeLength} ${circumference}`}
                strokeDashoffset={strokeOffset}
                transform={`rotate(-90 ${center} ${center})`}
                style={{
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  cursor: "pointer",
                }}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
            );
          })}

          <text
            x={center}
            y={center - 6}
            fill="#94a3b8"
            fontSize="11px"
            fontWeight="500"
            textAnchor="middle"
          >
            {hoveredIdx !== null ? labels[hoveredIdx] : "Total Nilai"}
          </text>
          <text
            x={center}
            y={center + 14}
            fill="#ffffff"
            fontSize="14px"
            fontWeight="bold"
            textAnchor="middle"
          >
            {hoveredIdx !== null
              ? `Rp ${data[hoveredIdx].toLocaleString("id-ID")}`
              : `Rp ${total.toLocaleString("id-ID")}`}
          </text>
        </svg>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {data.map((val, idx) => {
          const color = colors[idx % colors.length];
          const isHovered = hoveredIdx === idx;
          const percentage = ((val / (total || 1)) * 100).toFixed(1);

          return (
            <div
              key={idx}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                cursor: "pointer",
                padding: "4px 8px",
                borderRadius: "6px",
                background: isHovered ? "rgba(255,255,255,0.05)" : "transparent",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "3px",
                  background: color,
                  boxShadow: `0 0 8px ${color}80`,
                }}
              />
              <span style={{ fontSize: "0.85rem", color: isHovered ? "#fff" : "var(--text-secondary)", fontWeight: isHovered ? "600" : "400" }}>
                {labels[idx]} ({percentage}%)
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

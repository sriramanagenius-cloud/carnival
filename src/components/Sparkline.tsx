import React from 'react';

interface SparklineProps {
  data: number[];
  color: string;
  width?: number;
  height?: number;
}

export const Sparkline: React.FC<SparklineProps> = ({
  data,
  color,
  width = 90,
  height = 28,
}) => {
  if (!data || data.length < 2) {
    return <div style={{ width, height }} className="bg-slate-800/40 rounded" />;
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min === 0 ? 1 : max - min;
  const padding = 3;
  const effectiveHeight = height - padding * 2;

  const points = data
    .map((val, idx) => {
      const x = (idx / (data.length - 1)) * (width - 6) + 3;
      const y = height - padding - ((val - min) / range) * effectiveHeight;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const areaPoints = `${points} ${width - 3},${height} 3,${height}`;

  return (
    <svg
      width={width}
      height={height}
      className="overflow-visible"
      aria-label="Sensor trend sparkline"
    >
      <defs>
        <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#grad-${color})`} />
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
      {/* Latest reading pulse dot */}
      {data.length > 0 && (
        <circle
          cx={width - 3}
          cy={height - padding - ((data[data.length - 1] - min) / range) * effectiveHeight}
          r="2.5"
          fill={color}
        />
      )}
    </svg>
  );
};

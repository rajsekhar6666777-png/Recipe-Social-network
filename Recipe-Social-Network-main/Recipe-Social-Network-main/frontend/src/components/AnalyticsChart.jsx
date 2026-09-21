import React from 'react';

// SVG Bar Chart Component for Monthly Activity
export const BarChart = ({ data = [], height = 220 }) => {
  if (!data || data.length === 0) return null;

  const maxVal = Math.max(...data.map((d) => d.recipes), 1);
  const chartHeight = height - 40;

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <svg width="100%" height={height} style={{ overflow: 'visible' }}>
        {data.map((item, index) => {
          const barWidth = 28;
          const gap = 45;
          const x = 30 + index * gap;
          const barHeight = (item.recipes / maxVal) * chartHeight;
          const y = chartHeight - barHeight + 20;

          return (
            <g key={index}>
              {/* Bar shadow/background line */}
              <rect
                x={x}
                y={20}
                width={barWidth}
                height={chartHeight}
                rx={6}
                fill="var(--bg-input)"
              />
              {/* Active Bar */}
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(barHeight, 6)}
                rx={6}
                fill="url(#barGradient)"
                style={{ transition: 'all 0.4s ease' }}
              />
              {/* Value Label */}
              <text
                x={x + barWidth / 2}
                y={y - 6}
                textAnchor="middle"
                fontSize="11"
                fontWeight="700"
                fill="var(--primary)"
              >
                {item.recipes}
              </text>
              {/* X Axis Month Label */}
              <text
                x={x + barWidth / 2}
                y={height - 5}
                textAnchor="middle"
                fontSize="12"
                fontWeight="600"
                fill="var(--text-muted)"
              >
                {item.month}
              </text>
            </g>
          );
        })}

        {/* Gradient Def */}
        <defs>
          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" />
            <stop offset="100%" stopColor="var(--primary-hover)" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

// SVG Line Chart Component for Likes Growth
export const LineChart = ({ data = [], height = 220 }) => {
  if (!data || data.length === 0) return null;

  const maxVal = Math.max(...data.map((d) => d.likes), 1);
  const chartHeight = height - 50;
  const stepX = 60;

  const points = data
    .map((item, idx) => {
      const x = 35 + idx * stepX;
      const y = chartHeight - (item.likes / maxVal) * chartHeight + 25;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <svg width="100%" height={height} style={{ overflow: 'visible' }}>
        {/* Polyline Area fill */}
        <polygon
          points={`35,${height - 25} ${points} ${35 + (data.length - 1) * stepX},${height - 25}`}
          fill="url(#areaGradient)"
          opacity="0.25"
        />

        {/* Stroke Line */}
        <polyline
          fill="none"
          stroke="var(--secondary)"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />

        {/* Circles on points */}
        {data.map((item, idx) => {
          const x = 35 + idx * stepX;
          const y = chartHeight - (item.likes / maxVal) * chartHeight + 25;
          return (
            <g key={idx}>
              <circle cx={x} cy={y} r="5" fill="var(--secondary)" stroke="#fff" strokeWidth="2" />
              <text x={x} y={y - 10} textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--text-main)">
                {item.likes}
              </text>
              <text x={x} y={height - 5} textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--text-muted)">
                {item.month}
              </text>
            </g>
          );
        })}

        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--secondary)" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

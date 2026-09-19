import React, { useState } from 'react';

interface TrendPoint {
  date: string;
  sleep: number;
  stress: number;
  workload: number;
  energy: number;
  happiness?: number;
}

interface TrendChartProps {
  data: TrendPoint[];
}

export const TrendChart: React.FC<TrendChartProps> = ({ data }) => {
  const [activeMetric, setActiveMetric] = useState<'all' | 'sleep' | 'stress' | 'workload' | 'energy' | 'happiness'>('all');

  if (!data || data.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--ink-dim)' }}>
        No trend data available yet.
      </div>
    );
  }

  const width = 600;
  const height = 200;
  const padding = 35;

  const getPoints = (key: keyof TrendPoint) => {
    const stepX = (width - padding * 2) / Math.max(data.length - 1, 1);
    return data.map((d, i) => {
      const val = Number(d[key]) || 0;
      const y = height - padding - (val / 10) * (height - padding * 2);
      const x = padding + i * stepX;
      return `${x},${y}`;
    }).join(' ');
  };

  const metrics = [
    { key: 'sleep', label: 'Sleep (hrs)', color: '#2d7eb8' },
    { key: 'stress', label: 'Stress (1-10)', color: '#b85d52' },
    { key: 'workload', label: 'Workload (1-10)', color: '#e8813a' },
    { key: 'energy', label: 'Energy (1-10)', color: '#62794f' },
    { key: 'happiness', label: 'Happiness (1-10)', color: '#e8638a' }
  ];

  return (
    <div className="glass-panel" style={{ padding: '1.25rem 1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--ink)', fontFamily: 'var(--font-heading)', marginBottom: '0.2rem' }}>
            Multi-Signal Trend History
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--ink-dim)' }}>
            Comparing sleep, stress, workload, energy & happiness over time
          </p>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '0.35rem' }}>
          <button
            onClick={() => setActiveMetric('all')}
            style={{
              padding: '0.3rem 0.65rem',
              fontSize: '0.8rem',
              fontFamily: 'var(--font-body)',
              fontWeight: 600,
              borderRadius: '4px',
              border: '1px solid var(--line)',
              background: activeMetric === 'all' ? 'var(--blue-deep)' : 'var(--paper-deep)',
              color: activeMetric === 'all' ? '#fbf8f0' : 'var(--ink)',
              cursor: 'pointer'
            }}
          >
            All Signals
          </button>
          {metrics.map(m => (
            <button
              key={m.key}
              onClick={() => setActiveMetric(m.key as any)}
              style={{
                padding: '0.3rem 0.65rem',
                fontSize: '0.8rem',
                fontFamily: 'var(--font-body)',
                fontWeight: 600,
                borderRadius: '4px',
                border: '1px solid var(--line)',
                background: activeMetric === m.key ? 'var(--blue-tint)' : 'var(--paper-deep)',
                color: activeMetric === m.key ? m.color : 'var(--ink-soft)',
                cursor: 'pointer'
              }}
            >
              {m.label.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Chart */}
      <div style={{ width: '100%', overflowX: 'auto' }}>
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', minWidth: '460px' }}>
          {/* Horizontal grid lines */}
          {[2, 4, 6, 8, 10].map(level => {
            const y = height - padding - (level / 10) * (height - padding * 2);
            return (
              <g key={level}>
                <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#ddd0b4" strokeDasharray="3 3" />
                <text x={padding - 8} y={y + 3} fill="#8c8273" fontSize="9" textAnchor="end">{level}</text>
              </g>
            );
          })}

          {/* Date labels on X-axis */}
          {data.map((d, i) => {
            if (i % Math.ceil(data.length / 7) === 0 || i === data.length - 1) {
              const stepX = (width - padding * 2) / Math.max(data.length - 1, 1);
              const x = padding + i * stepX;
              return (
                <text key={i} x={x} y={height - 10} fill="#8c8273" fontSize="10" textAnchor="middle">
                  {d.date}
                </text>
              );
            }
            return null;
          })}

          {/* Metric lines */}
          {metrics.map(m => {
            if (activeMetric !== 'all' && activeMetric !== m.key) return null;
            const points = getPoints(m.key as any);
            return (
              <g key={m.key}>
                <polyline
                  fill="none"
                  stroke={m.color}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={points}
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '1.25rem', justifyContent: 'center', marginTop: '0.75rem', flexWrap: 'wrap' }}>
        {metrics.map(m => (
          <div key={m.key} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--ink-soft)' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: m.color }} />
            {m.label}
          </div>
        ))}
      </div>
    </div>
  );
};

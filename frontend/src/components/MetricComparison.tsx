import React from 'react';
import { Moon, Zap, Briefcase, Smile, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface MetricComparisonProps {
  label: string;
  current: number;
  baseline: number;
  unit?: string;
  type: 'sleep' | 'stress' | 'workload' | 'energy' | 'productivity';
}

export const MetricComparison: React.FC<MetricComparisonProps> = ({
  label,
  current,
  baseline,
  unit = '',
  type
}) => {
  const getIcon = () => {
    switch (type) {
      case 'sleep': return <Moon size={18} color="var(--blue-deep)" />;
      case 'stress': return <Zap size={18} color="var(--amber)" />;
      case 'workload': return <Briefcase size={18} color="var(--blue-deep)" />;
      case 'energy': return <Smile size={18} color="var(--green-deep)" />;
      default: return <Smile size={18} color="var(--green-deep)" />;
    }
  };

  const diff = current - baseline;
  const pct = baseline > 0 ? (diff / baseline) * 100 : 0;
  const isHealthy = type === 'stress' || type === 'workload' ? diff <= 0 : diff >= -0.5;

  return (
    <div className="glass-panel" style={{ padding: '1rem 1.15rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {getIcon()}
          <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--ink)' }}>{label}</span>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.2rem',
          fontSize: '0.8rem',
          fontWeight: 700,
          color: isHealthy ? 'var(--green-deep)' : 'var(--rose-deep)'
        }}>
          {Math.abs(diff) < 0.1 ? (
            <><Minus size={13} /> Baseline</>
          ) : diff > 0 ? (
            <><ArrowUpRight size={14} /> +{Math.round(pct)}%</>
          ) : (
            <><ArrowDownRight size={14} /> {Math.round(pct)}%</>
          )}
        </div>
      </div>

      {/* Numerical comparison */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
        <div>
          <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--ink)', fontFamily: 'var(--font-heading)' }}>
            {current}
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--ink-dim)', marginLeft: '0.25rem' }}>
            {unit} (Today)
          </span>
        </div>
        <div style={{ fontSize: '0.82rem', color: 'var(--ink-soft)' }}>
          Normal: <strong style={{ color: 'var(--ink)' }}>{baseline}{unit}</strong>
        </div>
      </div>

      {/* Comparative Progress Bar */}
      <div style={{ position: 'relative', height: '8px', background: 'var(--paper-deep)', border: '1px solid var(--line-subtle)', borderRadius: '4px', overflow: 'hidden' }}>
        {/* Baseline mark marker */}
        <div style={{
          position: 'absolute',
          left: `${Math.min(baseline * 10, 100)}%`,
          top: 0,
          bottom: 0,
          width: '2px',
          background: 'var(--ink)',
          zIndex: 2
        }} />
        {/* Current fill */}
        <div style={{
          height: '100%',
          width: `${Math.min(current * 10, 100)}%`,
          background: isHealthy ? 'linear-gradient(90deg, var(--green), var(--blue))' : 'linear-gradient(90deg, var(--amber), var(--rose))',
          borderRadius: '4px',
          transition: 'width 0.4s ease'
        }} />
      </div>
    </div>
  );
};

import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, Info, ArrowRight, Activity } from 'lucide-react';

interface AlertBannerProps {
  status: 'STABLE' | 'WATCH' | 'CHANGES_DETECTED' | 'SIGNIFICANT_CHANGE';
  signalStrength: number;
  headline: string;
  explanation: string;
  factors: string[];
  onOpenIntervention?: () => void;
  onOpenSimulator?: () => void;
  style?: React.CSSProperties;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({
  status,
  signalStrength,
  headline,
  explanation,
  factors,
  onOpenIntervention,
  onOpenSimulator,
  style
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'SIGNIFICANT_CHANGE':
        return {
          badgeClass: 'badge-significant',
          border: '1px solid var(--rose-border)',
          bg: 'linear-gradient(135deg, var(--rose-tint) 0%, var(--paper-card) 100%)',
          icon: AlertCircle,
          iconColor: 'var(--rose-deep)',
          label: 'Meaningful Deviation Detected'
        };
      case 'CHANGES_DETECTED':
        return {
          badgeClass: 'badge-changes',
          border: '1px solid var(--amber-border)',
          bg: 'linear-gradient(135deg, var(--amber-tint) 0%, var(--paper-card) 100%)',
          icon: AlertTriangle,
          iconColor: 'var(--amber-deep)',
          label: 'Early Pattern Shift'
        };
      case 'WATCH':
        return {
          badgeClass: 'badge-watch',
          border: '1px solid var(--blue-border)',
          bg: 'linear-gradient(135deg, var(--blue-tint) 0%, var(--paper-card) 100%)',
          icon: Info,
          iconColor: 'var(--blue-deep)',
          label: 'Minor Pattern Shifts'
        };
      default:
        return {
          badgeClass: 'badge-stable',
          border: '1px solid var(--green-border)',
          bg: 'linear-gradient(135deg, var(--green-tint) 0%, var(--paper-card) 100%)',
          icon: CheckCircle,
          iconColor: 'var(--green-deep)',
          label: 'Stable & In Baseline'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className="glass-panel" style={{
      border: config.border,
      background: config.bg,
      padding: '1.25rem 1.5rem',
      marginBottom: '0',
      position: 'relative',
      overflow: 'hidden',
      height: '100%',
      ...style
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '280px' }}>
          {/* Badge & Signal Strength */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <span className={`badge ${config.badgeClass}`}>
              <Icon size={14} color={config.iconColor} /> {status.replace('_', ' ')}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem', color: 'var(--ink-soft)' }}>
              <Activity size={14} color="var(--blue-deep)" />
              <span>Signal Strength: <strong>{Math.round(signalStrength * 100)}%</strong></span>
            </div>
          </div>

          <h2 style={{ fontSize: '1.45rem', fontWeight: 600, color: 'var(--ink)', fontFamily: 'var(--font-heading)', marginBottom: '0.4rem' }}>
            {headline}
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--ink-soft)', lineHeight: 1.55, marginBottom: '0.85rem' }}>
            {explanation}
          </p>

          {/* Factors list */}
          {factors && factors.length > 0 && (
            <div style={{
              background: 'var(--paper-deep)',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--line)'
            }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Why MindGuard flagged this:
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.9rem', color: 'var(--ink-soft)', display: 'grid', gap: '0.3rem' }}>
                {factors.map((factor, idx) => (
                  <li key={idx}>{factor}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Action CTAs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '190px' }}>
          {status !== 'STABLE' && onOpenIntervention && (
            <button onClick={onOpenIntervention} className="btn btn-primary" style={{ fontSize: '0.9rem' }}>
              View Recommended Steps <ArrowRight size={15} />
            </button>
          )}
          {onOpenSimulator && (
            <button onClick={onOpenSimulator} className="btn btn-secondary" style={{ fontSize: '0.88rem' }}>
              Test Workload Relief
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

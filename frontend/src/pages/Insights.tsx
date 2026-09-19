import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { InsightsData } from '../types';
import { Activity, Cpu, TrendingUp, TrendingDown, Minus } from 'lucide-react';

export const Insights: React.FC = () => {
  const [data, setData] = useState<InsightsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setIsLoading(true);
        const res = await api.getInsights();
        setData(res);
      } catch (err) {
        console.error('Failed to load insights:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInsights();
  }, []);

  if (isLoading || !data) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--ink-soft)' }}>
        Analyzing SilentSignals and Isolation Forest distributions...
      </div>
    );
  }

  const { status, headline, ml_anomaly_score, is_ml_anomaly, feature_analysis } = data;

  const featureNames: Record<string, string> = {
    sleep_hours: 'Sleep Duration',
    stress: 'Stress Intensity',
    workload: 'Academic Workload',
    energy: 'Vitality / Energy',
    productivity: 'Study Productivity'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '880px', margin: '0 auto' }}>
      <div>
        <h1 style={{ fontSize: '2.1rem', fontWeight: 700, color: 'var(--ink)', fontFamily: 'var(--font-heading)', marginBottom: '0.25rem' }}>
          SilentSignals & Anomaly Intelligence
        </h1>
        <p style={{ fontSize: '0.95rem', color: 'var(--ink-soft)' }}>
          Detailed mathematical breakdown comparing your current 7-day rolling patterns against your personal baseline.
        </p>
      </div>

      {/* Model & Detection Summary */}
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <Activity size={18} color="var(--green-deep)" />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--green-deep)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              MindGuard Aggregate Status
            </span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--ink)', fontFamily: 'var(--font-heading)', marginBottom: '0.25rem' }}>
            {status.replace('_', ' ')}
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--ink-soft)', lineHeight: 1.45 }}>
            {headline}
          </p>
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <Cpu size={18} color="var(--blue-deep)" />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--blue-deep)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Isolation Forest ML Engine
            </span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: is_ml_anomaly ? 'var(--rose-deep)' : 'var(--green-deep)', fontFamily: 'var(--font-heading)', marginBottom: '0.25rem' }}>
            {Math.round(ml_anomaly_score * 100)}% Anomaly Score
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--ink-soft)', lineHeight: 1.45 }}>
            {is_ml_anomaly
              ? 'scikit-learn Isolation Forest flagged multi-dimensional vector variance beyond standard tolerance.'
              : 'Statistical inlier: multidimensional pattern remains within expected student baseline variance.'}
          </p>
        </div>
      </div>

      {/* Feature Breakdown Table */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--ink)', fontFamily: 'var(--font-heading)', marginBottom: '1rem' }}>
          Personal Baseline Deviation Analysis
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--line)', color: 'var(--ink-dim)', textAlign: 'left' }}>
                <th style={{ padding: '0.65rem 0.5rem' }}>Feature</th>
                <th style={{ padding: '0.65rem 0.5rem' }}>Personal Mean (μ)</th>
                <th style={{ padding: '0.65rem 0.5rem' }}>Std Dev (σ)</th>
                <th style={{ padding: '0.65rem 0.5rem' }}>Current 7d Avg</th>
                <th style={{ padding: '0.65rem 0.5rem' }}>Baseline Shift</th>
                <th style={{ padding: '0.65rem 0.5rem' }}>Trend</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(feature_analysis).map(([key, feat]) => {
                const isHealthy = key === 'stress' || key === 'workload' ? feat.deviation <= 0 : feat.deviation >= -0.5;
                return (
                  <tr key={key} style={{ borderBottom: '1px solid var(--line-subtle)' }}>
                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600, color: 'var(--ink)' }}>
                      {featureNames[key] || key}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', color: 'var(--ink-soft)' }}>
                      {feat.mean}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', color: 'var(--ink-soft)' }}>
                      ±{feat.std_dev}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: 700, color: 'var(--ink)' }}>
                      {feat.current_7d_avg}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: 700, color: isHealthy ? 'var(--green-deep)' : 'var(--rose-deep)' }}>
                      {feat.deviation > 0 ? `+${feat.deviation}` : feat.deviation} ({feat.deviation_percent > 0 ? `+${feat.deviation_percent}` : feat.deviation_percent}%)
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        fontSize: '0.82rem',
                        color: feat.trend === 'increasing' ? (key === 'stress' ? 'var(--rose-deep)' : 'var(--green-deep)') : feat.trend === 'decreasing' ? (key === 'sleep' ? 'var(--rose-deep)' : 'var(--green-deep)') : 'var(--ink-dim)'
                      }}>
                        {feat.trend === 'increasing' && <TrendingUp size={14} />}
                        {feat.trend === 'decreasing' && <TrendingDown size={14} />}
                        {feat.trend === 'stable' && <Minus size={14} />}
                        {feat.trend}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

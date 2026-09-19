import React from 'react';
import { DashboardData } from '../types';
import { AlertBanner } from '../components/AlertBanner';
import { MetricComparison } from '../components/MetricComparison';
import { TrendChart } from '../components/TrendChart';
import { TaskCalendar } from '../components/TaskCalendar';
import { Calendar, ListTodo, Gamepad2, ArrowRight } from 'lucide-react';

interface DashboardProps {
  data: DashboardData | null;
  onNavigate: (tab: string) => void;
  onOpenIntervention: () => void;
  isLoading: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({
  data,
  onNavigate,
  onOpenIntervention,
  isLoading
}) => {
  if (isLoading || !data) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--ink-soft)' }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid var(--line)',
          borderTopColor: 'var(--green-deep)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 1rem auto'
        }} />
        Loading Esprit wellbeing intelligence...
      </div>
    );
  }

  const { metrics, baselines, workload, recent_trend, status, signal_strength, headline, explanation, changes } = data;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Greeting & Today Summary Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.1rem', fontWeight: 700, color: 'var(--ink)', fontFamily: 'var(--font-heading)', letterSpacing: '-0.01em', marginBottom: '0.25rem' }}>
            Hello, {data.user_name} 👋
          </h1>
          <p style={{ fontSize: '0.98rem', color: 'var(--ink-soft)' }}>
            Esprit has analyzed your latest check-ins against your personal baseline.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => onNavigate('checkin')} className="btn btn-primary">
            <Calendar size={16} /> Daily Check-In
          </button>
          <button onClick={() => onNavigate('remind')} className="btn btn-secondary">
            <Gamepad2 size={16} /> ReMind Micro-Game
          </button>
        </div>
      </div>

      {/* MindGuard Proactive Alert Banner & Academic Deadlines Calendar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '1.25rem',
        alignItems: 'stretch'
      }}>
        <AlertBanner
          status={status}
          signalStrength={signal_strength}
          headline={headline}
          explanation={explanation}
          factors={changes}
          onOpenIntervention={onOpenIntervention}
          onOpenSimulator={() => onNavigate('simulator')}
        />
        <TaskCalendar
          taskDeadlines={data.task_deadlines || []}
          onNavigate={onNavigate}
        />
      </div>

      {/* Metric Comparisons Grid: Today vs Personal Baseline */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--ink)', fontFamily: 'var(--font-heading)' }}>
            Signals vs. Personal Baseline
          </h3>
          <span style={{ fontSize: '0.82rem', color: 'var(--ink-dim)' }}>
            Calculated from your historical moving normal
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem'
        }}>
          <MetricComparison
            label="Sleep Duration"
            current={metrics.sleep}
            baseline={baselines.sleep_hours || 7.5}
            unit="h"
            type="sleep"
          />
          <MetricComparison
            label="Stress Level"
            current={metrics.stress}
            baseline={baselines.stress || 3.5}
            unit="/10"
            type="stress"
          />
          <MetricComparison
            label="Workload Rating"
            current={metrics.workload}
            baseline={baselines.workload || 4.5}
            unit="/10"
            type="workload"
          />
          <MetricComparison
            label="Daily Energy"
            current={metrics.energy}
            baseline={baselines.energy || 7.2}
            unit="/10"
            type="energy"
          />
        </div>
      </div>

      {/* Academic Workload & ReMind Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {/* Academic Workload Card */}
        <div className="glass-panel" style={{ padding: '1.25rem 1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ListTodo size={18} color="var(--blue-deep)" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--ink)', fontFamily: 'var(--font-heading)' }}>Upcoming Academic Tasks</h3>
            </div>
            <button onClick={() => onNavigate('tasks')} className="btn btn-sm btn-secondary">
              Manage <ArrowRight size={13} />
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1rem' }}>
            <div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--ink)', fontFamily: 'var(--font-heading)' }}>
                {workload.total_hours}<span style={{ fontSize: '0.9rem', color: 'var(--ink-dim)' }}> hrs</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--ink-soft)' }}>Estimated Workload</div>
            </div>

            <div style={{ height: '35px', width: '1px', background: 'var(--line)' }} />

            <div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: workload.high_priority_count > 1 ? 'var(--rose-deep)' : 'var(--blue-deep)', fontFamily: 'var(--font-heading)' }}>
                {workload.high_priority_count}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--ink-soft)' }}>High Priority</div>
            </div>

            <div style={{ height: '35px', width: '1px', background: 'var(--line)' }} />

            <div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: workload.daily_pressure_score > 70 ? 'var(--rose-deep)' : 'var(--green-deep)', fontFamily: 'var(--font-heading)' }}>
                {Math.round(workload.daily_pressure_score)}%
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--ink-soft)' }}>Pressure Score</div>
            </div>
          </div>

          {/* Workload meter */}
          <div style={{ height: '8px', background: 'var(--paper-deep)', border: '1px solid var(--line-subtle)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${Math.min(workload.daily_pressure_score, 100)}%`,
              background: workload.daily_pressure_score > 70 ? 'linear-gradient(90deg, var(--amber), var(--rose))' : 'linear-gradient(90deg, var(--green), var(--blue))'
            }} />
          </div>
        </div>

        {/* ReMind Micro-Activity Status Card */}
        <div className="glass-panel" style={{ padding: '1.25rem 1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Gamepad2 size={18} color="var(--green-deep)" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--ink)', fontFamily: 'var(--font-heading)' }}>ReMind Micro-Games</h3>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--ink-dim)' }}>30–60 SECONDS</span>
          </div>

          <p style={{ fontSize: '0.92rem', color: 'var(--ink-soft)', lineHeight: 1.55, marginBottom: '1rem' }}>
            {data.remind_completed_today
              ? 'Great work! You already completed an interaction today. Feel free to try a Reset breathing cycle anytime.'
              : 'Take 45 seconds for a visual focus or reaction interaction. It adds real-world cognitive nuance to your personal baseline.'}
          </p>

          <button onClick={() => onNavigate('remind')} className="btn btn-accent" style={{ width: '100%' }}>
            {data.remind_completed_today ? 'Explore More Activities' : 'Start Focus Micro-Challenge (45s)'}
          </button>
        </div>
      </div>

      {/* Multi-Signal Trend History */}
      <TrendChart data={recent_trend} />
    </div>
  );
};

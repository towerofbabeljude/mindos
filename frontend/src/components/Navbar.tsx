import React from 'react';
import { Sparkles, ShieldCheck, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface NavbarProps {
  status?: string;
  onSeedDemo: (mode: 'normal' | 'stressful') => void;
  isSeeding: boolean;
  demoMode: 'normal' | 'stressful';
  userName?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onSeedDemo, isSeeding, demoMode, userName }) => {
  const getInitials = (name?: string) => {
    if (!name) return 'ES';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const initials = getInitials(userName);

  return (
    <header className="glass-panel" style={{
      position: 'sticky',
      top: '1rem',
      zIndex: 40,
      margin: '0.75rem 1.25rem',
      padding: '0.75rem 1.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderRadius: 'var(--radius-md)',
      border: '1px solid var(--line)',
      background: 'var(--bg-card)',
    }}>
      {/* Brand logo & tagline */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, var(--green-deep) 0%, var(--blue-deep) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 10px var(--green-glow)',
        }}>
          <ShieldCheck size={22} color="#fbf8f0" />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.45rem', fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--ink)', fontFamily: 'var(--font-heading)' }}>
              Es<span style={{ color: 'var(--blue-deep)' }}>prit</span>
            </span>
            <span style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              padding: '0.15rem 0.5rem',
              background: 'var(--green-tint)',
              color: 'var(--green-deep)',
              borderRadius: '4px',
              border: '1px solid var(--green-border)',
              letterSpacing: '0.04em'
            }}>
              EARLY SIGNAL
            </span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--ink-dim)', margin: 0 }}>
            Student Wellbeing & Baseline Intelligence
          </p>
        </div>
      </div>

      {/* Right controls: Demo Switcher & User Avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          background: 'var(--paper-deep)',
          padding: '0.3rem 0.4rem',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--line)'
        }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--ink-soft)', paddingLeft: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Sparkles size={13} color="var(--amber)" /> Demo Scenario:
          </span>
          <button
            onClick={() => onSeedDemo('normal')}
            disabled={isSeeding}
            className={`btn btn-sm ${demoMode === 'normal' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.8rem', padding: '0.25rem 0.65rem' }}
          >
            <CheckCircle2 size={13} /> Normal
          </button>
          <button
            onClick={() => onSeedDemo('stressful')}
            disabled={isSeeding}
            className={`btn btn-sm ${demoMode === 'stressful' ? 'btn-rose' : 'btn-secondary'}`}
            style={{ fontSize: '0.8rem', padding: '0.25rem 0.65rem' }}
          >
            <AlertTriangle size={13} /> Crunch Mode
          </button>
        </div>

        {/* User avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div
            title={userName || 'Student Profile'}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'var(--blue-tint)',
              border: '1px solid var(--blue-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.88rem',
              color: 'var(--blue-deep)'
            }}
          >
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
};

import React from 'react';
import {
  LayoutDashboard,
  CalendarCheck,
  Gamepad2,
  ListTodo,
  Activity,
  HeartHandshake,
  Sliders,
  Settings,
  ShieldCheck,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  status?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onTabChange }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'checkin', label: 'Daily Check-In', icon: CalendarCheck, badge: '30s' },
    { id: 'remind', label: 'ReMind Activities', icon: Gamepad2, badge: 'Micro' },
    { id: 'tasks', label: 'Academic Tasks', icon: ListTodo },
    { id: 'insights', label: 'SilentSignals', icon: Activity },
    { id: 'interventions', label: 'Proactive Support', icon: HeartHandshake },
    { id: 'simulator', label: 'What-If Simulator', icon: Sliders },
    { id: 'chatbot', label: 'Wellbeing Chat', icon: HeartHandshake, badge: 'Companion' },
    { id: 'settings', label: 'Settings & Privacy', icon: Settings },
  ];

  return (
    <aside style={{
      width: '240px',
      padding: '1.25rem 1rem',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      gap: '1.5rem',
    }}>
      {/* Navigation links */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        <div style={{
          fontSize: '0.75rem',
          fontWeight: 700,
          color: 'var(--ink-dim)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          padding: '0 0.75rem 0.5rem 0.75rem'
        }}>
          Navigation
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.7rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: isActive ? 'var(--green-tint)' : 'transparent',
                color: isActive ? 'var(--green-deep)' : 'var(--ink-soft)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.92rem',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.18s ease',
                borderLeft: isActive ? '3px solid var(--green-deep)' : '3px solid transparent'
              }}
              onMouseEnter={(e) => {
                if (!isActive) (e.currentTarget.style.background = 'var(--paper-deep)');
              }}
              onMouseLeave={(e) => {
                if (!isActive) (e.currentTarget.style.background = 'transparent');
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Icon size={18} color={isActive ? 'var(--green-deep)' : 'currentColor'} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span style={{
                  fontSize: '0.68rem',
                  padding: '0.1rem 0.45rem',
                  background: 'var(--paper-deep)',
                  color: 'var(--ink-dim)',
                  borderRadius: '4px',
                  border: '1px solid var(--line-subtle)'
                }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Safety Notice Footer Card */}
      <div className="glass-panel" style={{
        padding: '0.85rem',
        background: 'var(--paper-card)',
        fontSize: '0.8rem',
        color: 'var(--ink-dim)',
        lineHeight: 1.45,
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--line)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--blue-deep)', marginBottom: '0.35rem', fontWeight: 700 }}>
          <ShieldCheck size={15} /> Product Boundary
        </div>
        Esprit offers wellbeing insights relative to your personal baseline. It does not provide medical or clinical diagnosis.
      </div>
    </aside>
  );
};

import React, { useState } from 'react';
import { ArrowLeft, Volume2, VolumeX } from 'lucide-react';
import { sound } from './soundEffects';

interface MiniGameHeaderProps {
  title: string;
  subtitle?: string;
  onBack: () => void;
  actions?: React.ReactNode;
}

export const MiniGameHeader: React.FC<MiniGameHeaderProps> = ({
  title,
  subtitle,
  onBack,
  actions,
}) => {
  const [muted, setMuted] = useState(sound.getMuted());

  const handleToggleMute = () => {
    const next = sound.toggleMute();
    setMuted(next);
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid var(--line-subtle)',
        marginBottom: '1.25rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        <button
          onClick={onBack}
          className="btn btn-secondary btn-sm"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.4rem 0.75rem',
            borderRadius: '999px',
          }}
          title="Return to ReMind Activities"
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>

        <div>
          <h2
            style={{
              fontSize: '1.45rem',
              fontWeight: 700,
              fontFamily: 'var(--font-heading)',
              color: 'var(--ink)',
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            {title}
          </h2>
          {subtitle && (
            <p
              style={{
                fontSize: '0.85rem',
                color: 'var(--ink-soft)',
                margin: '0.2rem 0 0 0',
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {actions}

        <button
          onClick={handleToggleMute}
          className="btn btn-secondary btn-sm"
          style={{
            padding: '0.45rem',
            borderRadius: '50%',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '34px',
            height: '34px',
          }}
          title={muted ? 'Unmute game sounds' : 'Mute game sounds'}
        >
          {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
      </div>
    </div>
  );
};

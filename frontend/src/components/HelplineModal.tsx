import React from 'react';
import { Phone, Heart, X, AlertTriangle } from 'lucide-react';

interface HelplineModalProps {
  onClose: () => void;
  isCrunchMode?: boolean;
}

export const HelplineModal: React.FC<HelplineModalProps> = ({ onClose, isCrunchMode }) => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(43, 39, 31, 0.60)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 200,
      padding: '1rem',
      animation: 'fadeInModal 0.3s ease'
    }}>
      <div style={{
        maxWidth: '560px',
        width: '100%',
        background: 'linear-gradient(150deg, #fef9f0 0%, #fdeee3 40%, #fef3e8 100%)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--sunset-border)',
        boxShadow: '0 20px 60px rgba(232, 129, 58, 0.25), 0 4px 20px rgba(43, 39, 31, 0.10)',
        padding: '2rem 2.25rem',
        position: 'relative',
        animation: 'slideUpModal 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--ink-dim)',
            padding: '0.25rem',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <X size={20} />
        </button>

        {/* Crunch mode banner */}
        {isCrunchMode && (
          <div style={{
            background: 'linear-gradient(125deg, var(--crunch-orange), var(--sunset))',
            borderRadius: 'var(--radius-sm)',
            padding: '0.65rem 1rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            color: '#fefcf5',
          }}>
            <AlertTriangle size={18} />
            <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>
              Crunch Mode Active — you&apos;ve been highly stressed for several days. Please reach out if needed.
            </span>
          </div>
        )}

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--sunset-soft), var(--golden))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 0.85rem auto',
            boxShadow: '0 4px 16px var(--sunset-glow)',
          }}>
            <Heart size={28} color="#2b271f" fill="rgba(43,39,31,0.15)" />
          </div>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            fontFamily: 'var(--font-heading)',
            color: 'var(--ink)',
            marginBottom: '0.35rem',
          }}>
            🫶 We are ALWAYS here for you 🫶
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--ink-soft)', maxWidth: '420px', margin: '0 auto' }}>
            You don&apos;t have to go through this alone. These helplines are confidential and free.
          </p>
        </div>

        {/* VIT Helplines */}
        <div style={{
          background: 'rgba(255,255,255,0.65)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--sunset-border)',
          padding: '1.1rem 1.35rem',
          marginBottom: '1rem',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '0.85rem',
          }}>
            <div style={{
              width: '30px',
              height: '30px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, var(--sunset), var(--sunset-soft))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Phone size={15} color="#fefcf5" />
            </div>
            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--ink)', fontFamily: 'var(--font-heading)' }}>
              VIT Mental Health & Student Helpline
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--sunset-deep)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.15rem' }}>
                  24×7 Ladies Hostel
                </div>
                <a href="tel:04162202705" style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--blue-deep)', textDecoration: 'none', fontFamily: 'var(--font-heading)', letterSpacing: '0.02em' }}>
                  0416-2202705
                </a>
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--sunset-deep)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.15rem' }}>
                  24×7 Men&apos;s Hostel
                </div>
                <a href="tel:04162202521" style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--blue-deep)', textDecoration: 'none', fontFamily: 'var(--font-heading)', letterSpacing: '0.02em' }}>
                  0416-2202521
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* India Helplines */}
        <div style={{
          background: 'rgba(255,255,255,0.65)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--blue-border)',
          padding: '1.1rem 1.35rem',
          marginBottom: '1.5rem',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '0.85rem',
          }}>
            <div style={{
              width: '30px',
              height: '30px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, var(--blue-deep), var(--blue-mid))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Phone size={15} color="#fefcf5" />
            </div>
            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--ink)', fontFamily: 'var(--font-heading)' }}>
              India National Helplines
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--blue-deep)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.15rem' }}>
                iCall Helpline · 24×7
              </div>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <a href="tel:14416" style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--blue-deep)', textDecoration: 'none', fontFamily: 'var(--font-heading)' }}>
                  14416
                </a>
                <span style={{ color: 'var(--ink-dim)', alignSelf: 'center' }}>or</span>
                <a href="tel:18008914416" style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--blue-deep)', textDecoration: 'none', fontFamily: 'var(--font-heading)' }}>
                  1800-891-4416
                </a>
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--blue-deep)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.15rem' }}>
                Suicide Prevention Helpline · Mon–Sun, 8am–10pm
              </div>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <a href="tel:04424640050" style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--blue-deep)', textDecoration: 'none', fontFamily: 'var(--font-heading)' }}>
                  044-2464-0050
                </a>
                <span style={{ color: 'var(--ink-dim)', alignSelf: 'center' }}>or</span>
                <a href="tel:04424640060" style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--blue-deep)', textDecoration: 'none', fontFamily: 'var(--font-heading)' }}>
                  044-2464-0060
                </a>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={onClose}
            className="btn btn-primary"
            style={{ flex: 1, justifyContent: 'center' }}
          >
            <Heart size={15} /> I&apos;m okay for now
          </button>
        </div>
      </div>
    </div>
  );
};

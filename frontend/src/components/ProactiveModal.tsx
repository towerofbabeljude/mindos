import React, { useState } from 'react';
import { Intervention } from '../types';
import { CheckCircle2, X, Star, HeartHandshake } from 'lucide-react';

interface ProactiveModalProps {
  intervention: Intervention;
  onAccept: (id: number) => void;
  onDismiss: (id: number) => void;
  onSubmitFeedback: (id: number, rating: number, helpful: string, feedback?: string) => void;
  onClose: () => void;
}

export const ProactiveModal: React.FC<ProactiveModalProps> = ({
  intervention,
  onAccept,
  onDismiss,
  onSubmitFeedback,
  onClose
}) => {
  const [showFeedback, setShowFeedback] = useState(false);
  const [rating, setRating] = useState(5);
  const [helpful, setHelpful] = useState('yes_a_lot');
  const [comment, setComment] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const handleAction = (type: 'accept' | 'dismiss') => {
    if (type === 'accept') {
      onAccept(intervention.id);
      setShowFeedback(true);
    } else {
      onDismiss(intervention.id);
      onClose();
    }
  };

  const handleSendFeedback = () => {
    onSubmitFeedback(intervention.id, rating, helpful, comment);
    setFeedbackSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(43, 39, 31, 0.55)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '1.25rem'
    }}>
      <div className="glass-panel" style={{
        maxWidth: '520px',
        width: '100%',
        padding: '1.75rem',
        background: 'var(--paper-card)',
        border: '1px solid var(--line)',
        boxShadow: '0 20px 50px rgba(43, 39, 31, 0.25)',
        position: 'relative',
        borderRadius: 'var(--radius-lg)'
      }}>
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'var(--paper-deep)',
            border: '1px solid var(--line-subtle)',
            color: 'var(--ink-dim)',
            cursor: 'pointer',
            padding: '0.4rem',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <X size={16} />
        </button>

        {!showFeedback ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'var(--green-tint)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--green-deep)'
              }}>
                <HeartHandshake size={20} />
              </div>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--green-deep)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Proactive Next Step
              </span>
            </div>

            <h2 style={{ fontSize: '1.45rem', fontWeight: 600, color: 'var(--ink)', fontFamily: 'var(--font-heading)', marginBottom: '0.4rem' }}>
              {intervention.title}
            </h2>
            <p style={{ fontSize: '0.92rem', color: 'var(--ink-soft)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              {intervention.reason}
            </p>

            <div style={{
              background: 'var(--paper-deep)',
              padding: '1rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--line)',
              marginBottom: '1.5rem'
            }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--ink)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Suggested Action Plan:
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.9rem', color: 'var(--ink-soft)', display: 'grid', gap: '0.45rem' }}>
                {intervention.steps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ul>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => handleAction('accept')}
                className="btn btn-primary"
                style={{ flex: 1 }}
              >
                <CheckCircle2 size={16} /> Accept & Try This
              </button>
              <button
                onClick={() => handleAction('dismiss')}
                className="btn btn-secondary"
              >
                I'm Doing Okay
              </button>
            </div>
          </div>
        ) : (
          <div>
            {!feedbackSubmitted ? (
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--ink)', fontFamily: 'var(--font-heading)', marginBottom: '0.35rem' }}>
                  Helpful Feedback Loop
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--ink-soft)', marginBottom: '1.25rem' }}>
                  Esprit learns your preferences. Did this recommendation fit your current study situation?
                </p>

                {/* Rating stars */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      onClick={() => setRating(s)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '0.2rem'
                      }}
                    >
                      <Star size={24} fill={s <= rating ? 'var(--amber)' : 'none'} color={s <= rating ? 'var(--amber)' : 'var(--line)'} />
                    </button>
                  ))}
                </div>

                {/* Helpful choices */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                  {[
                    { id: 'yes_a_lot', label: 'Yes, very helpful' },
                    { id: 'somewhat', label: 'Somewhat' },
                    { id: 'not_really', label: 'Not really' }
                  ].map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => setHelpful(opt.id)}
                      style={{
                        padding: '0.4rem 0.8rem',
                        fontSize: '0.85rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--line)',
                        background: helpful === opt.id ? 'var(--green-tint)' : 'var(--paper-deep)',
                        color: helpful === opt.id ? 'var(--green-deep)' : 'var(--ink-soft)',
                        cursor: 'pointer'
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                <textarea
                  className="input-field"
                  placeholder="Optional notes on what worked or what you'd prefer..."
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  style={{ marginBottom: '1.25rem', resize: 'none' }}
                />

                <button onClick={handleSendFeedback} className="btn btn-primary" style={{ width: '100%' }}>
                  Submit Feedback
                </button>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                <CheckCircle2 size={42} color="var(--green-deep)" style={{ margin: '0 auto 0.75rem auto' }} />
                <h3 style={{ fontSize: '1.2rem', color: 'var(--ink)', fontFamily: 'var(--font-heading)', marginBottom: '0.25rem' }}>Feedback Saved</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--ink-soft)' }}>
                  Esprit will adapt future recommendations based on your input.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

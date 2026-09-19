import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Intervention } from '../types';
import { HeartHandshake, CheckCircle2, XCircle, Star, Calendar, Phone, Heart, ChevronDown, ChevronUp } from 'lucide-react';

export const Interventions: React.FC = () => {
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFeedbackId, setSelectedFeedbackId] = useState<number | null>(null);
  const [feedbackRating, setFeedbackRating] = useState<number>(5);
  const [feedbackHelpful, setFeedbackHelpful] = useState<string>('yes_a_lot');
  const [feedbackNotes, setFeedbackNotes] = useState<string>('');
  const [feedbackStatus, setFeedbackStatus] = useState<string | null>(null);
  const [showHelplines, setShowHelplines] = useState(true);

  const loadInterventions = async () => {
    try {
      setIsLoading(true);
      const res = await api.getInterventions();
      setInterventions(res);
    } catch (err) {
      console.error('Failed to load interventions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInterventions();
  }, []);

  const handleAction = async (id: number, action: 'accept' | 'dismiss') => {
    try {
      await api.takeInterventionAction(id, action);
      if (action === 'accept') {
        setSelectedFeedbackId(id);
      }
      loadInterventions();
    } catch (err) {
      console.error('Failed to update intervention action:', err);
    }
  };

  const handleFeedbackSubmit = async (id: number) => {
    try {
      await api.submitInterventionFeedback(id, feedbackRating, feedbackHelpful, feedbackNotes);
      setFeedbackStatus('Feedback submitted! Thank you.');
      setTimeout(() => {
        setSelectedFeedbackId(null);
        setFeedbackStatus(null);
      }, 1500);
    } catch (err) {
      console.error('Failed to submit feedback:', err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '820px', margin: '0 auto' }}>
      <div>
        <h1 style={{ fontSize: '2.1rem', fontWeight: 700, color: 'var(--ink)', fontFamily: 'var(--font-heading)', marginBottom: '0.25rem' }}>
          Proactive Support
        </h1>
        <p style={{ fontSize: '0.95rem', color: 'var(--ink-soft)' }}>
          Targeted suggestions offered when MindGuard spots early deviations in your routine. Always optional and student-directed.
        </p>
      </div>

      {/* ── Helpline Numbers Section ── */}
      <div style={{
        background: 'linear-gradient(135deg, #fef3e5 0%, #fdeee0 50%, #fef8e8 100%)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--sunset-border)',
        boxShadow: '0 4px 20px var(--sunset-glow)',
        overflow: 'hidden',
      }}>
        {/* Header row */}
        <button
          onClick={() => setShowHelplines(!showHelplines)}
          style={{
            width: '100%',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--sunset-soft), var(--golden))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 3px 10px var(--sunset-glow)',
            }}>
              <Heart size={20} color="#2b271f" />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--ink)', fontFamily: 'var(--font-heading)' }}>
                🫶 We are ALWAYS here for you 🫶
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--sunset-deep)', fontWeight: 600 }}>
                Helpline Numbers — Confidential & Free
              </div>
            </div>
          </div>
          {showHelplines ? <ChevronUp size={18} color="var(--ink-dim)" /> : <ChevronDown size={18} color="var(--ink-dim)" />}
        </button>

        {showHelplines && (
          <div style={{ padding: '0 1.5rem 1.5rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* VIT Helplines */}
            <div style={{
              background: 'rgba(255,255,255,0.7)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--sunset-border)',
              padding: '1rem 1.25rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
                <div style={{
                  width: '28px', height: '28px', borderRadius: '7px',
                  background: 'linear-gradient(135deg, var(--sunset), var(--sunset-soft))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Phone size={14} color="#fefcf5" />
                </div>
                <span style={{ fontWeight: 700, color: 'var(--ink)', fontSize: '0.95rem', fontFamily: 'var(--font-heading)' }}>
                  VIT Mental Health & Student Helpline
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--sunset-deep)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>
                    24×7 Ladies Hostel
                  </div>
                  <a href="tel:04162202705" style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--blue-deep)', textDecoration: 'none', fontFamily: 'var(--font-heading)' }}>
                    0416-2202705
                  </a>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--sunset-deep)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>
                    24×7 Men's Hostel
                  </div>
                  <a href="tel:04162202521" style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--blue-deep)', textDecoration: 'none', fontFamily: 'var(--font-heading)' }}>
                    0416-2202521
                  </a>
                </div>
              </div>
            </div>

            {/* India Helplines */}
            <div style={{
              background: 'rgba(255,255,255,0.7)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--blue-border)',
              padding: '1rem 1.25rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
                <div style={{
                  width: '28px', height: '28px', borderRadius: '7px',
                  background: 'linear-gradient(135deg, var(--blue-deep), var(--blue-mid))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Phone size={14} color="#fefcf5" />
                </div>
                <span style={{ fontWeight: 700, color: 'var(--ink)', fontSize: '0.95rem', fontFamily: 'var(--font-heading)' }}>
                  India National Helplines
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--blue-deep)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>
                    iCall · 24×7
                  </div>
                  <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <a href="tel:14416" style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--blue-deep)', textDecoration: 'none', fontFamily: 'var(--font-heading)' }}>14416</a>
                    <span style={{ color: 'var(--ink-dim)', fontSize: '0.85rem' }}>or</span>
                    <a href="tel:18008914416" style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--blue-deep)', textDecoration: 'none', fontFamily: 'var(--font-heading)' }}>1800-891-4416</a>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--blue-deep)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>
                    Suicide Prevention · Mon–Sun 8am–10pm
                  </div>
                  <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <a href="tel:04424640050" style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--blue-deep)', textDecoration: 'none', fontFamily: 'var(--font-heading)' }}>044-2464-0050</a>
                    <span style={{ color: 'var(--ink-dim)', fontSize: '0.85rem' }}>or</span>
                    <a href="tel:04424640060" style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--blue-deep)', textDecoration: 'none', fontFamily: 'var(--font-heading)' }}>044-2464-0060</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--ink-soft)' }}>Loading suggestions...</div>
      ) : interventions.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--ink-dim)' }}>
          No active interventions right now. Your routine is currently in good balance!
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {interventions.map((item) => (
            <div key={item.id} className="glass-panel" style={{ padding: '1.5rem', border: item.is_accepted ? '1px solid var(--green-border)' : '1px solid var(--line)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--green-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--green-deep)' }}>
                    <HeartHandshake size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--ink)', fontFamily: 'var(--font-heading)' }}>
                      {item.title}
                    </h3>
                    <div style={{ fontSize: '0.8rem', color: 'var(--ink-dim)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Calendar size={13} /> {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Recent'}
                    </div>
                  </div>
                </div>

                <div>
                  {item.is_accepted === true && (
                    <span className="badge badge-stable">
                      <CheckCircle2 size={13} /> Followed Plan
                    </span>
                  )}
                  {item.is_accepted === false && (
                    <span className="badge badge-watch">
                      <XCircle size={13} /> Dismissed
                    </span>
                  )}
                </div>
              </div>

              <p style={{ fontSize: '0.92rem', color: 'var(--ink-soft)', lineHeight: 1.5, marginBottom: '1rem' }}>
                {item.reason}
              </p>

              <div style={{
                background: 'var(--paper-deep)',
                padding: '0.85rem 1.15rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--line)',
                marginBottom: '1.25rem'
              }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--ink)', textTransform: 'uppercase', marginBottom: '0.4rem', letterSpacing: '0.04em' }}>
                  Recommended Action Steps:
                </div>
                <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.88rem', color: 'var(--ink-soft)', display: 'grid', gap: '0.35rem' }}>
                  {item.steps.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ul>
              </div>

              {/* Action buttons if not yet decided */}
              {item.is_accepted === null && !item.is_dismissed && (
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button onClick={() => handleAction(item.id, 'accept')} className="btn btn-primary" style={{ fontSize: '0.9rem' }}>
                    <CheckCircle2 size={15} /> Try This Recommendation
                  </button>
                  <button onClick={() => handleAction(item.id, 'dismiss')} className="btn btn-secondary" style={{ fontSize: '0.88rem' }}>
                    I'm Doing Okay
                  </button>
                </div>
              )}

              {/* Feedback Form */}
              {selectedFeedbackId === item.id && (
                <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--line)' }}>
                  {feedbackStatus ? (
                    <div style={{ color: 'var(--green-deep)', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <CheckCircle2 size={16} /> {feedbackStatus}
                    </div>
                  ) : (
                    <div>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--ink)', fontFamily: 'var(--font-heading)', marginBottom: '0.35rem' }}>
                        How helpful was this recommendation?
                      </h4>
                      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.75rem' }}>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button
                            key={s}
                            onClick={() => setFeedbackRating(s)}
                            style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                          >
                            <Star size={22} fill={s <= feedbackRating ? 'var(--amber)' : 'none'} color={s <= feedbackRating ? 'var(--amber)' : 'var(--line)'} />
                          </button>
                        ))}
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                        {['yes_a_lot', 'somewhat', 'not_really'].map(opt => (
                          <button
                            key={opt}
                            onClick={() => setFeedbackHelpful(opt)}
                            style={{
                              padding: '0.35rem 0.75rem',
                              fontSize: '0.82rem',
                              fontFamily: 'var(--font-body)',
                              borderRadius: '4px',
                              border: '1px solid var(--line)',
                              background: feedbackHelpful === opt ? 'var(--green-tint)' : 'var(--paper-deep)',
                              color: feedbackHelpful === opt ? 'var(--green-deep)' : 'var(--ink-soft)',
                              cursor: 'pointer'
                            }}
                          >
                            {opt === 'yes_a_lot' ? 'Very Helpful' : opt === 'somewhat' ? 'Somewhat' : 'Not Really'}
                          </button>
                        ))}
                      </div>

                      <textarea
                        className="input-field"
                        rows={2}
                        placeholder="Optional feedback..."
                        value={feedbackNotes}
                        onChange={(e) => setFeedbackNotes(e.target.value)}
                        style={{ marginBottom: '0.75rem', resize: 'none' }}
                      />

                      <button onClick={() => handleFeedbackSubmit(item.id)} className="btn btn-sm btn-primary">
                        Submit Outcome Feedback
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

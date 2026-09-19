import React, { useState } from 'react';
import { api } from '../services/api';
import { CheckInPayload } from '../types';
import { CheckCircle2, Send, Smile, Zap, Moon, Briefcase, Flame, Heart } from 'lucide-react';

interface CheckInProps {
  onSuccess: () => void;
}

export const CheckIn: React.FC<CheckInProps> = ({ onSuccess }) => {
  const [stress, setStress] = useState<number>(4);
  const [energy, setEnergy] = useState<number>(7);
  const [sleepHours, setSleepHours] = useState<number>(7.5);
  const [workload, setWorkload] = useState<number>(5);
  const [connection] = useState<number>(7);
  const [productivity, setProductivity] = useState<number>(7);
  const [happiness, setHappiness] = useState<number>(7);
  const [selectedTags, setSelectedTags] = useState<string[]>(['Assignments']);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const availableTags = [
    'Exams',
    'Assignments',
    'Deadlines',
    'Group Projects',
    'Career Prep',
    'Social Life',
    'Sleep Disruption',
    'Exercise'
  ];

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload: CheckInPayload = {
        stress,
        energy,
        sleep_hours: sleepHours,
        workload,
        social_connection: connection,
        productivity,
        happiness,
        tags: selectedTags,
        notes: notes.trim() || undefined
      };
      await api.submitCheckIn(payload);
      setIsSubmitted(true);
      setTimeout(() => {
        onSuccess();
      }, 1400);
    } catch (err) {
      console.error('Error submitting checkin:', err);
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="glass-panel" style={{ padding: '3.5rem 2rem', textAlign: 'center', maxWidth: '560px', margin: '2rem auto' }}>
        <CheckCircle2 size={54} color="var(--green-deep)" style={{ margin: '0 auto 1rem auto' }} />
        <h2 style={{ fontSize: '1.75rem', color: 'var(--ink)', fontFamily: 'var(--font-heading)', marginBottom: '0.5rem' }}>Daily Check-In Saved!</h2>
        <p style={{ fontSize: '0.95rem', color: 'var(--ink-soft)' }}>
          Esprit has updated your personal baseline and SilentSignals analysis. Redirecting to your dashboard...
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '2.1rem', fontWeight: 700, color: 'var(--ink)', fontFamily: 'var(--font-heading)', marginBottom: '0.25rem' }}>
          Daily Check-In
        </h1>
        <p style={{ fontSize: '0.95rem', color: 'var(--ink-soft)' }}>
          Takes only 30–60 seconds. Esprit compares your ratings against your personal baseline.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '1.75rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        {/* Stress slider */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <label style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Zap size={16} color="var(--amber)" /> Stress Level
            </label>
            <span style={{ fontSize: '1.2rem', fontWeight: 700, color: stress > 6 ? 'var(--rose-deep)' : 'var(--blue-deep)', fontFamily: 'var(--font-heading)' }}>
              {stress} <span style={{ fontSize: '0.8rem', color: 'var(--ink-dim)' }}>/ 10</span>
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={10}
            step={0.5}
            value={stress}
            onChange={(e) => setStress(parseFloat(e.target.value))}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--ink-dim)', marginTop: '0.25rem' }}>
            <span>1 - Relaxed & Calm</span>
            <span>10 - Severely Overwhelmed</span>
          </div>
        </div>

        {/* Energy slider */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <label style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Smile size={16} color="var(--green-deep)" /> Energy & Vitality
            </label>
            <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--green-deep)', fontFamily: 'var(--font-heading)' }}>
              {energy} <span style={{ fontSize: '0.8rem', color: 'var(--ink-dim)' }}>/ 10</span>
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={10}
            step={0.5}
            value={energy}
            onChange={(e) => setEnergy(parseFloat(e.target.value))}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--ink-dim)', marginTop: '0.25rem' }}>
            <span>1 - Completely Drained</span>
            <span>10 - Fully Energized</span>
          </div>
        </div>

        {/* Sleep Hours slider */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <label style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Moon size={16} color="var(--blue-deep)" /> Last Night's Sleep
            </label>
            <span style={{ fontSize: '1.2rem', fontWeight: 700, color: sleepHours < 6 ? 'var(--rose-deep)' : 'var(--blue-deep)', fontFamily: 'var(--font-heading)' }}>
              {sleepHours} <span style={{ fontSize: '0.8rem', color: 'var(--ink-dim)' }}>hours</span>
            </span>
          </div>
          <input
            type="range"
            min={3}
            max={12}
            step={0.5}
            value={sleepHours}
            onChange={(e) => setSleepHours(parseFloat(e.target.value))}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--ink-dim)', marginTop: '0.25rem' }}>
            <span>3 hours (Severe Deficit)</span>
            <span>12 hours (Deep Rest)</span>
          </div>
        </div>

        {/* Workload slider */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <label style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Briefcase size={16} color="var(--blue-deep)" /> Academic Workload Feel
            </label>
            <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--blue-deep)', fontFamily: 'var(--font-heading)' }}>
              {workload} <span style={{ fontSize: '0.8rem', color: 'var(--ink-dim)' }}>/ 10</span>
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={10}
            step={0.5}
            value={workload}
            onChange={(e) => setWorkload(parseFloat(e.target.value))}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--ink-dim)', marginTop: '0.25rem' }}>
            <span>1 - Very Light</span>
            <span>10 - Crushing Pressure</span>
          </div>
        </div>

        {/* Productivity slider */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <label style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Flame size={16} color="var(--amber)" /> Study Productivity
            </label>
            <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--amber)', fontFamily: 'var(--font-heading)' }}>
              {productivity} <span style={{ fontSize: '0.8rem', color: 'var(--ink-dim)' }}>/ 10</span>
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={10}
            step={0.5}
            value={productivity}
            onChange={(e) => setProductivity(parseFloat(e.target.value))}
          />
        </div>

        {/* Happiness slider */}
        <div style={{
          background: 'linear-gradient(135deg, var(--happiness-tint), #fff9fc)',
          borderRadius: 'var(--radius-sm)',
          padding: '1rem 1.15rem',
          border: '1px solid var(--happiness-border)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <label style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Heart size={16} color="var(--happiness-pink)" fill="rgba(232,99,138,0.2)" /> How happy are you feeling?
            </label>
            <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--happiness-pink)', fontFamily: 'var(--font-heading)' }}>
              {happiness} <span style={{ fontSize: '0.8rem', color: 'var(--ink-dim)' }}>/ 10</span>
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={10}
            step={1}
            value={happiness}
            onChange={(e) => setHappiness(parseFloat(e.target.value))}
            style={{ accentColor: 'var(--happiness-pink)' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--ink-dim)', marginTop: '0.25rem' }}>
            <span>1 — 😢 Terrible</span>
            <span>10 — 😄 Awesome!!!</span>
          </div>
        </div>

        {/* Tags Selection */}
        <div>
          <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--ink)', display: 'block', marginBottom: '0.5rem' }}>
            What is driving your routine today? (Optional)
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {availableTags.map(tag => {
              const selected = selectedTags.includes(tag);
              return (
                <button
                  type="button"
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  style={{
                    padding: '0.4rem 0.85rem',
                    fontSize: '0.85rem',
                    fontFamily: 'var(--font-body)',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid var(--line)',
                    background: selected ? 'var(--green-tint)' : 'var(--paper-deep)',
                    color: selected ? 'var(--green-deep)' : 'var(--ink-soft)',
                    borderColor: selected ? 'var(--green-border)' : 'var(--line)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {selected ? '✓ ' : '+ '}{tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* Optional notes */}
        <div>
          <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--ink)', display: 'block', marginBottom: '0.4rem' }}>
            Quick Reflection Notes (Optional)
          </label>
          <textarea
            className="input-field"
            placeholder="e.g. Worked late on algorithms lab, felt tired this morning..."
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            style={{ resize: 'none' }}
          />
        </div>

        <button type="submit" disabled={isSubmitting} className="btn btn-primary" style={{ padding: '0.85rem' }}>
          <Send size={16} /> {isSubmitting ? 'Recording Signals...' : 'Save Check-In'}
        </button>
      </form>
    </div>
  );
};

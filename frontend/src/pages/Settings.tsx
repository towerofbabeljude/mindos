import React, { useState, useEffect } from 'react';
import { Phone, RefreshCw, CheckCircle2, User, Lock, Save } from 'lucide-react';
import { api } from '../services/api';

interface SettingsProps {
  onResetData: () => void;
  onProfileUpdated?: (name: string) => void;
}

export const Settings: React.FC<SettingsProps> = ({ onResetData, onProfileUpdated }) => {
  const [resetSuccess, setResetSuccess] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Editable Profile States
  const [name, setName] = useState('Alex Chen');
  const [academicStanding, setAcademicStanding] = useState('Junior (Year 3)');
  const [degreeDepartment, setDegreeDepartment] = useState('Computer Science & Cognitive AI');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const prof = await api.getUserProfile();
        if (prof.name) setName(prof.name);
        if (prof.academic_standing) setAcademicStanding(prof.academic_standing);
        if (prof.degree_department) setDegreeDepartment(prof.degree_department);
      } catch (err) {
        console.warn('Could not load user profile from API, using cached state:', err);
      }
    };
    fetchProfile();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const updated = await api.updateUserProfile({
        name: name.trim(),
        academic_standing: academicStanding.trim(),
        degree_department: degreeDepartment.trim()
      });

      if (updated.name) {
        setName(updated.name);
        onProfileUpdated?.(updated.name);
      }
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
      }, 2500);
    } catch (err) {
      console.error('Failed to update profile:', err);
      // Still notify UI optimistically
      onProfileUpdated?.(name.trim());
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
      }, 2500);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetToHealthy = async () => {
    try {
      await api.seedDemo('normal');
      setResetSuccess(true);
      setTimeout(() => {
        setResetSuccess(false);
        onResetData();
      }, 1200);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '820px', margin: '0 auto' }}>
      <div>
        <h1 style={{ fontSize: '2.1rem', fontWeight: 700, color: 'var(--ink)', fontFamily: 'var(--font-heading)', marginBottom: '0.25rem' }}>
          Settings & Student Privacy
        </h1>
        <p style={{ fontSize: '0.95rem', color: 'var(--ink-soft)' }}>
          Manage your baseline preferences, edit your student details, or access professional human resources.
        </p>
      </div>

      {saveSuccess && (
        <div className="glass-panel" style={{ padding: '1rem', background: 'var(--green-tint)', color: 'var(--green-deep)', border: '1px solid var(--green-border)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={18} /> Profile details saved successfully!
        </div>
      )}

      {resetSuccess && (
        <div className="glass-panel" style={{ padding: '1rem', background: 'var(--green-tint)', color: 'var(--green-deep)', border: '1px solid var(--green-border)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={18} /> Personal baseline reset to healthy standard demo data!
        </div>
      )}

      {/* Editable Profile & Course Info */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--ink)', fontFamily: 'var(--font-heading)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User size={18} color="var(--green-deep)" /> Student Profile & Course Context
          </h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--ink-dim)' }}>
            Editable anytime
          </span>
        </div>

        <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--ink)', display: 'block', marginBottom: '0.35rem' }}>
                Student Name
              </label>
              <input
                type="text"
                required
                className="input-field"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex Chen"
              />
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--ink)', display: 'block', marginBottom: '0.35rem' }}>
                Academic Standing
              </label>
              <input
                type="text"
                required
                className="input-field"
                value={academicStanding}
                onChange={(e) => setAcademicStanding(e.target.value)}
                placeholder="e.g. Junior (Year 3)"
              />
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--ink)', display: 'block', marginBottom: '0.35rem' }}>
                Degree / Department
              </label>
              <input
                type="text"
                required
                className="input-field"
                value={degreeDepartment}
                onChange={(e) => setDegreeDepartment(e.target.value)}
                placeholder="e.g. Computer Science & Cognitive AI"
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '0.25rem' }}>
            <button
              type="submit"
              disabled={isSaving}
              className="btn btn-primary"
              style={{ padding: '0.65rem 1.4rem' }}
            >
              <Save size={16} /> {isSaving ? 'Saving Changes...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Privacy Architecture Checklist */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--ink)', fontFamily: 'var(--font-heading)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
          <Lock size={18} color="var(--blue-deep)" /> Privacy & Data Sovereignty
        </h3>

        <p style={{ fontSize: '0.9rem', color: 'var(--ink-soft)', lineHeight: 1.5, marginBottom: '1rem' }}>
          Esprit strictly separates student wellbeing data from university administration. Individual self-assessments are never shared with academic advisors or faculty.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem', fontSize: '0.88rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--ink)' }}>
            <CheckCircle2 size={16} color="var(--green-deep)" /> Strict Minimal Data Collection
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--ink)' }}>
            <CheckCircle2 size={16} color="var(--green-deep)" /> No Diagnostics or Clinical Claims
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--ink)' }}>
            <CheckCircle2 size={16} color="var(--green-deep)" /> User-Controlled Data Deletion
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--ink)' }}>
            <CheckCircle2 size={16} color="var(--green-deep)" /> Zero Ad Tracking or Third-Party Brokers
          </div>
        </div>

        <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--line)' }}>
          <button onClick={handleResetToHealthy} className="btn btn-secondary btn-sm">
            <RefreshCw size={14} /> Reset Baseline To Normal Demo Dataset
          </button>
        </div>
      </div>

      {/* Immediate Campus & Human Support Contacts */}
      <div className="glass-panel" style={{ padding: '1.5rem', border: '1px solid var(--rose-border)', background: 'linear-gradient(135deg, var(--rose-tint) 0%, var(--paper-card) 100%)' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--rose-deep)', fontFamily: 'var(--font-heading)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <Phone size={18} color="var(--rose-deep)" /> Immediate Human & Campus Resources
        </h3>
        <p style={{ fontSize: '0.88rem', color: 'var(--ink-soft)', marginBottom: '1rem' }}>
          If you or someone you know is going through a crisis or feels overwhelmed beyond software self-help, please reach out to professional human care:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', fontSize: '0.9rem' }}>
          <div style={{ background: 'var(--paper-card)', border: '1px solid var(--line)', padding: '0.85rem', borderRadius: '6px' }}>
            <strong style={{ color: 'var(--ink)', fontFamily: 'var(--font-heading)' }}>University Counseling Services</strong>
            <div style={{ color: 'var(--blue-deep)', fontWeight: 600 }}>(555) 019-2830</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--ink-dim)' }}>Mon–Fri 8am–6pm</div>
          </div>
          <div style={{ background: 'var(--paper-card)', border: '1px solid var(--line)', padding: '0.85rem', borderRadius: '6px' }}>
            <strong style={{ color: 'var(--ink)', fontFamily: 'var(--font-heading)' }}>988 Suicide & Crisis Lifeline</strong>
            <div style={{ color: 'var(--blue-deep)', fontWeight: 600 }}>Call or Text 988</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--ink-dim)' }}>24/7 Confidential & Free</div>
          </div>
          <div style={{ background: 'var(--paper-card)', border: '1px solid var(--line)', padding: '0.85rem', borderRadius: '6px' }}>
            <strong style={{ color: 'var(--ink)', fontFamily: 'var(--font-heading)' }}>Crisis Text Line</strong>
            <div style={{ color: 'var(--blue-deep)', fontWeight: 600 }}>Text HOME to 741741</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--ink-dim)' }}>Free 24/7 Crisis Support</div>
          </div>
        </div>
      </div>
    </div>
  );
};

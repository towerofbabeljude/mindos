import React, { useState } from 'react';
import { api } from '../services/api';
import {
  Eye,
  Zap,
  Wind,
  BookOpen,
  CheckCircle2,
  Play,
  RotateCcw,
  Gamepad2,
  Sparkles,
  Layers,
  HeartHandshake,
  Compass,
} from 'lucide-react';
import { SortItGame } from '../components/remind/SortItGame';
import { CardMatchingGame } from '../components/remind/CardMatchingGame';
import { DinosaurGame } from '../components/remind/DinosaurGame';

export type ActivityType =
  | 'sort_it'
  | 'card_matching'
  | 'dinosaur'
  | 'focus'
  | 'reaction'
  | 'reset'
  | 'reflection'
  | null;

export const ReMind: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'games' | 'mindful'>('games');
  const [activeActivity, setActiveActivity] = useState<ActivityType>(null);
  const [completedMessage, setCompletedMessage] = useState<string | null>(null);

  // Focus Game State
  const [focusScore, setFocusScore] = useState(0);
  const [focusTarget, setFocusTarget] = useState(0);
  const [focusRounds, setFocusRounds] = useState(0);

  // Reaction Game State
  const [reactionState, setReactionState] = useState<'waiting' | 'ready' | 'clicked' | 'early'>('waiting');
  const [reactionStartTime, setReactionStartTime] = useState(0);
  const [reactionTime, setReactionTime] = useState<number | null>(null);

  // Reflection State
  const [reflectionText, setReflectionText] = useState('');

  // 1. Focus Game Logic
  const startFocusGame = () => {
    setActiveActivity('focus');
    setFocusScore(0);
    setFocusRounds(0);
    setFocusTarget(Math.floor(Math.random() * 9));
  };

  const handleFocusClick = (index: number) => {
    const isCorrect = index === focusTarget;
    const newScore = isCorrect ? focusScore + 1 : focusScore;
    const nextRounds = focusRounds + 1;

    setFocusScore(newScore);
    setFocusRounds(nextRounds);

    if (nextRounds >= 10) {
      const accuracy = newScore / 10;
      api.recordReMind({
        activity_type: 'focus',
        accuracy,
        completion_time: 25.0,
        score: Math.round(accuracy * 100),
      });
      setCompletedMessage(`Focus Activity Complete! Accuracy: ${Math.round(accuracy * 100)}%`);
      setActiveActivity(null);
    } else {
      setFocusTarget(Math.floor(Math.random() * 9));
    }
  };

  // 2. Reaction Game Logic
  const startReactionGame = () => {
    setActiveActivity('reaction');
    setReactionState('waiting');
    setReactionTime(null);

    const delay = 1500 + Math.random() * 2500;
    setTimeout(() => {
      setReactionState('ready');
      setReactionStartTime(Date.now());
    }, delay);
  };

  const handleReactionClick = () => {
    if (reactionState === 'waiting') {
      setReactionState('early');
    } else if (reactionState === 'ready') {
      const diff = Date.now() - reactionStartTime;
      setReactionTime(diff);
      setReactionState('clicked');
      api.recordReMind({
        activity_type: 'reaction',
        accuracy: 1.0,
        reaction_time: diff,
        score: Math.max(100 - Math.round((diff - 200) / 10), 40),
      });
      setCompletedMessage(`Reaction Recorded! Speed: ${diff}ms`);
    }
  };

  // 3. Reset Breathing Activity
  const startResetActivity = () => {
    setActiveActivity('reset');
  };

  const finishReset = () => {
    api.recordReMind({
      activity_type: 'reset',
      accuracy: 1.0,
      completion_time: 45.0,
      score: 100,
    });
    setCompletedMessage('Reset complete! Hope you feel a bit clearer and more grounded.');
    setActiveActivity(null);
  };

  // 4. Reflection Activity
  const startReflectionActivity = () => {
    setActiveActivity('reflection');
  };

  const finishReflection = () => {
    api.recordReMind({
      activity_type: 'reflection',
      accuracy: 1.0,
      score: 100,
      metadata_info: reflectionText,
    });
    setCompletedMessage('Reflection noted. Take your time today.');
    setActiveActivity(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '860px', margin: '0 auto' }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
          <h1
            style={{
              fontSize: '2.1rem',
              fontWeight: 700,
              color: 'var(--ink)',
              fontFamily: 'var(--font-heading)',
              margin: 0,
            }}
          >
            ReMind Activities
          </h1>
          <span
            style={{
              padding: '0.2rem 0.65rem',
              borderRadius: '999px',
              fontSize: '0.75rem',
              fontWeight: 600,
              background: 'var(--blue-tint)',
              color: 'var(--blue-deep)',
              border: '1px solid var(--blue-border)',
            }}
          >
            MindOS Arcade & Wellbeing
          </span>
        </div>
        <p style={{ fontSize: '0.95rem', color: 'var(--ink-soft)', margin: 0 }}>
          Engaging micro-games and 30–60 second mindful resets to restore cognitive focus, clear mental fatigue, and recalibrate attention.
        </p>
      </div>

      {completedMessage && (
        <div
          className="glass-panel"
          style={{
            padding: '1rem 1.25rem',
            background: 'var(--green-tint)',
            border: '1px solid var(--green-border)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            color: 'var(--green-deep)',
          }}
        >
          <CheckCircle2 size={20} />
          <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>{completedMessage}</span>
        </div>
      )}

      {/* RENDER ACTIVE GAME IF SELECTED */}
      {activeActivity === 'sort_it' && <SortItGame onBack={() => setActiveActivity(null)} />}
      {activeActivity === 'card_matching' && <CardMatchingGame onBack={() => setActiveActivity(null)} />}
      {activeActivity === 'dinosaur' && <DinosaurGame onBack={() => setActiveActivity(null)} />}

      {/* ACTIVE MINDFUL BREAKS */}
      {activeActivity === 'focus' && (
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.45rem', color: 'var(--ink)', fontFamily: 'var(--font-heading)', marginBottom: '0.5rem' }}>
            Focus Target: Click the Active Dot
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--ink-soft)', marginBottom: '1.5rem' }}>
            Round {focusRounds + 1} of 10 | Score: {focusScore}
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 80px)',
              gap: '1rem',
              justifyContent: 'center',
              margin: '0 auto 1.5rem auto',
            }}
          >
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => {
              const isTarget = i === focusTarget;
              return (
                <button
                  key={i}
                  onClick={() => handleFocusClick(i)}
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '16px',
                    border: isTarget ? '2px solid var(--blue-deep)' : '1px solid var(--line)',
                    background: isTarget
                      ? 'linear-gradient(135deg, var(--green-deep), var(--blue-deep))'
                      : 'var(--paper-deep)',
                    boxShadow: isTarget ? '0 0 20px var(--blue-glow)' : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.1s ease',
                  }}
                />
              );
            })}
          </div>

          <button onClick={() => setActiveActivity(null)} className="btn btn-secondary btn-sm">
            Cancel Activity
          </button>
        </div>
      )}

      {activeActivity === 'reaction' && (
        <div className="glass-panel" style={{ padding: '2.5rem 1.5rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.45rem', color: 'var(--ink)', fontFamily: 'var(--font-heading)', marginBottom: '0.5rem' }}>
            Reaction Speed
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--ink-soft)', marginBottom: '1.5rem' }}>
            Wait for the box to turn green, then click as fast as you can!
          </p>

          <div
            onClick={handleReactionClick}
            style={{
              height: '180px',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '1.35rem',
              fontWeight: 700,
              fontFamily: 'var(--font-heading)',
              color: '#fbf8f0',
              background:
                reactionState === 'ready'
                  ? 'var(--green-deep)'
                  : reactionState === 'early'
                  ? 'var(--rose-deep)'
                  : reactionState === 'clicked'
                  ? 'var(--blue-deep)'
                  : 'var(--paper-deep)',
              boxShadow: reactionState === 'ready' ? '0 0 35px var(--green-glow)' : 'none',
              transition: 'background 0.15s ease',
              marginBottom: '1.5rem',
              border: '1px solid var(--line)',
            }}
          >
            <span style={{ color: reactionState === 'waiting' ? 'var(--ink)' : '#fbf8f0' }}>
              {reactionState === 'waiting' && 'Wait for green...'}
              {reactionState === 'ready' && 'CLICK NOW!'}
              {reactionState === 'early' && 'Too early! Click to retry.'}
              {reactionState === 'clicked' && `Reaction: ${reactionTime} ms!`}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
            <button onClick={startReactionGame} className="btn btn-secondary btn-sm">
              <RotateCcw size={14} /> Try Again
            </button>
            <button onClick={() => setActiveActivity(null)} className="btn btn-secondary btn-sm">
              Done
            </button>
          </div>
        </div>
      )}

      {activeActivity === 'reset' && (
        <div className="glass-panel" style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--ink)', fontFamily: 'var(--font-heading)', marginBottom: '0.5rem' }}>
            4-4-4 Micro-Reset Breathing
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--ink-soft)', marginBottom: '2.5rem' }}>
            Inhale as circle expands ... Hold ... Exhale as it gently releases.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '3rem' }}>
            <div
              className="breathe-circle"
              style={{
                width: '130px',
                height: '130px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, var(--green-tint) 0%, var(--blue-tint) 70%)',
                border: '2px solid var(--blue)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--ink)',
                fontFamily: 'var(--font-heading)',
                fontWeight: 600,
                fontSize: '1.05rem',
              }}
            >
              Breathe
            </div>
          </div>

          <button onClick={finishReset} className="btn btn-accent">
            <CheckCircle2 size={16} /> Complete Reset (I Feel Better)
          </button>
        </div>
      )}

      {activeActivity === 'reflection' && (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.45rem', color: 'var(--ink)', fontFamily: 'var(--font-heading)', marginBottom: '0.35rem' }}>
            Gentle Reflection
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--blue-deep)', marginBottom: '1.25rem', fontWeight: 600 }}>
            "What has been quietly taking the most energy or space in your mind today?"
          </p>

          <textarea
            className="input-field"
            rows={4}
            placeholder="Type a few thoughts here... this stays 100% private and on your device."
            value={reflectionText}
            onChange={(e) => setReflectionText(e.target.value)}
            style={{ marginBottom: '1.25rem', resize: 'none' }}
          />

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={finishReflection} className="btn btn-primary">
              Save Reflection
            </button>
            <button onClick={() => setActiveActivity(null)} className="btn btn-secondary">
              Back
            </button>
          </div>
        </div>
      )}

      {/* MAIN GALLERY VIEW (When no activity is running) */}
      {!activeActivity && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Navigation Tab Bar */}
          <div
            style={{
              display: 'flex',
              gap: '0.75rem',
              borderBottom: '1px solid var(--line)',
              paddingBottom: '0.75rem',
            }}
          >
            <button
              onClick={() => setActiveTab('games')}
              className={`btn btn-sm ${activeTab === 'games' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.5rem 1rem' }}
            >
              <Gamepad2 size={16} />
              <span>Mini-Games (3)</span>
            </button>

            <button
              onClick={() => setActiveTab('mindful')}
              className={`btn btn-sm ${activeTab === 'mindful' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.5rem 1rem' }}
            >
              <Wind size={16} />
              <span>Mindful Micro-Breaks (4)</span>
            </button>
          </div>

          {/* TAB 1: MINI-GAMES */}
          {activeTab === 'games' && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '1.25rem',
              }}
            >
              {/* Game 1: Sort It */}
              <div
                className="glass-panel"
                style={{
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  background: 'linear-gradient(180deg, var(--paper-card) 0%, var(--paper-deep) 100%)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
              >
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '1rem',
                    }}
                  >
                    <div
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff',
                        boxShadow: '0 4px 12px rgba(6, 182, 212, 0.35)',
                      }}
                    >
                      🧪
                    </div>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        padding: '0.2rem 0.6rem',
                        borderRadius: '999px',
                        background: 'var(--cyan-glow)',
                        color: 'var(--blue-deep)',
                      }}
                    >
                      5 Tubes · 20 Balls
                    </span>
                  </div>

                  <h3
                    style={{
                      fontSize: '1.25rem',
                      fontWeight: 700,
                      color: 'var(--ink)',
                      fontFamily: 'var(--font-heading)',
                      marginBottom: '0.4rem',
                    }}
                  >
                    Sort It
                  </h3>

                  <p style={{ fontSize: '0.88rem', color: 'var(--ink-soft)', lineHeight: 1.45, marginBottom: '1.25rem' }}>
                    Sort 20 colourful balls across 5 tubes (cyan, purple, magenta, yellow). Every tube starts mixed with multiple colours. Max 5 balls per tube.
                  </p>
                </div>

                <button
                  onClick={() => setActiveActivity('sort_it')}
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                >
                  <Play size={15} /> Play Sort It
                </button>
              </div>

              {/* Game 2: Card Matching */}
              <div
                className="glass-panel"
                style={{
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  background: 'linear-gradient(180deg, var(--paper-card) 0%, var(--paper-deep) 100%)',
                }}
              >
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '1rem',
                    }}
                  >
                    <div
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #f472b6, #fb923c)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff',
                        fontSize: '1.3rem',
                        boxShadow: '0 4px 12px rgba(244, 114, 182, 0.35)',
                      }}
                    >
                      🩷
                    </div>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        padding: '0.2rem 0.6rem',
                        borderRadius: '999px',
                        background: 'var(--rose-tint)',
                        color: 'var(--rose-deep)',
                      }}
                    >
                      4×4 · 8 Pairs
                    </span>
                  </div>

                  <h3
                    style={{
                      fontSize: '1.25rem',
                      fontWeight: 700,
                      color: 'var(--ink)',
                      fontFamily: 'var(--font-heading)',
                      marginBottom: '0.4rem',
                    }}
                  >
                    Card Matching
                  </h3>

                  <p style={{ fontSize: '0.88rem', color: 'var(--ink-soft)', lineHeight: 1.45, marginBottom: '1.25rem' }}>
                    Flip and match 8 icon pairs: baby pink heart, diamond, blueberry, apple, orange, strawberry, pineapple, and banana in a 4×4 grid.
                  </p>
                </div>

                <button
                  onClick={() => setActiveActivity('card_matching')}
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                >
                  <Play size={15} /> Play Card Matching
                </button>
              </div>

              {/* Game 3: Dinosaur Runner */}
              <div
                className="glass-panel"
                style={{
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  background: 'linear-gradient(180deg, var(--paper-card) 0%, var(--paper-deep) 100%)',
                }}
              >
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '1rem',
                    }}
                  >
                    <div
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #635b4e, #2b271f)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff',
                        fontSize: '1.3rem',
                        boxShadow: '0 4px 12px rgba(43, 39, 31, 0.25)',
                      }}
                    >
                      🦖
                    </div>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        padding: '0.2rem 0.6rem',
                        borderRadius: '999px',
                        background: 'var(--paper-deep)',
                        color: 'var(--ink)',
                      }}
                    >
                      Chrome Offline
                    </span>
                  </div>

                  <h3
                    style={{
                      fontSize: '1.25rem',
                      fontWeight: 700,
                      color: 'var(--ink)',
                      fontFamily: 'var(--font-heading)',
                      marginBottom: '0.4rem',
                    }}
                  >
                    Dinosaur Runner
                  </h3>

                  <p style={{ fontSize: '0.88rem', color: 'var(--ink-soft)', lineHeight: 1.45, marginBottom: '1.25rem' }}>
                    The iconic Chrome offline T-Rex runner! Jump over cacti, duck beneath flying pterodactyls, experience night mode, and beat your high score.
                  </p>
                </div>

                <button
                  onClick={() => setActiveActivity('dinosaur')}
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                >
                  <Play size={15} /> Play Dino Runner
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: MINDFUL MICRO-BREAKS */}
          {activeTab === 'mindful' && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '1.25rem',
              }}
            >
              {/* Focus Challenge */}
              <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'var(--blue-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--blue-deep)', marginBottom: '1rem' }}>
                    <Eye size={22} />
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--ink)', fontFamily: 'var(--font-heading)', marginBottom: '0.35rem' }}>Focus Challenge</h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--ink-soft)', lineHeight: 1.45, marginBottom: '1.25rem' }}>
                    10 quick visual targets. Tests attention stability and sustained concentration under light time cues.
                  </p>
                </div>
                <button onClick={startFocusGame} className="btn btn-secondary" style={{ width: '100%' }}>
                  <Play size={15} /> Start (30s)
                </button>
              </div>

              {/* Reaction Activity */}
              <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'var(--green-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--green-deep)', marginBottom: '1rem' }}>
                    <Zap size={22} />
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--ink)', fontFamily: 'var(--font-heading)', marginBottom: '0.35rem' }}>Reaction Time</h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--ink-soft)', lineHeight: 1.45, marginBottom: '1.25rem' }}>
                    Click as soon as the screen flashes green. Measures neural alertness versus fatigue slowdown.
                  </p>
                </div>
                <button onClick={startReactionGame} className="btn btn-secondary" style={{ width: '100%' }}>
                  <Play size={15} /> Test Speed (15s)
                </button>
              </div>

              {/* Reset Activity */}
              <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'var(--blue-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--blue-deep)', marginBottom: '1rem' }}>
                    <Wind size={22} />
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--ink)', fontFamily: 'var(--font-heading)', marginBottom: '0.35rem' }}>Guided Reset</h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--ink-soft)', lineHeight: 1.45, marginBottom: '1.25rem' }}>
                    Gentle 4-4-4 breathing circle. Calms sympathetic nervous system arousal when studying.
                  </p>
                </div>
                <button onClick={startResetActivity} className="btn btn-secondary" style={{ width: '100%' }}>
                  <Wind size={15} /> Start Breathing (60s)
                </button>
              </div>

              {/* Reflection */}
              <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'var(--amber-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--amber-deep)', marginBottom: '1rem' }}>
                    <BookOpen size={22} />
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--ink)', fontFamily: 'var(--font-heading)', marginBottom: '0.35rem' }}>Mindful Reflection</h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--ink-soft)', lineHeight: 1.45, marginBottom: '1.25rem' }}>
                    One gentle self-inquiry question to pause, unpack energy drains, and recalibrate your focus.
                  </p>
                </div>
                <button onClick={startReflectionActivity} className="btn btn-secondary" style={{ width: '100%' }}>
                  <BookOpen size={15} /> Reflect
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

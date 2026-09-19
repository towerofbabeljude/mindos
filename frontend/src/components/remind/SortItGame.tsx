import React, { useState, useEffect, useRef } from 'react';
import { MiniGameHeader } from './MiniGameHeader';
import { sound } from './soundEffects';
import { api } from '../../services/api';
import { RotateCcw, Undo2, Trophy, Sparkles, Play, HelpCircle } from 'lucide-react';

export type BallColor = 'cyan' | 'purple' | 'magenta' | 'yellow';

interface ColorDef {
  id: BallColor;
  name: string;
  gradient: string;
  border: string;
  glow: string;
  hex: string;
}

const COLOR_DEFS: Record<BallColor, ColorDef> = {
  cyan: {
    id: 'cyan',
    name: 'Cyan',
    gradient: 'radial-gradient(circle at 35% 30%, #a5f3fc 0%, #06b6d4 50%, #0891b2 90%)',
    border: '#22d3ee',
    glow: 'rgba(6, 182, 212, 0.45)',
    hex: '#06b6d4',
  },
  purple: {
    id: 'purple',
    name: 'Purple',
    gradient: 'radial-gradient(circle at 35% 30%, #ddd6fe 0%, #8b5cf6 50%, #6d28d9 90%)',
    border: '#a78bfa',
    glow: 'rgba(139, 92, 246, 0.45)',
    hex: '#8b5cf6',
  },
  magenta: {
    id: 'magenta',
    name: 'Magenta',
    gradient: 'radial-gradient(circle at 35% 30%, #fbcfe8 0%, #d946ef 50%, #a21caf 90%)',
    border: '#e879f9',
    glow: 'rgba(217, 70, 239, 0.45)',
    hex: '#d946ef',
  },
  yellow: {
    id: 'yellow',
    name: 'Yellow',
    gradient: 'radial-gradient(circle at 35% 30%, #fef08a 0%, #eab308 50%, #ca8a04 90%)',
    border: '#fde047',
    glow: 'rgba(234, 179, 8, 0.45)',
    hex: '#eab308',
  },
};

const TUBE_CAPACITY = 5;
const NUM_TUBES = 5;
const ALL_COLORS: BallColor[] = ['cyan', 'purple', 'magenta', 'yellow'];

interface MoveRecord {
  fromTube: number;
  toTube: number;
}

interface SortItGameProps {
  onBack: () => void;
}

export const SortItGame: React.FC<SortItGameProps> = ({ onBack }) => {
  // Mode: 'distributed' (all 5 tubes start with 4 balls each = 20 balls total, each tube holding multiple colors)
  // or 'classic' (4 tubes with 5 balls each + 1 empty tube)
  const [mode, setMode] = useState<'distributed' | 'classic'>('distributed');
  const [tubes, setTubes] = useState<BallColor[][]>([]);
  const [selectedTube, setSelectedTube] = useState<number | null>(null);
  const [moveHistory, setMoveHistory] = useState<MoveRecord[]>([]);
  const [movesCount, setMovesCount] = useState(0);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isWon, setIsWon] = useState(false);
  const [shakeTube, setShakeTube] = useState<number | null>(null);
  const [showRules, setShowRules] = useState(false);
  const timerRef = useRef<number | null>(null);

  // Generate a guaranteed solvable board
  const generateBoard = (currentMode: 'distributed' | 'classic') => {
    // Solved state: 4 tubes have 5 balls of a single color, 1 tube is empty
    let currentTubes: BallColor[][] = [
      ['cyan', 'cyan', 'cyan', 'cyan', 'cyan'],
      ['purple', 'purple', 'purple', 'purple', 'purple'],
      ['magenta', 'magenta', 'magenta', 'magenta', 'magenta'],
      ['yellow', 'yellow', 'yellow', 'yellow', 'yellow'],
      [],
    ];

    // Perform reverse valid moves to shuffle the balls
    const shuffleSteps = 80;
    for (let step = 0; step < shuffleSteps; step++) {
      // Pick a random tube that has balls
      const nonEmpties = currentTubes
        .map((t, idx) => (t.length > 0 ? idx : -1))
        .filter((idx) => idx !== -1);
      const fromIdx = nonEmpties[Math.floor(Math.random() * nonEmpties.length)];

      // Pick a target tube that has capacity < 5
      const availableTargets = currentTubes
        .map((t, idx) => (idx !== fromIdx && t.length < TUBE_CAPACITY ? idx : -1))
        .filter((idx) => idx !== -1);

      if (availableTargets.length > 0) {
        const toIdx = availableTargets[Math.floor(Math.random() * availableTargets.length)];
        const ball = currentTubes[fromIdx].pop()!;
        currentTubes[toIdx].push(ball);
      }
    }

    if (currentMode === 'distributed') {
      // Bring tubes to [4, 4, 4, 4, 4] so every tube holds multiple colors
      // Balance out tubes to length 4
      let balancing = true;
      let balanceAttempts = 0;
      while (balancing && balanceAttempts < 200) {
        balanceAttempts++;
        const overFilled = currentTubes
          .map((t, idx) => (t.length > 4 ? idx : -1))
          .filter((i) => i !== -1);
        const underFilled = currentTubes
          .map((t, idx) => (t.length < 4 ? idx : -1))
          .filter((i) => i !== -1);

        if (overFilled.length === 0 && underFilled.length === 0) {
          balancing = false;
          break;
        }

        if (overFilled.length > 0 && underFilled.length > 0) {
          const from = overFilled[0];
          const to = underFilled[0];
          const b = currentTubes[from].pop()!;
          currentTubes[to].push(b);
        } else {
          break;
        }
      }
    } else {
      // Classic mode: ensure 4 tubes have 5 balls and 1 tube is empty
      let balancing = true;
      let balanceAttempts = 0;
      while (balancing && balanceAttempts < 200) {
        balanceAttempts++;
        const empties = currentTubes.filter((t) => t.length === 0).length;
        if (empties === 1 && currentTubes.every((t) => t.length === 5 || t.length === 0)) {
          balancing = false;
          break;
        }
        const nonFullAndNonEmpty = currentTubes
          .map((t, idx) => (t.length > 0 && t.length < 5 ? idx : -1))
          .filter((i) => i !== -1);

        if (nonFullAndNonEmpty.length >= 2) {
          const from = nonFullAndNonEmpty[0];
          const to = nonFullAndNonEmpty[1];
          const b = currentTubes[from].pop()!;
          currentTubes[to].push(b);
        } else {
          // move from any tube with balls to another that has space
          const withBalls = currentTubes
            .map((t, idx) => (t.length > 0 ? idx : -1))
            .filter((i) => i !== -1);
          const withSpace = currentTubes
            .map((t, idx) => (t.length < 5 ? idx : -1))
            .filter((i) => i !== -1);
          if (withBalls.length && withSpace.length) {
            const from = withBalls[0];
            const to = withSpace.find((i) => i !== from);
            if (to !== undefined) {
              const b = currentTubes[from].pop()!;
              currentTubes[to].push(b);
            } else {
              break;
            }
          } else {
            break;
          }
        }
      }
    }

    // Verify all non-empty tubes have multiple colors initially
    let hasMultiple = currentTubes.every((t) => {
      if (t.length <= 1) return true;
      const first = t[0];
      return t.some((c) => c !== first);
    });

    // If accidental pure tube, swap a ball
    if (!hasMultiple) {
      for (let i = 0; i < currentTubes.length - 1; i++) {
        if (currentTubes[i].length > 1 && currentTubes[i + 1].length > 1) {
          const swap = currentTubes[i][0];
          currentTubes[i][0] = currentTubes[i + 1][0];
          currentTubes[i + 1][0] = swap;
        }
      }
    }

    setTubes(currentTubes);
    setSelectedTube(null);
    setMoveHistory([]);
    setMovesCount(0);
    setIsWon(false);
    setStartTime(Date.now());
    setElapsedSeconds(0);
  };

  // Timer loop
  useEffect(() => {
    generateBoard(mode);
  }, [mode]);

  useEffect(() => {
    if (isWon) return;
    timerRef.current = window.setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startTime, isWon]);

  // Check win condition
  const checkWinCondition = (currentTubes: BallColor[][]) => {
    let completedTubes = 0;
    for (const tube of currentTubes) {
      if (tube.length === TUBE_CAPACITY) {
        const firstColor = tube[0];
        const isUniform = tube.every((c) => c === firstColor);
        if (isUniform) completedTubes++;
      }
    }

    // If 4 tubes are completely filled with 5 balls of a single color
    if (completedTubes === 4) {
      setIsWon(true);
      sound.playSuccess();
      const timeSpent = Math.max(1, Math.floor((Date.now() - startTime) / 1000));
      api.recordReMind({
        activity_type: 'sort_it',
        accuracy: 1.0,
        completion_time: timeSpent,
        score: Math.max(100 - movesCount, 50),
        metadata_info: `Sorted in ${movesCount} moves, ${timeSpent}s`,
      });
    }
  };

  // Tube click handler
  const handleTubeClick = (tubeIndex: number) => {
    if (isWon) return;

    if (selectedTube === null) {
      // Selecting a source tube
      if (tubes[tubeIndex].length === 0) {
        // Can't pick from an empty tube
        triggerShake(tubeIndex);
        return;
      }
      setSelectedTube(tubeIndex);
      sound.playPop(520);
    } else if (selectedTube === tubeIndex) {
      // Clicked same tube: deselect
      setSelectedTube(null);
      sound.playPop(380);
    } else {
      // Attempt to move from selectedTube to tubeIndex
      const sourceTube = tubes[selectedTube];
      const targetTube = tubes[tubeIndex];

      if (sourceTube.length === 0) {
        setSelectedTube(null);
        return;
      }

      const ballToMove = sourceTube[sourceTube.length - 1];

      // Check validity:
      // Target must have space (< 5)
      // AND (target must be empty OR top ball of target matches ballToMove)
      const hasSpace = targetTube.length < TUBE_CAPACITY;
      const canPlace = targetTube.length === 0 || targetTube[targetTube.length - 1] === ballToMove;

      if (hasSpace && canPlace) {
        // Valid move!
        const nextTubes = tubes.map((t) => [...t]);
        const popped = nextTubes[selectedTube].pop()!;
        nextTubes[tubeIndex].push(popped);

        setTubes(nextTubes);
        setMoveHistory((prev) => [...prev, { fromTube: selectedTube, toTube: tubeIndex }]);
        setMovesCount((m) => m + 1);
        setSelectedTube(null);
        sound.playDrop();

        checkWinCondition(nextTubes);
      } else {
        // Invalid move
        triggerShake(tubeIndex);
      }
    }
  };

  const triggerShake = (index: number) => {
    setShakeTube(index);
    sound.playPop(200);
    setTimeout(() => setShakeTube(null), 400);
  };

  // Undo previous move
  const handleUndo = () => {
    if (moveHistory.length === 0 || isWon) return;
    const lastMove = moveHistory[moveHistory.length - 1];
    const nextTubes = tubes.map((t) => [...t]);

    if (nextTubes[lastMove.toTube].length > 0) {
      const ball = nextTubes[lastMove.toTube].pop()!;
      nextTubes[lastMove.fromTube].push(ball);
      setTubes(nextTubes);
      setMoveHistory((prev) => prev.slice(0, -1));
      setMovesCount((m) => Math.max(0, m - 1));
      setSelectedTube(null);
      sound.playPop(420);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '840px', margin: '0 auto' }}>
      <MiniGameHeader
        title="Sort It — Ball Sort Challenge"
        subtitle="5 tubes · 20 balls · 4 colours · Max 5 per tube"
        onBack={onBack}
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <button
              onClick={() => setShowRules(!showRules)}
              className="btn btn-secondary btn-sm"
              title="How to play"
              style={{ padding: '0.45rem 0.75rem' }}
            >
              <HelpCircle size={15} /> Rules
            </button>
            <button
              onClick={handleUndo}
              disabled={moveHistory.length === 0 || isWon}
              className="btn btn-secondary btn-sm"
              title="Undo last move"
              style={{
                opacity: moveHistory.length === 0 || isWon ? 0.5 : 1,
                cursor: moveHistory.length === 0 || isWon ? 'not-allowed' : 'pointer',
              }}
            >
              <Undo2 size={15} /> Undo
            </button>
            <button
              onClick={() => generateBoard(mode)}
              className="btn btn-secondary btn-sm"
              title="Reset current puzzle"
            >
              <RotateCcw size={15} /> Restart
            </button>
          </div>
        }
      />

      {/* Rules Banner */}
      {showRules && (
        <div
          className="glass-panel"
          style={{
            padding: '1rem 1.25rem',
            background: 'var(--blue-tint)',
            border: '1px solid var(--blue-border)',
            fontSize: '0.88rem',
            color: 'var(--ink)',
            lineHeight: 1.5,
          }}
        >
          <strong>How to Play:</strong>
          <ul style={{ margin: '0.4rem 0 0 1.25rem', padding: 0 }}>
            <li>Tap any tube to select its top ball, then tap another tube to place it.</li>
            <li>A ball can only be placed on an <strong>empty tube</strong> or on top of a <strong>matching color ball</strong>.</li>
            <li>Each tube can hold a maximum of <strong>5 balls</strong>.</li>
            <li><strong>Goal:</strong> Sort all 4 colors into their own separate full tubes!</li>
          </ul>
        </div>
      )}

      {/* Status & Stats Bar */}
      <div
        className="glass-panel"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          padding: '0.85rem 1.25rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Moves</span>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--ink)' }}>{movesCount}</div>
          </div>
          <div style={{ width: '1px', height: '26px', background: 'var(--line)' }} />
          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Time</span>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--ink)' }}>{formatTime(elapsedSeconds)}</div>
          </div>
          <div style={{ width: '1px', height: '26px', background: 'var(--line)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mode:</span>
            <button
              onClick={() => setMode(mode === 'distributed' ? 'classic' : 'distributed')}
              className="btn btn-secondary btn-sm"
              style={{ padding: '0.2rem 0.6rem', fontSize: '0.8rem' }}
            >
              {mode === 'distributed' ? '5 Tubes Mixed (4 ea)' : 'Classic (4 Mixed + 1 Empty)'}
            </button>
          </div>
        </div>

        {/* Color Key */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {ALL_COLORS.map((c) => (
            <div key={c} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: COLOR_DEFS[c].hex,
                  boxShadow: `0 0 8px ${COLOR_DEFS[c].glow}`,
                  display: 'inline-block',
                }}
              />
              <span style={{ fontSize: '0.8rem', color: 'var(--ink-soft)', textTransform: 'capitalize' }}>
                {c}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Playfield: 5 Test Tubes */}
      <div
        className="glass-panel"
        style={{
          padding: '2.5rem 1.5rem 2rem 1.5rem',
          minHeight: '440px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          background: 'linear-gradient(180deg, var(--paper-card) 0%, var(--paper-deep) 100%)',
          borderRadius: 'var(--radius-lg, 16px)',
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
        }}
      >
        {/* Rack & Tubes Area */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-end',
            gap: 'clamp(1rem, 3.5vw, 2.2rem)',
            width: '100%',
            maxWidth: '680px',
            paddingBottom: '1.5rem',
          }}
        >
          {tubes.map((tube, tubeIdx) => {
            const isSelected = selectedTube === tubeIdx;
            const isShaking = shakeTube === tubeIdx;
            const isCompleted =
              tube.length === TUBE_CAPACITY && tube.every((c) => c === tube[0]);

            return (
              <div
                key={tubeIdx}
                onClick={() => handleTubeClick(tubeIdx)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  userSelect: 'none',
                  position: 'relative',
                  transform: isShaking
                    ? 'translateX(6px)'
                    : isSelected
                    ? 'scale(1.03)'
                    : 'scale(1)',
                  transition: 'transform 0.15s ease, filter 0.15s ease',
                  filter: isCompleted ? 'drop-shadow(0 0 10px rgba(147, 172, 130, 0.4))' : 'none',
                }}
              >
                {/* Floating ball when tube is selected */}
                <div
                  style={{
                    height: '52px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    marginBottom: '0.4rem',
                  }}
                >
                  {isSelected && tube.length > 0 && (
                    <div
                      style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '50%',
                        background: COLOR_DEFS[tube[tube.length - 1]].gradient,
                        border: `2px solid ${COLOR_DEFS[tube[tube.length - 1]].border}`,
                        boxShadow: `0 8px 20px ${COLOR_DEFS[tube[tube.length - 1]].glow}`,
                        animation: 'ballFloat 1.2s ease-in-out infinite alternate',
                      }}
                    />
                  )}
                </div>

                {/* Glass Tube Container */}
                <div
                  style={{
                    width: '56px',
                    height: '240px',
                    background: isSelected
                      ? 'rgba(255, 255, 255, 0.75)'
                      : isCompleted
                      ? 'rgba(234, 239, 225, 0.85)'
                      : 'rgba(255, 255, 255, 0.45)',
                    backdropFilter: 'blur(6px)',
                    border: isSelected
                      ? '2px solid var(--blue-deep)'
                      : isCompleted
                      ? '2px solid var(--green-deep)'
                      : '2px solid rgba(210, 195, 170, 0.85)',
                    borderTop: 'none',
                    borderRadius: '0 0 28px 28px',
                    display: 'flex',
                    flexDirection: 'column-reverse',
                    alignItems: 'center',
                    padding: '8px 4px 10px 4px',
                    gap: '4px',
                    position: 'relative',
                    boxShadow: isSelected
                      ? '0 0 20px var(--blue-glow), inset 0 0 12px rgba(255,255,255,0.8)'
                      : isCompleted
                      ? '0 0 18px var(--green-glow), inset 0 0 10px rgba(255,255,255,0.8)'
                      : 'inset 0 0 10px rgba(255, 255, 255, 0.6), 0 6px 14px rgba(0,0,0,0.06)',
                  }}
                >
                  {/* Glass Lip at top */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '-5px',
                      left: '-4px',
                      right: '-4px',
                      height: '8px',
                      borderRadius: '4px',
                      background: isSelected ? 'var(--blue-deep)' : 'rgba(200, 185, 160, 0.9)',
                      border: '1px solid rgba(255,255,255,0.6)',
                    }}
                  />

                  {/* Measurement tick marks */}
                  <div
                    style={{
                      position: 'absolute',
                      right: '3px',
                      top: '25px',
                      bottom: '25px',
                      width: '4px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      opacity: 0.4,
                      pointerEvents: 'none',
                    }}
                  >
                    {[1, 2, 3, 4].map((mark) => (
                      <div key={mark} style={{ width: '4px', height: '1.5px', background: 'var(--ink)' }} />
                    ))}
                  </div>

                  {/* Balls inside tube */}
                  {tube.map((color, ballIdx) => {
                    const isTopBallAndSelected = isSelected && ballIdx === tube.length - 1;
                    if (isTopBallAndSelected) {
                      // Top ball is lifted above tube
                      return (
                        <div
                          key={ballIdx}
                          style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '50%',
                            border: '1px dashed rgba(0,0,0,0.15)',
                            opacity: 0.3,
                          }}
                        />
                      );
                    }

                    return (
                      <div
                        key={ballIdx}
                        style={{
                          width: '46px',
                          height: '46px',
                          borderRadius: '50%',
                          background: COLOR_DEFS[color].gradient,
                          border: `1.5px solid ${COLOR_DEFS[color].border}`,
                          boxShadow: `inset 0 -4px 6px rgba(0,0,0,0.25), inset 0 3px 6px rgba(255,255,255,0.6), 0 3px 6px ${COLOR_DEFS[color].glow}`,
                          transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        }}
                      />
                    );
                  })}
                </div>

                {/* Tube Number / Label */}
                <div
                  style={{
                    marginTop: '0.6rem',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: isSelected ? 'var(--blue-deep)' : 'var(--ink-soft)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                  }}
                >
                  {isCompleted ? (
                    <span style={{ color: 'var(--green-deep)' }}>✓ Done</span>
                  ) : (
                    <span>Tube {tubeIdx + 1}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Wooden Rack Bar */}
        <div
          style={{
            width: '100%',
            maxWidth: '660px',
            height: '14px',
            background: 'linear-gradient(90deg, #d5b88a 0%, #ecd0a6 50%, #d5b88a 100%)',
            borderRadius: '7px',
            boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
            marginTop: '-0.8rem',
            border: '1px solid #caa974',
          }}
        />

        {/* Win Modal Overlay */}
        {isWon && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(253, 245, 228, 0.92)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2rem',
              zIndex: 20,
              animation: 'fadeIn 0.3s ease',
            }}
          >
            <div
              style={{
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                background: 'var(--green-tint)',
                border: '2px solid var(--green-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--green-deep)',
                marginBottom: '1rem',
                boxShadow: '0 0 25px var(--green-glow)',
              }}
            >
              <Trophy size={36} />
            </div>

            <h3
              style={{
                fontSize: '1.8rem',
                fontWeight: 700,
                fontFamily: 'var(--font-heading)',
                color: 'var(--ink)',
                marginBottom: '0.5rem',
              }}
            >
              Brilliant Sort!
            </h3>

            <p style={{ fontSize: '0.95rem', color: 'var(--ink-soft)', marginBottom: '1.5rem', textAlign: 'center' }}>
              All 4 colours perfectly sorted in <strong>{movesCount} moves</strong> and <strong>{formatTime(elapsedSeconds)}</strong>.
            </p>

            <div style={{ display: 'flex', gap: '0.85rem' }}>
              <button onClick={() => generateBoard(mode)} className="btn btn-primary">
                <Sparkles size={16} /> Play Another Puzzle
              </button>
              <button onClick={onBack} className="btn btn-secondary">
                Back to Activities
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes ballFloat {
          0% { transform: translateY(0px); }
          100% { transform: translateY(-8px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

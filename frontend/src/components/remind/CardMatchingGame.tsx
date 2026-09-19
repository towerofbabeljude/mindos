import React, { useState, useEffect, useRef } from 'react';
import { MiniGameHeader } from './MiniGameHeader';
import { sound } from './soundEffects';
import { api } from '../../services/api';
import { RotateCcw, Trophy, Sparkles, Star } from 'lucide-react';

interface CardDef {
  id: string;
  name: string;
  emoji: string;
  bgGradient: string;
  borderColor: string;
  glowColor: string;
}

const ICONS: CardDef[] = [
  {
    id: 'heart',
    name: 'Baby Pink Heart',
    emoji: '🩷',
    bgGradient: 'radial-gradient(circle, #fde2e8 0%, #f9a8d4 100%)',
    borderColor: '#f472b6',
    glowColor: 'rgba(244, 114, 182, 0.45)',
  },
  {
    id: 'diamond',
    name: 'Diamond',
    emoji: '💎',
    bgGradient: 'radial-gradient(circle, #e0f2fe 0%, #7dd3fc 100%)',
    borderColor: '#38bdf8',
    glowColor: 'rgba(56, 189, 248, 0.45)',
  },
  {
    id: 'blueberry',
    name: 'Blueberry',
    emoji: '🫐',
    bgGradient: 'radial-gradient(circle, #e0e7ff 0%, #818cf8 100%)',
    borderColor: '#6366f1',
    glowColor: 'rgba(99, 102, 241, 0.45)',
  },
  {
    id: 'apple',
    name: 'Apple',
    emoji: '🍎',
    bgGradient: 'radial-gradient(circle, #fee2e2 0%, #f87171 100%)',
    borderColor: '#ef4444',
    glowColor: 'rgba(239, 68, 68, 0.45)',
  },
  {
    id: 'orange',
    name: 'Orange',
    emoji: '🍊',
    bgGradient: 'radial-gradient(circle, #ffedd5 0%, #fb923c 100%)',
    borderColor: '#f97316',
    glowColor: 'rgba(249, 115, 22, 0.45)',
  },
  {
    id: 'strawberry',
    name: 'Strawberry',
    emoji: '🍓',
    bgGradient: 'radial-gradient(circle, #ffe4e6 0%, #fb7185 100%)',
    borderColor: '#f43f5e',
    glowColor: 'rgba(244, 63, 94, 0.45)',
  },
  {
    id: 'pineapple',
    name: 'Pineapple',
    emoji: '🍍',
    bgGradient: 'radial-gradient(circle, #fef9c3 0%, #facc15 100%)',
    borderColor: '#eab308',
    glowColor: 'rgba(234, 179, 8, 0.45)',
  },
  {
    id: 'banana',
    name: 'Banana',
    emoji: '🍌',
    bgGradient: 'radial-gradient(circle, #fefce8 0%, #fde047 100%)',
    borderColor: '#facc15',
    glowColor: 'rgba(250, 204, 21, 0.45)',
  },
];

interface CardInstance {
  uniqueId: number;
  icon: CardDef;
  isFlipped: boolean;
  isMatched: boolean;
}

interface CardMatchingGameProps {
  onBack: () => void;
}

export const CardMatchingGame: React.FC<CardMatchingGameProps> = ({ onBack }) => {
  const [cards, setCards] = useState<CardInstance[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [movesCount, setMovesCount] = useState(0);
  const [matchesCount, setMatchesCount] = useState(0);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isWon, setIsWon] = useState(false);
  const timerRef = useRef<number | null>(null);

  // Initialize and shuffle 4x4 cards (8 pairs = 16 cards)
  const initializeGame = () => {
    const deck: CardInstance[] = [];
    let uniqueIdCounter = 0;

    ICONS.forEach((icon) => {
      // 2 instances of each icon for pairs
      deck.push({
        uniqueId: uniqueIdCounter++,
        icon,
        isFlipped: false,
        isMatched: false,
      });
      deck.push({
        uniqueId: uniqueIdCounter++,
        icon,
        isFlipped: false,
        isMatched: false,
      });
    });

    // Fisher-Yates shuffle
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    setCards(deck);
    setSelectedIndices([]);
    setIsProcessing(false);
    setMovesCount(0);
    setMatchesCount(0);
    setIsWon(false);
    setStartTime(Date.now());
    setElapsedSeconds(0);
  };

  useEffect(() => {
    initializeGame();
  }, []);

  // Timer loop
  useEffect(() => {
    if (isWon) return;
    timerRef.current = window.setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startTime, isWon]);

  // Handle card click
  const handleCardClick = (index: number) => {
    if (isProcessing || isWon) return;
    const card = cards[index];

    // Ignore if already flipped or matched
    if (card.isFlipped || card.isMatched) return;

    sound.playPop(480);

    const nextFlipped = [...selectedIndices, index];
    const newCards = [...cards];
    newCards[index] = { ...newCards[index], isFlipped: true };
    setCards(newCards);
    setSelectedIndices(nextFlipped);

    // If second card revealed
    if (nextFlipped.length === 2) {
      setMovesCount((m) => m + 1);
      setIsProcessing(true);

      const [firstIdx, secondIdx] = nextFlipped;
      const firstCard = newCards[firstIdx];
      const secondCard = newCards[secondIdx];

      if (firstCard.icon.id === secondCard.icon.id) {
        // MATCH!
        setTimeout(() => {
          sound.playSuccess();
          const matchedCards = [...newCards];
          matchedCards[firstIdx] = { ...matchedCards[firstIdx], isMatched: true };
          matchedCards[secondIdx] = { ...matchedCards[secondIdx], isMatched: true };
          setCards(matchedCards);
          setSelectedIndices([]);
          setIsProcessing(false);

          const newMatches = matchesCount + 1;
          setMatchesCount(newMatches);

          // Check if all 8 pairs matched
          if (newMatches === 8) {
            setIsWon(true);
            const timeSpent = Math.max(1, Math.floor((Date.now() - startTime) / 1000));
            const calculatedScore = Math.max(100 - movesCount * 2, 40);
            api.recordReMind({
              activity_type: 'card_matching',
              accuracy: 8 / (movesCount + 1),
              completion_time: timeSpent,
              score: calculatedScore,
              metadata_info: `Matched 8 pairs in ${movesCount + 1} moves, ${timeSpent}s`,
            });
          }
        }, 400);
      } else {
        // MISMATCH -> flip back
        setTimeout(() => {
          sound.playDrop();
          const resetCards = [...newCards];
          resetCards[firstIdx] = { ...resetCards[firstIdx], isFlipped: false };
          resetCards[secondIdx] = { ...resetCards[secondIdx], isFlipped: false };
          setCards(resetCards);
          setSelectedIndices([]);
          setIsProcessing(false);
        }, 900);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const getStarRating = () => {
    if (movesCount <= 12) return 3;
    if (movesCount <= 18) return 2;
    return 1;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '820px', margin: '0 auto' }}>
      <MiniGameHeader
        title="Card Matching"
        subtitle="4×4 memory grid · Match 8 pairs of icons"
        onBack={onBack}
        actions={
          <button onClick={initializeGame} className="btn btn-secondary btn-sm" title="New Game">
            <RotateCcw size={15} /> Restart
          </button>
        }
      />

      {/* Stats Bar */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Pairs Matched
            </span>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--ink)' }}>
              {matchesCount} / 8
            </div>
          </div>
          <div style={{ width: '1px', height: '26px', background: 'var(--line)' }} />
          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Moves
            </span>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--ink)' }}>{movesCount}</div>
          </div>
          <div style={{ width: '1px', height: '26px', background: 'var(--line)' }} />
          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Time
            </span>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--ink)' }}>{formatTime(elapsedSeconds)}</div>
          </div>
        </div>

        {/* Rating Stars */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          {[1, 2, 3].map((star) => (
            <Star
              key={star}
              size={18}
              fill={star <= getStarRating() ? 'var(--golden)' : 'transparent'}
              color={star <= getStarRating() ? 'var(--golden-deep)' : 'var(--line)'}
            />
          ))}
        </div>
      </div>

      {/* 4x4 Card Grid */}
      <div
        className="glass-panel"
        style={{
          padding: '2rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          background: 'linear-gradient(180deg, var(--paper-card) 0%, var(--paper-deep) 100%)',
          borderRadius: 'var(--radius-lg, 16px)',
          minHeight: '480px',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 'clamp(0.6rem, 2vw, 1rem)',
            width: '100%',
            maxWidth: '520px',
            aspectRatio: '1 / 1',
            perspective: '1000px',
          }}
        >
          {cards.map((card, idx) => {
            const isFlipped = card.isFlipped || card.isMatched;

            return (
              <div
                key={card.uniqueId}
                onClick={() => handleCardClick(idx)}
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '100%',
                  cursor: card.isMatched ? 'default' : 'pointer',
                  transformStyle: 'preserve-3d',
                  transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  borderRadius: '16px',
                  userSelect: 'none',
                }}
              >
                {/* Card Back (Face Down) */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #fdf5e4 0%, #f0dec0 100%)',
                    border: '2px solid #deb887',
                    boxShadow: '0 4px 10px rgba(43, 39, 31, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    if (!isFlipped) {
                      e.currentTarget.style.borderColor = 'var(--blue-deep)';
                      e.currentTarget.style.boxShadow = '0 6px 16px var(--blue-glow)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isFlipped) {
                      e.currentTarget.style.borderColor = '#deb887';
                      e.currentTarget.style.boxShadow = '0 4px 10px rgba(43, 39, 31, 0.08)';
                    }
                  }}
                >
                  {/* Subtle Card Back Pattern */}
                  <div
                    style={{
                      width: '70%',
                      height: '70%',
                      borderRadius: '10px',
                      border: '1.5px dashed rgba(180, 140, 90, 0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 80%)',
                    }}
                  >
                    <div
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        border: '2px solid rgba(180, 140, 90, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'rgba(180, 140, 90, 0.7)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                      }}
                    >
                      ✦
                    </div>
                  </div>
                </div>

                {/* Card Front (Face Up) */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '16px',
                    background: card.isMatched ? 'var(--green-tint)' : '#ffffff',
                    border: card.isMatched ? '2px solid var(--green)' : `2px solid ${card.icon.borderColor}`,
                    boxShadow: card.isMatched
                      ? '0 0 16px var(--green-glow)'
                      : `0 6px 18px ${card.icon.glowColor}`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                    padding: '0.4rem',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <div
                    style={{
                      width: '74%',
                      height: '74%',
                      borderRadius: '50%',
                      background: card.icon.bgGradient,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 'clamp(1.9rem, 5vw, 2.8rem)',
                      boxShadow: `inset 0 2px 4px rgba(255,255,255,0.8), 0 4px 12px ${card.icon.glowColor}`,
                    }}
                  >
                    {card.icon.emoji}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Win Modal */}
        {isWon && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(253, 245, 228, 0.94)',
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
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: 'var(--golden-tint)',
                border: '2px solid var(--golden-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--golden-deep)',
                marginBottom: '1rem',
                boxShadow: '0 0 25px var(--golden-glow)',
              }}
            >
              <Trophy size={40} />
            </div>

            <h3
              style={{
                fontSize: '1.85rem',
                fontWeight: 700,
                fontFamily: 'var(--font-heading)',
                color: 'var(--ink)',
                marginBottom: '0.35rem',
              }}
            >
              All Pairs Matched!
            </h3>

            {/* Stars */}
            <div style={{ display: 'flex', gap: '0.4rem', margin: '0.5rem 0 1rem 0' }}>
              {[1, 2, 3].map((star) => (
                <Star
                  key={star}
                  size={24}
                  fill={star <= getStarRating() ? 'var(--golden)' : 'transparent'}
                  color={star <= getStarRating() ? 'var(--golden-deep)' : 'var(--line)'}
                />
              ))}
            </div>

            <p style={{ fontSize: '0.95rem', color: 'var(--ink-soft)', marginBottom: '1.5rem', textAlign: 'center' }}>
              Completed in <strong>{movesCount} moves</strong> and <strong>{formatTime(elapsedSeconds)}</strong>.
            </p>

            <div style={{ display: 'flex', gap: '0.85rem' }}>
              <button onClick={initializeGame} className="btn btn-primary">
                <Sparkles size={16} /> Play Again
              </button>
              <button onClick={onBack} className="btn btn-secondary">
                Back to Activities
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

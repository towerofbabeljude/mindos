import React, { useState, useEffect, useRef } from 'react';
import { MiniGameHeader } from './MiniGameHeader';
import { sound } from './soundEffects';
import { api } from '../../services/api';
import { RotateCcw, ArrowUp, ArrowDown, Play } from 'lucide-react';

interface DinosaurGameProps {
  onBack: () => void;
}

export const DinosaurGame: React.FC<DinosaurGameProps> = ({ onBack }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameState, setGameState] = useState<'idle' | 'running' | 'gameover'>('idle');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('mindos_dino_hi') || '0', 10);
  });
  const [isDucking, setIsDucking] = useState(false);

  // Engine state references so requestAnimationFrame always gets fresh values without re-mounting
  const engineRef = useRef({
    state: 'idle' as 'idle' | 'running' | 'gameover',
    score: 0,
    highScore: parseInt(localStorage.getItem('mindos_dino_hi') || '0', 10),
    speed: 4.8,
    distance: 0,
    startTime: 0,
    lastObstacleDist: 0,
    nextObstacleGap: 380,
    jumpBuffered: false,

    // T-Rex state
    dino: {
      x: 50,
      y: 0, // offset from ground
      vy: 0,
      width: 44,
      height: 47,
      isJumping: false,
      isDucking: false,
      legStep: 0,
      stepTimer: 0,
    },

    // Ground line
    groundY: 190,
    groundOffset: 0,
    groundBumps: [] as { x: number; y: number; size: number }[],

    // Clouds
    clouds: [] as { x: number; y: number; speed: number }[],

    // Obstacles
    obstacles: [] as {
      type: 'cactus_small' | 'cactus_large' | 'cactus_double' | 'pterodactyl';
      x: number;
      y: number;
      width: number;
      height: number;
      altitude?: 'low' | 'mid' | 'high';
      flapFrame?: number;
      flapTimer?: number;
    }[],

    // Day/Night inverted mode
    isNight: false,
    nightAlpha: 0,
  });

  // Initialize ground bumps and clouds
  useEffect(() => {
    const e = engineRef.current;
    e.groundBumps = [];
    for (let x = 0; x < 1200; x += 30) {
      e.groundBumps.push({
        x,
        y: e.groundY + Math.random() * 8 + 2,
        size: Math.random() > 0.5 ? 2 : 1,
      });
    }

    e.clouds = [
      { x: 150, y: 45, speed: 0.8 },
      { x: 420, y: 30, speed: 0.6 },
      { x: 680, y: 55, speed: 0.9 },
    ];
  }, []);

  // Controls handler
  const triggerJump = () => {
    const e = engineRef.current;
    if (e.state === 'idle' || e.state === 'gameover') {
      startGame();
      return;
    }
    if (!e.dino.isJumping && !e.dino.isDucking) {
      e.dino.vy = -9.2;
      e.dino.isJumping = true;
      e.jumpBuffered = false;
      sound.playJump();
    } else if (e.dino.isJumping && e.dino.y > -25) {
      // Buffer jump if pressed right before landing
      e.jumpBuffered = true;
    }
  };

  const setDuckingState = (ducking: boolean) => {
    const e = engineRef.current;
    if (e.state !== 'running') return;
    e.dino.isDucking = ducking;
    setIsDucking(ducking);
    if (ducking && e.dino.isJumping) {
      // Fast drop down if pressing duck while in air
      e.dino.vy = Math.max(e.dino.vy, 6);
    }
  };

  const startGame = () => {
    const e = engineRef.current;
    e.state = 'running';
    e.score = 0;
    e.distance = 0;
    e.speed = 4.8;
    e.startTime = Date.now();
    e.lastObstacleDist = 0;
    e.nextObstacleGap = 380;
    e.jumpBuffered = false;
    e.dino.y = 0;
    e.dino.vy = 0;
    e.dino.isJumping = false;
    e.dino.isDucking = false;
    e.obstacles = [];
    e.isNight = false;
    e.nightAlpha = 0;

    setGameState('running');
    setScore(0);
    setIsDucking(false);
  };

  // Keyboard events
  useEffect(() => {
    const handleKeyDown = (ev: KeyboardEvent) => {
      if (ev.code === 'Space' || ev.code === 'ArrowUp') {
        ev.preventDefault();
        triggerJump();
      } else if (ev.code === 'ArrowDown') {
        ev.preventDefault();
        setDuckingState(true);
      }
    };

    const handleKeyUp = (ev: KeyboardEvent) => {
      if (ev.code === 'ArrowDown') {
        setDuckingState(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Main Canvas Render and Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;

      const e = engineRef.current;
      const width = canvas.width;
      const height = canvas.height;

      // Update if running
      if (e.state === 'running') {
        const timeScale = Math.min(dt * 60, 1.5);
        e.distance += e.speed * timeScale;
        const currentScore = Math.floor(e.distance / 10);
        if (currentScore !== e.score) {
          e.score = currentScore;
          setScore(currentScore);

          // Milestone beep every 100 points
          if (currentScore > 0 && currentScore % 100 === 0) {
            sound.playMilestone();
          }

          // Gradual, smooth speed up as you go!
          e.speed = Math.min(13.5, 4.8 + Math.floor(currentScore / 50) * 0.28);

          // Day / Night cycle (toggle every 700 points)
          const nightCycle = Math.floor(currentScore / 700) % 2 === 1;
          e.isNight = nightCycle;
        }

        // Night alpha transition
        if (e.isNight && e.nightAlpha < 1) {
          e.nightAlpha = Math.min(1, e.nightAlpha + dt * 1.5);
        } else if (!e.isNight && e.nightAlpha > 0) {
          e.nightAlpha = Math.max(0, e.nightAlpha - dt * 1.5);
        }

        // Dino physics: smooth arc, never leaves canvas
        if (e.dino.isJumping) {
          e.dino.vy += 0.54 * timeScale;
          e.dino.y += e.dino.vy * timeScale;

          // Clamped apex so dino is always within full view
          if (e.dino.y <= -80) {
            e.dino.y = -80;
            if (e.dino.vy < 0) e.dino.vy = 0;
          }

          if (e.dino.y >= 0) {
            e.dino.y = 0;
            e.dino.vy = 0;
            e.dino.isJumping = false;
            if (e.jumpBuffered) {
              e.jumpBuffered = false;
              e.dino.vy = -9.2;
              e.dino.isJumping = true;
              sound.playJump();
            }
          }
        }

        // Step animation timer
        e.dino.stepTimer += dt * (e.speed * 2.2);
        if (e.dino.stepTimer >= 1) {
          e.dino.stepTimer = 0;
          e.dino.legStep = e.dino.legStep === 0 ? 1 : 0;
        }

        // Update ground
        e.groundOffset = (e.groundOffset + e.speed * timeScale) % 600;

        // Update clouds
        e.clouds.forEach((cloud) => {
          cloud.x -= cloud.speed * dt * 40;
          if (cloud.x < -60) {
            cloud.x = width + Math.random() * 80;
            cloud.y = 25 + Math.random() * 40;
          }
        });

        // Obstacle spawning with generous spacing
        if (e.distance - e.lastObstacleDist > e.nextObstacleGap) {
          e.lastObstacleDist = e.distance;
          const minGap = Math.max(380, e.speed * 48);
          e.nextObstacleGap = minGap + Math.random() * 260;

          // Determine obstacle type: Cacti vs Pterodactyl (pterodactyls appear once score > 300)
          const allowPtero = e.score > 300 && Math.random() > 0.65;
          if (allowPtero) {
            // Pick altitude: low (requires jump), mid (requires duck), or high (safe)
            const altitudes: ('low' | 'mid' | 'high')[] = ['low', 'mid', 'high'];
            const chosenAlt = altitudes[Math.floor(Math.random() * altitudes.length)];
            let pteroY = e.groundY - 32; // low
            if (chosenAlt === 'mid') pteroY = e.groundY - 54;
            if (chosenAlt === 'high') pteroY = e.groundY - 78;

            e.obstacles.push({
              type: 'pterodactyl',
              x: width + 20,
              y: pteroY,
              width: 44,
              height: 32,
              altitude: chosenAlt,
              flapFrame: 0,
              flapTimer: 0,
            });
          } else {
            // Cactus variety
            const roll = Math.random();
            if (roll < 0.4) {
              e.obstacles.push({
                type: 'cactus_small',
                x: width + 20,
                y: e.groundY - 36,
                width: 20,
                height: 36,
              });
            } else if (roll < 0.75) {
              e.obstacles.push({
                type: 'cactus_double',
                x: width + 20,
                y: e.groundY - 38,
                width: 36,
                height: 38,
              });
            } else {
              e.obstacles.push({
                type: 'cactus_large',
                x: width + 20,
                y: e.groundY - 48,
                width: 26,
                height: 48,
              });
            }
          }
        }

        // Update obstacles & check collision
        for (let i = e.obstacles.length - 1; i >= 0; i--) {
          const obs = e.obstacles[i];
          const obsSpeed = obs.type === 'pterodactyl' ? e.speed * 1.15 : e.speed;
          obs.x -= obsSpeed * timeScale;

          // Flapping animation for pterodactyl
          if (obs.type === 'pterodactyl') {
            obs.flapTimer = (obs.flapTimer || 0) + dt * 8;
            if (obs.flapTimer >= 1) {
              obs.flapTimer = 0;
              obs.flapFrame = obs.flapFrame === 0 ? 1 : 0;
            }
          }

          // Dino bounding box
          const dinoW = e.dino.isDucking ? 56 : 42;
          const dinoH = e.dino.isDucking ? 28 : 46;
          const dinoX = e.dino.x;
          const dinoY = e.groundY - dinoH + e.dino.y;

          // Collision check with slight inset tolerance for fair hitboxes
          const inset = 6;
          const collision =
            dinoX + inset < obs.x + obs.width - inset &&
            dinoX + dinoW - inset > obs.x + inset &&
            dinoY + inset < obs.y + obs.height &&
            dinoY + dinoH > obs.y + inset;

          if (collision) {
            // Crash!
            e.state = 'gameover';
            setGameState('gameover');
            sound.playHit();

            if (e.score > e.highScore) {
              e.highScore = e.score;
              setHighScore(e.score);
              localStorage.setItem('mindos_dino_hi', e.score.toString());
            }

            const timeSpent = Math.max(1, Math.floor((Date.now() - e.startTime) / 1000));
            api.recordReMind({
              activity_type: 'dinosaur',
              accuracy: 1.0,
              score: e.score,
              completion_time: timeSpent,
              metadata_info: `Dino Run score: ${e.score} (${timeSpent}s)`,
            });
            break;
          }

          // Remove offscreen
          if (obs.x < -60) {
            e.obstacles.splice(i, 1);
          }
        }
      }

      // ----------------- DRAWING -----------------
      // Background (smooth Day / Night cycle)
      const bgColor = e.nightAlpha > 0
        ? `rgb(${Math.round(253 * (1 - e.nightAlpha) + 32 * e.nightAlpha)}, ${Math.round(
            245 * (1 - e.nightAlpha) + 36 * e.nightAlpha
          )}, ${Math.round(228 * (1 - e.nightAlpha) + 48 * e.nightAlpha)})`
        : '#fdf5e4';

      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, width, height);

      // Stars in Night mode
      if (e.nightAlpha > 0) {
        ctx.fillStyle = `rgba(255, 255, 255, ${0.8 * e.nightAlpha})`;
        const starCoords = [
          [80, 25], [190, 40], [310, 18], [480, 50], [600, 20], [710, 35],
        ];
        starCoords.forEach(([sx, sy]) => {
          ctx.fillRect(sx, sy, 2, 2);
        });

        // Crescent moon
        ctx.fillStyle = `rgba(240, 230, 200, ${e.nightAlpha})`;
        ctx.beginPath();
        ctx.arc(660, 45, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = bgColor;
        ctx.beginPath();
        ctx.arc(656, 42, 11, 0, Math.PI * 2);
        ctx.fill();
      }

      const inkColor = e.nightAlpha > 0 ? '#f5e8ca' : '#2b271f';
      const softInk = e.nightAlpha > 0 ? '#a89d8d' : '#8c8273';

      // Draw clouds
      ctx.fillStyle = e.nightAlpha > 0 ? 'rgba(255, 255, 255, 0.15)' : 'rgba(215, 195, 165, 0.4)';
      e.clouds.forEach((cloud) => {
        ctx.beginPath();
        ctx.arc(cloud.x, cloud.y, 14, 0, Math.PI * 2);
        ctx.arc(cloud.x + 14, cloud.y - 6, 17, 0, Math.PI * 2);
        ctx.arc(cloud.x + 30, cloud.y, 13, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw ground line
      ctx.strokeStyle = inkColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, e.groundY);
      ctx.lineTo(width, e.groundY);
      ctx.stroke();

      // Ground bumps/sand pebbles
      ctx.fillStyle = softInk;
      e.groundBumps.forEach((bump) => {
        const drawX = ((bump.x - e.groundOffset) % (width + 60)) + (bump.x < e.groundOffset ? width + 60 : 0);
        ctx.fillRect(drawX, bump.y, bump.size * 2, bump.size);
      });

      // Draw Obstacles
      ctx.fillStyle = inkColor;
      e.obstacles.forEach((obs) => {
        if (obs.type === 'cactus_small') {
          // Single classic cactus
          drawCactus(ctx, obs.x, obs.y, 20, 36);
        } else if (obs.type === 'cactus_double') {
          drawCactus(ctx, obs.x, obs.y, 16, 36);
          drawCactus(ctx, obs.x + 18, obs.y + 4, 18, 32);
        } else if (obs.type === 'cactus_large') {
          drawCactus(ctx, obs.x, obs.y, 26, 48);
        } else if (obs.type === 'pterodactyl') {
          // Flying Pterodactyl
          drawPterodactyl(ctx, obs.x, obs.y, obs.flapFrame || 0);
        }
      });

      // Draw Dino
      const dinoW = e.dino.isDucking ? 56 : 42;
      const dinoH = e.dino.isDucking ? 28 : 46;
      const dinoX = e.dino.x;
      const dinoY = e.groundY - dinoH + e.dino.y;

      if (e.dino.isDucking) {
        drawDuckingDino(ctx, dinoX, dinoY, e.dino.legStep, inkColor, e.state === 'gameover');
      } else {
        drawStandingDino(ctx, dinoX, dinoY, e.dino.legStep, inkColor, e.dino.isJumping, e.state === 'gameover');
      }

      // Draw Scores in Canvas (Retro arcade font look)
      ctx.font = '700 15px "Courier New", monospace';
      ctx.textAlign = 'right';
      ctx.fillStyle = softInk;
      const hiStr = `HI ${String(e.highScore).padStart(5, '0')}`;
      const scStr = String(e.score).padStart(5, '0');
      ctx.fillText(`${hiStr}  ${scStr}`, width - 25, 30);

      // Start prompt or Game Over banner
      if (e.state === 'idle') {
        ctx.textAlign = 'center';
        ctx.font = '700 16px var(--font-heading), serif';
        ctx.fillStyle = inkColor;
        ctx.fillText('Press SPACE or UP to Jump', width / 2, 95);
        ctx.font = '13px var(--font-body), serif';
        ctx.fillStyle = softInk;
        ctx.fillText('Use DOWN Arrow to Duck under flying obstacles', width / 2, 120);
      } else if (e.state === 'gameover') {
        ctx.textAlign = 'center';
        ctx.font = '700 20px "Courier New", monospace';
        ctx.fillStyle = inkColor;
        ctx.fillText('G A M E   O V E R', width / 2, 85);

        // Restart Icon
        ctx.strokeStyle = inkColor;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(width / 2, 120, 16, 0.4 * Math.PI, 1.9 * Math.PI);
        ctx.stroke();
        // Arrow head
        ctx.beginPath();
        ctx.moveTo(width / 2 + 16, 112);
        ctx.lineTo(width / 2 + 16, 126);
        ctx.lineTo(width / 2 + 4, 126);
        ctx.fill();

        ctx.font = '13px var(--font-body), serif';
        ctx.fillStyle = softInk;
        ctx.fillText('Press SPACE, UP, or Click to Replay', width / 2, 155);
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Helper renderer: Pixel-crisp Cactus
  const drawCactus = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => {
    // Main trunk
    const trunkW = Math.max(6, Math.floor(w * 0.35));
    const trunkX = x + Math.floor((w - trunkW) / 2);
    ctx.fillRect(trunkX, y, trunkW, h);

    // Left arm
    const armH = Math.floor(h * 0.45);
    const armY = y + Math.floor(h * 0.25);
    ctx.fillRect(x, armY, trunkX - x, 4);
    ctx.fillRect(x, armY - armH * 0.5, 4, armH * 0.7);

    // Right arm
    const rightArmX = trunkX + trunkW;
    const rightArmY = y + Math.floor(h * 0.35);
    ctx.fillRect(rightArmX, rightArmY, x + w - rightArmX, 4);
    ctx.fillRect(x + w - 4, rightArmY - armH * 0.5, 4, armH * 0.7);
  };

  // Helper renderer: Flapping Pterodactyl
  const drawPterodactyl = (ctx: CanvasRenderingContext2D, x: number, y: number, flapFrame: number) => {
    // Body & Beak
    ctx.fillRect(x + 10, y + 12, 22, 8);
    ctx.fillRect(x + 2, y + 14, 10, 4); // Beak
    ctx.fillRect(x + 30, y + 14, 8, 4);  // Tail

    // Eye
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + 10, y + 13, 2, 2);
    ctx.fillStyle = engineRef.current.nightAlpha > 0 ? '#f5e8ca' : '#2b271f';

    // Wings
    if (flapFrame === 0) {
      // Wings UP
      ctx.beginPath();
      ctx.moveTo(x + 14, y + 12);
      ctx.lineTo(x + 22, y - 6);
      ctx.lineTo(x + 26, y + 12);
      ctx.fill();
    } else {
      // Wings DOWN
      ctx.beginPath();
      ctx.moveTo(x + 14, y + 16);
      ctx.lineTo(x + 22, y + 32);
      ctx.lineTo(x + 26, y + 16);
      ctx.fill();
    }
  };

  // Helper renderer: Standing T-Rex
  const drawStandingDino = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    legStep: number,
    color: string,
    isJumping: boolean,
    isDead: boolean
  ) => {
    ctx.fillStyle = color;

    // Head
    ctx.fillRect(x + 22, y, 20, 16);
    ctx.fillRect(x + 18, y + 4, 6, 12);

    // Eye
    if (isDead) {
      // X mark eye
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 32, y + 3, 4, 4);
      ctx.fillStyle = color;
      ctx.fillRect(x + 33, y + 4, 2, 2);
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 32, y + 3, 3, 3);
      ctx.fillStyle = color;
    }

    // Mouth
    ctx.fillRect(x + 30, y + 10, 12, 2);

    // Body
    ctx.fillRect(x + 10, y + 16, 20, 18);
    // Tail
    ctx.fillRect(x, y + 20, 10, 8);
    ctx.fillRect(x + 4, y + 28, 8, 6);

    // Tiny arm
    ctx.fillRect(x + 28, y + 22, 6, 3);
    ctx.fillRect(x + 32, y + 24, 2, 4);

    // Legs
    if (isJumping || isDead) {
      ctx.fillRect(x + 14, y + 34, 4, 12);
      ctx.fillRect(x + 22, y + 34, 4, 12);
    } else {
      if (legStep === 0) {
        ctx.fillRect(x + 14, y + 34, 4, 12);
        ctx.fillRect(x + 22, y + 34, 4, 7);
      } else {
        ctx.fillRect(x + 14, y + 34, 4, 7);
        ctx.fillRect(x + 22, y + 34, 4, 12);
      }
    }
  };

  // Helper renderer: Ducking T-Rex
  const drawDuckingDino = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    legStep: number,
    color: string,
    isDead: boolean
  ) => {
    ctx.fillStyle = color;

    // Elongated horizontal body & head
    ctx.fillRect(x, y + 8, 48, 14);
    ctx.fillRect(x + 44, y + 4, 12, 14); // Extended head

    // Eye
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + 50, y + 6, 3, 3);
    ctx.fillStyle = color;

    // Tail
    ctx.fillRect(x, y + 12, 6, 8);

    // Arm
    ctx.fillRect(x + 36, y + 14, 6, 2);

    // Legs
    if (isDead) {
      ctx.fillRect(x + 16, y + 22, 4, 8);
      ctx.fillRect(x + 28, y + 22, 4, 8);
    } else {
      if (legStep === 0) {
        ctx.fillRect(x + 16, y + 22, 4, 8);
        ctx.fillRect(x + 28, y + 22, 4, 4);
      } else {
        ctx.fillRect(x + 16, y + 22, 4, 4);
        ctx.fillRect(x + 28, y + 22, 4, 8);
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '820px', margin: '0 auto' }}>
      <MiniGameHeader
        title="Dinosaur Runner"
        subtitle="Chrome offline runner · Space / Up to Jump · Down to Duck"
        onBack={onBack}
        actions={
          <button onClick={startGame} className="btn btn-secondary btn-sm">
            <RotateCcw size={15} /> Restart
          </button>
        }
      />

      {/* Game Canvas Container */}
      <div
        className="glass-panel"
        style={{
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          borderRadius: 'var(--radius-lg, 16px)',
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
          userSelect: 'none',
        }}
      >
        <canvas
          ref={canvasRef}
          width={760}
          height={240}
          onClick={triggerJump}
          style={{
            width: '100%',
            maxWidth: '760px',
            height: 'auto',
            borderRadius: '12px',
            cursor: 'pointer',
            imageRendering: 'pixelated',
            border: '1px solid var(--line)',
          }}
        />

        {/* Responsive Mobile / Touch Control Buttons */}
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            width: '100%',
            maxWidth: '500px',
            marginTop: '1rem',
            justifyContent: 'center',
          }}
        >
          <button
            onClick={triggerJump}
            className="btn btn-primary"
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              padding: '0.75rem',
            }}
          >
            <ArrowUp size={18} /> Jump (Space / Up)
          </button>

          <button
            onMouseDown={() => setDuckingState(true)}
            onMouseUp={() => setDuckingState(false)}
            onTouchStart={(e) => {
              e.preventDefault();
              setDuckingState(true);
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              setDuckingState(false);
            }}
            className="btn btn-secondary"
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              padding: '0.75rem',
              background: isDucking ? 'var(--paper-deep)' : undefined,
            }}
          >
            <ArrowDown size={18} /> Duck (Down Arrow)
          </button>
        </div>
      </div>
    </div>
  );
};

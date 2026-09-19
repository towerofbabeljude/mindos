import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { AcademicTask, SimulationResult } from '../types';
import { Sliders, CheckSquare, Square, Sparkles } from 'lucide-react';

export const Simulator: React.FC = () => {
  const [tasks, setTasks] = useState<AcademicTask[]>([]);
  const [selectedTaskIds, setSelectedTaskIds] = useState<number[]>([]);
  const [reducedPercent, setReducedPercent] = useState<number>(15);
  const [result, setResult] = useState<SimulationResult | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const t = await api.getTasks();
        const active = t.filter(item => item.status !== 'completed');
        setTasks(active);
        if (active.length > 0) {
          setSelectedTaskIds([active[0].id]);
        }
      } catch (err) {
        console.error('Failed to load tasks for simulation:', err);
      }
    };
    fetchTasks();
  }, []);

  const runSim = async (postponed: number[], pct: number) => {
    try {
      const res = await api.simulateWorkload(postponed, pct);
      setResult(res);
    } catch (err) {
      console.error('Simulation calculation failed:', err);
    }
  };

  useEffect(() => {
    runSim(selectedTaskIds, reducedPercent);
  }, [selectedTaskIds, reducedPercent]);

  const toggleTask = (id: number) => {
    if (selectedTaskIds.includes(id)) {
      setSelectedTaskIds(selectedTaskIds.filter(x => x !== id));
    } else {
      setSelectedTaskIds([...selectedTaskIds, id]);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '880px', margin: '0 auto' }}>
      <div>
        <h1 style={{ fontSize: '2.1rem', fontWeight: 700, color: 'var(--ink)', fontFamily: 'var(--font-heading)', marginBottom: '0.25rem' }}>
          What-If Workload Simulator
        </h1>
        <p style={{ fontSize: '0.95rem', color: 'var(--ink-soft)' }}>
          Experiment with rescheduling deadlines or reducing cognitive load to see immediate estimated workload relief.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        {/* Left Column: Controls */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--ink)', fontFamily: 'var(--font-heading)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sliders size={18} color="var(--green-deep)" /> Simulation Variables
          </h3>

          {/* Task Postpone Selection */}
          <div>
            <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--ink)', display: 'block', marginBottom: '0.6rem' }}>
              Select tasks to simulate postponing / rescheduling:
            </label>

            {tasks.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--ink-dim)' }}>No active tasks available to simulate.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '240px', overflowY: 'auto', paddingRight: '0.4rem' }}>
                {tasks.map(task => {
                  const isChecked = selectedTaskIds.includes(task.id);
                  return (
                    <div
                      key={task.id}
                      onClick={() => toggleTask(task.id)}
                      style={{
                        padding: '0.65rem 0.85rem',
                        borderRadius: 'var(--radius-sm)',
                        background: isChecked ? 'var(--green-tint)' : 'var(--paper-deep)',
                        border: isChecked ? '1px solid var(--green-border)' : '1px solid var(--line)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        {isChecked ? <CheckSquare size={16} color="var(--green-deep)" /> : <Square size={16} color="var(--ink-dim)" />}
                        <span style={{ fontSize: '0.9rem', color: isChecked ? 'var(--green-deep)' : 'var(--ink-soft)', fontWeight: isChecked ? 600 : 400 }}>
                          {task.title}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--blue-deep)', fontWeight: 600 }}>
                        {task.estimated_hours}h
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Study Target Reduction Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--ink)' }}>
                Scale Down Non-Critical Study Time:
              </label>
              <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--blue-deep)', fontFamily: 'var(--font-heading)' }}>
                -{reducedPercent}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={40}
              step={5}
              value={reducedPercent}
              onChange={(e) => setReducedPercent(parseInt(e.target.value))}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--ink-dim)', marginTop: '0.2rem' }}>
              <span>0% (Normal load)</span>
              <span>40% (Substantial break)</span>
            </div>
          </div>
        </div>

        {/* Right Column: Comparative Impact Visualization */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Sparkles size={18} color="var(--amber)" />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--ink)', fontFamily: 'var(--font-heading)' }}>Estimated Impact</h3>
            </div>

            {result && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Visual Comparative Bars */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {/* Current Plan */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                      <span style={{ color: 'var(--ink-soft)' }}>CURRENT WORKLOAD:</span>
                      <strong style={{ color: 'var(--rose-deep)' }}>{result.original_workload_hours}h ({Math.round(result.original_pressure_percent)}% load)</strong>
                    </div>
                    <div style={{ height: '8px', background: 'var(--paper-deep)', border: '1px solid var(--line-subtle)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${Math.min(result.original_pressure_percent, 100)}%`, background: 'var(--rose)' }} />
                    </div>
                  </div>

                  {/* Simulated Plan */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                      <span style={{ color: 'var(--green-deep)', fontWeight: 600 }}>SIMULATED PLAN:</span>
                      <strong style={{ color: 'var(--green-deep)' }}>{result.simulated_workload_hours}h ({Math.round(result.simulated_pressure_percent)}% load)</strong>
                    </div>
                    <div style={{ height: '8px', background: 'var(--paper-deep)', border: '1px solid var(--line-subtle)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${Math.min(result.simulated_pressure_percent, 100)}%`, background: 'var(--green-deep)', transition: 'width 0.3s ease' }} />
                    </div>
                  </div>
                </div>

                {/* Big Relief Callout Pill */}
                <div style={{
                  background: 'var(--green-tint)',
                  border: '1px solid var(--green-border)',
                  padding: '1rem',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem'
                }}>
                  <div style={{ fontSize: '1.9rem', fontWeight: 700, color: 'var(--green-deep)', fontFamily: 'var(--font-heading)' }}>
                    -{Math.round(result.relief_percent)}%
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--ink)' }}>Workload Pressure Relief</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--ink-soft)' }}>Estimated cognitive capacity freed up</div>
                  </div>
                </div>

                <p style={{ fontSize: '0.9rem', color: 'var(--ink-soft)', lineHeight: 1.5 }}>
                  {result.explanation}
                </p>
              </div>
            )}
          </div>

          <div style={{ fontSize: '0.78rem', color: 'var(--ink-dim)', borderTop: '1px solid var(--line)', paddingTop: '0.75rem', marginTop: '1rem' }}>
            Note: Simulations are estimated workload recalculations designed to help you make informed scheduling choices.
          </div>
        </div>
      </div>
    </div>
  );
};

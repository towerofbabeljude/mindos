import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { AcademicTask } from '../types';
import { Plus, Trash2, CheckCircle, Clock, AlertTriangle, Calendar, Filter, X } from 'lucide-react';

export const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<AcademicTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Filter state
  const [showFilter, setShowFilter] = useState(false);
  const [filterBy, setFilterBy] = useState<'course' | 'deadline' | 'estimated_hours' | 'priority'>('priority');
  const [filterValue, setFilterValue] = useState<string>('');

  // New task form state
  const [title, setTitle] = useState('');
  const [course, setCourse] = useState('CS 301');
  const [deadline, setDeadline] = useState(new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]);
  const [estimatedHours, setEstimatedHours] = useState(3.0);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  const loadTasks = async () => {
    try {
      setIsLoading(true);
      const data = await api.getTasks();
      setTasks(data);
    } catch (err) {
      console.error('Failed to load tasks:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleToggleComplete = async (task: AcademicTask) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    try {
      await api.updateTask(task.id, { status: newStatus });
      loadTasks();
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.deleteTask(id);
      loadTasks();
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      await api.createTask({
        title,
        course,
        deadline,
        estimated_hours: estimatedHours,
        priority,
        difficulty,
        status: 'pending'
      });
      setTitle('');
      setShowAddModal(false);
      loadTasks();
    } catch (err) {
      console.error('Failed to create task:', err);
    }
  };

  // Filter logic
  const applyFilter = (taskList: AcademicTask[]) => {
    if (!showFilter || !filterValue.trim()) return taskList;
    return taskList.filter(t => {
      if (filterBy === 'course') return t.course.toLowerCase().includes(filterValue.toLowerCase());
      if (filterBy === 'deadline') return t.deadline === filterValue;
      if (filterBy === 'estimated_hours') return t.estimated_hours <= parseFloat(filterValue);
      if (filterBy === 'priority') return t.priority === filterValue;
      return true;
    });
  };

  const allActiveTasks = tasks.filter(t => t.status !== 'completed');
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const activeTasks = applyFilter(allActiveTasks);
  const totalPendingHours = allActiveTasks.reduce((acc, t) => acc + t.estimated_hours, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '880px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.1rem', fontWeight: 700, color: 'var(--ink)', fontFamily: 'var(--font-heading)', marginBottom: '0.25rem' }}>
            Academic Tasks & Workload
          </h1>
          <p style={{ fontSize: '0.95rem', color: 'var(--ink-soft)' }}>
            Esprit monitors your pending deadlines and workload hours to detect academic strain early.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
          <button
            onClick={() => { setShowFilter(!showFilter); setFilterValue(''); }}
            className={`btn btn-sm ${showFilter ? 'btn-sunset' : 'btn-secondary'}`}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Filter size={14} /> {showFilter ? 'Clear Filter' : 'Filter'}
          </button>
          <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
            <Plus size={16} /> Add New Task
          </button>
        </div>
      </div>

      {/* Filter bar */}
      {showFilter && (
        <div className="glass-panel" style={{
          padding: '1rem 1.35rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.85rem',
          flexWrap: 'wrap',
          background: 'linear-gradient(135deg, var(--sunset-tint), var(--golden-tint))',
          border: '1px solid var(--sunset-border)',
        }}>
          <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--ink)', whiteSpace: 'nowrap' }}>
            <Filter size={14} style={{ marginRight: '0.35rem', verticalAlign: 'middle' }} />
            Filter by:
          </span>

          <select
            className="input-field"
            value={filterBy}
            onChange={(e) => { setFilterBy(e.target.value as any); setFilterValue(''); }}
            style={{ maxWidth: '180px', padding: '0.45rem 0.75rem', fontSize: '0.88rem' }}
          >
            <option value="course">Course</option>
            <option value="deadline">Deadline (exact date)</option>
            <option value="estimated_hours">Estimated Hours (≤)</option>
            <option value="priority">Priority</option>
          </select>

          {filterBy === 'course' && (
            <input
              type="text"
              placeholder="e.g. CS 301"
              className="input-field"
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              style={{ maxWidth: '180px', padding: '0.45rem 0.75rem', fontSize: '0.88rem' }}
            />
          )}
          {filterBy === 'deadline' && (
            <input
              type="date"
              className="input-field"
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              style={{ maxWidth: '180px', padding: '0.45rem 0.75rem', fontSize: '0.88rem' }}
            />
          )}
          {filterBy === 'estimated_hours' && (
            <input
              type="number"
              placeholder="Max hours"
              className="input-field"
              value={filterValue}
              min={0.5}
              step={0.5}
              onChange={(e) => setFilterValue(e.target.value)}
              style={{ maxWidth: '130px', padding: '0.45rem 0.75rem', fontSize: '0.88rem' }}
            />
          )}
          {filterBy === 'priority' && (
            <select
              className="input-field"
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              style={{ maxWidth: '140px', padding: '0.45rem 0.75rem', fontSize: '0.88rem' }}
            >
              <option value="">All priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          )}

          {filterValue && (
            <span style={{ fontSize: '0.82rem', color: 'var(--sunset-deep)', fontWeight: 600 }}>
              Showing {activeTasks.length} of {allActiveTasks.length} active tasks
            </span>
          )}

          <button
            onClick={() => setFilterValue('')}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--ink-dim)', marginLeft: 'auto', display: 'flex', alignItems: 'center' }}
            title="Clear filter value"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Workload Metric Bar */}
      <div className="glass-panel" style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--ink)', fontFamily: 'var(--font-heading)' }}>
              {totalPendingHours.toFixed(1)} <span style={{ fontSize: '0.85rem', color: 'var(--ink-dim)' }}>hours</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--ink-soft)' }}>Total Pending Workload</div>
          </div>
          <div style={{ height: '30px', width: '1px', background: 'var(--line)' }} />
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--blue-deep)', fontFamily: 'var(--font-heading)' }}>
              {activeTasks.length}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--ink-soft)' }}>Active Deadlines</div>
          </div>
        </div>

        <div style={{ fontSize: '0.85rem', color: 'var(--ink-soft)' }}>
          {totalPendingHours > 14 ? (
            <span style={{ color: 'var(--rose-deep)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <AlertTriangle size={15} /> High Workload Concentration
            </span>
          ) : (
            <span style={{ color: 'var(--green-deep)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <CheckCircle size={15} /> Balanced Academic Volume
            </span>
          )}
        </div>
      </div>

      {/* Task List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--ink-soft)' }}>Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem', color: 'var(--ink-dim)' }}>
            No academic tasks logged yet. Add your deadlines to track workload pressure!
          </div>
        ) : (
          <>
            {activeTasks.map(task => (
              <div
                key={task.id}
                className="glass-panel"
                style={{
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  borderLeft: task.priority === 'high' ? '4px solid var(--rose)' : task.priority === 'medium' ? '4px solid var(--amber)' : '4px solid var(--blue)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flex: 1 }}>
                  <button
                    onClick={() => handleToggleComplete(task)}
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '6px',
                      border: '2px solid var(--line)',
                      background: 'var(--paper-deep)',
                      cursor: 'pointer'
                    }}
                  />
                  <div>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--ink)', fontFamily: 'var(--font-heading)', marginBottom: '0.2rem' }}>
                      {task.title}
                    </h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.82rem', color: 'var(--ink-soft)' }}>
                      <span style={{ color: 'var(--blue-deep)', fontWeight: 600 }}>{task.course}</span>
                      <span>•</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Calendar size={13} /> {task.deadline}
                      </span>
                      <span>•</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Clock size={13} /> {task.estimated_hours}h
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span className={`badge ${task.priority === 'high' ? 'badge-significant' : task.priority === 'medium' ? 'badge-changes' : 'badge-watch'}`}>
                    {task.priority}
                  </span>
                  <button
                    onClick={() => handleDelete(task.id)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--ink-dim)', cursor: 'pointer', padding: '0.3rem' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}

            {completedTasks.length > 0 && (
              <div style={{ marginTop: '1rem' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--ink-dim)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                  Completed Tasks ({completedTasks.length})
                </div>
                {completedTasks.map(task => (
                  <div
                    key={task.id}
                    className="glass-panel"
                    style={{
                      padding: '0.75rem 1.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      opacity: 0.65,
                      marginBottom: '0.4rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <button
                        onClick={() => handleToggleComplete(task)}
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '6px',
                          border: 'none',
                          background: 'var(--green-deep)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer'
                        }}
                      >
                        <CheckCircle size={15} color="#fbf8f0" />
                      </button>
                      <span style={{ textDecoration: 'line-through', color: 'var(--ink-soft)', fontSize: '0.95rem' }}>
                        {task.title}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDelete(task.id)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--ink-dim)', cursor: 'pointer' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
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
          padding: '1rem'
        }}>
          <div className="glass-panel" style={{ maxWidth: '480px', width: '100%', padding: '1.75rem', background: 'var(--paper-card)' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--ink)', fontFamily: 'var(--font-heading)', marginBottom: '1rem' }}>
              Add Academic Task
            </h2>

            <form onSubmit={handleAddTask} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--ink-soft)', display: 'block', marginBottom: '0.3rem' }}>
                  Task Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Systems Lab 3"
                  className="input-field"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--ink-soft)', display: 'block', marginBottom: '0.3rem' }}>
                    Course
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--ink-soft)', display: 'block', marginBottom: '0.3rem' }}>
                    Deadline
                  </label>
                  <input
                    type="date"
                    required
                    className="input-field"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--ink-soft)', display: 'block', marginBottom: '0.3rem' }}>
                    Estimated Hours
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    className="input-field"
                    value={estimatedHours}
                    onChange={(e) => setEstimatedHours(parseFloat(e.target.value))}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--ink-soft)', display: 'block', marginBottom: '0.3rem' }}>
                    Priority
                  </label>
                  <select
                    className="input-field"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Save Task
                </button>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

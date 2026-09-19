import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

interface TaskCalendarProps {
  taskDeadlines: string[]; // Format: YYYY-MM-DD
  onNavigate?: (tab: string) => void;
}

export const TaskCalendar: React.FC<TaskCalendarProps> = ({ taskDeadlines, onNavigate }) => {
  const [currentDate, setCurrentDate] = useState(() => new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  // Days in month calculation
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Today comparison
  const today = new Date();
  const isCurrentMonthToday = today.getFullYear() === year && today.getMonth() === month;
  const todayDate = today.getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleResetToday = () => {
    setCurrentDate(new Date());
  };

  // Build calendar cells
  const cells = [];
  for (let i = 0; i < firstDayIndex; i++) {
    cells.push({ day: null, dateStr: '' });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const formattedMonth = String(month + 1).padStart(2, '0');
    const formattedDay = String(d).padStart(2, '0');
    const dateStr = `${year}-${formattedMonth}-${formattedDay}`;
    cells.push({ day: d, dateStr });
  }

  // Count deadlines in this current month view
  const deadlinesThisMonth = taskDeadlines.filter(dl => {
    const prefix = `${year}-${String(month + 1).padStart(2, '0')}`;
    return dl.startsWith(prefix);
  }).length;

  return (
    <div
      className="glass-panel"
      style={{
        padding: '1.25rem 1.4rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: 'linear-gradient(145deg, var(--paper-card) 0%, var(--sunset-tint) 100%)',
        border: '1px solid var(--sunset-border)',
        boxShadow: '0 4px 18px var(--sunset-glow)'
      }}
    >
      <div>
        {/* Header with Month / Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <CalendarIcon size={18} color="var(--sunset-deep)" />
            <h3 style={{
              fontSize: '1.1rem',
              fontWeight: 700,
              color: 'var(--ink)',
              fontFamily: 'var(--font-heading)',
              margin: 0
            }}>
              {monthNames[month]} {year}
            </h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            {!isCurrentMonthToday && (
              <button
                onClick={handleResetToday}
                style={{
                  background: 'var(--paper-deep)',
                  border: '1px solid var(--line)',
                  borderRadius: '4px',
                  padding: '0.15rem 0.45rem',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  color: 'var(--ink-soft)',
                  marginRight: '0.2rem'
                }}
              >
                Today
              </button>
            )}
            <button
              onClick={handlePrevMonth}
              aria-label="Previous month"
              style={{
                background: 'transparent',
                border: '1px solid var(--line)',
                borderRadius: '4px',
                padding: '0.25rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--ink-soft)'
              }}
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={handleNextMonth}
              aria-label="Next month"
              style={{
                background: 'transparent',
                border: '1px solid var(--line)',
                borderRadius: '4px',
                padding: '0.25rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--ink-soft)'
              }}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* Weekday headers */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '4px',
          textAlign: 'center',
          marginBottom: '0.4rem'
        }}>
          {daysOfWeek.map((day, idx) => (
            <span
              key={idx}
              style={{
                fontSize: '0.74rem',
                fontWeight: 700,
                color: idx === 0 || idx === 6 ? 'var(--sunset-deep)' : 'var(--ink-dim)',
                textTransform: 'uppercase'
              }}
            >
              {day}
            </span>
          ))}
        </div>

        {/* Days grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '4px'
        }}>
          {cells.map((cell, idx) => {
            if (!cell.day) {
              return <div key={`empty-${idx}`} style={{ height: '32px' }} />;
            }

            const hasTask = taskDeadlines.includes(cell.dateStr);
            const isToday = isCurrentMonthToday && cell.day === todayDate;

            return (
              <div
                key={cell.dateStr}
                title={hasTask ? `Task deadline on ${cell.dateStr}` : cell.dateStr}
                style={{
                  height: '32px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '6px',
                  fontSize: '0.82rem',
                  fontWeight: hasTask || isToday ? 700 : 500,
                  cursor: hasTask && onNavigate ? 'pointer' : 'default',
                  position: 'relative',
                  transition: 'all 0.15s ease',
                  // Task due date styling in soft orange
                  background: hasTask
                    ? 'var(--sunset-tint)'
                    : isToday
                    ? 'var(--blue-tint)'
                    : 'transparent',
                  border: hasTask
                    ? '1.5px solid var(--sunset)'
                    : isToday
                    ? '1.5px solid var(--blue-deep)'
                    : '1px solid transparent',
                  color: hasTask
                    ? 'var(--sunset-deep)'
                    : isToday
                    ? 'var(--blue-deep)'
                    : 'var(--ink)'
                }}
                onClick={() => {
                  if (hasTask && onNavigate) {
                    onNavigate('tasks');
                  }
                }}
              >
                <span>{cell.day}</span>
                {hasTask && (
                  <span
                    style={{
                      position: 'absolute',
                      bottom: '2px',
                      width: '4px',
                      height: '4px',
                      borderRadius: '50%',
                      background: 'var(--sunset)'
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer / Legend & Action */}
      <div style={{
        marginTop: '0.85rem',
        paddingTop: '0.65rem',
        borderTop: '1px solid var(--line-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--ink-soft)' }}>
          <span style={{
            display: 'inline-block',
            width: '8px',
            height: '8px',
            borderRadius: '2px',
            background: 'var(--sunset-tint)',
            border: '1px solid var(--sunset)'
          }} />
          <span>
            {deadlinesThisMonth > 0
              ? `${deadlinesThisMonth} task${deadlinesThisMonth > 1 ? 's' : ''} due in ${monthNames[month].slice(0, 3)}`
              : 'Soft orange = Task due'}
          </span>
        </div>

        {onNavigate && (
          <button
            onClick={() => onNavigate('tasks')}
            style={{
              background: 'transparent',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              color: 'var(--sunset-deep)',
              fontWeight: 700,
              fontSize: '0.78rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.2rem'
            }}
          >
            Tasks <ArrowRight size={12} />
          </button>
        )}
      </div>
    </div>
  );
};

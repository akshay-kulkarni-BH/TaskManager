import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

export function CalendarView({ tasks }) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [hoveredDate, setHoveredDate] = useState(null);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPad = firstDay.getDay(); // 0=Sun
    const daysInMonth = lastDay.getDate();

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

    const monthLabel = currentDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

    const formatTime = (mins) => {
        if (!mins) return '0m';
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return h > 0 ? `${h}h${m > 0 ? ` ${m}m` : ''}` : `${m}m`;
    };

    const getDateStr = (day) => {
        const d = new Date(year, month, day);
        return d.toISOString().split('T')[0];
    };

    const getDayData = (day) => {
        const dateStr = getDateStr(day);

        // Tasks present on this day (myDayDate or targetDate matches)
        const tasksOnDay = tasks.filter(t =>
            t.status !== 'deleted' &&
            (t.myDayDate === dateStr || t.targetDate?.startsWith(dateStr))
        );

        // Tasks completed on this day
        const completedOnDay = tasks.filter(t =>
            t.status === 'completed' && t.completedAt?.startsWith(dateStr)
        );

        const totalPT = tasksOnDay.reduce((sum, t) => sum + (t.plannedTime || 0), 0);
        const totalAT = tasksOnDay.reduce((sum, t) => sum + (t.actualTime || 0), 0);

        return {
            tasksCount: tasksOnDay.length,
            completedCount: completedOnDay.length,
            completedTasks: completedOnDay,
            totalPT,
            totalAT
        };
    };

    const today = new Date().toISOString().split('T')[0];

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="main-content-overlay" style={{ overflowY: 'auto', height: '100%', paddingLeft: '24px', paddingRight: '24px' }}>
            {/* Header */}
            <header className="py-6" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 className="text-2xl font-bold text-brand-primary">Calendar</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button
                        onClick={prevMonth}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '4px', display: 'flex' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        <ChevronLeft size={20} style={{ color: 'var(--text-secondary)' }} />
                    </button>
                    <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', minWidth: '160px', textAlign: 'center' }}>
                        {monthLabel}
                    </span>
                    <button
                        onClick={nextMonth}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '4px', display: 'flex' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        <ChevronRight size={20} style={{ color: 'var(--text-secondary)' }} />
                    </button>
                </div>
            </header>

            {/* Calendar Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', backgroundColor: 'var(--border-light)', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-light)' }}>
                {/* Day Headers */}
                {days.map(d => (
                    <div key={d} style={{ padding: '8px', textAlign: 'center', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', backgroundColor: 'var(--bg-surface)', textTransform: 'uppercase' }}>
                        {d}
                    </div>
                ))}

                {/* Empty cells for padding */}
                {Array.from({ length: startPad }).map((_, i) => (
                    <div key={`pad-${i}`} style={{ padding: '8px', backgroundColor: 'var(--bg-surface)', minHeight: '90px' }} />
                ))}

                {/* Day cells */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const dateStr = getDateStr(day);
                    const isToday = dateStr === today;
                    const data = getDayData(day);
                    const isHovered = hoveredDate === dateStr;

                    return (
                        <div
                            key={day}
                            style={{
                                padding: '8px',
                                minHeight: '90px',
                                backgroundColor: isToday ? 'var(--bg-selected)' : 'var(--bg-surface)',
                                position: 'relative',
                                cursor: 'default',
                                transition: 'background-color 0.15s'
                            }}
                            onMouseEnter={() => setHoveredDate(dateStr)}
                            onMouseLeave={() => setHoveredDate(null)}
                        >
                            {/* Day number */}
                            <div style={{ fontSize: '0.85rem', fontWeight: isToday ? 700 : 500, color: isToday ? 'var(--brand-primary)' : 'var(--text-primary)', marginBottom: '4px' }}>
                                {day}
                            </div>

                            {/* Day metrics */}
                            {(data.tasksCount > 0 || data.completedCount > 0) && (
                                <div style={{ fontSize: '0.6rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                    {(data.totalPT > 0 || data.totalAT > 0) && (
                                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                            {data.totalPT > 0 && (
                                                <span style={{ color: 'var(--text-secondary)' }}>PT: {formatTime(data.totalPT)}</span>
                                            )}
                                            {data.totalAT > 0 && (
                                                <span style={{ color: data.totalAT > data.totalPT && data.totalPT > 0 ? '#dc2626' : 'var(--text-secondary)' }}>AT: {formatTime(data.totalAT)}</span>
                                            )}
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                        <span style={{ color: 'var(--text-placeholder)' }}>📋 {data.tasksCount}</span>
                                        {data.completedCount > 0 && (
                                            <span style={{ color: '#16a34a' }}>✓ {data.completedCount}</span>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Hover tooltip - completed tasks */}
                            {isHovered && data.completedTasks.length > 0 && (
                                <div style={{
                                    position: 'absolute',
                                    bottom: '100%',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    backgroundColor: 'var(--bg-surface-solid)',
                                    border: '1px solid var(--border-light)',
                                    borderRadius: '6px',
                                    padding: '8px 10px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                    zIndex: 30,
                                    minWidth: '160px',
                                    maxWidth: '220px'
                                }}>
                                    <div style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase' }}>
                                        Completed
                                    </div>
                                    {data.completedTasks.slice(0, 5).map(t => (
                                        <div key={t.id} style={{ fontSize: '0.7rem', color: 'var(--text-primary)', padding: '2px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            ✓ {t.title}
                                        </div>
                                    ))}
                                    {data.completedTasks.length > 5 && (
                                        <div style={{ fontSize: '0.65rem', color: 'var(--text-placeholder)', marginTop: '2px' }}>
                                            +{data.completedTasks.length - 5} more
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

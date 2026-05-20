import { AlertCircle, Check, ChevronDown, ChevronUp, Star, Sun } from 'lucide-react';
import { useState } from 'react';

export function TaskRow({ task, onComplete, onSelect, onToggleImportance, onUpdate, selected, activeFilter, onAddToMyDay }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const isCompleted = task.status === 'completed';
    const daysSinceCreation = !isCompleted && task.createdAt 
        ? Math.floor((new Date() - new Date(task.createdAt)) / (1000 * 60 * 60 * 24))
        : null;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', borderBottom: '1px solid var(--border-light)' }}>
        <div
            className={`task-row ${selected ? 'selected' : ''}`}
            style={{ backgroundColor: selected ? 'var(--bg-selected)' : 'var(--bg-surface)', cursor: 'pointer', borderBottom: 'none' }}
            onClick={() => onSelect(task)}
        >
            <div
                className={`task-checkbox ${isCompleted ? 'completed' : ''}`}
                onClick={(e) => {
                    e.stopPropagation();
                    onComplete(task.id);
                }}
            >
                {isCompleted && <Check size={14} strokeWidth={3} />}
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', textDecoration: isCompleted ? 'line-through' : 'none', color: isCompleted ? 'var(--text-placeholder)' : 'var(--text-primary)' }}>
                <span className="font-normal" style={{ fontSize: '0.9rem' }}>{task.title}</span>
                <div style={{ display: 'flex', gap: '8px', fontSize: '0.75rem', color: 'var(--text-secondary)', alignItems: 'center' }}>
                    {task.tags?.map(t => <span key={t}>#{t}</span>)}

                    {/* Subtasks Indicator */}
                    {task.subtasks?.length > 0 && (
                        <span 
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsExpanded(!isExpanded);
                            }}
                            style={{ display: 'flex', alignItems: 'center', gap: '3px', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', backgroundColor: 'var(--bg-hover)', color: 'var(--text-secondary)', cursor: 'pointer' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-selected)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                            title="Click to toggle subtasks"
                        >
                            {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length} subtasks
                            {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        </span>
                    )}

                    {/* In Progress Indicator */}
                    {task.status === 'in-progress' && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', backgroundColor: '#fef3c7', color: '#d97706', fontWeight: 500 }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#d97706', display: 'inline-block' }}></span>
                            In Progress
                        </span>
                    )}

                    {/* Urgency Indicators */}
                    {task.urgency > 7 && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', backgroundColor: '#fee2e2', color: '#dc2626', fontWeight: 500 }}>
                            <AlertCircle size={10} /> Urgent
                        </span>
                    )}

                    {/* Completed task dates */}
                    {isCompleted && task.createdAt && (
                        <span style={{ fontSize: '10px', color: 'var(--text-placeholder)' }}>
                            Added: {new Date(task.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                    )}
                    {isCompleted && task.completedAt && (
                        <>
                            <span style={{ color: 'var(--text-placeholder)', fontSize: '10px' }}>|</span>
                            <span style={{ fontSize: '10px', color: 'var(--text-placeholder)' }}>
                                Done: {new Date(task.completedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </span>
                        </>
                    )}
                </div>
            </div>

            {/* Inline metadata: PT | AT | Due Date | Days */}
            {!isCompleted && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.68rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', paddingRight: '4px' }}>
                    {activeFilter === 'my-day' && task.plannedTime && (
                        <span title="Planned Time">PT: {task.plannedTime >= 60 ? `${Math.floor(task.plannedTime / 60)}h${task.plannedTime % 60 > 0 ? ` ${task.plannedTime % 60}m` : ''}` : `${task.plannedTime}m`}</span>
                    )}
                    {activeFilter === 'my-day' && task.plannedTime && task.actualTime && (
                        <span style={{ color: 'var(--text-placeholder)' }}>|</span>
                    )}
                    {activeFilter === 'my-day' && task.actualTime && (
                        <span title="Actual Time" style={{ color: (task.plannedTime && task.actualTime > task.plannedTime) ? '#dc2626' : 'var(--text-secondary)' }}>AT: {task.actualTime >= 60 ? `${Math.floor(task.actualTime / 60)}h${task.actualTime % 60 > 0 ? ` ${task.actualTime % 60}m` : ''}` : `${task.actualTime}m`}</span>
                    )}
                    {activeFilter === 'my-day' && (task.plannedTime || task.actualTime) && task.targetDate && (
                        <span style={{ color: 'var(--text-placeholder)' }}>|</span>
                    )}
                    {(() => {
                        const dueDate = task.targetDate ? new Date(task.targetDate) : null;
                        const reminder = task.reminder ? new Date(task.reminder) : null;
                        const displayDate = dueDate || reminder;
                        if (!displayDate) return null;
                        const now = new Date();
                        const isOverdue = displayDate < now;
                        const dateStr = dueDate
                            ? displayDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                            : displayDate.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                        return (
                            <span style={{ color: isOverdue ? '#dc2626' : 'var(--text-secondary)', fontWeight: isOverdue ? 700 : 400 }} title={isOverdue ? 'Overdue' : 'Due date'}>
                                {dateStr}
                            </span>
                        );
                    })()}
                    {((activeFilter === 'my-day' && (task.plannedTime || task.actualTime)) || task.targetDate) && daysSinceCreation !== null && daysSinceCreation >= 0 && (
                        <span style={{ color: 'var(--text-placeholder)' }}>|</span>
                    )}
                    {daysSinceCreation !== null && daysSinceCreation >= 0 && (
                        <span title="Days since creation">{daysSinceCreation}d</span>
                    )}
                </div>
            )}

            {/* Add to My Day button - show in non-my-day views when task is not already added today */}
            {activeFilter !== 'my-day' && activeFilter !== 'archive' && task.myDayDate !== new Date().toISOString().split('T')[0] && onAddToMyDay && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onAddToMyDay(task.id);
                    }}
                    style={{
                        fontSize: '0.65rem',
                        padding: '3px 8px',
                        borderRadius: '12px',
                        border: '1px solid var(--border-light)',
                        background: 'transparent',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px',
                        marginRight: '4px'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#fef3c7'; e.currentTarget.style.color = '#d97706'; e.currentTarget.style.borderColor = '#fbbf24'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border-light)'; }}
                    title="Add to My Day"
                >
                    <Sun size={12} /> My Day
                </button>
            )}
            <div
                style={{ padding: '0.5rem', borderRadius: '0.25rem', cursor: 'pointer', color: task.importance > 7 ? '#2563eb' : 'var(--text-placeholder)' }}
                onClick={(e) => {
                    e.stopPropagation();
                    onToggleImportance(task.id);
                }}
                onMouseEnter={(e) => { if (task.importance <= 7) e.currentTarget.style.color = '#3b82f6' }}
                onMouseLeave={(e) => { if (task.importance <= 7) e.currentTarget.style.color = 'var(--text-placeholder)' }}
            >
                <Star size={18} fill={task.importance > 7 ? "currentColor" : "none"} />
            </div>
        </div>

        {/* Expanded Subtasks */}
        {isExpanded && task.subtasks?.length > 0 && (
            <div style={{ backgroundColor: selected ? 'var(--bg-selected)' : 'var(--bg-surface)', padding: '0.5rem 1rem 0.5rem 3rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {task.subtasks.map(st => (
                    <div key={st.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.25rem 0' }}>
                        <div 
                            onClick={(e) => {
                                e.stopPropagation();
                                if (onUpdate) {
                                    const updated = task.subtasks.map(s => s.id === st.id ? { ...s, completed: !s.completed } : s);
                                    const allCompleted = updated.every(s => s.completed);
                                    const someCompleted = updated.some(s => s.completed);
                                    const newStatus = allCompleted ? 'completed' : (someCompleted ? 'in-progress' : task.status === 'completed' ? 'pending' : task.status);
                                    
                                    onUpdate(task.id, { 
                                        subtasks: updated,
                                        status: newStatus,
                                        completedAt: newStatus === 'completed' ? new Date().toISOString() : (task.status === 'completed' ? null : task.completedAt)
                                    });
                                }
                            }}
                            style={{ 
                                width: '14px', height: '14px', borderRadius: '50%', border: '1px solid', 
                                borderColor: st.completed ? 'var(--brand-primary)' : 'var(--text-placeholder)',
                                backgroundColor: st.completed ? 'var(--brand-primary)' : 'transparent',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                            }}
                        >
                            {st.completed && <Check size={10} color="white" strokeWidth={3} />}
                        </div>
                        <span style={{ fontSize: '0.8rem', color: st.completed ? 'var(--text-placeholder)' : 'var(--text-primary)', textDecoration: st.completed ? 'line-through' : 'none' }}>
                            {st.title}
                        </span>
                    </div>
                ))}
            </div>
        )}
        </div>
    );
}

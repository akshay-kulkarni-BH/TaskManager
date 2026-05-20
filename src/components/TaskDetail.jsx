import { AlertCircle, Bell, Calendar, Check, Clock, Play, Star, Sun, Trash2, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';

export function TaskDetail({ task, onClose, onUpdate, onDelete }) {
    const [title, setTitle] = useState(task.title);
    const [note, setNote] = useState(task.description || '');
    const dateInputRef = React.useRef(null);
    const reminderInputRef = React.useRef(null);

    // Sync state when task changes
    useEffect(() => {
        setTitle(task.title);
        setNote(task.description || '');
    }, [task.id]);



    return (
        <div
            className="glass-panel"
            style={{
                position: 'fixed',
                top: 0,
                right: 0,
                height: '100%',
                width: '350px',
                backgroundColor: 'var(--bg-surface-solid)',
                boxShadow: 'var(--shadow-flyout)',
                zIndex: 20,
                display: 'flex',
                flexDirection: 'column',
                borderLeft: '1px solid var(--border-light)',
                transition: 'transform 0.3s'
            }}
        >
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', color: 'var(--text-primary)' }}>
                {/* Header */}
                <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)' }}>
                    <button onClick={onClose} style={{ padding: '0.5rem', marginLeft: '-0.5rem', borderRadius: '0.25rem', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                        <X size={20} style={{ color: 'var(--text-secondary)' }} />
                    </button>
                    <button onClick={() => onDelete(task.id)} style={{ padding: '0.5rem', borderRadius: '0.25rem', color: '#ef4444', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                        <Trash2 size={18} />
                    </button>
                </div>

                <div style={{ padding: '1.5rem', flex: 1, overflowY: 'auto' }}>
                    {/* Title Edit */}
                    <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <textarea
                            className="fluent-input"
                            style={{ fontSize: '1.25rem', fontWeight: 600, backgroundColor: 'transparent', color: 'var(--text-primary)', resize: 'none', overflow: 'hidden', wordWrap: 'break-word', overflowWrap: 'break-word', minHeight: '2rem' }}
                            value={title}
                            onChange={(e) => {
                                setTitle(e.target.value);
                                e.target.style.height = 'auto';
                                e.target.style.height = e.target.scrollHeight + 'px';
                            }}
                            onBlur={() => onUpdate(task.id, { title })}
                            rows={1}
                            ref={(el) => { if (el) { el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px'; } }}
                        />
                    </div>

                    {/* Quick Actions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>

                        {/* Hidden Native Inputs for Pickers - removed from here, moved next to buttons */}

                        <button
                            onClick={() => {
                                const todayStr = new Date().toISOString().split('T')[0];
                                if (task.myDayDate === todayStr) {
                                    onUpdate(task.id, { myDayDate: null });
                                } else {
                                    onUpdate(task.id, { myDayDate: todayStr });
                                }
                            }}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '0.25rem',
                                border: '1px solid',
                                borderColor: task.myDayDate === new Date().toISOString().split('T')[0] ? '#fbbf24' : 'var(--border-light)',
                                background: task.myDayDate === new Date().toISOString().split('T')[0] ? '#fef3c7' : 'transparent',
                                color: task.myDayDate === new Date().toISOString().split('T')[0] ? '#d97706' : 'var(--text-secondary)',
                                width: '100%', cursor: 'pointer', textAlign: 'left'
                            }}
                            onMouseEnter={(e) => { if (task.myDayDate !== new Date().toISOString().split('T')[0]) e.currentTarget.style.backgroundColor = 'var(--bg-hover)' }}
                            onMouseLeave={(e) => { if (task.myDayDate !== new Date().toISOString().split('T')[0]) e.currentTarget.style.backgroundColor = 'transparent' }}>
                            <Sun size={18} />
                            {task.myDayDate === new Date().toISOString().split('T')[0] ? 'Added to My Day' : 'Add to My Day'}
                        </button>

                        <div style={{ position: 'relative' }}>
                            <input
                                type="date"
                                ref={dateInputRef}
                                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, pointerEvents: 'none', zIndex: 0 }}
                                onChange={(e) => onUpdate(task.id, { targetDate: e.target.value })}
                            />
                            <button
                                onClick={() => dateInputRef.current?.showPicker()}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '0.25rem', border: '1px solid var(--border-light)', background: 'transparent', color: 'var(--text-secondary)', width: '100%', cursor: 'pointer', textAlign: 'left', position: 'relative', zIndex: 1 }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                <Calendar size={18} />
                                {task.targetDate ? new Date(task.targetDate).toLocaleDateString() : 'Add due date'}
                            </button>
                        </div>

                        <div style={{ position: 'relative' }}>
                            <input
                                type="datetime-local"
                                ref={reminderInputRef}
                                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, pointerEvents: 'none', zIndex: 0 }}
                                onChange={(e) => onUpdate(task.id, { reminder: e.target.value })}
                            />
                            <button
                                onClick={() => reminderInputRef.current?.showPicker()}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '0.25rem', border: '1px solid var(--border-light)', background: 'transparent', color: 'var(--text-secondary)', width: '100%', cursor: 'pointer', textAlign: 'left', position: 'relative', zIndex: 1 }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                <Bell size={18} />
                                {task.reminder ? new Date(task.reminder).toLocaleString() : 'Remind me'}
                            </button>
                        </div>
                        
                        <button
                            onClick={() => {
                                const newStatus = task.status === 'in-progress' ? 'pending' : 'in-progress';
                                onUpdate(task.id, { status: newStatus });
                            }}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '0.25rem', border: '1px solid', borderColor: task.status === 'in-progress' ? '#fbbf24' : 'var(--border-light)', background: task.status === 'in-progress' ? '#fef3c7' : 'transparent', color: task.status === 'in-progress' ? '#d97706' : 'var(--text-secondary)', width: '100%', cursor: 'pointer', textAlign: 'left' }}
                            onMouseEnter={(e) => { if (task.status !== 'in-progress') e.currentTarget.style.backgroundColor = 'var(--bg-hover)' }}
                            onMouseLeave={(e) => { if (task.status !== 'in-progress') e.currentTarget.style.backgroundColor = 'transparent' }}>
                            <Play size={18} />
                            {task.status === 'in-progress' ? 'In Progress' : 'Mark as In Progress'}
                        </button>
                    </div>

                    {/* Time Tracking Section */}
                    <div style={{ padding: '1rem', borderRadius: '0.25rem', border: '1px solid var(--border-light)', marginBottom: '1.5rem', backgroundColor: 'var(--bg-surface)' }}>
                        <h3 style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '1rem' }}>Time Tracking</h3>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Planned (min)</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Clock size={14} style={{ color: 'var(--text-secondary)' }} />
                                    <input
                                        type="number"
                                        min="0"
                                        className="fluent-input"
                                        style={{ width: '100%', padding: '0.4rem', fontSize: '0.875rem', backgroundColor: 'transparent', color: 'var(--text-primary)' }}
                                        placeholder="0"
                                        value={task.plannedTime || ''}
                                        onChange={(e) => onUpdate(task.id, { plannedTime: e.target.value ? parseInt(e.target.value) : null })}
                                    />
                                </div>
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Actual (min)</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Clock size={14} style={{ color: 'var(--text-secondary)' }} />
                                    <input
                                        type="number"
                                        min="0"
                                        className="fluent-input"
                                        style={{ width: '100%', padding: '0.4rem', fontSize: '0.875rem', backgroundColor: 'transparent', color: 'var(--text-primary)' }}
                                        placeholder="0"
                                        value={task.actualTime || ''}
                                        onChange={(e) => onUpdate(task.id, { actualTime: e.target.value ? parseInt(e.target.value) : null })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Priority & Tags Section */}
                    <div style={{ padding: '1rem', borderRadius: '0.25rem', border: '1px solid var(--border-light)', marginBottom: '1.5rem', backgroundColor: 'var(--bg-surface)' }}>
                        <h3 style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '1rem' }}>Tags & Priority</h3>

                        {/* Special Toggles */}
                        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                            <button
                                onClick={() => onUpdate(task.id, { importance: task.importance > 5 ? 1 : 10 })}
                                style={{
                                    flex: 1, padding: '0.5rem', borderRadius: '4px', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer',
                                    border: task.importance > 5 ? '1px solid #7c3aed' : '1px solid var(--border-light)',
                                    backgroundColor: task.importance > 5 ? '#f3e8ff' : 'transparent',
                                    color: task.importance > 5 ? '#7c3aed' : 'var(--text-secondary)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                                }}
                            >
                                <Star size={16} fill={task.importance > 5 ? "currentColor" : "none"} /> Important
                            </button>
                            <button
                                onClick={() => onUpdate(task.id, { urgency: task.urgency > 5 ? 1 : 10 })}
                                style={{
                                    flex: 1, padding: '0.5rem', borderRadius: '4px', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer',
                                    border: task.urgency > 5 ? '1px solid #dc2626' : '1px solid var(--border-light)',
                                    backgroundColor: task.urgency > 5 ? '#fee2e2' : 'transparent',
                                    color: task.urgency > 5 ? '#dc2626' : 'var(--text-secondary)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                                }}
                            >
                                <AlertCircle size={16} /> Urgent
                            </button>
                        </div>

                        {/* Tag List */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                            {task.tags?.map((tag, index) => (
                                <span key={index} style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                                    padding: '2px 8px', borderRadius: '12px', fontSize: '12px',
                                    backgroundColor: 'var(--bg-hover)', color: 'var(--text-primary)',
                                    border: '1px solid var(--border-light)'
                                }}>
                                    #{tag}
                                    <X
                                        size={12}
                                        style={{ cursor: 'pointer', color: 'var(--text-secondary)' }}
                                        onClick={() => {
                                            const newTags = task.tags.filter(t => t !== tag);
                                            onUpdate(task.id, { tags: newTags });
                                        }}
                                    />
                                </span>
                            ))}
                        </div>

                        {/* Add Tag Input */}
                        <input
                            className="fluent-input"
                            style={{
                                width: '100%', padding: '0.5rem', fontSize: '0.875rem',
                                backgroundColor: 'transparent', borderBottom: '1px solid var(--border-light)',
                                borderRadius: 0, color: 'var(--text-primary)'
                            }}
                            placeholder="+ Add custom tag (Press Enter)"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    const val = e.target.value.trim();
                                    if (val && !task.tags?.includes(val)) {
                                        const newTags = [...(task.tags || []), val];
                                        onUpdate(task.id, { tags: newTags });
                                        e.target.value = '';
                                    }
                                }
                            }}
                        />
                    </div>

                    {/* Subtasks Section */}
                    <div style={{ padding: '1rem', borderRadius: '0.25rem', border: '1px solid var(--border-light)', marginBottom: '1.5rem', backgroundColor: 'var(--bg-surface)' }}>
                        <h3 style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '1rem' }}>Subtasks</h3>
                        
                        {/* Subtasks List */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.75rem' }}>
                            {task.subtasks?.map((st) => (
                                <div key={st.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.25rem 0' }}>
                                    <div 
                                        onClick={() => {
                                            const updated = task.subtasks.map(s => s.id === st.id ? { ...s, completed: !s.completed } : s);
                                            // Determine overall task status
                                            const allCompleted = updated.length > 0 && updated.every(s => s.completed);
                                            const someCompleted = updated.some(s => s.completed);
                                            const newStatus = allCompleted ? 'completed' : (someCompleted ? 'in-progress' : task.status === 'completed' ? 'pending' : task.status);
                                            
                                            onUpdate(task.id, { 
                                                subtasks: updated,
                                                status: newStatus,
                                                completedAt: newStatus === 'completed' ? new Date().toISOString() : (task.status === 'completed' ? null : task.completedAt)
                                            });
                                        }}
                                        style={{ 
                                            width: '16px', height: '16px', borderRadius: '50%', border: '1px solid', 
                                            borderColor: st.completed ? 'var(--brand-primary)' : 'var(--text-placeholder)',
                                            backgroundColor: st.completed ? 'var(--brand-primary)' : 'transparent',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                                        }}
                                    >
                                        {st.completed && <Check size={10} color="white" strokeWidth={3} />}
                                    </div>
                                    <span style={{ flex: 1, fontSize: '0.875rem', color: st.completed ? 'var(--text-placeholder)' : 'var(--text-primary)', textDecoration: st.completed ? 'line-through' : 'none' }}>
                                        {st.title}
                                    </span>
                                    <button 
                                        onClick={() => {
                                            const updated = task.subtasks.filter(s => s.id !== st.id);
                                            onUpdate(task.id, { subtasks: updated });
                                        }}
                                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px', color: 'var(--text-secondary)' }}
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Add Subtask Input */}
                        <input
                            className="fluent-input"
                            style={{
                                width: '100%', padding: '0.5rem', fontSize: '0.875rem',
                                backgroundColor: 'transparent', borderBottom: '1px solid var(--border-light)',
                                borderRadius: 0, color: 'var(--text-primary)'
                            }}
                            placeholder="+ Add subtask (Press Enter)"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    const val = e.target.value.trim();
                                    if (val) {
                                        const newSt = { id: crypto.randomUUID(), title: val, completed: false };
                                        const updated = [...(task.subtasks || []), newSt];
                                        // If this is the first subtask and task is completed, maybe mark pending
                                        const newStatus = task.status === 'completed' ? 'in-progress' : task.status;
                                        onUpdate(task.id, { 
                                            subtasks: updated,
                                            status: newStatus,
                                            completedAt: newStatus !== 'completed' ? null : task.completedAt
                                        });
                                        e.target.value = '';
                                    }
                                }
                            }}
                        />
                    </div>

                    {/* Note Section */}
                    <div style={{ marginTop: '1.5rem' }}>
                        <textarea
                            style={{ width: '100%', height: '8rem', padding: '0.75rem', backgroundColor: 'var(--bg-hover)', borderRadius: '0.25rem', border: '1px solid transparent', resize: 'none', fontSize: '0.875rem', color: 'var(--text-primary)', fontFamily: 'inherit' }}
                            placeholder="Add note..."
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            onBlur={() => onUpdate(task.id, { description: note })}
                        />
                    </div>

                    <div style={{ marginTop: '2rem', fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                        Created {new Date(task.createdAt).toLocaleDateString()}
                    </div>
                </div>
            </div>
        </div>
    );
}

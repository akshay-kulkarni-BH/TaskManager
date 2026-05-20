import { Bell, Calendar, Clock, Plus, Search, Tag, X } from 'lucide-react';
import React, { useRef, useState } from 'react';
import { useTasks } from '../hooks/useTasks';
import { Analytics } from './Analytics';
import { CalendarView } from './CalendarView';
import { Settings } from './Settings';
import { Sidebar } from './Sidebar';
import { TaskDetail } from './TaskDetail';
import { TaskRow } from './TaskRow';

export function Dashboard() {
    const { tasks, stats, settings, addTask, updateTask, updateSettings } = useTasks();
    const [filter, setFilter] = useState('all');
    const [selectedTaskId, setSelectedTaskId] = useState(null);
    const selectedTask = selectedTaskId ? tasks.find(t => t.id === selectedTaskId) ?? null : null;

    // Search and Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [tagFilter, setTagFilter] = useState('');
    const [isSearchVisible, setIsSearchVisible] = useState(false);

    // New Task State
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskDate, setNewTaskDate] = useState(null);
    const [newTaskReminder, setNewTaskReminder] = useState(null);
    const [newTaskTags, setNewTaskTags] = useState([]);
    const [isTagInputVisible, setIsTagInputVisible] = useState(false);
    const [tagInputValue, setTagInputValue] = useState('');
    const [newTaskPlannedTime, setNewTaskPlannedTime] = useState(null);
    const [isPlannedTimeVisible, setIsPlannedTimeVisible] = useState(false);

    const dateInputRef = useRef(null);
    const reminderInputRef = useRef(null);

    const [opacity, setOpacity] = useState(0.85);
    const [isDarkMode, setIsDarkMode] = useState(false);

    React.useEffect(() => {
        if (settings?.opacity !== undefined) setOpacity(settings.opacity);
        if (settings?.isDarkMode !== undefined) setIsDarkMode(settings.isDarkMode);
    }, [settings?.opacity, settings?.isDarkMode]);

    // Background Layer Style
    // Background Layer Style
    const bgLayerStyle = settings?.backgroundImage
        ? { backgroundImage: `url(${settings.backgroundImage})` }
        : { backgroundImage: 'url(/background_image_1.jpg)' }; // Default fallback

    // Filter Logic
    const today = new Date().toISOString().split('T')[0];
    const filteredTasks = tasks.filter(task => {
        if (filter === 'archive') return task.status === 'completed';
        // My Day: show pending tasks for today + tasks completed today
        if (filter === 'my-day') {
            if (task.status === 'deleted') return false;
            if (task.myDayDate !== today) return false;
            if (task.status === 'completed') return task.completedAt?.startsWith(today);
            return true;
        }
        // For all other regular views, hide completed tasks
        if (task.status === 'completed') return false;

        if (filter === 'important') return task.importance > 7;
        if (filter === 'urgent') return task.urgency > 7;
        
        return true;
    }).filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTag = tagFilter ? (task.tags && task.tags.includes(tagFilter)) : true;
        return matchesSearch && matchesTag;
    }).sort((a, b) => {
        // In My Day, push completed tasks to the bottom
        if (filter === 'my-day') {
            if (a.status === 'completed' && b.status !== 'completed') return 1;
            if (a.status !== 'completed' && b.status === 'completed') return -1;
        }
        return 0;
    });

    const allTags = Array.from(new Set(tasks.flatMap(t => t.tags || [])));

    const handleAddTask = (e) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;
        addTask({
            title: newTaskTitle,
            importance: filter === 'important' ? 8 : 1,
            urgency: filter === 'urgent' ? 8 : 5,
            targetDate: newTaskDate,
            reminder: newTaskReminder,
            tags: newTaskTags,
            myDayDate: filter === 'my-day' ? today : null,
            plannedTime: newTaskPlannedTime
        });

        // Reset Logic
        setNewTaskTitle('');
        setNewTaskDate(null);
        setNewTaskReminder(null);
        setNewTaskTags([]);
        setIsTagInputVisible(false);
        setTagInputValue('');
        setNewTaskPlannedTime(null);
        setIsPlannedTimeVisible(false);
    };

    const handleTagInputKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const val = tagInputValue.trim();
            if (val && !newTaskTags.includes(val)) {
                setNewTaskTags([...newTaskTags, val]);
                setTagInputValue('');
            }
        }
    };

    return (
        <>
            {/* 0. Background Layer (Fixed) */}
            <div
                style={{
                    ...bgLayerStyle,
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 0,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    transition: 'all 0.3s ease'
                }}
            />

            {/* App Overlay (Glass effect) */}
            <div
                className={`app-layout relative z-[2] ${isDarkMode ? 'dark-mode' : ''}`}
                style={{
                    backgroundColor: isDarkMode ? `rgba(30, 30, 30, ${opacity})` : `rgba(255, 255, 255, ${opacity})`
                }}
            >
                {/* 1. Sidebar */}
                <Sidebar
                    activeFilter={filter}
                    onSelectFilter={setFilter}
                />

                {/* 2. Main Content */}
                <div className="main-content">
                    {filter === 'analytics' ? (
                        <Analytics tasks={tasks} />
                    ) : filter === 'calendar' ? (
                        <CalendarView tasks={tasks} />
                    ) : filter === 'settings' ? (
                        <Settings
                            opacity={opacity}
                            setOpacity={setOpacity}
                            isDarkMode={isDarkMode}
                            setIsDarkMode={setIsDarkMode}
                            settings={settings}
                            onUpdateSettings={updateSettings}
                        />
                    ) : (
                        <div className="main-content-overlay">
                            <header className="py-6" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h2 className="text-2xl font-bold text-brand-primary" style={{ textTransform: 'capitalize' }}>
                                        {filter.replace('-', ' ')}
                                    </h2>
                                    {filter === 'my-day' && (
                                        <p className="text-sm text-gray-500">
                                            {new Date().toDateString()}
                                        </p>
                                    )}
                                </div>

                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                    {isSearchVisible ? (
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <input 
                                                className="fluent-input" 
                                                placeholder="Search tasks..." 
                                                value={searchQuery}
                                                onChange={e => setSearchQuery(e.target.value)}
                                                style={{ 
                                                    fontSize: '14px', padding: '6px 12px', borderRadius: '6px', 
                                                    border: '1px solid var(--border-light)', background: isDarkMode ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)',
                                                    color: isDarkMode ? 'white' : 'var(--text-primary)',
                                                    width: '200px'
                                                }}
                                                autoFocus
                                            />
                                            <select 
                                                className="fluent-input"
                                                value={tagFilter}
                                                onChange={e => setTagFilter(e.target.value)}
                                                style={{ 
                                                    fontSize: '14px', padding: '6px 12px', borderRadius: '6px', 
                                                    border: '1px solid var(--border-light)', background: isDarkMode ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)',
                                                    color: isDarkMode ? 'white' : 'var(--text-primary)'
                                                }}
                                            >
                                                <option value="">All Tags</option>
                                                {allTags.map(tag => (
                                                    <option key={tag} value={tag}>{tag}</option>
                                                ))}
                                            </select>
                                            <button 
                                                onClick={() => { setIsSearchVisible(false); setSearchQuery(''); setTagFilter(''); }} 
                                                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }}
                                            >
                                                <X size={20} className="text-gray-500 hover:text-brand-primary transition-colors" />
                                            </button>
                                        </div>
                                    ) : (
                                        <button 
                                            onClick={() => setIsSearchVisible(true)} 
                                            style={{ 
                                                background: 'transparent', border: 'none', cursor: 'pointer', 
                                                padding: '8px', borderRadius: '50%', backgroundColor: 'var(--bg-hover)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}
                                            title="Search and Filter"
                                        >
                                            <Search size={20} className="text-brand-primary" />
                                        </button>
                                    )}
                                </div>
                            </header>

                            {/* Time Summary Card - My Day only */}
                            {filter === 'my-day' && (() => {
                                const totalPT = filteredTasks.reduce((sum, t) => sum + (t.plannedTime || 0), 0);
                                const totalAT = filteredTasks.reduce((sum, t) => sum + (t.actualTime || 0), 0);
                                if (totalPT === 0 && totalAT === 0) return null;
                                const formatTime = (mins) => {
                                    if (!mins) return '0m';
                                    const h = Math.floor(mins / 60);
                                    const m = mins % 60;
                                    return h > 0 ? `${h}h ${m > 0 ? m + 'm' : ''}` : `${m}m`;
                                };
                                const overBudget = totalAT > totalPT && totalPT > 0;
                                return (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-surface)', marginBottom: '12px', fontSize: '0.8rem' }}>
                                        <Clock size={14} style={{ color: 'var(--text-secondary)' }} />
                                        <span style={{ color: 'var(--text-secondary)' }}>Planned: <strong style={{ color: 'var(--text-primary)' }}>{formatTime(totalPT)}</strong></span>
                                        <span style={{ color: 'var(--text-placeholder)' }}>|</span>
                                        <span style={{ color: 'var(--text-secondary)' }}>Actual: <strong style={{ color: overBudget ? '#dc2626' : 'var(--text-primary)' }}>{formatTime(totalAT)}</strong></span>
                                    </div>
                                );
                            })()}

                            <div className="task-list">
                                {filteredTasks.map(task => (
                                    <TaskRow
                                        key={task.id}
                                        task={task}
                                        selected={selectedTask?.id === task.id}
                                        onSelect={t => setSelectedTaskId(t.id)}
                                        onComplete={(id) => updateTask(id, {
                                            status: task.status === 'completed' ? 'pending' : 'completed',
                                            completedAt: task.status !== 'completed' ? new Date().toISOString() : null
                                        })}
                                        onToggleImportance={(id) => updateTask(id, { importance: task.importance > 7 ? 1 : 10 })}
                                        onUpdate={updateTask}
                                        activeFilter={filter}
                                        onAddToMyDay={(id) => {
                                            const todayStr = new Date().toISOString().split('T')[0];
                                            updateTask(id, { myDayDate: todayStr });
                                        }}
                                    />
                                ))}
                            </div>

                            <div className="add-task-bar" style={{ padding: '0.75rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                    <Plus className="text-brand-primary mr-3" />
                                    <form onSubmit={handleAddTask} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}>
                                        <input
                                            className="fluent-input"
                                            style={{
                                                flex: 1,
                                                color: isDarkMode ? 'white' : 'var(--text-primary)',
                                                '::placeholder': { color: isDarkMode ? 'rgba(255,255,255,0.6)' : 'inherit' }
                                            }}
                                            placeholder="Add a task"
                                            value={newTaskTitle}
                                            onChange={(e) => setNewTaskTitle(e.target.value)}
                                        />

                                        {/* Quick Add Actions - Inline */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            {/* Date Picker */}
                                            <div style={{ position: 'relative' }}>
                                                <input
                                                    type="date"
                                                    ref={dateInputRef}
                                                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, pointerEvents: 'none', zIndex: 0 }}
                                                    onChange={(e) => setNewTaskDate(e.target.value)}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => dateInputRef.current?.showPicker()}
                                                    style={{ padding: '6px', borderRadius: '4px', border: 'none', background: newTaskDate ? 'var(--bg-hover)' : 'transparent', color: newTaskDate ? 'var(--brand-primary)' : 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', position: 'relative', zIndex: 1 }}
                                                    title="Set Due Date"
                                                >
                                                    <Calendar size={18} />
                                                </button>
                                            </div>

                                            {/* Reminder Picker */}
                                            <div style={{ position: 'relative' }}>
                                                <input
                                                    type="datetime-local"
                                                    ref={reminderInputRef}
                                                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, pointerEvents: 'none', zIndex: 0 }}
                                                    onChange={(e) => setNewTaskReminder(e.target.value)}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => reminderInputRef.current?.showPicker()}
                                                    style={{ padding: '6px', borderRadius: '4px', border: 'none', background: newTaskReminder ? 'var(--bg-hover)' : 'transparent', color: newTaskReminder ? 'var(--brand-primary)' : 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', position: 'relative', zIndex: 1 }}
                                                    title="Set Reminder"
                                                >
                                                    <Bell size={18} />
                                                </button>
                                            </div>

                                            {/* Tags Toggle */}
                                            <button
                                                type="button"
                                                onClick={() => setIsTagInputVisible(!isTagInputVisible)}
                                                style={{ padding: '6px', borderRadius: '4px', border: 'none', background: newTaskTags.length > 0 ? 'var(--bg-hover)' : 'transparent', color: newTaskTags.length > 0 ? 'var(--brand-primary)' : 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                                title="Add Tags"
                                            >
                                                <Tag size={18} />
                                            </button>

                                            {/* Planned Time Toggle */}
                                            <button
                                                type="button"
                                                onClick={() => setIsPlannedTimeVisible(!isPlannedTimeVisible)}
                                                style={{ padding: '6px', borderRadius: '4px', border: 'none', background: newTaskPlannedTime ? 'var(--bg-hover)' : 'transparent', color: newTaskPlannedTime ? 'var(--brand-primary)' : 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                                title="Set Planned Time"
                                            >
                                                <Clock size={18} />
                                            </button>
                                        </div>
                                    </form>
                                </div>

                                {/* Active Tags & Input Row (appears below if needed) */}
                                {(newTaskTags.length > 0 || isTagInputVisible || newTaskDate || newTaskReminder || newTaskPlannedTime || isPlannedTimeVisible) && (
                                    <div style={{ paddingLeft: '2.5rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', fontSize: '12px' }}>
                                        {/* Status Text for Date/Time */}
                                        {newTaskDate && (
                                            <span style={{ color: 'var(--brand-primary)', fontWeight: 500 }}>
                                                Due: {new Date(newTaskDate).toLocaleDateString()}
                                            </span>
                                        )}
                                        {newTaskReminder && (
                                            <span style={{ color: 'var(--brand-primary)', fontWeight: 500 }}>
                                                Remind: {new Date(newTaskReminder).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        )}
                                        {newTaskPlannedTime && (
                                            <span style={{ color: 'var(--brand-primary)', fontWeight: 500 }}>
                                                PT: {newTaskPlannedTime}m
                                            </span>
                                        )}

                                        {/* Planned Time Input */}
                                        {isPlannedTimeVisible && (
                                            <input
                                                type="number"
                                                min="0"
                                                className="fluent-input"
                                                style={{
                                                    fontSize: '12px', padding: '2px 6px', width: '80px',
                                                    color: isDarkMode ? 'white' : 'var(--text-primary)',
                                                    border: '1px solid var(--border-light)',
                                                    background: 'transparent'
                                                }}
                                                placeholder="Minutes"
                                                value={newTaskPlannedTime || ''}
                                                onChange={(e) => setNewTaskPlannedTime(e.target.value ? parseInt(e.target.value) : null)}
                                                autoFocus
                                            />
                                        )}

                                        {/* Tags */}
                                        {newTaskTags.map(tag => (
                                            <span key={tag} style={{ padding: '2px 8px', borderRadius: '12px', background: 'var(--bg-hover)', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'default' }}>
                                                #{tag}
                                                <X size={12} style={{ cursor: 'pointer' }} onClick={() => setNewTaskTags(newTaskTags.filter(t => t !== tag))} />
                                            </span>
                                        ))}

                                        {/* Tag Input */}
                                        {isTagInputVisible && (
                                            <input
                                                className="fluent-input"
                                                style={{
                                                    fontSize: '12px', padding: '2px 6px', width: '150px',
                                                    color: isDarkMode ? 'white' : 'var(--text-primary)',
                                                    border: '1px solid var(--border-light)',
                                                    background: 'transparent'
                                                }}
                                                placeholder="Type tag & Enter..."
                                                value={tagInputValue}
                                                onChange={(e) => setTagInputValue(e.target.value)}
                                                onKeyDown={handleTagInputKeyDown}
                                                autoFocus
                                            />
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* 3. Detail Panel - Only show if not in analytics mode */}
                {selectedTask && filter !== 'analytics' && (
                    <TaskDetail
                        task={selectedTask}
                        onClose={() => setSelectedTaskId(null)}
                        onUpdate={updateTask}
                        onDelete={(id) => {
                            // Basic delete/archive - status 'deleted' or remove
                            updateTask(id, { status: 'deleted' }); // soft delete
                            setSelectedTaskId(null);
                        }}
                    />
                )}
            </div>
        </>
    );
}

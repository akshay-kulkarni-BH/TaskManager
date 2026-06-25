import { useEffect, useMemo, useState } from 'react';

function getTodayDate() {
    return new Date().toISOString().split('T')[0];
}

export function useTasks() {
    const [tasks, setTasks] = useState([]);
    const [settings, setSettings] = useState({});

    // Initial Load via Electron IPC
    useEffect(() => {
        const load = async () => {
            if (window.electronAPI) {
                try {
                    const data = await window.electronAPI.getAll();
                    setTasks(data.tasks || []);
                    setSettings(data.settings || {});
                    console.log('Data loaded from Electron:', data);
                } catch (err) {
                    console.error('Failed to load data:', err);
                }
            } else {
                console.warn('Electron API not found - running in web mode?');
            }
        };
        load();
    }, []);

    const visibleTasks = useMemo(() => {
        return tasks.filter(t => {
            if (t.isRecurrenceTemplate) return false;
            // Hide legacy generated recurrence children from previous model.
            if (t.recurrenceTemplateId && t.recurrenceFrequency === 'daily') return false;
            return true;
        });
    }, [tasks]);

    const sortedTasks = useMemo(() => {
        return [...visibleTasks].sort((a, b) => {
            const scoreA = (a.importance || 0) * 1.5 + (a.urgency || 0);
            const scoreB = (b.importance || 0) * 1.5 + (b.urgency || 0);
            return scoreB - scoreA;
        });
    }, [visibleTasks]);

    const stats = useMemo(() => {
        const today = getTodayDate();
        const completedToday = visibleTasks.filter(t => t.status === 'completed' && t.completedAt?.startsWith(today)).length;
        const pending = visibleTasks.filter(t => t.status !== 'completed').length;
        return { completedToday, pending };
    }, [visibleTasks]);

    const addTask = async (task) => {
        const newTask = {
            id: crypto.randomUUID(),
            status: 'pending',
            pushHistory: [],
            createdAt: new Date().toISOString(),
            tags: [],
            subtasks: [],
            importance: 5,
            urgency: 5,
            description: '',
            targetDate: null,
            reminder: null,
            myDayDate: null,
            plannedTime: null,
            actualTime: null,
            actualTimeDate: null,
            repeatTask: false,
            repeatActive: false,
            repeatCompletionHistory: [],
            isRecurrenceTemplate: false,
            recurrenceTemplateId: null,
            recurrenceFrequency: null,
            recurrenceDate: null,
            recurrenceDayIndex: null,
            recurrenceTotalDays: null,
            recurrenceStartDate: null,
            recurrenceEndDate: null,
            ...task
        };

        // Optimistic UI Update
        setTasks(prev => [newTask, ...prev]);

        if (window.electronAPI) {
            try {
                await window.electronAPI.addTask(newTask);
            } catch (err) {
                console.error('Failed to add task:', err);
            }
        }
    };

    const updateTask = async (id, updates) => {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));

        if (window.electronAPI) {
            try {
                await window.electronAPI.updateTask(id, updates);
            } catch (err) {
                console.error('Failed to update task:', err);
            }
        }
    };

    const pushTask = (id, reason) => {
        const task = tasks.find(t => t.id === id);
        if (!task) return;

        const newHistory = [
            ...(task.pushHistory || []),
            { date: new Date().toISOString(), reason }
        ];

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        updateTask(id, {
            pushHistory: newHistory,
            targetDate: tomorrow.toISOString()
        });
    };

    const toggleTaskCompleteForToday = async (taskId) => {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;

        if (task.repeatTask && task.repeatActive) {
            const today = getTodayDate();
            const current = Array.isArray(task.repeatCompletionHistory) ? task.repeatCompletionHistory : [];
            const exists = current.includes(today);
            const updatedHistory = exists
                ? current.filter(d => d !== today)
                : [...current, today];
            await updateTask(taskId, { repeatCompletionHistory: updatedHistory });
            return;
        }

        await updateTask(taskId, {
            status: task.status === 'completed' ? 'pending' : 'completed',
            completedAt: task.status !== 'completed' ? new Date().toISOString() : null
        });
    };

    const completeRepeatSeries = async (taskId) => {
        await updateTask(taskId, {
            repeatActive: false,
            myDayDate: null,
            recurrenceEndDate: new Date().toISOString()
        });
    };

    const updateSettings = async (newSettings) => {
        const updated = { ...settings, ...newSettings };
        setSettings(updated);

        if (window.electronAPI) {
            try {
                await window.electronAPI.saveSettings(updated);
            } catch (err) {
                console.error('Failed to save settings:', err);
            }
        }
    };

    return {
        tasks: sortedTasks,
        stats,
        settings,
        addTask,
        updateTask,
        toggleTaskCompleteForToday,
        completeRepeatSeries,
        pushTask,
        updateSettings
    };
}

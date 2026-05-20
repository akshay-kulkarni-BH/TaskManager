import { useEffect, useMemo, useState } from 'react';

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

    const sortedTasks = useMemo(() => {
        return [...tasks].sort((a, b) => {
            const scoreA = (a.importance || 0) * 1.5 + (a.urgency || 0);
            const scoreB = (b.importance || 0) * 1.5 + (b.urgency || 0);
            return scoreB - scoreA;
        });
    }, [tasks]);

    const stats = useMemo(() => {
        const today = new Date().toISOString().split('T')[0];
        const completedToday = tasks.filter(t => t.status === 'completed' && t.completedAt?.startsWith(today)).length;
        const pending = tasks.filter(t => t.status !== 'completed').length;
        return { completedToday, pending };
    }, [tasks]);

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
        pushTask,
        updateSettings
    };
}

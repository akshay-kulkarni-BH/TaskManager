import { app, BrowserWindow, dialog, ipcMain, Notification } from 'electron';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getCurrentDbPath, getDB, initDB } from './db.js';

const __filename_esm = fileURLToPath(import.meta.url);
const __dirname_esm = path.dirname(__filename_esm);

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
// squirrel-startup is commonjs only usually, trying dynamic import or ignoring for dev
// import squirrelStartup from 'electron-squirrel-startup'; 
// if (squirrelStartup) app.quit();

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        minWidth: 800,
        icon: path.join(app.getAppPath(), 'task_manager.ico'),
        webPreferences: {
            preload: path.join(__dirname_esm, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
        },
        autoHideMenuBar: false, // Show menu bar for reload/debugging
        backgroundColor: '#00000000', // Transparent background
    });

    // VITE_DEV_SERVER_URL is passed by vite-plugin-electron
    if (process.env.VITE_DEV_SERVER_URL) {
        mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
        // Open DevTools in development
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(path.join(app.getAppPath(), 'dist/index.html'));
    }
}

const configPath = path.join(app.getPath('userData'), 'config.json');

function loadConfig() {
    try {
        if (fs.existsSync(configPath)) {
            const data = fs.readFileSync(configPath, 'utf-8');
            return JSON.parse(data);
        }
    } catch (err) {
        console.error('Error loading config:', err);
    }
    return {};
}

function saveConfig(config) {
    try {
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    } catch (err) {
        console.error('Error saving config:', err);
    }
}

// --- My Day Daily Reset & Auto-populate ---
function resetMyDayTasks() {
    try {
        const db = getDB();
        const today = new Date().toISOString().split('T')[0];

        // 1. Clear myDayDate for previous-day completed tasks (move to archive)
        db.prepare(`
            UPDATE tasks SET my_day_date = NULL
            WHERE my_day_date IS NOT NULL AND my_day_date < ?
              AND status = 'completed'
        `).run(today);

        // 2. Clear myDayDate for previous-day unattended tasks (not in-progress, not urgent)
        db.prepare(`
            UPDATE tasks SET my_day_date = NULL
            WHERE my_day_date IS NOT NULL AND my_day_date < ?
              AND status != 'in-progress'
              AND (urgency IS NULL OR urgency <= 7)
        `).run(today);

        // 2. Auto-add all in-progress and urgent non-completed tasks to today's My Day
        db.prepare(`
            UPDATE tasks SET my_day_date = ?
            WHERE status != 'completed' AND status != 'deleted'
              AND (status = 'in-progress' OR urgency > 7)
        `).run(today);

        console.log('My Day refreshed for today');
    } catch (err) {
        console.error('Failed to refresh My Day tasks:', err);
    }
}

// --- Reminder Notification Checker ---
// Checks every 30 seconds for tasks with reminders that are due
const notifiedReminders = new Set();

function startReminderChecker() {
    setInterval(() => {
        try {
            const db = getDB();
            const now = new Date();
            const tasks = db.prepare(
                `SELECT id, title, reminder FROM tasks WHERE reminder IS NOT NULL AND status != 'completed' AND status != 'deleted'`
            ).all();

            for (const task of tasks) {
                if (notifiedReminders.has(task.id)) continue;
                const reminderTime = new Date(task.reminder);
                if (reminderTime <= now) {
                    notifiedReminders.add(task.id);
                    const notification = new Notification({
                        title: 'Rabbit Task Manager',
                        body: task.title,
                        icon: path.join(app.getAppPath(), 'task_manager.ico')
                    });
                    notification.show();
                }
            }
        } catch (err) {
            console.error('Reminder check error:', err);
        }
    }, 30000); // Check every 30 seconds
}

app.whenReady().then(() => {
    const config = loadConfig();
    try {
        initDB(config.dbPath);
        resetMyDayTasks();
    } catch (err) {
        console.error('Failed to init DB on launch:', err);
    }

    createWindow();
    startReminderChecker();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// --- IPC Handlers ---

ipcMain.handle('db:get-all', () => {
    try {
        const db = getDB();
        const tasks = db.prepare('SELECT * FROM tasks').all();
        const settingsRows = db.prepare('SELECT * FROM settings').all();

        // Parse JSON fields
        const parsedTasks = tasks.map(t => ({
            ...t,
            tags: t.tags ? JSON.parse(t.tags) : [],
            pushHistory: t.push_history ? JSON.parse(t.push_history) : [],
            subtasks: t.subtasks ? JSON.parse(t.subtasks) : [],
            targetDate: t.target_date,
            createdAt: t.created_at,
            completedAt: t.completed_at,
            reminder: t.reminder || null,
            myDayDate: t.my_day_date || null,
            plannedTime: t.planned_time || null,
            actualTime: t.actual_time || null,
            actualTimeDate: t.actual_time_date || null
        }));

        const settings = settingsRows.reduce((acc, row) => {
            acc[row.key] = JSON.parse(row.value);
            return acc;
        }, {});

        return { tasks: parsedTasks, settings };
    } catch (err) {
        console.error('IPC get-all error:', err);
        return { tasks: [], settings: {} };
    }
});

ipcMain.handle('db:add-task', (_, task) => {
    const db = getDB();
    const stmt = db.prepare(`
        INSERT INTO tasks (id, title, description, status, created_at, tags, importance, urgency, subtasks, target_date, reminder, my_day_date, planned_time, actual_time, actual_time_date)
        VALUES (@id, @title, @description, @status, @createdAt, @tags, @importance, @urgency, @subtasks, @targetDate, @reminder, @myDayDate, @plannedTime, @actualTime, @actualTimeDate)
    `);
    const info = stmt.run({
        ...task,
        tags: JSON.stringify(task.tags || []),
        subtasks: JSON.stringify(task.subtasks || []),
        targetDate: task.targetDate || null,
        reminder: task.reminder || null,
        myDayDate: task.myDayDate || null,
        plannedTime: task.plannedTime || null,
        actualTime: task.actualTime || null,
        actualTimeDate: task.actualTimeDate || null
    });
    return info.lastInsertRowid;
});

ipcMain.handle('db:update-task', (_, { id, updates }) => {
    const fields = Object.keys(updates).map(k => {
        const colMap = {
            targetDate: 'target_date',
            pushHistory: 'push_history',
            createdAt: 'created_at',
            completedAt: 'completed_at',
            myDayDate: 'my_day_date',
            plannedTime: 'planned_time',
            actualTime: 'actual_time',
            actualTimeDate: 'actual_time_date'
        };
        const col = colMap[k] || k;
        return `${col} = @${k}`;
    });

    if (fields.length === 0) return;

    const query = `UPDATE tasks SET ${fields.join(', ')} WHERE id = @id`;

    // Serialize JSONs
    const safeUpdates = { ...updates };
    if (updates.tags) safeUpdates.tags = JSON.stringify(updates.tags);
    if (updates.pushHistory) safeUpdates.pushHistory = JSON.stringify(updates.pushHistory);
    if (updates.subtasks) safeUpdates.subtasks = JSON.stringify(updates.subtasks);

    const db = getDB();
    db.prepare(query).run({ id, ...safeUpdates });
});

ipcMain.handle('db:save-settings', (_, newSettings) => {
    const db = getDB();
    const insert = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (@key, @value)');
    const insertMany = db.transaction((settings) => {
        for (const [key, value] of Object.entries(settings)) {
            insert.run({ key, value: JSON.stringify(value) });
        }
    });
    insertMany(newSettings);
});

// --- Database Path Management ---

ipcMain.handle('db:get-current-path', () => {
    return getCurrentDbPath();
});

ipcMain.handle('db:switch-path', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openFile', 'createDirectory', 'promptToCreate'],
        filters: [{ name: 'SQLite Database', extensions: ['db', 'sqlite'] }]
    });

    if (!result.canceled && result.filePaths.length > 0) {
        const newPath = result.filePaths[0];
        try {
            initDB(newPath);
            saveConfig({ dbPath: newPath });
            return { success: true, path: newPath };
        } catch (err) {
            console.error('Failed to switch DB:', err);
            return { success: false, error: err.message };
        }
    }
    return { success: false, cancelled: true };
});

// Test Ping
ipcMain.handle('ping', () => 'pong');

// App version
ipcMain.handle('app:get-version', () => app.getVersion());

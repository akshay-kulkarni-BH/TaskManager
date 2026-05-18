import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
    ping: () => ipcRenderer.invoke('ping'),
    getAll: () => ipcRenderer.invoke('db:get-all'),
    addTask: (task) => ipcRenderer.invoke('db:add-task', task),
    updateTask: (id, updates) => ipcRenderer.invoke('db:update-task', { id, updates }),
    saveSettings: (settings) => ipcRenderer.invoke('db:save-settings', settings),

    // Database Management
    switchDatabase: () => ipcRenderer.invoke('db:switch-path'),
    getDatabasePath: () => ipcRenderer.invoke('db:get-current-path'),

    // App info
    getVersion: () => ipcRenderer.invoke('app:get-version'),
});

import Database from 'better-sqlite3';
import { app } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname_esm = path.dirname(fileURLToPath(import.meta.url));




let dbInstance = null;
let currentDbPath = null;

export function initDB(customPath) {
    // If a specific path is provided, use it.
    // Otherwise, default to Project Root (Dev) or UserData (Prod).
    let dbPath = customPath;

    if (!dbPath) {
        dbPath = process.env.NODE_ENV === 'development'
            ? path.join(__dirname_esm, '../../tasks.db')
            : path.join(app.getPath('userData'), 'tasks.db');
    }

    // Close existing connection if any
    if (dbInstance) {
        console.log('Closing existing database connection...');
        dbInstance.close();
    }

    console.log('Initializing database at:', dbPath);
    currentDbPath = dbPath;

    try {
        dbInstance = new Database(dbPath, { verbose: console.log });
        dbInstance.pragma('journal_mode = WAL');

        // Initialize Schema
        dbInstance.exec(`
          CREATE TABLE IF NOT EXISTS tasks (
              id TEXT PRIMARY KEY,
              title TEXT NOT NULL,
              description TEXT,
              status TEXT DEFAULT 'pending',
              created_at TEXT,
              completed_at TEXT,
              importance INTEGER DEFAULT 5,
              urgency INTEGER DEFAULT 5,
              tags TEXT, -- JSON array
              target_date TEXT,
              push_history TEXT, -- JSON array
              subtasks TEXT, -- JSON array
              is_recurrence_template INTEGER DEFAULT 0,
              recurrence_template_id TEXT,
              recurrence_frequency TEXT,
              recurrence_date TEXT,
              recurrence_day_index INTEGER,
              recurrence_total_days INTEGER,
              recurrence_start_date TEXT,
              recurrence_end_date TEXT,
              repeat_task INTEGER DEFAULT 0,
              repeat_active INTEGER DEFAULT 0,
              repeat_completion_history TEXT -- JSON array of YYYY-MM-DD strings
          );
          
          CREATE TABLE IF NOT EXISTS settings (
              key TEXT PRIMARY KEY,
              value TEXT
          );
        `);

        // Migration for existing tables
        try {
            dbInstance.exec("ALTER TABLE tasks ADD COLUMN subtasks TEXT");
        } catch (e) {
            // Column already exists
        }

        try {
            dbInstance.exec("ALTER TABLE tasks ADD COLUMN reminder TEXT");
        } catch (e) {
            // Column already exists
        }

        try {
            dbInstance.exec("ALTER TABLE tasks ADD COLUMN my_day_date TEXT");
        } catch (e) {
            // Column already exists
        }

        try {
            dbInstance.exec("ALTER TABLE tasks ADD COLUMN planned_time INTEGER");
        } catch (e) {
            // Column already exists
        }

        try {
            dbInstance.exec("ALTER TABLE tasks ADD COLUMN actual_time INTEGER");
        } catch (e) {
            // Column already exists
        }

        try {
            dbInstance.exec("ALTER TABLE tasks ADD COLUMN actual_time_date TEXT");
        } catch (e) {
            // Column already exists
        }

        try {
            dbInstance.exec("ALTER TABLE tasks ADD COLUMN is_recurrence_template INTEGER DEFAULT 0");
        } catch (e) {
            // Column already exists
        }

        try {
            dbInstance.exec("ALTER TABLE tasks ADD COLUMN recurrence_template_id TEXT");
        } catch (e) {
            // Column already exists
        }

        try {
            dbInstance.exec("ALTER TABLE tasks ADD COLUMN recurrence_frequency TEXT");
        } catch (e) {
            // Column already exists
        }

        try {
            dbInstance.exec("ALTER TABLE tasks ADD COLUMN recurrence_date TEXT");
        } catch (e) {
            // Column already exists
        }

        try {
            dbInstance.exec("ALTER TABLE tasks ADD COLUMN recurrence_day_index INTEGER");
        } catch (e) {
            // Column already exists
        }

        try {
            dbInstance.exec("ALTER TABLE tasks ADD COLUMN recurrence_total_days INTEGER");
        } catch (e) {
            // Column already exists
        }

        try {
            dbInstance.exec("ALTER TABLE tasks ADD COLUMN recurrence_start_date TEXT");
        } catch (e) {
            // Column already exists
        }

        try {
            dbInstance.exec("ALTER TABLE tasks ADD COLUMN recurrence_end_date TEXT");
        } catch (e) {
            // Column already exists
        }

        try {
            dbInstance.exec("ALTER TABLE tasks ADD COLUMN repeat_task INTEGER DEFAULT 0");
        } catch (e) {
            // Column already exists
        }

        try {
            dbInstance.exec("ALTER TABLE tasks ADD COLUMN repeat_active INTEGER DEFAULT 0");
        } catch (e) {
            // Column already exists
        }

        try {
            dbInstance.exec("ALTER TABLE tasks ADD COLUMN repeat_completion_history TEXT");
        } catch (e) {
            // Column already exists
        }

        return true;
    } catch (error) {
        console.error('Failed to initialize database:', error);
        dbInstance = null;
        throw error;
    }
}

export function getDB() {
    if (!dbInstance) {
        throw new Error('Database not initialized. Call initDB() first.');
    }
    return dbInstance;
}

export function getCurrentDbPath() {
    return currentDbPath;
}

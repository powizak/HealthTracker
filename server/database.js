const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

// Determine database path. Env var mostly for Docker.
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'health.db');

let db;

async function getDb() {
    if (db) return db;

    db = await open({
        filename: DB_PATH,
        driver: sqlite3.Database
    });

    await db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            google_id TEXT UNIQUE,
            email TEXT,
            name TEXT,
            picture TEXT,
            refresh_token TEXT,
            calendar_id TEXT,
            sync_enabled BOOLEAN DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS family_members (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            name TEXT,
            color TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            member_id INTEGER,
            title TEXT,
            description TEXT,
            start_date TEXT,
            end_date TEXT,
            google_event_id TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id),
            FOREIGN KEY(member_id) REFERENCES family_members(id)
        );

        CREATE TABLE IF NOT EXISTS treatments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            record_id INTEGER,
            name TEXT,
            type TEXT, -- e.g., 'medication', 'therapy', 'lifestyle'
            dosage TEXT,
            notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(record_id) REFERENCES records(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS attachments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            record_id INTEGER,
            filename TEXT,
            path TEXT,
            mime_type TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(record_id) REFERENCES records(id) ON DELETE CASCADE
        );
    `);

    // Migrations: Check if columns exist and add them if not (for existing DBs)
    try {
        await db.run('ALTER TABLE users ADD COLUMN refresh_token TEXT');
    } catch (e) { /* Ignore if exists */ }

    try {
        await db.run('ALTER TABLE users ADD COLUMN calendar_id TEXT');
    } catch (e) { /* Ignore if exists */ }

    try {
        await db.run('ALTER TABLE users ADD COLUMN sync_enabled BOOLEAN DEFAULT 0');
    } catch (e) { /* Ignore if exists */ }

    try {
        await db.run('ALTER TABLE records ADD COLUMN member_id INTEGER');
    } catch (e) { /* Ignore if exists */ }

    try {
        await db.run('ALTER TABLE records ADD COLUMN google_event_id TEXT');
    } catch (e) { /* Ignore if exists */ }

    return db;
}

module.exports = { getDb };

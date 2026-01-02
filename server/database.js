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

        CREATE TABLE IF NOT EXISTS families (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            created_by INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(created_by) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS family_users (
            family_id INTEGER,
            user_id INTEGER,
            role TEXT DEFAULT 'member', -- 'admin', 'member'
            joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (family_id, user_id),
            FOREIGN KEY(family_id) REFERENCES families(id),
            FOREIGN KEY(user_id) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS family_invites (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            family_id INTEGER,
            email TEXT,
            token TEXT,
            invited_by INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(family_id) REFERENCES families(id)
        );

        CREATE TABLE IF NOT EXISTS family_members (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER, -- Deprecated, used for migration
            family_id INTEGER,
            name TEXT,
            color TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(family_id) REFERENCES families(id)
        );

        CREATE TABLE IF NOT EXISTS records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER, -- Creator
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

        CREATE TABLE IF NOT EXISTS vaccinations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            member_id INTEGER,
            vaccine_name TEXT,
            date_given TEXT,
            next_dose_date TEXT,
            batch_number TEXT,
            notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(member_id) REFERENCES family_members(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS growth_records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            member_id INTEGER,
            date TEXT,
            height REAL,
            weight REAL,
            head_circumference REAL,
            notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(member_id) REFERENCES family_members(id) ON DELETE CASCADE
        );
    `);

    // Migrations
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

    try {
        await db.run('ALTER TABLE family_members ADD COLUMN family_id INTEGER');
    } catch (e) { /* Ignore if exists */ }

    // DATA MIGRATION: Move orphan users/members to a Family structure
    const users = await db.all('SELECT * FROM users');
    for (const user of users) {
        // Check if user is already in a family
        const inFamily = await db.get('SELECT * FROM family_users WHERE user_id = ?', [user.id]);
        if (!inFamily) {
            console.log(`Migrating user ${user.name} to Family structure...`);
            // Create Family
            const result = await db.run('INSERT INTO families (name, created_by) VALUES (?, ?)', [`Rodina - ${user.name}`, user.id]);
            const familyId = result.lastID;

            // Add User to Family
            await db.run('INSERT INTO family_users (family_id, user_id, role) VALUES (?, ?, ?)', [familyId, user.id, 'admin']);

            // Move their Members to this Family
            // Check if they have members with null family_id or belonging to them
            await db.run('UPDATE family_members SET family_id = ? WHERE user_id = ? AND (family_id IS NULL OR family_id = 0)', [familyId, user.id]);
        }
    }

    return db;
}

module.exports = { getDb };

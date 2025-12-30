const express = require('express');
const cors = require('cors');
const cookieSession = require('cookie-session');
const { OAuth2Client } = require('google-auth-library');
const { google } = require('googleapis');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getDb } = require('./database');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET; // Ensure this is in .env
const REDIRECT_URI = 'postmessage'; // Important for React Google Login code flow

const client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

// Constants
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR);
}

// Multer Setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage });

// Middleware
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(cookieSession({
    name: 'session',
    keys: [process.env.SESSION_SECRET || 'secret_key_change_me'],
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

// Add Headers for Google Login Popups
app.use((req, res, next) => {
    res.header("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
    res.header("Cross-Origin-Embedder-Policy", "require-corp");
    next();
});

app.use('/uploads', express.static(UPLOAD_DIR));

// Check Configuration
if (!process.env.GOOGLE_CLIENT_SECRET) {
    console.error('!!!! FATAL ERROR: GOOGLE_CLIENT_SECRET is missing in .env !!!!');
    console.error('Please add GOOGLE_CLIENT_SECRET=YOUR_SECRET to server/.env');
}

// Auth Middleware
async function verifyUser(req, res, next) {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
}

// --- LOGGING ROUTES ---
// Login
app.get('/auth/dev_login', async (req, res) => {
    // DEV ONLY: Create/Login a test user
    const db = await getDb();
    let user = await db.get('SELECT * FROM users WHERE google_id = ?', ['dev_user_123']);
    if (!user) {
        const result = await db.run(
            'INSERT INTO users (google_id, email, name, picture) VALUES (?, ?, ?, ?)',
            ['dev_user_123', 'dev@example.com', 'Dev User', '']
        );
        user = { id: result.lastID };
    }
    req.session.userId = user.id;
    res.send('Logged in as Dev User. <a href="http://localhost:5173">Go to Frontend</a>');
});

// Login
app.post('/auth/login', async (req, res) => {
    const { code } = req.body; // Received 'code' from frontend
    try {
        const { tokens } = await client.getToken(code); // Exchange code for tokens

        // Verify ID Token
        const ticket = await client.verifyIdToken({
            idToken: tokens.id_token,
            audience: CLIENT_ID,
        });
        const payload = ticket.getPayload();

        const db = await getDb();
        let user = await db.get('SELECT * FROM users WHERE google_id = ?', [payload.sub]);

        if (!user) {
            const result = await db.run(
                'INSERT INTO users (google_id, email, name, picture, refresh_token) VALUES (?, ?, ?, ?, ?)',
                [payload.sub, payload.email, payload.name, payload.picture, tokens.refresh_token] // Store refresh token
            );
            user = { id: result.lastID, ...payload };
        } else if (tokens.refresh_token) {
            // Update refresh token if provided (Google doesn't always send it)
            await db.run('UPDATE users SET refresh_token = ? WHERE id = ?', [tokens.refresh_token, user.id]);
        }

        req.session.userId = user.id;
        res.json({ user });
    } catch (error) {
        console.error('Auth Error Detailed:', error);
        if (error.response) {
            console.error('Google API Error Response:', JSON.stringify(error.response.data, null, 2));
        }
        res.status(401).json({ error: 'Authentication failed', details: error.message });
    }
});

app.post('/auth/logout', (req, res) => {
    req.session = null;
    res.json({ message: 'Logged out' });
});

app.get('/api/me', verifyUser, async (req, res) => {
    const db = await getDb();
    const user = await db.get('SELECT id, google_id, email, name, picture, calendar_id, sync_enabled FROM users WHERE id = ?', [req.session.userId]);
    res.json(user);
});

app.put('/api/settings', verifyUser, async (req, res) => {
    const { calendar_id, sync_enabled } = req.body;
    const db = await getDb();

    let query = 'UPDATE users SET ';
    const params = [];
    const updates = [];

    if (calendar_id !== undefined) {
        updates.push('calendar_id = ?');
        params.push(calendar_id);
    }
    if (sync_enabled !== undefined) {
        updates.push('sync_enabled = ?');
        params.push(sync_enabled);
    }

    if (updates.length > 0) {
        query += updates.join(', ') + ' WHERE id = ?';
        params.push(req.session.userId);
        await db.run(query, params);
    }

    res.json({ message: 'Settings updated' });
});

// --- FAMILY MEMBER ROUTES ---
app.get('/api/members', verifyUser, async (req, res) => {
    const db = await getDb();
    const members = await db.all('SELECT * FROM family_members WHERE user_id = ?', [req.session.userId]);
    res.json(members);
});

app.post('/api/members', verifyUser, async (req, res) => {
    const { name, color } = req.body;
    const db = await getDb();
    const result = await db.run(
        'INSERT INTO family_members (user_id, name, color) VALUES (?, ?, ?)',
        [req.session.userId, name, color || '#3b82f6']
    );
    res.json({ id: result.lastID, name, color });
});

// --- RECORDS ROUTES ---
app.get('/api/records', verifyUser, async (req, res) => {
    const { member_id } = req.query;
    const db = await getDb();
    let query = 'SELECT r.*, m.name as member_name, m.color as member_color FROM records r LEFT JOIN family_members m ON r.member_id = m.id WHERE r.user_id = ?';
    const params = [req.session.userId];

    if (member_id) {
        query += ' AND r.member_id = ?';
        params.push(member_id);
    }

    query += ' ORDER BY start_date DESC';
    const records = await db.all(query, params);
    res.json(records);
});

// --- CALENDAR ROUTES ---
app.get('/api/calendars', verifyUser, async (req, res) => {
    try {
        const db = await getDb();
        const user = await db.get('SELECT refresh_token FROM users WHERE id = ?', [req.session.userId]);

        if (!user || !user.refresh_token) {
            return res.json([]); // No access
        }

        const oauth2Client = new OAuth2Client(CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, REDIRECT_URI);
        oauth2Client.setCredentials({ refresh_token: user.refresh_token });
        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

        const response = await calendar.calendarList.list({ minAccessRole: 'writer' });

        // Return simple list
        const calendars = response.data.items.map(c => ({
            id: c.id,
            summary: c.summary,
            primary: c.primary || false
        }));

        res.json(calendars);
    } catch (error) {
        console.error('Fetch Calendars Error:', error);
        res.status(500).json({ error: 'Failed to fetch calendars' });
    }
});

app.post('/api/records', verifyUser, async (req, res) => {
    const { title, description, start_date, end_date, member_id, addToCalendar, calendarId } = req.body;
    const db = await getDb();

    let google_event_id = null;

    if (addToCalendar) {
        console.log('Attempting to sync to calendar...', { calendarId });
        try {
            const user = await db.get('SELECT refresh_token, calendar_id FROM users WHERE id = ?', [req.session.userId]);
            const targetCalendarId = calendarId || user.calendar_id || 'primary';

            if (user && user.refresh_token) {
                const oauth2Client = new OAuth2Client(CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, REDIRECT_URI);
                oauth2Client.setCredentials({ refresh_token: user.refresh_token });
                const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

                // Fetch member name for title
                const member = member_id ? await db.get('SELECT name FROM family_members WHERE id = ?', [member_id]) : null;
                const eventTitle = `Zdraví: ${member ? member.name + ' - ' : ''}${title}`;

                // Calculate End Date for Event (Google API expects end date to be exclusive for all-day events, or specific time)
                // Assuming all-day events for simplicity based on current date inputs
                const start = new Date(start_date);
                const end = end_date ? new Date(end_date) : new Date(start_date);

                // If it's the same day, google needs end date to be next day for all-day event
                // Or we can just send date string directly

                // For all-day events:
                // start: { date: "2023-01-01" }
                // end: { date: "2023-01-02" } (exclusive)

                // Let's just use the string provided by frontend if it matches YYYY-MM-DD
                // But we need to ensure end date is >= start date + 1 day for all-day logic if they are the same

                let apiEndDate = end_date || start_date;
                if (apiEndDate === start_date) {
                    // Add 1 day for proper all-day event duration of 1 day
                    const d = new Date(start_date);
                    d.setDate(d.getDate() + 1);
                    apiEndDate = d.toISOString().split('T')[0];
                } else {
                    // Even if end_date is provided, for "Until 5.1.", it usually means including 5.1.
                    // Google expects exclusive end. So we should add 1 day to end_date.
                    const d = new Date(end_date);
                    d.setDate(d.getDate() + 1);
                    apiEndDate = d.toISOString().split('T')[0];
                }

                const event = await calendar.events.insert({
                    calendarId: targetCalendarId,
                    requestBody: {
                        summary: eventTitle,
                        description: description,
                        start: { date: start_date },
                        end: { date: apiEndDate }
                    }
                });
                google_event_id = event.data.id;
                console.log('Event created:', google_event_id);
            } else {
                console.log('No refresh token found for user');
            }
        } catch (error) {
            console.error('Calendar Sync Failed', error);
            // Non-blocking error, we still save record
        }
    }

    const result = await db.run(
        'INSERT INTO records (user_id, member_id, title, description, start_date, end_date, google_event_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [req.session.userId, member_id, title, description, start_date, end_date, google_event_id]
    );
    res.json({ id: result.lastID, ...req.body, google_event_id });
});

app.put('/api/records/:id', verifyUser, async (req, res) => {
    const { title, description, start_date, end_date, member_id, addToCalendar } = req.body;
    const db = await getDb();

    // Check for existing record
    const record = await db.get('SELECT * FROM records WHERE id = ? AND user_id = ?', [req.params.id, req.session.userId]);
    if (!record) return res.status(404).json({ error: 'Not found' });

    let google_event_id = record.google_event_id;

    // Logic: 
    // 1. If addToCalendar is true AND no google_event_id -> Create Event
    // 2. If addToCalendar is false AND has google_event_id -> Delete Event
    // 3. If addToCalendar is true AND has google_event_id -> Update Event

    try {
        const user = await db.get('SELECT refresh_token, calendar_id FROM users WHERE id = ?', [req.session.userId]);

        if (user && user.refresh_token) {
            const oauth2Client = new OAuth2Client(CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, REDIRECT_URI);
            oauth2Client.setCredentials({ refresh_token: user.refresh_token });
            const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
            const targetCalendarId = user.calendar_id || 'primary';

            // Common Date Logic
            let apiEndDate = end_date || start_date;
            if (apiEndDate === start_date) {
                const d = new Date(start_date);
                d.setDate(d.getDate() + 1);
                apiEndDate = d.toISOString().split('T')[0];
            } else {
                const d = new Date(end_date);
                d.setDate(d.getDate() + 1);
                apiEndDate = d.toISOString().split('T')[0];
            }

            const member = member_id ? await db.get('SELECT name FROM family_members WHERE id = ?', [member_id]) : null;
            const eventTitle = `Zdraví: ${member ? member.name + ' - ' : ''}${title}`;

            if (addToCalendar && !google_event_id) {
                // CREATE
                const event = await calendar.events.insert({
                    calendarId: targetCalendarId,
                    requestBody: {
                        summary: eventTitle,
                        description: description,
                        start: { date: start_date },
                        end: { date: apiEndDate }
                    }
                });
                google_event_id = event.data.id;
                console.log('Event created on update:', google_event_id);

            } else if (!addToCalendar && google_event_id) {
                // DELETE
                await calendar.events.delete({
                    calendarId: targetCalendarId,
                    eventId: google_event_id
                });
                console.log('Event deleted on update:', google_event_id);
                google_event_id = null;

            } else if (addToCalendar && google_event_id) {
                // UPDATE
                await calendar.events.update({
                    calendarId: targetCalendarId,
                    eventId: google_event_id,
                    requestBody: {
                        summary: eventTitle,
                        description: description,
                        start: { date: start_date },
                        end: { date: apiEndDate }
                    }
                });
                console.log('Event updated:', google_event_id);
            }
        }
    } catch (error) {
        console.error('Calendar sync error on update:', error);
        // Non-blocking
    }

    const result = await db.run(
        'UPDATE records SET title=?, description=?, start_date=?, end_date=?, member_id=?, google_event_id=? WHERE id=? AND user_id=?',
        [title, description, start_date, end_date, member_id, google_event_id, req.params.id, req.session.userId]
    );
    res.json({ message: 'Updated' });
});

app.delete('/api/records/:id', verifyUser, async (req, res) => {
    const db = await getDb();

    // Check for record and google info first
    const record = await db.get('SELECT * FROM records WHERE id = ? AND user_id = ?', [req.params.id, req.session.userId]);
    if (!record) {
        return res.status(404).json({ error: 'Record not found or unauthorized' });
    }

    // Attempt to delete from Calendar
    if (record.google_event_id) {
        try {
            const user = await db.get('SELECT refresh_token, calendar_id FROM users WHERE id = ?', [req.session.userId]);
            if (user && user.refresh_token) {
                const targetCalendarId = user.calendar_id || 'primary';
                const oauth2Client = new OAuth2Client(CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, REDIRECT_URI);
                oauth2Client.setCredentials({ refresh_token: user.refresh_token });
                const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

                await calendar.events.delete({
                    calendarId: targetCalendarId,
                    eventId: record.google_event_id
                });
                console.log('Calendar event deleted:', record.google_event_id);
            }
        } catch (error) {
            console.error('Failed to delete calendar event:', error);
            // Non-blocking
        }
    }

    const result = await db.run('DELETE FROM records WHERE id = ? AND user_id = ?', [req.params.id, req.session.userId]);
    res.json({ message: 'Deleted' });
});

// --- TREATMENTS ROUTES ---
app.get('/api/records/:id/treatments', verifyUser, async (req, res) => {
    const db = await getDb();
    const treatments = await db.all('SELECT * FROM treatments WHERE record_id = ?', [req.params.id]);
    res.json(treatments);
});

app.post('/api/records/:id/treatments', verifyUser, async (req, res) => {
    const { name, type, dosage, notes } = req.body;
    const db = await getDb();
    const result = await db.run(
        'INSERT INTO treatments (record_id, name, type, dosage, notes) VALUES (?, ?, ?, ?, ?)',
        [req.params.id, name, type, dosage, notes]
    );
    res.json({ id: result.lastID, ...req.body });
});

// --- ATTACHMENTS ROUTES ---
app.post('/api/records/:id/attachments', verifyUser, upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const db = await getDb();
    // Check ownership of record
    const record = await db.get('SELECT id FROM records WHERE id = ? AND user_id = ?', [req.params.id, req.session.userId]);
    if (!record) {
        fs.unlinkSync(req.file.path); // Delete file if unauthorised
        return res.status(404).json({ error: 'Record not found' });
    }

    const result = await db.run(
        'INSERT INTO attachments (record_id, filename, path, mime_type) VALUES (?, ?, ?, ?)',
        [req.params.id, req.file.originalname, req.file.filename, req.file.mimetype]
    );

    res.json({
        id: result.lastID,
        filename: req.file.originalname,
        path: `/uploads/${req.file.filename}`,
        mime_type: req.file.mimetype
    });
});

app.get('/api/records/:id/attachments', verifyUser, async (req, res) => {
    const db = await getDb();
    const attachments = await db.all('SELECT * FROM attachments WHERE record_id = ?', [req.params.id]);
    // Map paths to be accessible
    const mapped = attachments.map(a => ({
        ...a,
        url: `/uploads/${a.path}`
    }));
    res.json(mapped);
});

// --- STATS & SUGGESTIONS ---
app.get('/api/stats/suggestions', verifyUser, async (req, res) => {
    const db = await getDb();

    // Top 20 most frequent titles
    const titles = await db.all(`
        SELECT title, COUNT(*) as count 
        FROM records 
        WHERE user_id = ? 
        GROUP BY title 
        ORDER BY count DESC 
        LIMIT 20
    `, [req.session.userId]);

    // Top 20 most frequent descriptions (exact match for simplify)
    const descriptions = await db.all(`
        SELECT description, COUNT(*) as count 
        FROM records 
        WHERE user_id = ? AND description IS NOT NULL AND description != ''
        GROUP BY description 
        ORDER BY count DESC 
        LIMIT 20
    `, [req.session.userId]);

    // Extract just strings
    res.json({
        titles: titles.map(t => t.title),
        descriptions: descriptions.map(d => d.description)
    });
});


// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

import sqlite3 from 'sqlite3';
import express, { Request, Response } from 'express';
import request from 'request';

const schedulesDB = new sqlite3.Database('schedules.sqlite3', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        return;
    }
    console.log('Connected to the schedules SQLite database.');
    schedulesDB.run(`CREATE TABLE IF NOT EXISTS key_value_store (
        key TEXT PRIMARY KEY,
        value TEXT
    )`);
    // Create table for user schedules
    schedulesDB.run(`CREATE TABLE IF NOT EXISTS user_schedules (
        user_id TEXT PRIMARY KEY,
        schedules TEXT
    )`);
    // Create table for course color rules.
    schedulesDB.run(`CREATE TABLE IF NOT EXISTS user_colors (
        user_id TEXT PRIMARY KEY,
        color_rules TEXT
    )`);

    // Create table for schedules.
    schedulesDB.run(`CREATE TABLE IF NOT EXISTS schedules (
        user_id TEXT PRIMARY KEY,
        schedule_set_string TEXT,
        selected_index INTEGER
    )`);
});

const app = express();
app.use(express.json());


app.post('/api/saveUser', (req: Request, res: Response) => {
    const {username, scheduleSetString, currentScheduleIndex}: {username: string, scheduleSetString: string, currentScheduleIndex: number} = req.body;

    const stmt = schedulesDB.prepare("INSERT OR REPLACE INTO schedules (user_id, schedule_set_string, selected_index) VALUES (?, ?, ?)");
    stmt.run(username, scheduleSetString, currentScheduleIndex, (err: Error | null) => {
        if (err) {
            console.log(err);
            res.status(500).send(`Error saving schedules for "${username}".`);
        } else {
            res.status(200).send(`Saved schedules for "${username}".`);
        }
    });
    stmt.finalize();
});

app.get('/api/loadUser/:key', (req: Request, res: Response) => {
    const key = req.params.key;
    schedulesDB.get("SELECT schedule_set_string, selected_index FROM schedules WHERE user_id = ?", [key], (err: Error | null, row: { schedule_set_string: string, selected_index: number }) => {
        if (err || !row) {
            console.log('Error retrieving user schedules.');
            console.log(err);
        } else {
            res.status(200).json({ 
                scheduleSetString: row.schedule_set_string,
                selectedIndex: row.selected_index
            });
        }
    });
});

app.get('/api/professors', (req: Request, res: Response) => {
    const searchQuery = req.query.q as string;
    const url = `https://www.ratemyprofessors.com/search/professors/1074?q=${searchQuery}`;

    request(url, (error, response, body) => {
        if (!error && response.statusCode === 200) {
            console.log(url);
            res.send(body);
        } else {
            res.status(response.statusCode).send(error);
        }
    });
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
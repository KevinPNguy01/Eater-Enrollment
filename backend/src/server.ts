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
});

const app = express();
app.use(express.json());

app.post('/api/data', (req: Request, res: Response) => {
    const { userID, schedules, colors } = req.body;

    const stmt2 = schedulesDB.prepare("INSERT OR REPLACE INTO user_colors (user_id, color_rules) VALUES (?, ?)");
    stmt2.run(userID, colors, (err: Error | null) => {
        if (err) {
            console.log('Error setting course colors.');
            console.log(err);
        } else {
            console.log('Data inserted successfully');
        }
    });
    stmt2.finalize();

    const stmt = schedulesDB.prepare("INSERT OR REPLACE INTO user_schedules (user_id, schedules) VALUES (?, ?)");
    stmt.run(userID, schedules, (err: Error | null) => {
        if (err) {
            console.log(err);
            res.status(500).send('Error saving schedule.');
        } else {
            res.status(200).send('Schedule saved successfully.');
        }
    });
    stmt.finalize();
});

app.get('/api/data/:key', (req: Request, res: Response) => {
    const key = req.params.key;
    let colors = "";
    schedulesDB.get("SELECT color_rules FROM user_colors WHERE user_id = ?", [key], (err: Error | null, row: { color_rules: string }) => {
        if (err) {
            console.log('Error retrieving course colors.');
            console.log(err);
        } else {
            colors = row ? row.color_rules : "";
        }
    });
    schedulesDB.get("SELECT schedules FROM user_schedules WHERE user_id = ?", [key], (err: Error | null, row: { schedules: string }) => {
        if (err) {
            res.status(500).send('Error retrieving data');
        } else {
            console.log(row)
            res.status(200).json({ 
                schedules: row ? row.schedules : null,
                colors: colors
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
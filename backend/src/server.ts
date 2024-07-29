import sqlite3 from 'sqlite3';
import express, { Request, Response } from 'express';
import request from 'request';

const db = new sqlite3.Database('schedules.sqlite3', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

db.run(`CREATE TABLE IF NOT EXISTS key_value_store (
    key TEXT PRIMARY KEY,
    value TEXT
)`);

const app = express();
app.use(express.json());

app.post('/api/data', (req: Request, res: Response) => {
    const { key, value } = req.body;
    const stmt = db.prepare("INSERT OR REPLACE INTO key_value_store (key, value) VALUES (?, ?)");
    stmt.run(key, value, (err: Error | null) => {
        if (err) {
            console.log(err);
            res.status(500).send('Error inserting data');
        } else {
            res.status(200).send('Data inserted successfully');
        }
    });
    stmt.finalize();
});

app.get('/api/data/:key', (req: Request, res: Response) => {
    const key = req.params.key;
    db.get("SELECT value FROM key_value_store WHERE key = ?", [key], (err: Error | null, row: { value: string }) => {
        if (err) {
            res.status(500).send('Error retrieving data');
        } else {
            res.status(200).json({ value: row ? row.value : null });
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
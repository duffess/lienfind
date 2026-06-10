const express = require('express');
const Database = require('better-sqlite3');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
const db = new Database(path.join(__dirname, 'scores.db'));
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    score INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// GET /api/scores — retorna o ranking ordenado por pontuação (maior primeiro)
app.get('/api/scores', (_req, res) => {
  const rows = db.prepare(
    'SELECT username, score, created_at FROM scores ORDER BY score DESC, created_at ASC LIMIT 50'
  ).all();
  res.json(rows);
});

// POST /api/scores — salva uma nova pontuação
app.post('/api/scores', (req, res) => {
  const { username, score } = req.body;
  if (!username || typeof score !== 'number') {
    return res.status(400).json({ error: 'username e score são obrigatórios' });
  }

  const stmt = db.prepare('INSERT INTO scores (username, score) VALUES (?, ?)');
  stmt.run(username.trim().substring(0, 30), score);
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`✓ API de pontuação rodando em http://localhost:${PORT}`);
});

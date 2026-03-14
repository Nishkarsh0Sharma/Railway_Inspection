import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const DB_FILE = process.env.DB_PATH || path.join(__dirname, 'data.db');

const db = new Database(DB_FILE);
db.pragma('journal_mode = WAL');

initDb();
defaultUsers();

function formatDate(d) {
  return d.toISOString().split('T')[0];
}

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function randomToken() {
  return crypto.randomBytes(32).toString('hex');
}

function initDb() {
  db.prepare(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('admin','worker'))
  )`).run();

  db.prepare(`CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expires_at TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`).run();

  db.prepare(`CREATE TABLE IF NOT EXISTS trains (
    id INTEGER PRIMARY KEY,
    train_id TEXT NOT NULL,
    date TEXT NOT NULL,
    coaches TEXT NOT NULL,
    UNIQUE(date, train_id)
  )`).run();

  db.prepare(`CREATE TABLE IF NOT EXISTS inspections (
    id INTEGER PRIMARY KEY,
    date TEXT NOT NULL,
    train_id TEXT NOT NULL,
    department TEXT NOT NULL,
    coach TEXT NOT NULL,
    comment TEXT NOT NULL,
    worker TEXT NOT NULL,
    time TEXT NOT NULL,
    created_at TEXT NOT NULL
  )`).run();

  db.prepare(`CREATE TABLE IF NOT EXISTS audit_log (
    id INTEGER PRIMARY KEY,
    action TEXT NOT NULL,
    performed_by TEXT NOT NULL,
    date TEXT,
    train_id TEXT,
    department TEXT,
    coach TEXT,
    comment TEXT,
    timestamp TEXT NOT NULL
  )`).run();
}

function defaultUsers() {
  const exists = db.prepare('SELECT COUNT(*) as c FROM users').get().c;
  if (exists > 0) return;

  const users = [
    { username: 'admin1', password: 'admin123', role: 'admin' },
    { username: 'worker1', password: 'worker123', role: 'worker' }
  ];
  const stmt = db.prepare('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)');
  for (const u of users) {
    stmt.run(u.username, hashPassword(u.password), u.role);
  }
}

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ error: 'Missing auth token' });

  const now = new Date().toISOString();
  const session = db.prepare(`SELECT s.*, u.username, u.role FROM sessions s JOIN users u ON s.user_id = u.id
    WHERE s.token = ? AND s.expires_at > ?`).get(token, now);
  if (!session) return res.status(401).json({ error: 'Invalid or expired token' });

  req.user = { id: session.user_id, username: session.username, role: session.role };
  next();
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') return res.status(403).json({ error: 'Admin required' });
  next();
}

const FRONTEND_ORIGIN = process.env.FRONTEND_URL || '*';
app.use(cors({
  origin: FRONTEND_ORIGIN,
  methods: ['GET', 'POST', 'DELETE', 'PUT'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'username/password required' });

  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!user || user.password_hash !== hashPassword(password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = randomToken();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  db.prepare('INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)').run(user.id, token, expiresAt);

  return res.json({ token, username: user.username, role: user.role });
});

app.get('/api/auth/me', authenticate, (req, res) => {
  res.json({ username: req.user.username, role: req.user.role });
});

app.get('/api/data', (req, res) => {
  const now = new Date();
  const cutoff = new Date(now.getTime() - 31 * 24 * 60 * 60 * 1000);
  const cutoffDate = formatDate(cutoff);

  db.prepare('DELETE FROM trains WHERE date < ?').run(cutoffDate);
  db.prepare('DELETE FROM inspections WHERE date < ?').run(cutoffDate);

  const query = db.prepare('SELECT date, train_id, coaches FROM trains WHERE date >= ? ORDER BY date, train_id');
  const trains = query.all(cutoffDate);
  const inspectionQuery = db.prepare('SELECT date, train_id, department, coach, comment, worker, time FROM inspections WHERE date >= ? ORDER BY date, train_id, department');
  const inspections = inspectionQuery.all(cutoffDate);

  const result = {};
  for (const { date, train_id, coaches } of trains) {
    if (!result[date]) result[date] = { trains: [] };
    const coachList = JSON.parse(coaches || '[]');
    result[date].trains.push({ id: train_id, coaches: coachList, departments: { Mechanical: {}, Electrical: {}, Safety: {} } });
  }

  for (const item of inspections) {
    const { date, train_id, department, coach, comment, worker, time } = item;
    if (!result[date]) continue;
    const train = result[date].trains.find((t) => t.id === train_id);
    if (!train) continue;

    train.departments[department] = train.departments[department] || {};
    train.departments[department][coach] = train.departments[department][coach] || [];
    train.departments[department][coach].push({ comment, worker, time });
  }

  res.json(result);
});

app.post('/api/addTrain', (req, res) => {
  const { date, trainId, coaches } = req.body;
  if (!date || !trainId) return res.status(400).json({ success: false, error: 'date and trainId required' });

  const exists = db.prepare('SELECT 1 FROM trains WHERE date = ? AND train_id = ?').get(date, trainId);
  if (exists) return res.json({ success: false, error: 'Train exists' });

  db.prepare('INSERT INTO trains (date, train_id, coaches) VALUES (?, ?, ?)').run(date, trainId, JSON.stringify(coaches || []));
  db.prepare('INSERT INTO audit_log (action, performed_by, date, train_id, timestamp) VALUES (?, ?, ?, ?, ?)')
    .run('addTrain', 'system', date, trainId, new Date().toISOString());

  res.json({ success: true });
});

app.post('/api/deleteTrain', (req, res) => {
  const { date, trainId } = req.body;
  if (!date || !trainId) return res.status(400).json({ success: false, error: 'date and trainId required' });

  db.prepare('DELETE FROM trains WHERE date = ? AND train_id = ?').run(date, trainId);
  db.prepare('DELETE FROM inspections WHERE date = ? AND train_id = ?').run(date, trainId);
  db.prepare('INSERT INTO audit_log (action, performed_by, date, train_id, timestamp) VALUES (?, ?, ?, ?, ?)')
    .run('deleteTrain', 'system', date, trainId, new Date().toISOString());

  res.json({ success: true });
});

app.post('/api/submitInspection', (req, res) => {
  const { date, trainId, dept, coach, inspection } = req.body;
  if (!date || !trainId || !dept || !coach || !inspection) {
    return res.status(400).json({ success: false, error: 'Missing fields' });
  }

  const exists = db.prepare('SELECT 1 FROM trains WHERE date = ? AND train_id = ?').get(date, trainId);
  if (!exists) return res.status(404).json({ success: false, error: 'Train not found' });

  db.prepare(`INSERT INTO inspections (date, train_id, department, coach, comment, worker, time, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(date, trainId, dept, coach, inspection.comment, inspection.worker, inspection.time, new Date().toISOString());

  db.prepare('INSERT INTO audit_log (action, performed_by, date, train_id, department, coach, comment, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .run('submitInspection', inspection.worker, date, trainId, dept, coach, inspection.comment, new Date().toISOString());

  res.json({ success: true });
});

app.get('/api/audit', authenticate, requireAdmin, (req, res) => {
  const { date } = req.query;
  let rows;
  if (date) {
    rows = db.prepare('SELECT * FROM audit_log WHERE date = ? ORDER BY timestamp DESC').all(date);
  } else {
    rows = db.prepare('SELECT * FROM audit_log ORDER BY timestamp DESC LIMIT 200').all();
  }
  res.json(rows);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
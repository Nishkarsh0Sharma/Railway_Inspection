import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_FILE = path.join(__dirname, 'data.json');

const formatDate = (d) => d.toISOString().split("T")[0];

// Middleware
app.use(cors());
app.use(express.json());

// Load data from file
function loadData() {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    // If file doesn't exist, return empty object
    return {};
  }
}

// Save data to file
function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Routes
app.get('/api/data', (req, res) => {
  const data = loadData();
  // Clean up old data (31 days)
  const now = new Date();
  const cutoff = new Date(now.getTime() - 31 * 24 * 60 * 60 * 1000);
  const cutoffKey = formatDate(cutoff);
  const cleaned = {};
  Object.keys(data).forEach((date) => {
    if (date >= cutoffKey) cleaned[date] = data[date];
  });
  saveData(cleaned);
  res.json(cleaned);
});

app.post('/api/addTrain', (req, res) => {
  const { date, trainId, coaches } = req.body;
  const data = loadData();
  const d = { ...(data[date] || { trains: [] }), trains: [...(data[date]?.trains || [])] };
  if (d.trains.some((t) => t.id === trainId)) return res.json({ success: false });
  d.trains.push({ id: trainId, coaches: coaches || [], departments: {} });
  data[date] = d;
  saveData(data);
  res.json({ success: true });
});

app.post('/api/deleteTrain', (req, res) => {
  const { date, trainId } = req.body;
  const data = loadData();
  const d = { ...(data[date] || { trains: [] }), trains: [...(data[date]?.trains || [])] };
  d.trains = d.trains.filter((t) => t.id !== trainId);
  data[date] = d;
  saveData(data);
  res.json({ success: true });
});

app.post('/api/submitInspection', (req, res) => {
  const { date, trainId, dept, coach, inspection } = req.body;
  const data = loadData();
  const d = { ...(data[date] || { trains: [] }), trains: [...(data[date]?.trains || [])] };
  const idx = d.trains.findIndex((t) => t.id === trainId);
  if (idx === -1) return res.json({ success: false });
  const t = { ...d.trains[idx], departments: { ...d.trains[idx].departments } };
  const deptRecords = { ...(t.departments?.[dept] || {}) };
  const existing = Array.isArray(deptRecords[coach]) ? deptRecords[coach] : [];
  deptRecords[coach] = [...existing, inspection];
  t.departments[dept] = deptRecords;
  d.trains[idx] = t;
  data[date] = d;
  saveData(data);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
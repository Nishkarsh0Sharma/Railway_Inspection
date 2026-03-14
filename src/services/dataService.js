// Minimal data layer abstraction for the RailTracker app.
// This keeps the app consistent while enabling future migration to a real backend.

const API_BASE = 'http://localhost:3001/api';
const MAX_DAYS = 31;

const formatDate = (d) => d.toISOString().split('T')[0];

const cleanOldData = (data) => {
  const now = new Date();
  const cutoff = new Date(now.getTime() - MAX_DAYS * 24 * 60 * 60 * 1000);
  const cutoffKey = formatDate(cutoff);
  const cleaned = {};
  Object.keys(data).forEach((date) => {
    if (date >= cutoffKey) cleaned[date] = data[date];
  });
  return cleaned;
};

export const loadData = async (seed) => {
  try {
    const response = await fetch(`${API_BASE}/data`);
    if (!response.ok) throw new Error('Failed to load data');
    const data = await response.json();
    return cleanOldData(data);
  } catch (e) {
    console.warn('RailTracker: failed to load stored data', e);
    return cleanOldData(seed);
  }
};

export const saveData = async () => {
  // server side persistence used directly by API
};

export const addTrain = async (data, date, trainId, coaches = []) => {
  try {
    const response = await fetch(`${API_BASE}/addTrain`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, trainId, coaches })
    });
    if (!response.ok) throw new Error('Failed to add train');
    const result = await response.json();
    if (result.success) {
      const d = { ...(data[date] || { trains: [] }), trains: [...(data[date]?.trains || [])] };
      d.trains.push({ id: trainId, coaches, departments: {} });
      return { ...data, [date]: d };
    }
  } catch (e) {
    console.warn('RailTracker: failed to add train', e);
  }
  return data;
};

export const deleteTrain = async (data, date, trainId) => {
  try {
    const response = await fetch(`${API_BASE}/deleteTrain`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, trainId })
    });
    if (!response.ok) throw new Error('Failed to delete train');
    const result = await response.json();
    if (result.success) {
      const d = { ...(data[date] || { trains: [] }), trains: [...(data[date]?.trains || [])] };
      d.trains = d.trains.filter((t) => t.id !== trainId);
      return { ...data, [date]: d };
    }
  } catch (e) {
    console.warn('RailTracker: failed to delete train', e);
  }
  return data;
};

export const submitInspection = async (data, date, trainId, dept, coach, inspection) => {
  try {
    const response = await fetch(`${API_BASE}/submitInspection`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, trainId, dept, coach, inspection })
    });
    if (!response.ok) throw new Error('Failed to submit inspection');
    const result = await response.json();
    if (result.success) {
      const d = { ...(data[date] || { trains: [] }), trains: [...(data[date]?.trains || [])] };
      const idx = d.trains.findIndex((t) => t.id === trainId);
      if (idx === -1) return data;
      const t = { ...d.trains[idx], departments: { ...d.trains[idx].departments } };
      const deptRecords = { ...t.departments[dept] };
      deptRecords[coach] = [...(deptRecords[coach] || []), inspection];
      t.departments[dept] = deptRecords;
      d.trains[idx] = t;
      return { ...data, [date]: d };
    }
  } catch (e) {
    console.warn('RailTracker: failed to submit inspection', e);
  }
  return data;
};

export const formatToday = () => formatDate(new Date());


import React, { useState } from 'react';

export function AdminPanel({ adminDate, setAdminDate, onAddTrain, trainsForDate, onDeleteTrain, auditLog = [] }) {
  const [trainSelection, setTrainSelection] = useState('TRN-1001');

  const TRAIN_OPTIONS = Array.from({ length: 20 }, (_, i) => `TRN-${1001 + i}`);

  const handleAdd = () => {
    if (!trainSelection) return;
    onAddTrain(trainSelection);
  };

  return (
    <div className="card">
      <h3>Admin Panel</h3>
      <div className="form-row">
        <label>Date</label>
        <input type="date" value={adminDate} onChange={(e) => setAdminDate(e.target.value)} />
      </div>
      <div className="form-row">
        <label>Train ID</label>
        <select value={trainSelection} onChange={(e) => setTrainSelection(e.target.value)}>
          {TRAIN_OPTIONS.map((id) => (
            <option key={id} value={id}>{id}</option>
          ))}
        </select>
      </div>
      <div className="form-row">
        <label>Coach nos</label>
        <div style={{ flex: 1, fontSize: '13px', color: '#374151', lineHeight: '1.4' }}>Auto mapped</div>
        <button className="btn" onClick={handleAdd}>Add</button>
      </div>

      <div className="train-list">
        <h4>Trains for {adminDate}</h4>
        {trainsForDate.length === 0 ? (
          <p>No trains scheduled</p>
        ) : (
          trainsForDate.map((train) => (
            <div key={train.id} className="train-line">
              <span>{train.id}</span>
              <button className="btn-danger" onClick={() => onDeleteTrain(train.id)}>Delete</button>
            </div>
          ))
        )}
      </div>

      <div style={{ marginTop: '20px' }}>
        <h4>Audit log (recent)</h4>
        <div style={{ maxHeight: '250px', overflowY: 'auto', border: '1px solid #ccc', padding: '8px' }}>
          {auditLog.length === 0 ? (
            <p>No audit events yet</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {auditLog.map((entry) => (
                <li key={entry.id} style={{ marginBottom: '6px', fontSize: '12px' }}>
                  <strong>{entry.timestamp.slice(0, 19).replace('T', ' ')}</strong>: {entry.action} by {entry.performed_by}
                  {entry.train_id ? ` on ${entry.train_id}` : ''}
                  {entry.department ? ` / ${entry.department}` : ''}
                  {entry.coach ? ` / ${entry.coach}` : ''}
                  {entry.comment ? ` -> ${entry.comment}` : ''}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
